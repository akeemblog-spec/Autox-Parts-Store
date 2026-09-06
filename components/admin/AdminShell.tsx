"use client";
import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminShell({children,name,role}:{children:React.ReactNode;name:string;role:"admin"|"super_admin"}){const[open,setOpen]=useState(false);return <div className="min-h-screen bg-black text-white"><div className="fixed inset-y-0 left-0 z-50 hidden lg:block"><AdminSidebar role={role}/></div>{open&&<><button aria-label="Close menu" onClick={()=>setOpen(false)} className="fixed inset-0 z-50 bg-black/70 lg:hidden"/><div className="fixed inset-y-0 left-0 z-[60] lg:hidden"><AdminSidebar role={role} mobile onClose={()=>setOpen(false)}/></div></>}<div className="lg:pl-64"><AdminHeader name={name} role={role} onMenuOpen={()=>setOpen(true)}/><main className="mx-auto max-w-[1700px] p-4 lg:p-6">{children}</main><footer className="flex flex-col justify-between gap-2 border-t border-autox-border px-6 py-4 text-[10px] text-autox-gray sm:flex-row"><span>© {new Date().getFullYear()} AutoX Parts Store. All rights reserved.</span><span>Logged in as {role === "super_admin" ? "Super Admin" : "Store Admin"}</span></footer></div></div>}
