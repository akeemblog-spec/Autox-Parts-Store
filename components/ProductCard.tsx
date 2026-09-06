"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, CreditCard, Bike, Check, GitCompareArrows } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "./ui/Badge";
import { Rating } from "./ui/Rating";
import { PriceDisplay } from "./ui/PriceDisplay";
import { cn } from "@/lib/utils/cn";

export function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [compared, setCompared] = useState(false);
  const image = product.images[0];

  const addToCart = async () => {
    if (!session?.user?.id || session.user.invalidated) {
      router.push(`/login?callbackUrl=/products/${product.slug}`);
      return;
    }

    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to add item to cart");
      setMessage("Added to cart");
      setAdded(true);
      window.dispatchEvent(new Event("autox-cart-updated"));
      window.setTimeout(() => setAdded(false), 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!session?.user?.id || session.user.invalidated) {
      router.push(`/login?callbackUrl=/products/${product.slug}`);
      return;
    }

    const next = !wishlisted;
    setWishlisted(next);
    const res = await fetch(next ? "/api/wishlist" : `/api/wishlist/${product.id}`, {
      method: next ? "POST" : "DELETE",
      headers: next ? { "Content-Type": "application/json" } : undefined,
      body: next ? JSON.stringify({ productId: product.id }) : undefined,
    });
    if (!res.ok) setWishlisted(!next);
    else window.dispatchEvent(new Event("autox-wishlist-updated"));
  };


  const addToCompare = async () => {
    if (!session?.user?.id || session.user.invalidated) { router.push(`/login?callbackUrl=/products/${product.slug}`); return; }
    const res = await fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setCompared(true); setMessage(data.alreadyAdded ? "Already in comparison" : "Added to comparison"); }
    else setMessage(data.error || "Unable to add to comparison");
  };

  return (
    <div className="group relative flex flex-col bg-autox-panel border border-autox-border rounded-md overflow-hidden transition-all duration-300 hover:border-autox-red/60 hover:-translate-y-1 hover:shadow-cardGlow">
      <div className="relative aspect-square bg-autox-panel3 overflow-hidden">
        {product.genuine && (
          <Badge variant="genuine" className="absolute top-2.5 left-2.5 z-10">
            Genuine
          </Badge>
        )}
        {product.discount && (
          <Badge variant="discount" className="absolute top-2.5 right-11 z-10">
            {product.discount}% OFF
          </Badge>
        )}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={toggleWishlist}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-autox-red transition-colors"
        >
          <Heart size={14} className={cn("text-white", wishlisted && "fill-autox-red text-autox-red")} />
        </button>
        <Link href={`/products/${product.slug}`}>
          <img
            src={image.url}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Badge variant="outOfStock">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3.5">
        <Link href={`/products/${product.slug}`} className="font-semibold text-white text-sm leading-snug hover:text-autox-red transition-colors line-clamp-2">
          {product.name}
        </Link>
        <p className="text-xs text-autox-gray mt-1">
          {product.compatibleModels[0]?.brand} {product.compatibleModels[0]?.model} ({product.compatibleModels[0]?.years})
        </p>
        <p className="text-[11px] text-autox-gray">{product.brand} &middot; {product.partType}</p>

        <div className="mt-2">
          <Rating value={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <PriceDisplay price={product.price} previousPrice={product.previousPrice} size="sm" />
          {product.inStock ? (
            <span className="text-[10px] text-green-500 font-semibold">In Stock</span>
          ) : (
            <span className="text-[10px] text-autox-gray font-semibold">Out of Stock</span>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <button
            disabled={!product.inStock || adding}
            onClick={addToCart}
            className={cn(
              "relative flex items-center justify-center gap-1.5 h-9 overflow-hidden rounded-sm disabled:bg-autox-panel3 disabled:text-autox-gray text-white text-xs font-bold uppercase tracking-wide transition-all",
              added ? "bg-autox-panel3 ring-1 ring-autox-red text-white" : "bg-autox-red hover:bg-autox-redDark"
            )}
          >
            {adding ? <><Bike size={15} className="autox-bike-run" /><span>Adding...</span></> : added ? <><Check size={14} /><span>Added</span></> : <><ShoppingCart size={13} /><span>Add to Cart</span></>}
          </button>
          {message && <p className="text-[11px] text-autox-gray text-center">{message}</p>}
          {product.installmentAvailable && (
            <span className="flex items-center justify-center gap-1.5 h-8 rounded-sm border border-autox-border text-autox-gray text-[11px] font-semibold uppercase tracking-wide"><CreditCard size={12} /> Installment available</span>
          )}
          <button type="button" onClick={addToCompare} className="flex h-8 items-center justify-center gap-1.5 rounded-sm border border-autox-border text-[11px] font-semibold uppercase tracking-wide text-autox-gray hover:border-autox-red/50 hover:text-white"><GitCompareArrows size={12}/>{compared ? "Compared" : "Compare"}</button>
        </div>
      </div>
    </div>
  );
}
