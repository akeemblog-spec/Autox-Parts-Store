import Link from "next/link";
import { Brand } from "@/types";
import { cn } from "@/lib/utils/cn";

export function BrandCard({ brand, active = false }: { brand: Brand; active?: boolean }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn(
        "group relative flex flex-col bg-autox-panel border rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-1",
        active ? "border-autox-red shadow-cardGlow" : "border-autox-border hover:border-autox-red/60"
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-autox-panel3">
        <img
          src={brand.vehicleImage}
          alt={`${brand.name} vehicle`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3 text-center">
        <div className="font-extrabold text-white text-sm uppercase tracking-wide">{brand.name}</div>
        <div className="text-autox-red text-xs font-semibold mt-0.5">{brand.productCount} Parts</div>
      </div>
    </Link>
  );
}
