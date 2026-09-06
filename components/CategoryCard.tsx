import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Package;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex items-center gap-3 text-left sm:flex-col sm:text-center bg-gradient-to-br from-autox-panel to-autox-panel2 border border-autox-border rounded-md p-3 sm:p-5 transition-all duration-300 hover:border-autox-red/60 hover:-translate-y-1"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-md sm:rounded-full bg-autox-panel3 border border-autox-border flex items-center justify-center sm:mb-3 group-hover:bg-autox-red/10 group-hover:border-autox-red/50 transition-colors">
        <Icon size={22} className="text-autox-red" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-white text-xs sm:text-sm line-clamp-1">{category.name}</div>
        <div className="text-autox-gray text-[10px] sm:text-xs mt-0.5 sm:mt-1">{category.productCount} Products</div>
      </div>
    </Link>
  );
}
