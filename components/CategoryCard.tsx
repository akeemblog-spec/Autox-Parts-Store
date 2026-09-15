import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/types";

export function CategoryCard({ category, settings = {} }: { category: Category; settings?: Record<string, string> }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Package;
  const defaultArtwork = ["body-parts", "braking-system", "chain-sprocket", "electrical-parts", "engine-parts", "filters-oil", "suspension", "transmission"].includes(category.slug) ? `/images/category-cards/${category.slug}.webp` : "";
  const image = settings[`category_card_image_${category.slug}`] || (category.image && !category.image.startsWith("/images/categories/") ? category.image : "") || defaultArtwork || category.image;
  const iconImage = settings[`category_icon_image_${category.slug}`];

  return (
    <Link
      href={`/categories/${category.slug}`}
      aria-label={`Shop ${category.name}: ${category.productCount} products`}
      className="autox-neon-frame group relative flex h-[255px] min-w-0 flex-col items-center overflow-hidden rounded-xl border bg-[#111113] px-2 pb-4 pt-4 text-center transition-[border-color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-autox-red sm:h-[300px] lg:h-[320px]"
    >
      {image && <img src={image} alt={`${category.name} motorcycle parts`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"/>}
      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,10,.85)_0%,rgba(8,8,10,.36)_36%,transparent_66%,rgba(8,8,10,.84)_100%)]"/>
      <span className="autox-neon-icon relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
        {iconImage ? <img src={iconImage} alt="" className="h-7 w-7 object-contain"/> : <Icon size={20} strokeWidth={1.9} className="autox-neon-mark"/>}
      </span>
      <span className="relative mt-3 line-clamp-2 min-h-[2.5em] text-xs font-extrabold leading-tight text-white sm:text-sm">{category.name}</span>
      <span className="autox-neon-count relative mt-auto"><span className="mr-1 tabular-nums">{category.productCount}</span> Products</span>
    </Link>
  );
}
