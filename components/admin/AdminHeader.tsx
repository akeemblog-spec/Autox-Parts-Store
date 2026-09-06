"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Package, ShoppingBag, UserRound, Loader2 } from "lucide-react";

import { AdminNotifications } from "./AdminNotifications";

type Result={type:"order"|"product"|"customer";id:string;title:string;subtitle:string;href:string};
const icons={order:ShoppingBag,product:Package,customer:UserRound};

export function AdminHeader({name="Admin",role="admin",onMenuOpen}:{name?:string;role?:"admin"|"super_admin";onMenuOpen?:()=>void}){
  const router=useRouter();
  const[q,setQ]=useState("");const[results,setResults]=useState<Result[]>([]);const[open,setOpen]=useState(false);const[loading,setLoading]=useState(false);const request=useRef(0);
  useEffect(()=>{const term=q.trim();if(term.length<2)return;const id=++request.current;const t=window.setTimeout(async()=>{setLoading(true);try{const r=await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`,{cache:"no-store"});const d=r.ok?await r.json():{results:[]};if(id!==request.current)return;setResults(d.results||[]);setOpen(true);}finally{if(id===request.current)setLoading(false)}},220);return()=>window.clearTimeout(t)},[q]);
  const change=(value:string)=>{setQ(value);if(value.trim().length<2){request.current++;setResults([]);setOpen(false);setLoading(false);}};
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(results[0]){setOpen(false);router.push(results[0].href);}};
  return <header className="sticky top-0 z-40 flex h-16 items-center border-b border-autox-border bg-black/95 px-4 backdrop-blur lg:px-6">
    <button onClick={onMenuOpen} className="mr-3 text-autox-gray hover:text-white lg:hidden" aria-label="Open admin menu"><Menu size={20}/></button>
    <div className="relative hidden w-full max-w-lg md:block"><div className="overflow-hidden rounded-sm border border-autox-border bg-autox-panel transition-colors focus-within:border-autox-red"><form onSubmit={submit} className="flex h-9 items-center"><Search size={14} className="ml-3 text-autox-gray"/><input value={q} onChange={e=>change(e.target.value)} onFocus={()=>{if(q.trim().length>=2)setOpen(true)}} onBlur={()=>{window.setTimeout(()=>setOpen(false),150)}} placeholder="Search order ID, product, customer..." className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-3 text-xs text-white outline-none ring-0 placeholder:text-autox-gray focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none"/><button type="submit" aria-label="Search admin" className="flex h-full w-10 items-center justify-center border-0 bg-autox-red text-white outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none">{loading?<Loader2 size={14} className="animate-spin"/>:<Search size={14}/>}</button></form></div>{open&&<div className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-y-auto rounded-sm border border-autox-border bg-autox-panel2 shadow-2xl">{loading&&results.length===0?<div className="px-4 py-4 text-xs text-autox-gray">Searching…</div>:results.length?results.map(r=>{const Icon=icons[r.type];return <Link key={`${r.type}-${r.id}`} href={r.href} onClick={()=>setOpen(false)} className="flex items-center gap-3 border-b border-autox-border/70 px-3 py-3 last:border-0 hover:bg-autox-panel3"><span className="grid h-8 w-8 place-items-center rounded-sm bg-autox-red/10 text-autox-red"><Icon size={14}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">{r.title}</span><span className="block truncate text-[10px] capitalize text-autox-gray">{r.type} · {r.subtitle}</span></span></Link>}):<div className="px-4 py-4 text-xs text-autox-gray">No matches found.</div>}</div>}</div>
    <div className="ml-auto flex items-center gap-3"><AdminNotifications/><span className="flex h-8 w-8 items-center justify-center rounded-full bg-autox-red text-xs font-extrabold text-white">{name.slice(0,1).toUpperCase()}</span><div className="hidden sm:block"><p className="text-xs font-semibold text-white">{name}</p><p className="text-[10px] text-autox-gray">{role === "super_admin" ? "Super Admin" : "Store Admin"}</p></div></div>
  </header>;
}
