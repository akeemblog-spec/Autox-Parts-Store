import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders, wishlistItems } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { AccountSectionShell } from "@/components/account/AccountSectionShell";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { formatPrice } from "@/lib/utils/format";
import { ReturnRequestButton } from "@/components/account/ReturnRequestButton";
import { Pagination } from "@/components/ui/Pagination";
import { parsePagination } from "@/lib/pagination";
import { ArrowRight, Package, ReceiptText, Truck, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const cls: Record<string, string> = {
  pending: "text-autox-gray bg-autox-panel3",
  paid: "text-blue-400 bg-blue-400/10",
  processing: "text-yellow-400 bg-yellow-400/10",
  shipped: "text-purple-400 bg-purple-400/10",
  out_for_delivery: "text-orange-400 bg-orange-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-autox-red bg-autox-red/10",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; limit?: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) redirect("/login?callbackUrl=/account/orders");
  const params = await searchParams;
  const { page, limit, offset } = parsePagination(params, 10, 50);

  const [rows, wishlist, countRows] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
      with: { items: { with: { product: { with: { images: true } } } }, statusHistory: true },
    }),
    db.query.wishlistItems.findMany({ where: eq(wishlistItems.userId, session.user.id) }),
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.userId, session.user.id)),
  ]);
  const total = countRows[0]?.count ?? 0;

  return (
    <AccountSectionShell title="My Orders" subtitle="Current and past orders with the exact pricing snapshot captured at checkout." wishlistCount={wishlist.length}>
      <div className="space-y-4">
        {rows.length === 0 && <div className="rounded-2xl bg-[#101012] p-10 text-center text-autox-gray"><Package className="mx-auto mb-3 text-autox-red" />No orders yet.</div>}

        {rows.map((order) => {
          const img = order.items[0]?.product?.images?.[0]?.url;
          const itemCount = order.items.reduce((n, item) => n + item.quantity, 0);
          const history = order.statusHistory?.length ? order.statusHistory : [{ status: "pending", title: "Order Placed", description: "Thank you. Your order has been received.", createdAt: order.createdAt }];
          const isExpress = order.deliveryMethod === "express" || (order.expressDeliveryFee ?? 0) > 0;
          const standardFee = order.standardDeliveryFee ?? order.deliveryFee;
          const expressFee = order.expressDeliveryFee ?? 0;

          return (
            <article key={order.id} className="overflow-hidden rounded-2xl bg-[#101012] shadow-[0_18px_48px_rgba(0,0,0,.22)]">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start lg:p-5">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-autox-panel3 ring-1 ring-inset ring-white/[.06]">
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Package className="text-autox-gray" /></div>}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h2 className="font-extrabold text-white">{order.orderNumber}</h2>
                      <p className="mt-1 text-xs text-autox-gray">{itemCount} item{itemCount === 1 ? "" : "s"} · {new Date(order.createdAt).toLocaleString("en-LK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${cls[order.status] || cls.pending}`}>{order.status.replaceAll("_", " ")}</span>
                      <p className="mt-2 text-lg font-black tracking-[-.02em] text-autox-red">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-black/25 px-3.5 py-3">
                          <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{item.productName}</p><p className="mt-1 text-[10px] text-zinc-500">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p></div>
                          <span className="shrink-0 text-xs font-bold text-zinc-200">{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && <p className="px-1 text-[10px] font-semibold text-zinc-500">+ {order.items.length - 3} more item{order.items.length - 3 === 1 ? "" : "s"}</p>}
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-white/[.04] to-black/20 p-4 ring-1 ring-inset ring-white/[.055]">
                      <div className="mb-3 flex items-center justify-between"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-zinc-500"><ReceiptText size={13} className="text-autox-red" /> Price Breakdown</p>{isExpress && <span className="flex items-center gap-1 rounded-full bg-autox-red/10 px-2 py-1 text-[9px] font-black uppercase text-autox-red"><Zap size={10} /> Express</span>}</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between gap-4"><span className="text-zinc-500">Subtotal</span><span className="font-semibold text-white">{formatPrice(order.subtotal)}</span></div>
                        <div className="flex justify-between gap-4"><span className="flex items-center gap-1.5 text-zinc-500"><Truck size={12} /> Standard Delivery</span><span className="font-semibold text-white">{formatPrice(standardFee)}</span></div>
                        {isExpress && <div className="flex justify-between gap-4"><span className="font-semibold text-autox-red">Express Delivery Fee</span><span className="font-extrabold text-autox-red">+ {formatPrice(expressFee)}</span></div>}
                        {(order.discountAmount ?? 0) > 0 && <div className="flex justify-between gap-4 text-emerald-400"><span>Coupon{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className="font-semibold">- {formatPrice(order.discountAmount)}</span></div>}
                      </div>
                      <div className="mt-3 flex items-end justify-between border-t border-white/[.07] pt-3"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-zinc-600">Total</p><p className="mt-0.5 text-[10px] text-zinc-600">Delivery included</p></div><span className="text-lg font-black text-autox-red">{formatPrice(order.total)}</span></div>
                    </div>
                  </div>

                  <OrderTimeline status={order.status} history={history} compact />
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <ReturnRequestButton orderId={order.id} status={order.status} />
                    <Link href={`/orders/track?order=${encodeURIComponent(order.orderNumber)}`} className="flex items-center gap-2 rounded-xl bg-autox-red/[.08] px-4 py-2 text-xs font-bold text-autox-red ring-1 ring-inset ring-autox-red/25 transition hover:bg-autox-red hover:text-white">Track Order <ArrowRight size={13} /></Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <Pagination page={page} pageSize={limit} total={total} pathname="/account/orders" />
    </AccountSectionShell>
  );
}
