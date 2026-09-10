"use client";
/* eslint-disable react-hooks/set-state-in-effect -- header counts intentionally follow auth state */

import Link from "next/link";
import { Heart, GitCompareArrows, ShoppingCart, User, LogOut, LayoutDashboard, UserRound, PackageSearch, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils/cn";

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
            <button onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} className={cn("flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white", menuOpen && "bg-white/[.05] text-white")}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20">
                {isAuthenticated && session.user?.name ? <span className="text-[11px] font-black">{session.user.name.trim().charAt(0).toUpperCase()}</span> : <User size={15} />}
              </span>
              {isAuthenticated ? session.user?.name?.split(" ")[0] : "Account"}
              <ChevronDown size={14} className={cn("text-zinc-600 transition-transform", menuOpen && "rotate-180")} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-[260] mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#101012] shadow-[0_24px_60px_rgba(0,0,0,.5)]">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-autox-red/[.14] to-transparent px-4 py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-autox-red text-sm font-black text-white shadow-[0_8px_20px_rgba(237,28,36,.3)]">
                        {session.user?.name?.trim().charAt(0).toUpperCase() ?? "A"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-white">{session.user?.name ?? "My Account"}</p>
                        <p className="truncate text-[11px] text-zinc-500">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="p-1.5">
                      {["admin", "super_admin"].includes(session.user?.role ?? "") && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white">
                          <LayoutDashboard size={16} className="text-autox-red" /> Admin Dashboard
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white">
                        <UserRound size={16} className="text-autox-red" /> My Account
                      </Link>
                      <Link href="/orders/track" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white">
                        <PackageSearch size={16} className="text-autox-red" /> Track Order
                      </Link>
                      <div className="my-1.5 h-px bg-white/[.06]" />
                      <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-autox-red transition-colors hover:bg-autox-red/10">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-1.5">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white">
                      <UserRound size={16} className="text-autox-red" /> Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[.05] hover:text-white">
                      <User size={16} className="text-autox-red" /> Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link href="/wishlist" className="hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white md:flex"><span className="relative"><Heart size={19}/>{liveWishlistCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{countLabel(liveWishlistCount)}</span>}</span>Wishlist</Link>
          <Link href="/compare" className="hidden items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-autox-gray transition-colors hover:bg-white/[.04] hover:text-white md:flex"><span className="relative"><GitCompareArrows size={19}/>{liveCompareCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{liveCompareCount}</span>}</span>Compare</Link>
          <Link href="/cart" className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-white/[.04] hover:text-autox-red"><span className={`relative ${cartPulse ? "autox-cart-pulse" : ""}`}><ShoppingCart size={20}/>{liveCartCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2.5">{countLabel(liveCartCount)}</span>}</span><span className="hidden md:inline">Cart</span></Link>
        </div>
      </div>
    </header>
  );
}
