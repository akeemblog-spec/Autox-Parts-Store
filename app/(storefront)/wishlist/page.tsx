"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Bike, Check, PackageOpen } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ButtonLink } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useAppUI } from "@/components/ui/AppUIProvider";
import { setSavedMembership } from "@/lib/client/saved-products-cache";

interface WishlistRow { id: string; product: { id: string; name: string; slug: string; price: number; previousPrice: number | null; images: { url: string; alt: string }[] } }

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useAppUI();
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && (!session?.user?.id || session.user.invalidated))) { router.push("/login?callbackUrl=/wishlist"); return; }
    if (status !== "authenticated") return;
    fetch("/api/wishlist", { cache: "no-store" }).then((res) => res.ok ? res.json() : { items: [] }).then((data) => setItems(data.items ?? [])).finally(() => setLoading(false));
  }, [status, session?.user?.id, session?.user?.invalidated, router]);

  const remove = async (productId: string) => {
    if (removingId) return;
    setRemovingId(productId);
    const previous = items;
    setItems((current) => current.filter((item) => item.product.id !== productId));
    const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" }).catch(() => null);
    setRemovingId(null);
    if (!res?.ok) { setItems(previous); toast("Unable to remove this item from your wishlist.", "error"); return; }
    setSavedMembership("wishlist", productId, false);
    window.dispatchEvent(new Event("autox-wishlist-updated"));
    toast("Removed from your wishlist.", "success");
  };

  const addToCart = async (productId: string) => {
    setAddingId(productId);
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) }).catch(() => null);
    setAddingId(null);
    if (!res?.ok) { const data = await res?.json().catch(() => ({})); toast(data?.error || "Unable to add this item to your cart.", "error"); return; }
    setAddedId(productId); window.dispatchEvent(new Event("autox-cart-updated")); toast("Added to cart.", "success"); window.setTimeout(() => setAddedId((current) => current === productId ? null : current), 1200);
  };

  if (status === "loading" || loading) return <main><LoadingState label="Loading your wishlist..."/></main>;

  return <main>
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}/></div>
    <section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6">
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-autox-red">Saved for later</p><h1 className="mt-1 text-2xl font-extrabold text-white">Your Wishlist</h1><p className="mt-1 text-sm text-autox-gray">{items.length ? `${items.length} saved ${items.length === 1 ? "part" : "parts"}` : "Keep the parts you like in one place."}</p></div>{items.length > 0 && <ButtonLink href="/products" variant="outline" size="sm">Browse More</ButtonLink>}</div>
      {items.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[.02] py-4"><EmptyState title="Save parts for later" description="Tap the heart on any product and it will be waiting here when you come back." action={<ButtonLink href="/products">Browse Parts</ButtonLink>}/></div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {items.map(({ id, product }) => <article key={id} className={`group flex flex-col overflow-hidden rounded-xl border border-white/[.08] bg-[#0b0b0d] transition-all duration-200 hover:border-autox-red/35 ${removingId === product.id ? "scale-[.98] opacity-50" : ""}`}>
          <div className="relative aspect-square overflow-hidden bg-autox-panel3">
            <button aria-label="Remove from wishlist" disabled={removingId === product.id} onClick={() => remove(product.id)} className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/70 text-autox-red backdrop-blur transition hover:bg-autox-red hover:text-white disabled:opacity-50"><Heart size={16} className="fill-current"/></button>
            <Link href={`/products/${product.slug}`} className="block h-full">{product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center text-zinc-700"><PackageOpen size={34}/></div>}</Link>
          </div>
          <div className="flex flex-1 flex-col p-3 sm:p-4"><Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white transition-colors hover:text-autox-red">{product.name}</Link><div className="mt-2"><PriceDisplay price={product.price} previousPrice={product.previousPrice ?? undefined} size="sm"/></div><button disabled={addingId === product.id} onClick={() => addToCart(product.id)} className={`mt-4 flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg text-[11px] font-black uppercase tracking-wide text-white transition-all disabled:opacity-60 ${addedId === product.id ? "bg-autox-panel3 ring-1 ring-autox-red" : "bg-autox-red hover:bg-autox-redDark"}`}>{addingId === product.id ? <><Bike size={15} className="autox-bike-run"/>Adding...</> : addedId === product.id ? <><Check size={14}/>Added</> : <><ShoppingCart size={14}/>Add to Cart</>}</button></div>
        </article>)}
      </div>}
    </section>
  </main>;
}
