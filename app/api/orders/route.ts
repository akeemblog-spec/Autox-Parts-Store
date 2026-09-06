import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { carts, cartItems, orders, orderItems, addresses, products, orderStatusHistory, coupons, couponUsages, inventoryMovements, adminNotifications, users } from "@/db/schema";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { isPaymentMethodEnabled } from "@/lib/db-queries/payment-methods";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";
import { sendOrderStatusEmail } from "@/lib/email/send-auth-email";

function generateOrderNumber() {
  return `AX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rows = await db.query.orders.findMany({ where: eq(orders.userId, session.user.id), orderBy: [desc(orders.createdAt)], with: { items: true } });
  return NextResponse.json({ orders: rows });
}

const checkoutSchema = z.object({
  address: z.object({
    line1: z.string().trim().min(1), line2: z.string().trim().optional(), city: z.string().trim().min(1), district: z.string().trim().min(1),
    postalCode: z.string().trim().optional(), phone: z.string().trim().min(7),
  }),
  paymentMethod: z.enum(["card", "cod", "bank_transfer", "installment", "koko", "mintpay"]),
  deliveryMethod: z.enum(["standard", "express"]).default("standard"),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { address: addressInput, paymentMethod, deliveryMethod, couponCode } = parsed.data;
  if (!(await isPaymentMethodEnabled(paymentMethod))) return NextResponse.json({ error: "This payment method isn't currently available. Please choose another." }, { status: 400 });
  const storeSettings = await getStorefrontSettings();
  const configuredDeliveryFee = Math.max(0, Number(storeSettings.delivery_fee ?? 500) || 0);
  const configuredExpressFee = Math.max(0, Number(storeSettings.express_delivery_fee ?? 750) || 0);
  const expressEnabled = (storeSettings.express_delivery_enabled ?? "true") === "true";
  if (deliveryMethod === "express" && !expressEnabled) return NextResponse.json({ error: "Express delivery is currently unavailable." }, { status: 400 });

  try {
    const order = await db.transaction(async (tx) => {
      const [cart] = await tx.select().from(carts).where(eq(carts.userId, session.user.id)).limit(1);
      if (!cart) throw new Error("CART_EMPTY");
      const items = await tx.query.cartItems.findMany({ where: eq(cartItems.cartId, cart.id), with: { product: true } });
      if (!items.length) throw new Error("CART_EMPTY");

      for (const item of items) {
        if (item.product.archivedAt) throw new Error(`UNAVAILABLE:${item.product.name}`);
        if (item.quantity < 1 || item.product.stock < item.quantity) throw new Error(`STOCK:${item.product.name}`);
      }

      const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const standardDeliveryFee = subtotal > 0 ? configuredDeliveryFee : 0;
      const expressDeliveryFee = subtotal > 0 && deliveryMethod === "express" ? configuredExpressFee : 0;
      const deliveryFee = standardDeliveryFee + expressDeliveryFee;
      let discountAmount = 0; let appliedCoupon: typeof coupons.$inferSelect | null = null;
      if (couponCode) {
        const [c] = await tx.select().from(coupons).where(eq(coupons.code, couponCode.toUpperCase())).limit(1); const now=new Date();
        if (!c || !c.active || (c.startsAt && c.startsAt>now) || (c.expiresAt && c.expiresAt<now) || subtotal<c.minOrderAmount || (c.usageLimit && c.usageCount>=c.usageLimit)) throw new Error("COUPON");
        const [usage] = await tx.select({n:sql<number>`count(*)`}).from(couponUsages).where(and(eq(couponUsages.couponId,c.id),eq(couponUsages.userId,session.user.id)));
        if(Number(usage?.n||0)>=c.perCustomerLimit) throw new Error("COUPON");
        discountAmount=c.percentOff?subtotal*c.percentOff/100:Number(c.amountOff||0); if(c.maxDiscount)discountAmount=Math.min(discountAmount,c.maxDiscount); discountAmount=Math.min(discountAmount,subtotal); appliedCoupon=c;
      }
      const [address] = await tx.insert(addresses).values({ userId: session.user.id, ...addressInput, isSaved: false, isDefault: false }).returning();
      const [created] = await tx.insert(orders).values({ orderNumber: generateOrderNumber(), userId: session.user.id, addressId: address.id, status: "pending", subtotal, deliveryFee, deliveryMethod, standardDeliveryFee, expressDeliveryFee, discountAmount, couponCode: appliedCoupon?.code ?? null, total: subtotal - discountAmount + deliveryFee, paymentMethod }).returning();
      await tx.insert(orderItems).values(items.map((item) => ({ orderId: created.id, productId: item.productId, productName: item.product.name, unitPrice: item.product.price, quantity: item.quantity })));
      await tx.insert(orderStatusHistory).values({ orderId: created.id, status: "pending", title: "Order Placed", description: "Thank you. Your order has been received.", createdAt: created.createdAt });
      if(appliedCoupon){await tx.insert(couponUsages).values({couponId:appliedCoupon.id,userId:session.user.id,orderId:created.id,discountAmount});await tx.update(coupons).set({usageCount:sql`${coupons.usageCount}+1`}).where(eq(coupons.id,appliedCoupon.id));}
      await tx.insert(adminNotifications).values({type:"order",title:"New order",message:`${created.orderNumber} is waiting to be processed.`,href:"/admin/orders",entityKey:`order:${created.id}`}).onConflictDoNothing();

      for (const item of items) {
        const [stockUpdated] = await tx.update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}`, updatedAt: new Date() })
          .where(and(eq(products.id, item.productId), isNull(products.archivedAt), gte(products.stock, item.quantity)))
          .returning({ id: products.id, stock: products.stock });
        if (!stockUpdated) throw new Error(`STOCK:${item.product.name}`);
        await tx.insert(inventoryMovements).values({productId:item.productId,orderId:created.id,quantityChange:-item.quantity,reason:"Order placed"}); if(stockUpdated.stock<=10)await tx.insert(adminNotifications).values({type:"stock",title:"Low stock",message:`${item.product.name} has ${stockUpdated.stock} left.`,href:"/admin/inventory",entityKey:`low-stock:${item.productId}`}).onConflictDoNothing();
      }
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      return created;
    });
    const [customer]=await db.select({email:users.email}).from(users).where(eq(users.id,session.user.id)).limit(1); if(customer?.email) await sendOrderStatusEmail(customer.email,order.orderNumber,"pending").catch(()=>null);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CART_EMPTY") return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    if (message === "COUPON") return NextResponse.json({ error: "Coupon is no longer valid. Please review your order." }, { status: 409 });
    if (message.startsWith("UNAVAILABLE:")) return NextResponse.json({ error: `${message.slice(12)} is no longer available. Remove it from your cart before checkout.` }, { status: 409 });
    if (message.startsWith("STOCK:")) return NextResponse.json({ error: `${message.slice(6)} no longer has enough stock for your requested quantity.` }, { status: 409 });
    return NextResponse.json({ error: "Unable to place the order. Please try again." }, { status: 500 });
  }
}
