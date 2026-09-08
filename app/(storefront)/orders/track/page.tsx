import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Breadcrumb } from "@/components/Breadcrumb";
import { formatPrice } from "@/lib/utils/format";
import { OrderTimeline, TrackingUpdates } from "@/components/orders/OrderTimeline";
import { ArrowRight, Headphones, Info, MapPin, Package, PackageCheck, Search, Truck, Zap, ReceiptText, Phone, CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "Track Your Order" };
export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  pending: "bg-autox-panel3 text-autox-gray",
  paid: "bg-blue-500/10 text-blue-400",
  processing: "bg-yellow-500/10 text-yellow-400",
  shipped: "bg-blue-500/10 text-blue-400",
  out_for_delivery: "bg-orange-500/10 text-orange-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-autox-red/10 text-autox-red",
};

export default async function TrackOrderPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) redirect("/login?callbackUrl=/orders/track");

  const { order: requested } = await searchParams;
  const query = requested?.trim();
  const order = query
    ? await db.query.orders.findFirst({
        where: and(eq(orders.userId, session.user.id), eq(orders.orderNumber, query)),
        with: { address: true, items: true, statusHistory: true },
      })
    : await db.query.orders.findFirst({
        where: eq(orders.userId, session.user.id),
        orderBy: [desc(orders.createdAt)],
        with: { address: true, items: true, statusHistory: true },
      });

  const history = order?.statusHistory?.length
    ? order.statusHistory
    : [{ status: "pending", title: "Order Placed", description: "Thank you. Your order has been received.", createdAt: order?.createdAt || new Date() }];
  const created = order ? new Date(order.createdAt) : null;
  const estimated = created ? new Date(created.getTime() + 3 * 86400000) : null;
  const isExpress = Boolean(order && (order.deliveryMethod === "express" || (order.expressDeliveryFee ?? 0) > 0));
  const standardFee = order ? (order.standardDeliveryFee ?? order.deliveryFee ?? 0) : 0;
  const expressFee = order?.expressDeliveryFee ?? 0;

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold uppercase text-white">Track <span className="text-autox-red">Your Order</span></h1>
          <p className="mt-1 text-sm text-autox-gray">Every status date comes from the same history used by My Orders.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-4">
            <section className="rounded-2xl bg-[#101012] p-4 shadow-[0_18px_50px_rgba(0,0,0,.22)] lg:p-5">
              <form action="/orders/track" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-autox-red text-white shadow-[0_10px_28px_rgba(237,28,36,.24)]"><Package size={19} /></div>
                <label className="min-w-0 flex-1 text-xs text-autox-gray">Enter your Order ID
                  <input name="order" defaultValue={query || ""} placeholder="e.g. AX1234567890" className="mt-1 h-11 w-full rounded-xl bg-black/45 px-4 text-sm text-white outline-none ring-1 ring-inset ring-white/[.08] transition focus:ring-autox-red/60" />
                </label>
                <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-autox-red px-6 text-xs font-bold uppercase text-white shadow-[0_10px_28px_rgba(237,28,36,.2)] transition hover:bg-red-600"><Search size={15} /> Track Order <ArrowRight size={14} /></button>
              </form>
              <p className="mt-3 flex items-center gap-2 text-[11px] text-autox-gray"><Info size={12} className="text-autox-red" /> Use an order number from My Orders.</p>
            </section>

            {query && !order && <section className="rounded-2xl bg-autox-red/[.06] p-8 text-center ring-1 ring-inset ring-autox-red/20"><h2 className="font-bold text-white">Order not found</h2></section>}

            {order && (
              <section className="rounded-2xl bg-[#101012] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase text-white">Order Status <span className={`ml-2 rounded-full px-2.5 py-1 text-[9px] ${statusClass[order.status] || statusClass.pending}`}>{order.status.replace("_", " ")}</span></h2>
                    {estimated && <p className="mt-3 text-xs text-autox-gray">Estimated delivery <span className="ml-2 font-semibold text-white">{estimated.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</span></p>}
                  </div>
                </div>
                <OrderTimeline status={order.status} history={history} />
                <div className="mt-7 border-t border-white/[.06] pt-5">
                  <h3 className="text-xs font-extrabold uppercase text-white">Tracking Updates</h3>
                  <TrackingUpdates history={history} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            {order && <>
              <section className="overflow-hidden rounded-2xl bg-[#101012] shadow-[0_18px_50px_rgba(0,0,0,.24)]">
                <div className="flex items-center gap-3 bg-gradient-to-r from-autox-red/[.12] to-transparent px-5 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-autox-red/10 text-autox-red"><ReceiptText size={18} /></span>
                  <div><h2 className="text-sm font-extrabold uppercase text-white">Order Summary</h2><p className="mt-0.5 text-[11px] text-zinc-500">{order.orderNumber} · {created?.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                </div>

                <div className="px-5 pb-5">
                  <div className="space-y-2.5 py-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl bg-black/30 px-3.5 py-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-bold leading-5 text-white">{item.productName}</p>
                          <p className="mt-1 text-[10px] text-zinc-500">Qty {item.quantity} × {formatPrice(item.unitPrice)}</p>
                        </div>
                        <p className="shrink-0 text-xs font-extrabold text-white">{formatPrice(item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 border-t border-white/[.06] pt-4 text-xs">
                    <div className="flex justify-between gap-4"><span className="text-zinc-500">Subtotal</span><span className="font-semibold text-white">{formatPrice(order.subtotal)}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-zinc-500">Standard Delivery</span><span className="font-semibold text-white">{formatPrice(standardFee)}</span></div>
                    {isExpress && <div className="flex justify-between gap-4"><span className="flex items-center gap-1.5 font-semibold text-autox-red"><Zap size={12} /> Express Delivery Fee</span><span className="font-extrabold text-autox-red">+ {formatPrice(expressFee)}</span></div>}
                    {(order.discountAmount ?? 0) > 0 && <div className="flex justify-between gap-4 text-emerald-400"><span>Coupon{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className="font-semibold">- {formatPrice(order.discountAmount)}</span></div>}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4 rounded-xl bg-gradient-to-r from-white/[.04] to-autox-red/[.08] px-4 py-4">
                    <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">Final Total</p><p className="mt-1 text-[11px] text-zinc-600">Including delivery</p></div>
                    <p className="text-xl font-black tracking-[-.03em] text-autox-red">{formatPrice(order.total)}</p>
                  </div>

                  <Link href="/account/orders" className="mt-4 flex h-10 items-center justify-between rounded-xl bg-white/[.045] px-3.5 text-[11px] font-bold uppercase text-white ring-1 ring-inset ring-white/[.07] transition hover:bg-white/[.075]"><span className="flex items-center gap-2"><PackageCheck size={14} /> My Orders</span><ArrowRight size={13} /></Link>
                </div>
              </section>

              <section className="rounded-2xl bg-[#101012] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-extrabold uppercase text-white">Delivery Information</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${isExpress ? "bg-autox-red/10 text-autox-red" : "bg-white/[.055] text-zinc-400"}`}>{isExpress ? "Express" : "Standard"}</span>
                </div>
                {order.address ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-3 rounded-xl bg-black/25 p-3.5 text-xs"><MapPin size={15} className="mt-0.5 shrink-0 text-autox-red" /><p className="leading-5 text-white">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br /><span className="text-zinc-500">{order.address.city}, {order.address.district}{order.address.postalCode ? ` · ${order.address.postalCode}` : ""}</span></p></div>
                    <div className="flex gap-3 rounded-xl bg-black/25 p-3.5 text-xs"><Phone size={15} className="shrink-0 text-autox-red" /><div><p className="text-zinc-500">Contact</p><p className="mt-1 font-semibold text-white">{order.address.phone}</p></div></div>
                  </div>
                ) : <p className="mt-3 text-xs text-autox-gray">No delivery address attached.</p>}
                <div className="mt-3 flex gap-3 rounded-xl bg-black/25 p-3.5 text-xs"><Truck size={15} className="shrink-0 text-autox-red" /><div><p className="text-zinc-500">Delivery service</p><p className="mt-1 font-semibold text-white">AutoX Islandwide {isExpress ? "Express" : "Standard"} Delivery</p></div></div>
                <div className="mt-3 flex gap-3 rounded-xl bg-black/25 p-3.5 text-xs"><CreditCard size={15} className="shrink-0 text-autox-red" /><div><p className="text-zinc-500">Payment</p><p className="mt-1 font-semibold uppercase text-white">{order.paymentMethod.replaceAll("_", " ")}</p></div></div>
              </section>
            </>}

            <section className="rounded-2xl bg-gradient-to-br from-autox-red/[.12] via-[#111113] to-[#0c0c0e] p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)]">
              <div className="flex items-center gap-3"><Headphones className="text-autox-red" /><div><h3 className="font-bold text-white">Need Help?</h3><p className="text-xs text-autox-gray">Our support team is here to assist you.</p></div></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
