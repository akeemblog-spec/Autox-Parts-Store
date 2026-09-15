"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, PackageCheck, MapPin, Heart, UserRound, CreditCard, Truck, Settings, LogOut, Headphones } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const nav = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "My Orders", href: "/account/orders", icon: PackageCheck },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Profile Details", href: "/account/profile", icon: UserRound },
  { label: "Payment Methods", href: "/account?section=payment#payment", icon: CreditCard, exact: true },
  { label: "Track Your Orders", href: "/orders/track", icon: Truck },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export function AccountSidebar({ wishlistCount = 0 }: { wishlistCount?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  return <aside className="hidden space-y-4 lg:sticky lg:top-32 lg:block lg:self-start"><div className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel"><nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Account navigation">{nav.map(({label,href,icon:Icon,exact})=>{const path=href.split('#')[0];const active=label==='Payment Methods'?pathname==='/account'&&section==='payment':label==='Dashboard'?pathname==='/account'&&!section:(exact?pathname===path:pathname===path||pathname.startsWith(`${path}/`));return <Link key={label} href={href} aria-current={active?'page':undefined} className={cn("group flex min-h-11 items-center gap-3 px-4 py-3 text-xs transition-all duration-200 sm:text-sm lg:mx-2 lg:my-1 lg:rounded-xl lg:border lg:px-3.5",active?"border-autox-red/35 bg-[linear-gradient(90deg,rgba(237,28,36,.16),rgba(237,28,36,.05))] text-white shadow-[inset_3px_0_0_#ed1c24,0_8px_24px_rgba(0,0,0,.18)]":"border-transparent text-autox-gray hover:border-white/[.06] hover:bg-white/[.035] hover:text-white")}><span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors",active?"bg-autox-red/15 text-autox-red":"bg-white/[.035] text-autox-gray group-hover:text-white")}><Icon size={16}/></span><span className="truncate">{label}</span>{label==='Wishlist'&&wishlistCount>0&&<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-autox-red px-1 text-[10px] font-bold text-white">{wishlistCount}</span>}</Link>})}<button onClick={()=>signOut({callbackUrl:'/'})} className="mx-2 my-1 flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-left text-xs text-autox-gray transition-all hover:border-autox-red/20 hover:bg-autox-red/[.05] hover:text-autox-red sm:text-sm"><LogOut size={17}/> Logout</button></nav></div><div className="hidden rounded-2xl border border-autox-border bg-autox-panel p-4 lg:block"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-autox-red/10 text-autox-red"><Headphones size={19}/></div><div><p className="text-sm font-bold text-white">Need Help?</p><p className="mt-1 text-xs leading-5 text-autox-gray">Our support team is here to help you.</p></div></div><Link href="/contact" className="mt-4 flex h-9 items-center justify-center rounded-xl border border-autox-red text-[11px] font-bold uppercase tracking-wide text-autox-red transition-colors hover:bg-autox-red hover:text-white">Contact Support</Link></div></aside>;
}
