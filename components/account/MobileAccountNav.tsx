"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  PackageCheck,
  Settings,
  Truck,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "My Orders", href: "/account/orders", icon: PackageCheck },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Profile Details", href: "/account/profile", icon: UserRound },
  { label: "Track Orders", href: "/orders/track", icon: Truck },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export function MobileAccountNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (label: string, href: string, exact?: boolean) => {
    const path = href.split("#")[0];
    if (label === "Dashboard") return pathname === "/account";
    if (exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const current = items.find((item) => isActive(item.label, item.href, item.exact)) ?? items[0];
  const CurrentIcon = current.icon;

  return (
    <div className="sticky top-16 z-[125] border-b border-white/[.06] bg-black/90 px-4 py-2.5 backdrop-blur-xl lg:hidden">
      <div className="mx-auto max-w-[1600px]">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/[.08] bg-[#111113] px-3.5 py-3 text-left shadow-[0_12px_35px_rgba(0,0,0,.28)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-autox-red text-white shadow-[0_8px_22px_rgba(237,28,36,.28)]"><CurrentIcon size={18} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[9px] font-black uppercase tracking-[.2em] text-zinc-500">My Account</span><span className="mt-0.5 block truncate text-sm font-extrabold text-white">{current.label}</span></span>
          <ChevronDown size={18} className={cn("text-zinc-400 transition-transform duration-200", open && "rotate-180 text-white")} />
        </button>

        <div className={cn("grid transition-[grid-template-rows,opacity] duration-250", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="min-h-0 overflow-hidden">
            <nav aria-label="Mobile account navigation" className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-white/[.07] bg-[#0d0d0f] p-2 shadow-2xl">
              {items.map(({ label, href, icon: Icon, exact }) => {
                const active = isActive(label, href, exact);
                return (
                  <Link key={label} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition-colors", active ? "border-autox-red/35 bg-autox-red/10 text-white" : "border-white/[.045] bg-white/[.02] text-zinc-400 hover:text-white")}>
                    <Icon size={16} className={active ? "text-autox-red" : "text-zinc-500"} />
                    <span className="min-w-0 leading-4">{label}</span>
                  </Link>
                );
              })}
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-autox-red/20 bg-autox-red/[.06] px-3 text-[11px] font-bold text-autox-red">
                <LogOut size={15} /> Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
