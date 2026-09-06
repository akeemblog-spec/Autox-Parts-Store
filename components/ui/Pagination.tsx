import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize, total, pathname, params = {} }: { page: number; pageSize: number; total: number; pathname: string; params?: Record<string, string | undefined> }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const href = (target: number) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value); });
    qs.set("page", String(target));
    qs.set("limit", String(pageSize));
    return `${pathname}?${qs.toString()}`;
  };
  const start = Math.max(1, Math.min(totalPages - 4, page - 2));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter((n) => n <= totalPages);
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);
  return <div className="mt-4 flex flex-col gap-3 rounded-md border border-autox-border bg-autox-panel px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"><p className="text-autox-gray">Showing <span className="font-semibold text-white">{firstItem}-{lastItem}</span> of <span className="font-semibold text-white">{total}</span></p><div className="flex items-center gap-1"><Link aria-disabled={page <= 1} className={`grid h-8 w-8 place-items-center rounded-sm border ${page <= 1 ? "pointer-events-none border-autox-border text-autox-gray/40" : "border-autox-border text-autox-gray hover:border-autox-red hover:text-white"}`} href={href(Math.max(1,page-1))}><ChevronLeft size={14}/></Link>{pages.map((n) => <Link key={n} href={href(n)} className={`grid h-8 min-w-8 place-items-center rounded-sm border px-2 font-bold ${n===page ? "border-autox-red bg-autox-red text-white" : "border-autox-border text-autox-gray hover:border-autox-red hover:text-white"}`}>{n}</Link>)}<Link aria-disabled={page >= totalPages} className={`grid h-8 w-8 place-items-center rounded-sm border ${page >= totalPages ? "pointer-events-none border-autox-border text-autox-gray/40" : "border-autox-border text-autox-gray hover:border-autox-red hover:text-white"}`} href={href(Math.min(totalPages,page+1))}><ChevronRight size={14}/></Link></div></div>;
}
