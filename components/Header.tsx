"use client";
/* eslint-disable react-hooks/set-state-in-effect -- header counts intentionally follow auth state */

import Link from "next/link";
import { Heart, GitCompareArrows, ShoppingCart, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { MobileNav } from "./MobileNav";

export function Header({ cartCount = 0, wishlistCount = 0 }: { cartCount?: number; wishlistCount?: number }) {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);
  const [liveWishlistCount, setLiveWishlistCount] = useState(wishlistCount);
  const [liveCompareCount, setLiveCompareCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id) && !session?.user?.invalidated;

  useEffect(() => {
    if (!isAuthenticated) {
      setLiveCartCount(0);
      setLiveWishlistCount(0);
      setLiveCompareCount(0);
      return;
    }

    const refreshCounts = async () => {
      const [cartRes, wishlistRes, compareRes] = await Promise.all([
        fetch("/api/cart", { cache: "no-store" }),
        fetch("/api/wishlist", { cache: "no-store" }),
        fetch("/api/compare", { cache: "no-store" }),
      ]);
      if (cartRes.ok) {
        const cart = await cartRes.json();
        setLiveCartCount((cart.items ?? []).reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0), 0));
      }
      if (wishlistRes.ok) {
        const wishlist = await wishlistRes.json();
        setLiveWishlistCount((wishlist.items ?? []).length);
      }
      if (compareRes.ok) {
        const compare = await compareRes.json();
        setLiveCompareCount((compare.items ?? []).length);
      }
    };

    const onCartUpdated = () => {
      refreshCounts();
      setCartPulse(false);
      window.requestAnimationFrame(() => setCartPulse(true));
      window.setTimeout(() => setCartPulse(false), 500);
    };

    refreshCounts();
    window.addEventListener("autox-cart-updated", onCartUpdated);
    window.addEventListener("autox-wishlist-updated", refreshCounts);
    window.addEventListener("autox-compare-updated", refreshCounts);
    return () => {
      window.removeEventListener("autox-cart-updated", onCartUpdated);
      window.removeEventListener("autox-wishlist-updated", refreshCounts);
      window.removeEventListener("autox-compare-updated", refreshCounts);
    };
  }, [isAuthenticated, session?.user?.id]);

  const countLabel = (count: number) => count > 99 ? "99+" : count;

  return (
    <header className="sticky top-0 z-[180] border-b border-autox-border bg-black/95 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[44px_1fr_44px] items-center gap-2 px-3 md:flex md:h-20 md:justify-between md:gap-4 lg:px-6">
        <MobileNav cartCount={liveCartCount} wishlistCount={liveWishlistCount} compareCount={liveCompareCount} />

        <Link href="/" className="flex shrink-0 flex-col items-center justify-self-center leading-none md:items-start md:justify-self-auto">
          <span className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">AUTO<span className="text-autox-red">X</span></span>
          <span className="-mt-0.5 text-[9px] font-semibold tracking-[0.3em] text-autox-gray lg:text-[10px]">PARTS STORE</span>
        </Link>

        <SearchBar />

        <Link href="/wishlist" aria-label={`Wishlist${liveWishlistCount ? `, ${liveWishlistCount} items` : ""}`} className="relative flex h-11 w-11 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white md:hidden">
          <Heart size={21} className={liveWishlistCount > 0 ? "fill-autox-red/20 text-autox-red" : ""} />
          {liveWishlistCount > 0 && <span className="autox-count-badge absolute -right-0.5 top-0.5">{countLabel(liveWishlistCount)}</span>}
        </Link>

        <div className="hidden shrink-0 items-center gap-1 md:flex lg:gap-2">
          <div className="relative hidden md:block">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white">
              <User size={19} />{isAuthenticated ? session.user?.name?.split(" ")[0] : "Account"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-[260] mt-2 w-52 rounded-xl border border-autox-border bg-[#101012] py-2 shadow-2xl">
                {isAuthenticated ? <>
                  {["admin", "super_admin"].includes(session.user?.role ?? "") && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-autox-gray hover:bg-autox-panel3 hover:text-white">Admin Dashboard</Link>}
                  <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-autox-gray hover:bg-autox-panel3 hover:text-white">My Account</Link>
                  <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-autox-red hover:bg-autox-panel3"><LogOut size={14}/> Sign Out</button>
                </> : <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-autox-gray hover:bg-autox-panel3 hover:text-white">Sign In</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-autox-gray hover:bg-autox-panel3 hover:text-white">Create Account</Link>
                </>}
              </div>
            )}
          </div>
          <Link href="/wishlist" className="hidden items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white md:flex"><span className="relative"><Heart size={19}/>{liveWishlistCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{countLabel(liveWishlistCount)}</span>}</span>Wishlist</Link>
          <Link href="/compare" className="hidden items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white md:flex"><span className="relative"><GitCompareArrows size={19}/>{liveCompareCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{liveCompareCount}</span>}</span>Compare</Link>
          <Link href="/cart" className="flex items-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[.04] hover:text-autox-red"><span className={`relative ${cartPulse ? "autox-cart-pulse" : ""}`}><ShoppingCart size={20}/>{liveCartCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{countLabel(liveCartCount)}</span>}</span><span className="hidden md:inline">Cart</span></Link>
        </div>
      </div>
    </header>
  );
}
