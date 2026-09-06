"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Bike, Check } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ButtonLink } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface WishlistRow {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    previousPrice: number | null;
    images: { url: string; alt: string }[];
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && (!session?.user?.id || session.user.invalidated))) {
      router.push("/login?callbackUrl=/wishlist");
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [status, session?.user?.id, session?.user?.invalidated, router]);

  const remove = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
    window.dispatchEvent(new Event("autox-wishlist-updated"));
  };

  const addToCart = async (productId: string) => {
    setAddingId(productId);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setAddingId(null);
    if (res.ok) {
      setAddedId(productId);
      window.dispatchEvent(new Event("autox-cart-updated"));
      window.setTimeout(() => setAddedId((current) => current === productId ? null : current), 1200);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        
        
        
        <main>
          <LoadingState label="Loading your wishlist..." />
        </main>
        
      </>
    );
  }

  return (
    <>
      
      
      

      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        </div>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 pb-14">
          <h1 className="text-2xl font-extrabold text-white mb-6">Your Wishlist</h1>

          {items.length === 0 ? (
            <EmptyState
              title="Your wishlist is empty"
              description="Save parts you're interested in so you can find them easily later."
              action={<ButtonLink href="/products">Browse Parts</ButtonLink>}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(({ id, product }) => (
                <div key={id} className="flex flex-col bg-autox-panel border border-autox-border rounded-md overflow-hidden">
                  <div className="relative aspect-square bg-autox-panel3">
                    <button
                      aria-label="Remove from wishlist"
                      onClick={() => remove(product.id)}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-autox-red transition-colors"
                    >
                      <Heart size={14} className="fill-autox-red text-autox-red" />
                    </button>
                    <Link href={`/products/${product.slug}`}>
                      {product.images[0] && (
                        <img src={product.images[0].url} alt={product.images[0].alt} className="w-full h-full object-cover" />
                      )}
                    </Link>
                  </div>
                  <div className="p-3.5">
                    <Link href={`/products/${product.slug}`} className="font-semibold text-white text-sm hover:text-autox-red transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <div className="mt-2">
                      <PriceDisplay price={product.price} previousPrice={product.previousPrice ?? undefined} size="sm" />
                    </div>
                    <button
                      disabled={addingId === product.id}
                      onClick={() => addToCart(product.id)}
                      className={`mt-3 flex items-center justify-center gap-1.5 h-9 w-full overflow-hidden rounded-sm text-white text-xs font-bold uppercase tracking-wide transition-all ${addedId === product.id ? "bg-autox-panel3 ring-1 ring-autox-red text-white" : "bg-autox-red hover:bg-autox-redDark"}`}
                    >
                      {addingId === product.id ? <><Bike size={15} className="autox-bike-run" /> Adding...</> : addedId === product.id ? <><Check size={14} /> Added</> : <><ShoppingCart size={13} /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      
    </>
  );
}
