"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppUI } from "@/components/ui/AppUIProvider";

type Counts = { orders:number; reviews:number; messages:number; returns:number; products:number; adminAccounts:number };
type AdminNotification = { id:string; title:string; message:string|null; href:string; readAt:string|null; createdAt:string };

type LiveContextValue = {
  counts: Counts;
  notifications: AdminNotification[];
  refreshNow: () => Promise<void>;
  markNotificationRead: (id:string) => Promise<void>;
};

const EMPTY: Counts = { orders:0,reviews:0,messages:0,returns:0,products:0,adminAccounts:0 };
const AdminLiveContext = createContext<LiveContextValue | null>(null);
const LIVE_ROUTES = ["/admin","/admin/orders","/admin/messages","/admin/returns","/admin/reviews","/admin/inventory"];

export function AdminLiveProvider({children}:{children:React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useAppUI();
  const [counts,setCounts] = useState<Counts>(EMPTY);
  const [notifications,setNotifications] = useState<AdminNotification[]>([]);
  const previous = useRef<Counts | null>(null);
  const running = useRef(false);

  const refreshNow = useCallback(async()=>{
    if(running.current) return;
    running.current = true;
    try {
      const [countsRes,notificationsRes] = await Promise.all([
        fetch('/api/admin/attention-counts',{cache:'no-store'}),
        fetch('/api/admin/notifications',{cache:'no-store'}),
      ]);
      // A failed request must not clear a badge or generate a false "change" toast.
      const nextCounts:Counts|null = countsRes.ok ? await countsRes.json() : null;
      const nextNotifications:AdminNotification[]|null = notificationsRes.ok ? ((await notificationsRes.json()).notifications || []) : null;

      if(nextCounts && previous.current){
        const before = previous.current;
        const increases = [
          ["orders", "New order received"],
          ["messages", "New customer message"],
          ["returns", "New return request"],
          ["reviews", "New review awaiting moderation"],
          ["products", "Inventory alert updated"],
        ] as const;
        const changed = increases.some(([key])=>nextCounts[key] !== before[key]);
        for(const [key,label] of increases){
          if(nextCounts[key] > before[key]) toast(label,'info');
        }
        if(changed && LIVE_ROUTES.some(route=>pathname===route || (route!=="/admin" && pathname.startsWith(route)))){
          router.refresh();
        }
      }

      if(nextCounts){ previous.current = nextCounts; setCounts(nextCounts); }
      if(nextNotifications) setNotifications(nextNotifications);
    } catch {
      // Keep current UI state if a background refresh fails.
    } finally {
      running.current = false;
    }
  },[pathname,router,toast]);

  useEffect(()=>{
    refreshNow();
    const timer = window.setInterval(()=>{ if(document.visibilityState === 'visible') refreshNow(); },12000);
    const onFocus = ()=>refreshNow();
    const onVisibility = ()=>{ if(document.visibilityState === 'visible') refreshNow(); };
    window.addEventListener('focus',onFocus);
    document.addEventListener('visibilitychange',onVisibility);
    return ()=>{ window.clearInterval(timer); window.removeEventListener('focus',onFocus); document.removeEventListener('visibilitychange',onVisibility); };
  },[refreshNow]);

  const markNotificationRead = useCallback(async(id:string)=>{
    setNotifications(v=>v.map(x=>x.id===id?{...x,readAt:new Date().toISOString()}:x));
    try {
      const response = await fetch('/api/admin/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
      if(!response.ok) throw new Error('Unable to mark notification as read');
    } catch {
      await refreshNow();
      toast('Could not mark notification as read. Please try again.','error');
    }
  },[refreshNow,toast]);

  const value = useMemo(()=>({counts,notifications,refreshNow,markNotificationRead}),[counts,notifications,refreshNow,markNotificationRead]);
  return <AdminLiveContext.Provider value={value}>{children}</AdminLiveContext.Provider>;
}

export function useAdminLive(){
  const value = useContext(AdminLiveContext);
  if(!value) throw new Error('useAdminLive must be used inside AdminLiveProvider');
  return value;
}
