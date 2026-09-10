import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Package;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-autox-border bg-gradient-to-br from-autox-panel to-[#0c0c0e] p-3.5 text-left shadow-[0_10px_28px_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-1 hover:border-autox-red/60 hover:shadow-[0_16px_38px_rgba(0,0,0,.3)] sm:flex-col sm:p-5 sm:text-center"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20 transition-colors group-hover:bg-autox-red group-hover:text-white sm:mb-3 sm:h-14 sm:w-14 sm:rounded-2xl">
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="line-clamp-1 text-xs font-bold text-white sm:text-sm">{category.name}</div>
        <div className="mt-1 text-[10px] text-autox-gray sm:mt-1.5 sm:text-xs">{category.productCount} Products</div>
      </div>
    </Link>
  );
}
