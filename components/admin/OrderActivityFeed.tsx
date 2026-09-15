"use client";

import { useEffect, useState } from "react";
import { Activity, UserRound } from "lucide-react";

type Entry={id:string;action:string;metadata:string|null;createdAt:string;actorName:string|null;actorEmail:string|null};

function label(action:string,metadata:string|null){
  let detail="";
  try{const parsed=metadata?JSON.parse(metadata):null;if(parsed?.status)detail=` · ${String(parsed.status).replaceAll('_',' ')}`;}catch{}
  const base=action.replace(/^order\./,'').replaceAll('_',' ');
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${detail}`;
}

export function OrderActivityFeed({orderId}:{orderId:string}){
  const[rows,setRows]=useState<Entry[]>([]);
  useEffect(()=>{let alive=true;fetch(`/api/admin/orders/${orderId}/activity`,{cache:'no-store'}).then(r=>r.ok?r.json():{activity:[]}).then(d=>{if(alive)setRows(d.activity||[])}).catch(()=>{});return()=>{alive=false}},[orderId]);
  return <div className="mt-5 border-t border-autox-border pt-4"><div className="mb-3 flex items-center gap-2"><Activity size={14} className="text-autox-red"/><h4 className="text-xs font-bold uppercase text-white">Admin Activity</h4></div>{rows.length?<div className="space-y-2">{rows.map(row=><div key={row.id} className="flex gap-3 rounded-lg bg-black/25 px-3 py-2.5"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[.04] text-autox-gray"><UserRound size={13}/></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold capitalize text-white">{label(row.action,row.metadata)}</p><p className="mt-1 text-[10px] text-autox-gray">{row.actorName||row.actorEmail||'System'} · {new Date(row.createdAt).toLocaleString('en-LK')}</p></div></div>)}</div>:<p className="text-xs text-autox-gray">No admin changes recorded for this order yet.</p>}</div>;
}
