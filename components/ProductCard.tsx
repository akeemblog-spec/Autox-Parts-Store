"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Bike, Check, GitCompareArrows } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "./ui/Badge";
import { Rating } from "./ui/Rating";
import { PriceDisplay } from "./ui/PriceDisplay";
import { cn } from "@/lib/utils/cn";
import { useAppUI } from "./ui/AppUIProvider";
import { loadSavedProductState, setSavedMembership } from "@/lib/client/saved-products-cache";

export function ProductCard({ product }: { product: Product }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useAppUI();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [compared, setCompared] = useState(false);
  const [saving, setSaving] = useState(false);
  const image = product.images[0];
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id) && !session?.user?.invalidated;

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    loadSavedProductState().then((saved) => {
      if (!mounted) return;
      setWishlisted(saved.wishlist.has(product.id));
      setCompared(saved.compare.has(product.id));
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, [isAuthenticated, product.id]);

  const requireLogin = () => {
    if (isAuthenticated) return false;
    router.push(`/login?callbackUrl=/products/${product.slug}`);
    return true;
  };

  const addToCart = async () => {
    if (requireLogin()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to add item to cart");
      setAdded(true); window.dispatchEvent(new Event("autox-cart-updated")); toast("Added to cart.", "success"); window.setTimeout(() => setAdded(false), 1200);
    } catch (error) { toast(error instanceof Error ? error.message : "Unable to add item to cart", "error"); }
    finally { setAdding(false); }
  };

  const toggleWishlist = async () => {
    if (requireLogin() || saving) return;
    const next = !wishlisted;
    setSaving(true); setWishlisted(next);
    const res = await fetch(next ? "/api/wishlist" : `/api/wishlist/${product.id}`, { method: next ? "POST" : "DELETE", headers: next ? { "Content-Type": "application/json" } : undefined, body: next ? JSON.stringify({ productId: product.id }) : undefined }).catch(() => null);
    setSaving(false);
    if (!res?.ok) { setWishlisted(!next); toast("Unable to update your wishlist.", "error"); return; }
    setSavedMembership("wishlist", product.id, next); window.dispatchEvent(new Event("autox-wishlist-updated")); toast(next ? "Saved to wishlist." : "Removed from wishlist.", "success");
  };

  const toggleCompare = async () => {
    if (requireLogin() || saving) return;
    setSaving(true);
    if (compared) {
      const res = await fetch(`/api/compare/${product.id}`, { method: "DELETE" }).catch(() => null);
      setSaving(false);
      if (!res?.ok) { toast("Unable to remove from comparison.", "error"); return; }
      setCompared(false); setSavedMembership("compare", product.id, false); window.dispatchEvent(new Event("autox-compare-updated")); toast("Removed from comparison.", "success"); return;
    }
    const res = await fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) }).catch(() => null);
    const data = await res?.json().catch(() => ({})); setSaving(false);
    if (!res?.ok) { toast(data?.error || "Unable to add to comparison.", "error"); return; }
    setCompared(true); setSavedMembership("compare", product.id, true); window.dispatchEvent(new Event("autox-compare-updated")); toast(data?.alreadyAdded ? "Already in comparison." : "Added to comparison.", "success");
  };

  return <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[.08] bg-[#0b0b0d] transition-all duration-300 hover:-translate-y-0.5 hover:border-autox-red/40 hover:shadow-cardGlow">
    <div className="relative aspect-square overflow-hidden bg-autox-panel3">
      {product.genuine && <Badge variant="genuine" className="absolute left-2 top-2 z-10">Genuine</Badge>}
      {product.discount && <Badge variant="discount" className="absolute right-11 top-2 z-10">{product.discount}% OFF</Badge>}
      <button aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wishlisted} disabled={saving} onClick={toggleWishlist} className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white backdrop-blur transition-colors hover:bg-autox-red disabled:opacity-50"><Heart size={16} className={cn(wishlisted && "fill-autox-red text-autox-red group-hover:text-white")}/></button>
      <Link href={`/products/${product.slug}`} className="block h-full"><img src={image.url} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/></Link>
      {!product.inStock && <div className="absolute inset-0 flex items-center justify-center bg-black/70"><Badge variant="outOfStock">Out of Stock</Badge></div>}
    </div>
    <div className="flex flex-1 flex-col p-3 sm:p-3.5">
      <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-white transition-colors hover:text-autox-red">{product.name}</Link>
      <p className="mt-1 line-clamp-1 text-[11px] text-autox-gray">{product.compatibleModels[0]?.brand} {product.compatibleModels[0]?.model}</p>
      <div className="mt-2"><Rating value={product.rating} reviewCount={product.reviewCount}/></div>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><PriceDisplay price={product.price} previousPrice={product.previousPrice} size="sm"/><span className={cn("text-[10px] font-semibold", product.inStock ? "text-emerald-400" : "text-zinc-500")}>{product.inStock ? "In Stock" : "Out of Stock"}</span></div>
      <div className="mt-auto grid grid-cols-[1fr_40px] gap-2 pt-3">
        <button disabled={!product.inStock || adding} onClick={addToCart} className={cn("relative flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-lg text-[10px] font-black uppercase tracking-wide text-white transition-all disabled:bg-autox-panel3 disabled:text-autox-gray", added ? "bg-autox-panel3 ring-1 ring-autox-red" : "bg-autox-red hover:bg-autox-redDark")}>{adding ? <><Bike size={15} className="autox-bike-run"/>Adding</> : added ? <><Check size={14}/>Added</> : <><ShoppingCart size={14}/>Add to Cart</>}</button>
        <button type="button" onClick={toggleCompare} disabled={saving} aria-label={compared ? "Remove from comparison" : "Add to comparison"} aria-pressed={compared} className={cn("flex h-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50", compared ? "border-autox-red/40 bg-autox-red/10 text-autox-red" : "border-white/10 text-zinc-500 hover:border-autox-red/40 hover:text-white")}><GitCompareArrows size={16}/></button>
      </div>
    </div>
  </article>;
}
