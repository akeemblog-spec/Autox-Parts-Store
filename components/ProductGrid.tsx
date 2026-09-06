"use client";

import { useState } from "react";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { formatCompactNumber } from "@/lib/utils/format";

interface ProductGridProps {
  products: Product[];
  totalCount?: number;
  sort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export function ProductGrid({ products, totalCount, sort, onSortChange }: ProductGridProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const total = totalCount ?? products.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-autox-border mb-5">
        <p className="text-sm text-autox-gray">
          Showing <span className="text-white font-semibold">1-{Math.min(products.length, 16)}</span> of{" "}
          <span className="text-white font-semibold">{formatCompactNumber(total)}</span> results
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-autox-panel3 border border-autox-border rounded-sm text-xs text-white pl-3 pr-7 h-9 outline-none focus:border-autox-red"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort by: {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-autox-gray" />
          </div>
          <div className="flex border border-autox-border rounded-sm overflow-hidden">
            <button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={cn("w-9 h-9 flex items-center justify-center", view === "grid" ? "bg-autox-red text-white" : "text-autox-gray")}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={cn("w-9 h-9 flex items-center justify-center", view === "list" ? "bg-autox-red text-white" : "text-autox-gray")}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No parts match your filters"
          description="Try adjusting or clearing your filters to see more results."
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
