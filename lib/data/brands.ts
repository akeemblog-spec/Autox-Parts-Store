import { Brand, VehicleType } from "@/types";

export const vehicleTypes: VehicleType[] = [
  { id: "bike", name: "Motorcycle" },
  { id: "three-wheeler", name: "Three Wheeler" },
];

export const bikeBrands: Brand[] = [
  {
    id: "brand-honda",
    slug: "honda",
    name: "Honda",
    logo: "/images/brands/honda-logo.svg",
    vehicleImage: "/images/brands/honda-bike.svg",
    productCount: 350,
    vehicleType: "bike",
    description: "Genuine Honda parts engineered for a perfect fit and lasting performance.",
  },
  {
    id: "brand-yamaha",
    slug: "yamaha",
    name: "Yamaha",
    logo: "/images/brands/yamaha-logo.svg",
    vehicleImage: "/images/brands/yamaha-bike.svg",
    productCount: 320,
    vehicleType: "bike",
    description: "Precision Yamaha components built for performance riders.",
  },
  {
    id: "brand-bajaj",
    slug: "bajaj",
    name: "Bajaj",
    logo: "/images/brands/bajaj-logo.svg",
    vehicleImage: "/images/brands/bajaj-bike.svg",
    productCount: 280,
    vehicleType: "bike",
    description: "Durable Bajaj parts for every terrain and every commute.",
  },
  {
    id: "brand-tvs",
    slug: "tvs",
    name: "TVS",
    logo: "/images/brands/tvs-logo.svg",
    vehicleImage: "/images/brands/tvs-bike.svg",
    productCount: 250,
    vehicleType: "bike",
    description: "Reliable TVS parts trusted across Sri Lanka.",
  },
  {
    id: "brand-suzuki",
    slug: "suzuki",
    name: "Suzuki",
    logo: "/images/brands/suzuki-logo.svg",
    vehicleImage: "/images/brands/suzuki-bike.svg",
    productCount: 220,
    vehicleType: "bike",
    description: "Genuine Suzuki parts for smooth, dependable rides.",
  },
  {
    id: "brand-hero",
    slug: "hero",
    name: "Hero",
    logo: "/images/brands/hero-logo.svg",
    vehicleImage: "/images/brands/hero-bike.svg",
    productCount: 200,
    vehicleType: "bike",
    description: "Affordable, genuine Hero parts for everyday reliability.",
  },
];

export const threeWheelerBrands: Brand[] = [
  {
    id: "brand-bajaj-re",
    slug: "bajaj-re",
    name: "Bajaj RE",
    logo: "/images/brands/bajaj-re-logo.svg",
    vehicleImage: "/images/brands/bajaj-re.svg",
    productCount: 350,
    vehicleType: "three-wheeler",
  },
  {
    id: "brand-tvs-king",
    slug: "tvs-king",
    name: "TVS King",
    logo: "/images/brands/tvs-king-logo.svg",
    vehicleImage: "/images/brands/tvs-king.svg",
    productCount: 120,
    vehicleType: "three-wheeler",
  },
  {
    id: "brand-piaggio-ape",
    slug: "piaggio-ape",
    name: "Piaggio Ape",
    logo: "/images/brands/piaggio-logo.svg",
    vehicleImage: "/images/brands/piaggio-ape.svg",
    productCount: 100,
    vehicleType: "three-wheeler",
  },
  {
    id: "brand-mahindra-alfa",
    slug: "mahindra-alfa",
    name: "Mahindra Alfa",
    logo: "/images/brands/mahindra-logo.svg",
    vehicleImage: "/images/brands/mahindra-alfa.svg",
    productCount: 90,
    vehicleType: "three-wheeler",
  },
  {
    id: "brand-atul-gem",
    slug: "atul-gem",
    name: "Atul Gem",
    logo: "/images/brands/atul-logo.svg",
    vehicleImage: "/images/brands/atul-gem.svg",
    productCount: 80,
    vehicleType: "three-wheeler",
  },
];

export const allBrands: Brand[] = [...bikeBrands, ...threeWheelerBrands];

export function getBrandBySlug(slug: string): Brand | undefined {
  return allBrands.find((b) => b.slug === slug);
}
