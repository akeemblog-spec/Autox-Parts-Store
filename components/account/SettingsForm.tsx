"use client";
import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export function SettingsForm({initial}:{initial:{orderUpdates:boolean;promotions:boolean;productNews:boolean}}){
  const[f,setF]=useState(initial);const[msg,setMsg]=useState('');
  const save=async()=>{const r=await fetch('/api/account/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)});setMsg(r.ok?'Preferences saved.':'Unable to save.');};
  const rows=[['orderUpdates','Order updates','Receive important status updates about your orders.'],['promotions','Offers & promotions','Receive occasional AutoX promotional updates.'],['productNews','New products','Hear about new products and parts.']] as const;
  return <div className="rounded-md border border-autox-border bg-autox-panel p-5"><h2 className="font-bold text-white">Notifications & Preferences</h2><div className="mt-4 divide-y divide-autox-border">{rows.map(([k,t,d])=><div key={k} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-white">{t}</p><p className="mt-1 text-xs text-autox-gray">{d}</p></div><ToggleSwitch checked={f[k]} onChange={(next)=>setF({...f,[k]:next})} label={t}/></div>)}</div>{msg&&<p className="mt-3 text-xs text-autox-gray">{msg}</p>}<button onClick={save} className="mt-4 rounded-sm bg-autox-red px-5 py-2.5 text-xs font-bold text-white">Save Settings</button></div>
}
