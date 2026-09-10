import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders, wishlistItems, reviews, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { formatPrice } from "@/lib/utils/format";
import { ArrowRight, CalendarDays, Check, Mail, MapPin, PackageCheck, Phone, ShieldCheck, ShoppingBag, Truck, Heart, Star, UserRound, WalletCards, Headphones } from "lucide-react";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

const statusMeta: Record<string, { label: string; className: string; step: number }> = {
  pending: { label: "Order placed", className: "text-autox-gray bg-autox-panel3", step: 1 },
  paid: { label: "Confirmed", className: "text-blue-400 bg-blue-400/10", step: 2 },
  processing: { label: "Processing", className: "text-yellow-400 bg-yellow-400/10", step: 2 },
  shipped: { label: "Shipped", className: "text-purple-400 bg-purple-400/10", step: 3 },
  delivered: { label: "Delivered", className: "text-green-400 bg-green-400/10", step: 4 },
  cancelled: { label: "Cancelled", className: "text-autox-red bg-autox-red/10", step: 0 },
};

function initials(name?: string | null, email?: string | null) {
  return (name?.trim()?.[0] || email?.trim()?.[0] || "A").toUpperCase();
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) redirect("/login?callbackUrl=/account");

  const [customer, myOrders, wishlist, myReviews] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
    db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        address: true,
        items: { with: { product: { with: { images: true } } } },
        statusHistory: true,
      },
    }),
    db.query.wishlistItems.findMany({ where: eq(wishlistItems.userId, session.user.id) }),
    db.query.reviews.findMany({ where: eq(reviews.userId, session.user.id) }),
  ]);

  const totalSpent = myOrders.filter((o) => o.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const latestOrder = myOrders[0];
  const latestStatus = latestOrder ? (statusMeta[latestOrder.status] ?? statusMeta.pending) : null;
  const firstImage = latestOrder?.items[0]?.product?.images?.[0];
  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      
      
      

      <main className="pb-14">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold text-white">My Account</h1>
            <p className="mt-1 text-sm text-autox-gray">Manage your orders, account details and saved items.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
            <AccountSidebar wishlistCount={wishlist.length} />

            <div className="min-w-0 space-y-5">
              <section id="profile" className="rounded-2xl border border-autox-border bg-gradient-to-br from-autox-panel to-black p-5 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-autox-red to-red-700 text-2xl font-extrabold text-white shadow-[0_0_28px_rgba(237,28,36,.18)]">
                      {initials(customer?.name, customer?.email)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-xl font-extrabold text-white">{customer?.name || "AutoX Customer"}</h2>
                        <span className="rounded-xl bg-autox-red/15 px-2 py-1 text-[10px] font-bold uppercase text-autox-red">Customer</span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-xs text-autox-gray">
                        <p className="flex items-center gap-2"><Mail size={13} /> {customer?.email}</p>
                        {customer?.phone && <p className="flex items-center gap-2"><Phone size={13} /> {customer.phone}</p>}
                        <p className="flex items-center gap-2"><CalendarDays size={13} /> Member since {memberSince}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-autox-border bg-autox-border sm:grid-cols-4 xl:min-w-[430px]">
                    {[
                      [String(myOrders.length), "Orders", ShoppingBag],
                      [formatPrice(totalSpent), "Total Spent", WalletCards],
                      [String(wishlist.length), "Wishlist", Heart],
                      [String(myReviews.length), "Reviews", Star],
                    ].map(([value, label, Icon]) => {
                      const IconComponent = Icon as typeof ShoppingBag;
                      return (
                        <div key={String(label)} className="bg-black/70 px-3 py-4 text-center">
                          <IconComponent size={15} className="mx-auto mb-1.5 text-autox-red" />
                          <p className="text-sm font-extrabold text-white sm:text-base">{value as string}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-autox-gray">{label as string}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section id="orders" className="rounded-2xl border border-autox-border bg-autox-panel p-4 lg:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-extrabold text-white">My Orders</h2>
                  <Link href="/account/orders" className="flex items-center gap-2 rounded-xl border border-autox-red px-3 py-2 text-[11px] font-bold uppercase text-white transition-colors hover:bg-autox-red">View All Orders <ArrowRight size={13} /></Link>
                </div>

                {!latestOrder ? (
                  <div className="rounded-2xl border border-dashed border-autox-border bg-black/30 p-8 text-center">
                    <PackageCheck className="mx-auto text-autox-red" />
                    <h3 className="mt-3 font-bold text-white">No orders yet</h3>
                    <p className="mt-1 text-sm text-autox-gray">Your latest order and its delivery progress will appear here.</p>
                    <Link href="/products" className="mt-4 inline-flex h-9 items-center rounded-xl bg-autox-red px-4 text-xs font-bold uppercase text-white">Shop Parts</Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-autox-border bg-black/25 p-4 lg:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-autox-border bg-autox-panel3">
                        {firstImage ? <img src={firstImage.url} alt={firstImage.alt} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-autox-red"><PackageCheck size={28} /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-white">{latestOrder.orderNumber}</p>
                            <p className="mt-1 text-xs text-autox-gray">{latestOrder.items.length} item{latestOrder.items.length === 1 ? "" : "s"} · {new Date(latestOrder.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                        </div>
                        {latestOrder.address && (
                          <p id="address" className="mt-3 flex items-start gap-2 text-xs leading-5 text-autox-gray"><MapPin size={14} className="mt-0.5 shrink-0" /> {latestOrder.address.line1}{latestOrder.address.line2 ? `, ${latestOrder.address.line2}` : ""}, {latestOrder.address.city}, {latestOrder.address.district}</p>
                        )}
                      </div>
                      <div className="sm:text-right">
                        <span className={`inline-block rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase ${latestStatus?.className}`}>{latestStatus?.label}</span>
                        <p className="mt-3 text-lg font-extrabold text-white">{formatPrice(latestOrder.total)}</p>
                        <Link href={`/orders/track?order=${encodeURIComponent(latestOrder.orderNumber)}`} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-autox-red px-3 py-2 text-[11px] font-bold uppercase text-white hover:bg-autox-red">View Order Details <ArrowRight size={13} /></Link>
                      </div>
                    </div>

                    {latestOrder.status !== "cancelled" && <OrderTimeline status={latestOrder.status} history={latestOrder.statusHistory?.length ? latestOrder.statusHistory : [{ status: "pending", title: "Order Placed", description: "Thank you. Your order has been received.", createdAt: latestOrder.createdAt }]} compact />}
                  </div>
                )}

                {myOrders.length > 1 && <p className="mt-3 text-xs text-autox-gray">Showing your latest order. You have {myOrders.length} orders in total.</p>}
              </section>

              <section id="payment" className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-autox-border bg-autox-panel p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><WalletCards size={17} className="text-autox-red" /> Payment Methods</h3><p className="mt-2 text-xs leading-5 text-autox-gray">Available payment methods are selected securely during checkout.</p></div>
                <div className="rounded-2xl border border-autox-border bg-autox-panel p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><Headphones size={17} className="text-autox-red" /> Customer Support</h3><p className="mt-2 text-xs leading-5 text-autox-gray">Need help with a product or order? Our support page is always available.</p></div>
              </section>
            </div>

            <aside className="space-y-5">
              <section id="security" className="rounded-2xl border border-autox-border bg-autox-panel p-5">
                <div className="flex items-start gap-3"><ShieldCheck className="text-autox-red" size={21} /><div><h3 className="font-bold text-white">Account Security</h3><p className="mt-1 text-xs text-autox-gray">Keep your account secure</p></div></div>
                <div className="mt-5 border-b border-autox-border pb-4"><p className="text-xs text-autox-gray">Password</p><div className="mt-1 flex items-center justify-between"><span className="tracking-[.25em] text-white">••••••••</span><Link href="/login" className="text-xs font-semibold text-autox-red">Change</Link></div></div>
                <div className="pt-4"><p className="text-xs text-autox-gray">Account</p><p className="mt-1 flex items-center gap-2 text-xs text-white"><ShieldCheck size={13} className="text-green-500" /> Password protected</p></div>
              </section>

              <section className="rounded-2xl border border-autox-border bg-gradient-to-br from-autox-red/10 to-autox-panel p-5">
                <h3 className="font-bold text-white">Exclusive Benefits</h3>
                <div className="mt-4 space-y-3 text-xs text-autox-gray">
                  {["Access to exclusive offers", "Early access to new products", "Special discounts & vouchers", "Priority customer support"].map((benefit) => <p key={benefit} className="flex gap-2"><Check size={14} className="shrink-0 text-autox-red" /> {benefit}</p>)}
                </div>
                <Link href="/offers" className="mt-5 flex h-9 items-center justify-center rounded-xl border border-autox-red text-[11px] font-bold uppercase text-autox-red transition-colors hover:bg-autox-red hover:text-white">View Offers</Link>
              </section>
            </aside>
          </div>

          <section className="mt-5 grid overflow-hidden rounded-2xl border border-autox-red/20 bg-gradient-to-r from-autox-red/10 via-autox-panel to-autox-red/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [ShieldCheck, "100% Genuine Parts", "Authentic & Trusted"],
              [Truck, "Islandwide Delivery", "Fast & Reliable"],
              [PackageCheck, "7 Days Easy Returns", "Hassle Free Returns"],
              [WalletCards, "Secure Payments", "100% Safe & Secure"],
              [Headphones, "Expert Support", "Customer Service"],
            ].map(([Icon, title, text]) => {
              const IconComponent = Icon as typeof ShieldCheck;
              return <div key={String(title)} className="flex items-center gap-3 border-b border-autox-border/60 p-4 last:border-0 sm:border-r lg:border-b-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-autox-red/10 text-autox-red"><IconComponent size={17} /></span><div><p className="text-xs font-semibold text-white">{title as string}</p><p className="mt-0.5 text-[11px] text-autox-gray">{text as string}</p></div></div>;
            })}
          </section>
        </div>
      </main>

      
    </>
  );
}
