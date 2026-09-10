import Link from "next/link";
import { Brand } from "@/types";
import { cn } from "@/lib/utils/cn";

export function BrandCard({ brand, active = false }: { brand: Brand; active?: boolean }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-autox-panel to-[#0c0c0e] shadow-[0_10px_30px_rgba(0,0,0,.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(0,0,0,.34)]",
        active ? "border-autox-red shadow-cardGlow" : "border-autox-border hover:border-autox-red/60"
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-autox-panel3">
        <img
          src={brand.vehicleImage}
          alt={`${brand.name} vehicle`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3.5 text-center">
        <div className="text-sm font-extrabold uppercase tracking-wide text-white">{brand.name}</div>
        <div className="mt-1.5 inline-flex items-center rounded-full bg-autox-red/10 px-2.5 py-1 text-[10px] font-bold text-autox-red ring-1 ring-inset ring-autox-red/20">
          {brand.productCount} Parts
        </div>
      </div>
    </Link>
  );
}
