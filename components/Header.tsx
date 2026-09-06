"use client";
/* eslint-disable react-hooks/set-state-in-effect -- state is intentionally reset when external auth/search/filter inputs change */


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
  const [cartPulse, setCartPulse] = useState(false);
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id) && !session?.user?.invalidated;

  useEffect(() => {
    if (!isAuthenticated) {
      setLiveCartCount(0);
      setLiveWishlistCount(0);
      return;
    }

    const refreshCounts = async () => {
      const [cartRes, wishlistRes] = await Promise.all([fetch("/api/cart"), fetch("/api/wishlist")]);
      if (cartRes.ok) {
        const cart = await cartRes.json();
        setLiveCartCount((cart.items ?? []).reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0), 0));
      }
      if (wishlistRes.ok) {
        const wishlist = await wishlistRes.json();
        setLiveWishlistCount((wishlist.items ?? []).length);
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
    return () => {
      window.removeEventListener("autox-cart-updated", onCartUpdated);
      window.removeEventListener("autox-wishlist-updated", refreshCounts);
    };
  }, [isAuthenticated, session?.user?.id]);

  return (
    <header className="bg-black border-b border-autox-border sticky top-0 z-[180]">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6 flex items-center justify-between h-16 lg:h-20 gap-4">
        <MobileNav cartCount={liveCartCount} wishlistCount={liveWishlistCount} />

        <Link href="/" className="flex flex-col leading-none shrink-0">
          <span className="font-extrabold text-2xl lg:text-3xl tracking-tight text-white">
            AUTO<span className="text-autox-red">X</span>
          </span>
          <span className="text-[9px] lg:text-[10px] tracking-[0.3em] text-autox-gray font-semibold -mt-0.5">
            PARTS STORE
          </span>
        </Link>

        <SearchBar />

        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          <div className="relative hidden md:block">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 text-autox-gray hover:text-white text-xs font-medium px-2 py-2 transition-colors"
            >
              <User size={19} />
              {isAuthenticated ? session.user?.name?.split(" ")[0] : "Account"}
            </button>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-autox-panel2 border border-autox-border rounded-sm shadow-xl py-2 z-[260]">
                {isAuthenticated ? (
                  <>
                    {["admin", "super_admin"].includes(session.user?.role ?? "") && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-autox-gray hover:text-white hover:bg-autox-panel3 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-autox-gray hover:text-white hover:bg-autox-panel3 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-autox-red hover:bg-autox-panel3 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-autox-gray hover:text-white hover:bg-autox-panel3 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-autox-gray hover:text-white hover:bg-autox-panel3 transition-colors"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link
            href="/wishlist"
            className="hidden md:flex items-center gap-1.5 text-autox-gray hover:text-white text-xs font-medium px-2 py-2 transition-colors"
          >
            <span className="relative">
              <Heart size={19} />
              {liveWishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-autox-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {liveWishlistCount}
                </span>
              )}
            </span>
            Wishlist
          </Link>
          <Link
            href="/compare"
            className="hidden md:flex items-center gap-1.5 text-autox-gray hover:text-white text-xs font-medium px-2 py-2 transition-colors"
          >
            <GitCompareArrows size={19} />
            Compare
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-white hover:text-autox-red text-xs font-medium px-2 py-2 transition-colors"
          >
            <span className={`relative ${cartPulse ? "autox-cart-pulse" : ""}`}>
              <ShoppingCart size={20} />
              {liveCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-autox-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {liveCartCount}
                </span>
              )}
            </span>
            <span className="hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
