"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAdminLive } from "./AdminLiveProvider";

export function AdminNotifications(){
  const rootRef=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
  const {notifications:items,markNotificationRead}=useAdminLive();
  useEffect(()=>{if(!open)return;const close=(event:MouseEvent|TouchEvent)=>{const target=event.target as Node|null;if(target&&!rootRef.current?.contains(target))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};document.addEventListener('mousedown',close);document.addEventListener('touchstart',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('touchstart',close);document.removeEventListener('keydown',key)}},[open]);
  const unread=items.filter(x=>!x.readAt).length;
  return <div ref={rootRef} className="relative"><button onClick={()=>setOpen(v=>!v)} className="relative grid h-9 w-9 place-items-center rounded border border-autox-border bg-autox-panel text-autox-gray transition hover:border-autox-red/50 hover:text-white" aria-label="Admin notifications"><Bell size={16}/>{unread>0&&<span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-autox-red px-1 text-center text-[9px] font-bold leading-5 text-white shadow-[0_0_16px_rgba(237,28,36,.35)]">{unread>99?'99+':unread}</span>}</button>{open&&<div className="absolute right-0 top-11 z-50 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-autox-border bg-[#0b0b0c] shadow-2xl"><div className="flex items-center justify-between border-b border-autox-border px-4 py-3"><div><p className="text-xs font-bold text-white">Notifications</p><p className="mt-0.5 text-[10px] text-autox-gray">Updates refresh automatically</p></div>{unread>0&&<span className="rounded-full bg-autox-red/10 px-2 py-1 text-[9px] font-bold text-autox-red">{unread} new</span>}</div><div className="max-h-96 overflow-y-auto">{items.length?items.map(n=><Link key={n.id} href={n.href} onClick={()=>{markNotificationRead(n.id);setOpen(false)}} className={`block border-b border-autox-border/60 px-4 py-3 transition hover:bg-white/[.03] ${!n.readAt?'bg-autox-red/[.045]':''}`}><div className="flex gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.readAt?'bg-autox-red shadow-[0_0_10px_rgba(237,28,36,.55)]':'bg-transparent'}`}/><span><b className="block text-xs text-white">{n.title}</b>{n.message&&<span className="mt-1 block text-[11px] leading-5 text-autox-gray">{n.message}</span>}</span></div></Link>):<p className="p-5 text-xs text-autox-gray">No notifications yet.</p>}</div></div>}</div>;
}
