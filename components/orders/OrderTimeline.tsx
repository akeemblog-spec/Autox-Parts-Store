import { Check, ClipboardCheck, Home, Package, PackageCheck, Truck } from "lucide-react";
import { ORDER_STAGES, stageForOrderStatus } from "@/lib/order-status";

export type OrderHistoryEntry = { id?: string; status: string; title: string; description: string | null; createdAt: Date | string };
const icons = [ClipboardCheck, PackageCheck, Truck, Package, Home];

function formatStamp(value: Date | string | undefined) {
  if (!value) return <span className="text-zinc-600">Pending</span>;
  const d = new Date(value);
  return <><span>{d.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</span><span className="text-zinc-600">{d.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })}</span></>;
}

function historyForStage(history: OrderHistoryEntry[], key: string) {
  return history.find((h) => h.status === key || (key === "confirmed" && (h.status === "paid" || h.status === "processing" || h.status === "confirmed")) || (key === "shipped" && h.status === "shipped"));
}

export function OrderTimeline({ status, history, compact = false }: { status: string; history: OrderHistoryEntry[]; compact?: boolean }) {
  const stage = stageForOrderStatus(status);
  const currentIndex = Math.max(0, Math.min(ORDER_STAGES.length - 1, stage - 1));

  return (
    <div className={compact ? "mt-5" : "mt-6"}>
      <div className="hidden md:grid md:grid-cols-5">
        {ORDER_STAGES.map((item, index) => {
          const completed = index < stage - 1;
          const current = index === currentIndex && stage > 0;
          const reached = index < stage;
          const Icon = icons[index];
          const entry = historyForStage(history, item.key);
          return (
            <div key={item.key} className="relative flex min-w-0 flex-col items-center px-1 text-center">
              {index < ORDER_STAGES.length - 1 && (
                <div className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-[2px] overflow-hidden rounded-full bg-white/[.055]">
                  <span className={`block h-full rounded-full transition-all ${completed ? "w-full bg-autox-red shadow-[0_0_12px_rgba(237,28,36,.35)]" : "w-0"}`} />
                </div>
              )}
              <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition ${current ? "bg-autox-red text-white shadow-[0_0_0_6px_rgba(237,28,36,.09),0_10px_25px_rgba(237,28,36,.3)]" : completed ? "bg-autox-red/14 text-autox-red ring-1 ring-inset ring-autox-red/25" : "bg-white/[.045] text-zinc-600 ring-1 ring-inset ring-white/[.055]"}`}>
                {completed ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
              </span>
              <p className={`mt-2 text-[10px] font-black uppercase tracking-[.06em] ${reached ? "text-white" : "text-zinc-600"}`}>{item.label}</p>
              <div className="mt-1 flex min-h-8 flex-col text-[9px] leading-4 text-zinc-500">{formatStamp(entry?.createdAt)}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-0 md:hidden">
        {ORDER_STAGES.map((item, index) => {
          const completed = index < stage - 1;
          const current = index === currentIndex && stage > 0;
          const reached = index < stage;
          const Icon = icons[index];
          const entry = historyForStage(history, item.key);
          return (
            <div key={item.key} className="relative flex gap-3 pb-5 last:pb-0">
              {index < ORDER_STAGES.length - 1 && <div className={`absolute left-[19px] top-10 h-[calc(100%-40px)] w-[2px] rounded-full ${completed ? "bg-autox-red" : "bg-white/[.055]"}`} />}
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${current ? "bg-autox-red text-white shadow-[0_0_0_5px_rgba(237,28,36,.08),0_8px_20px_rgba(237,28,36,.26)]" : completed ? "bg-autox-red/14 text-autox-red ring-1 ring-inset ring-autox-red/25" : "bg-white/[.045] text-zinc-600 ring-1 ring-inset ring-white/[.055]"}`}>
                {completed ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
              </span>
              <div className={`min-w-0 flex-1 rounded-xl px-3 py-2.5 ${current ? "bg-autox-red/[.07]" : reached ? "bg-white/[.025]" : "bg-transparent"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2"><p className={`text-xs font-extrabold uppercase ${reached ? "text-white" : "text-zinc-600"}`}>{item.label}</p>{current && <span className="rounded-full bg-autox-red/12 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-autox-red">Current</span>}</div>
                <div className="mt-1 flex gap-2 text-[10px] text-zinc-500">{formatStamp(entry?.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrackingUpdates({ history }: { history: OrderHistoryEntry[] }) {
  const sorted = [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div className="mt-4 space-y-0">
      {sorted.map((entry, index) => {
        const Icon = entry.status === "delivered" ? Home : entry.status === "out_for_delivery" ? Package : entry.status === "shipped" ? Truck : (entry.status === "paid" || entry.status === "processing" || entry.status === "confirmed") ? PackageCheck : ClipboardCheck;
        return (
          <div key={entry.id || `${entry.status}-${entry.createdAt}`} className="relative flex gap-3 pb-3 last:pb-0">
            {index < sorted.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%-36px)] w-[2px] rounded-full bg-autox-red/25" />}
            <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-autox-red text-white shadow-[0_8px_22px_rgba(237,28,36,.24)]" : "bg-white/[.045] text-zinc-500 ring-1 ring-inset ring-white/[.06]"}`}><Icon size={15} /></span>
            <div className={`min-w-0 flex-1 rounded-xl px-4 py-3 ${index === 0 ? "bg-gradient-to-r from-autox-red/[.08] to-white/[.025]" : "bg-black/25"}`}>
              <div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-white">{entry.title}</p><span className="text-[10px] text-zinc-500">{new Date(entry.createdAt).toLocaleString("en-LK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
              {entry.description && <p className="mt-1 text-[11px] leading-5 text-zinc-500">{entry.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
