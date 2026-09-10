"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap, CreditCard, Heart, Truck, ShieldCheck, RotateCcw, Bike, Check, GitCompareArrows } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { loadSavedProductState } from "@/lib/client/saved-products-cache";
import type { findProductBySlug, findRelatedProducts } from "@/lib/db-queries/products";

type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof findProductBySlug>>>;
type RelatedProduct = Awaited<ReturnType<typeof findRelatedProducts>>[number];

const partTypeLabels: Record<string, string> = {
  genuine_honda: "Genuine Honda",
  genuine: "Genuine",
  oem: "OEM",
  aftermarket: "Aftermarket",
};

export function ProductDetailView({
  product,
  related,
}: {
  product: ProductWithRelations;
  related: RelatedProduct[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [compared, setCompared] = useState(false);
  const [reviewRating,setReviewRating]=useState(5);const[reviewComment,setReviewComment]=useState("");const[reviewMessage,setReviewMessage]=useState<string|null>(null);

  useEffect(() => {
    if (!session?.user?.id || session.user.invalidated) return;
    let mounted = true;
    loadSavedProductState().then((saved) => {
      if (!mounted) return;
      setWishlisted(saved.wishlist.has(product.id));
      setCompared(saved.compare.has(product.id));
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, [session?.user?.id, session?.user?.invalidated, product.id]);

  const submitReview=async(e:React.FormEvent)=>{e.preventDefault();if(!session?.user?.id){router.push(`/login?callbackUrl=/products/${product.slug}`);return;}const r=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:product.id,rating:reviewRating,comment:reviewComment})});const d=await r.json();setReviewMessage(r.ok?'Thanks. Your verified-purchase review is awaiting approval.':d.error||'Unable to submit review.');if(r.ok)setReviewComment('')};

  const inStock = product.stock > 0;
  const partTypeLabel = partTypeLabels[product.partType] ?? product.partType;

  const addToCart = async (goToCart = false) => {
    if (!session?.user?.id || session.user.invalidated) {
      router.push(`/login?callbackUrl=/products/${product.slug}`);
      return;
    }
    setAdding(true);
    setMessage(null);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    setAdding(false);
    if (res.ok) {
      setMessage(goToCart ? "Added — opening cart..." : "Added to cart.");
      setAdded(true);
      window.dispatchEvent(new Event("autox-cart-updated"));
      window.setTimeout(() => setAdded(false), 1200);
      if (goToCart) router.push("/cart?checkout=1");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Couldn't add to cart. Try again.");
    }
  };

  const toggleWishlist = async () => {
    if (!session?.user?.id || session.user.invalidated) {
      router.push(`/login?callbackUrl=/products/${product.slug}`);
      return;
    }
    setWishlisted((v) => !v);
    const res = await fetch(wishlisted ? `/api/wishlist/${product.id}` : "/api/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: wishlisted ? undefined : { "Content-Type": "application/json" },
      body: wishlisted ? undefined : JSON.stringify({ productId: product.id }),
    });
    if (res.ok) window.dispatchEvent(new Event("autox-wishlist-updated"));
  };


  const addToCompare = async () => {
    if (!session?.user?.id || session.user.invalidated) { router.push(`/login?callbackUrl=/products/${product.slug}`); return; }
    const res = await fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setCompared(true); setMessage(data.alreadyAdded ? "Already in comparison." : "Added to comparison."); }
    else setMessage(data.error || "Unable to add to comparison.");
  };

  return (
    <>
      
      
      

      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Brands", href: "/brands" },
              { label: product.brand.name, href: `/brands/${product.brand.slug}` },
              { label: product.name },
            ]}
          />
        </div>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 grid lg:grid-cols-2 gap-10">
          <div>
            <div className="aspect-square bg-autox-panel border border-autox-border rounded-2xl overflow-hidden relative">
              {product.genuine && <Badge variant="genuine" className="absolute top-3 left-3 z-10">Genuine</Badge>}
              {product.images[activeImage] && (
                <img
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].alt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "w-16 h-16 rounded-xl overflow-hidden border-2",
                      idx === activeImage ? "border-autox-red" : "border-autox-border"
                    )}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-autox-red font-bold uppercase tracking-wide">
              {product.brand.name} &middot; {partTypeLabel}
            </p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">{product.name}</h1>
            <div className="mt-3">
              <Rating value={product.rating} reviewCount={product.reviewCount} size={16} />
            </div>

            <div className="mt-4">
              <PriceDisplay price={product.price} previousPrice={product.previousPrice ?? undefined} size="lg" />
              {product.discount && (
                <span className="inline-block mt-1 text-xs font-bold text-autox-red">
                  Save {product.discount}% &mdash; Limited time offer
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-autox-gray leading-relaxed">{product.description}</p>

            <div className="mt-4">
              {inStock ? (
                <span className="text-xs font-semibold text-green-500">In Stock &middot; {product.stock} available</span>
              ) : (
                <span className="text-xs font-semibold text-autox-gray">Out of Stock</span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.compatibility.map((c) => (
                <span key={c.id} className="text-xs bg-autox-panel3 border border-autox-border rounded-xl px-2.5 py-1 text-autox-gray">
                  Fits: {c.brandName} {c.modelName} ({c.years})
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-autox-border rounded-xl">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-white hover:text-autox-red"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-white">{quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                  className="w-10 h-11 flex items-center justify-center text-white hover:text-autox-red"
                >
                  <Plus size={15} />
                </button>
              </div>
              <Button disabled={!inStock || adding} onClick={() => addToCart(false)} className={`relative flex-1 min-w-[160px] h-11 overflow-hidden ${added ? "!bg-autox-panel3 ring-1 ring-autox-red !text-white" : ""}`}>
                {adding ? <><Bike size={17} className="autox-bike-run" /> Adding...</> : added ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
              </Button>
              <Button disabled={!inStock || adding} onClick={() => addToCart(true)} variant="secondary" className="flex-1 min-w-[160px] h-11">
                <Zap size={16} /> Buy Now
              </Button>
              <button type="button" aria-label="Add to comparison" onClick={addToCompare} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-autox-border px-3 text-xs font-bold uppercase text-autox-gray hover:border-autox-red hover:text-white"><GitCompareArrows size={16}/><span className="hidden sm:inline">{compared ? "Compared" : "Compare"}</span></button>
              <button
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
                onClick={toggleWishlist}
                className="w-11 h-11 flex items-center justify-center border border-autox-border rounded-xl hover:border-autox-red"
              >
                <Heart size={17} className={cn("text-white", wishlisted && "fill-autox-red text-autox-red")} />
              </button>
            </div>

            {message && <p className="mt-2 text-xs text-autox-gray">{message}</p>}

            {product.installmentAvailable && (
              <div className="mt-3 flex items-center gap-2 text-xs text-autox-gray bg-autox-panel border border-autox-border rounded-xl px-3 py-2.5">
                <CreditCard size={15} className="text-autox-red" />
                Available on 0% interest installment plans &mdash; select at checkout.
              </div>
            )}

            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs text-autox-gray">
                <Truck size={16} className="text-autox-red" /> {product.deliveryEstimate}
              </div>
              <div className="flex items-center gap-2 text-xs text-autox-gray">
                <ShieldCheck size={16} className="text-autox-red" /> {product.warranty}
              </div>
              <div className="flex items-center gap-2 text-xs text-autox-gray">
                <RotateCcw size={16} className="text-autox-red" /> 7 days easy returns
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-8 border-t border-autox-border">
          <h2 className="text-lg font-extrabold text-white uppercase tracking-wide mb-4">Specifications</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-2 max-w-3xl">
            {product.specifications.map((spec) => (
              <div key={spec.id} className="flex justify-between py-2 border-b border-autox-border/60 text-sm">
                <span className="text-autox-gray">{spec.label}</span>
                <span className="text-white font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] border-t border-autox-border px-4 py-8 lg:px-6"><div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div><h2 className="mb-4 text-lg font-extrabold uppercase tracking-wide text-white">Customer Reviews</h2>{product.reviews.length? <div className="space-y-3">{product.reviews.map(r=><article key={r.id} className="rounded-2xl border border-autox-border bg-autox-panel p-4"><div className="flex items-center justify-between"><b className="text-sm text-white">{r.user.name||'Verified Customer'}</b><span className="text-xs text-autox-red">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div>{r.comment&&<p className="mt-2 text-sm text-autox-gray">{r.comment}</p>}<p className="mt-2 text-[10px] font-bold uppercase text-green-400">Verified Purchase</p></article>)}</div>:<p className="text-sm text-autox-gray">No approved reviews yet.</p>}</div><form onSubmit={submitReview} className="h-fit rounded-2xl border border-autox-border bg-autox-panel p-4"><h3 className="text-sm font-bold text-white">Review this product</h3><p className="mt-1 text-[11px] text-autox-gray">Available to customers with a delivered purchase.</p><select value={reviewRating} onChange={e=>setReviewRating(Number(e.target.value))} className="mt-3 w-full rounded border border-autox-border bg-black p-2 text-sm">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select><textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Share your experience" className="mt-2 min-h-24 w-full rounded border border-autox-border bg-black p-2 text-sm"/><button className="mt-2 w-full rounded bg-autox-red p-2 text-xs font-bold">Submit Review</button>{reviewMessage&&<p className="mt-2 text-xs text-autox-gray">{reviewMessage}</p>}</form></div></section>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-8 border-t border-autox-border pb-14">
            <h2 className="text-lg font-extrabold text-white uppercase tracking-wide mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {related.map((p) => (
                <a
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col bg-autox-panel border border-autox-border rounded-2xl overflow-hidden hover:border-autox-red/60 transition-colors"
                >
                  <div className="aspect-square bg-autox-panel3 overflow-hidden">
                    {p.images[0] && (
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">{p.name}</p>
                    <p className="text-white font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      
    </>
  );
}
