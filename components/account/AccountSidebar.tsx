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
  return <aside className="hidden space-y-4 lg:sticky lg:top-32 lg:block lg:self-start"><div className="overflow-hidden rounded-md border border-autox-border bg-autox-panel"><nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Account navigation">{nav.map(({label,href,icon:Icon,exact})=>{const path=href.split('#')[0];const active=label==='Payment Methods'?pathname==='/account'&&section==='payment':label==='Dashboard'?pathname==='/account'&&!section:(exact?pathname===path:pathname===path||pathname.startsWith(`${path}/`));return <Link key={label} href={href} aria-current={active?'page':undefined} className={cn("flex min-h-11 items-center gap-3 px-4 py-3 text-xs transition-colors sm:text-sm lg:border-l-2",active?"border-autox-red bg-autox-red/15 text-autox-red":"border-transparent text-autox-gray hover:bg-autox-panel3 hover:text-white")}><Icon size={17} className="shrink-0"/><span className="truncate">{label}</span>{label==='Wishlist'&&wishlistCount>0&&<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-autox-red px-1 text-[10px] font-bold text-white">{wishlistCount}</span>}</Link>})}<button onClick={()=>signOut({callbackUrl:'/'})} className="flex min-h-11 items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left text-xs text-autox-gray transition-colors hover:bg-autox-panel3 hover:text-autox-red sm:text-sm"><LogOut size={17}/> Logout</button></nav></div><div className="hidden rounded-md border border-autox-border bg-autox-panel p-4 lg:block"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-autox-red/10 text-autox-red"><Headphones size={19}/></div><div><p className="text-sm font-bold text-white">Need Help?</p><p className="mt-1 text-xs leading-5 text-autox-gray">Our support team is here to help you.</p></div></div><Link href="/contact" className="mt-4 flex h-9 items-center justify-center rounded-sm border border-autox-red text-[11px] font-bold uppercase tracking-wide text-autox-red transition-colors hover:bg-autox-red hover:text-white">Contact Support</Link></div></aside>;
}
