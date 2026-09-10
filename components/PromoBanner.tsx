import { PromoBannerData } from "@/types";
import { ButtonLink } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

export function PromoBanner({ banner }: { banner: PromoBannerData }) {
  const isInstallment = banner.variant === "installment";
  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-autox-border p-6 lg:p-7 min-h-[180px]",
        isInstallment
          ? "bg-gradient-to-br from-autox-panel via-autox-panel to-black"
          : "bg-gradient-to-br from-autox-redDark/20 via-autox-panel to-black"
      )}
    >
      <div className="absolute inset-0 opacity-40">
        <img src={banner.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="relative z-10 max-w-xs">
        <h3 className="text-white font-extrabold text-lg lg:text-xl leading-tight">{banner.title}</h3>
        {banner.highlight && (
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-autox-red">0%</span>
            <span className="text-xs font-bold text-white uppercase tracking-wide">Interest Plans</span>
          </div>
        )}
        <p className="text-sm text-autox-gray mt-2">{banner.description}</p>
        <ButtonLink href={banner.ctaHref} size="sm" className="mt-4">
          {banner.ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
