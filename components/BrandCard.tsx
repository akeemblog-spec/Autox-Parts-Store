import Link from "next/link";
import { Brand } from "@/types";

// Storefront-only artwork preserves all existing Admin and database brand fields.
const cardArtwork: Record<string, { scene: string; logo: string }> = {
  honda: { scene: "honda.webp", logo: "honda-logo.webp" },
  yamaha: { scene: "yamaha.webp", logo: "yamaha-logo.webp" },
  bajaj: { scene: "bajaj.webp", logo: "bajaj-logo.webp" },
  tvs: { scene: "tvs.webp", logo: "tvs-logo.webp" },
  suzuki: { scene: "suzuki.webp", logo: "suzuki-logo.webp" },
  hero: { scene: "hero.webp", logo: "hero-logo.webp" },
  ktm: { scene: "ktm.webp", logo: "ktm-logo.webp" },
  kawasaki: { scene: "kawasaki.webp", logo: "kawasaki-logo.webp" },
  "royal-enfield": { scene: "royal-enfield.webp", logo: "royal-enfield-logo.webp" },
  "bajaj-re": { scene: "bajaj-re.webp", logo: "bajaj-logo.webp" },
  "tvs-king": { scene: "tvs-king.webp", logo: "tvs-logo.webp" },
  "piaggio-ape": { scene: "piaggio-ape.webp", logo: "piaggio-logo.webp" },
  "mahindra-alfa": { scene: "mahindra-alfa.webp", logo: "mahindra-logo.webp" },
  "atul-gem": { scene: "atul-gem.webp", logo: "atul-logo.webp" },
};

export function BrandCard({ brand, settings = {} }: { brand: Brand; active?: boolean; settings?: Record<string, string> }) {
  const artwork = cardArtwork[brand.slug];
  // Catalog uploads and Storefront artwork take precedence over seed placeholders.
  const catalogVehicle = brand.vehicleImage && !brand.vehicleImage.startsWith("/images/brands/") ? brand.vehicleImage : "";
  const catalogLogo = brand.logo && !brand.logo.startsWith("/images/brands/") ? brand.logo : "";
  const refreshedBrand = ["ktm", "kawasaki", "royal-enfield"].includes(brand.slug);
  const defaultVehicle = artwork ? `/images/brand-cards/${artwork.scene}` : brand.vehicleImage;
  const vehicle = settings[`brand_card_image_${brand.slug}`] || (refreshedBrand ? defaultVehicle : catalogVehicle || defaultVehicle);
  const defaultLogo = artwork ? `/images/brand-cards/${artwork.logo}` : brand.logo;
  const logo = settings[`brand_card_logo_${brand.slug}`] || (brand.slug === "ktm" ? defaultLogo : catalogLogo || defaultLogo);
  return (
    <Link
      href={`/brands/${brand.slug}`}
      aria-label={`Shop ${brand.name}: ${brand.productCount} parts`}
      className="autox-neon-frame group relative block h-[310px] w-full overflow-hidden rounded-xl border bg-[#101012] transition-[border-color,box-shadow] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-autox-red motion-reduce:transition-none sm:h-[326px]"
    >
      <img src={vehicle} alt={artwork ? `${brand.name} ${brand.vehicleType === "three-wheeler" ? "three-wheeler" : "motorcycle"} in a performance garage` : `${brand.name} vehicle`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,10,.83)_0%,rgba(8,8,10,.08)_31%,transparent_62%,rgba(8,8,10,.22)_80%,rgba(8,8,10,.87)_100%)]" />
      <div className="absolute inset-x-3 top-3 flex h-[68px] flex-col items-center justify-center sm:top-4 sm:h-[74px]">
        {logo ? <img src={logo} alt={`${brand.name} logo`} className="max-h-[52px] max-w-[155px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,.75)] sm:max-h-[57px] sm:max-w-[170px]" /> : <span className="text-center text-lg font-extrabold uppercase tracking-wide text-white">{brand.name}</span>}
        {brand.vehicleType === "three-wheeler" && artwork && <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.15em] text-white/85">{brand.name}</span>}
      </div>
      <div className="absolute inset-x-3 bottom-3 flex justify-center sm:bottom-4">
        <span className="autox-neon-count">
          <span className="mr-1 tabular-nums">{brand.productCount}</span> Parts
        </span>
      </div>
    </Link>
  );
}
