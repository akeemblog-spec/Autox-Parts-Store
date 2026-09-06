// ---------------------------------------------------------------------------
// AutoX Parts Store — Core domain types
// These interfaces describe the future database entities. Mock data in
// lib/data/*.ts is shaped to satisfy these interfaces so a real backend/API
// can later be substituted without touching UI components.
// ---------------------------------------------------------------------------

export type VehicleTypeId = string;

export interface VehicleType {
  id: VehicleTypeId;
  name: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  vehicleImage: string;
  productCount: number;
  vehicleType: VehicleTypeId;
  description?: string | null;
  coverImage?: string | null;
}

export interface VehicleModel {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  image: string;
  yearFrom: number;
  yearTo: number | "Present";
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
  icon: string;
  coverImage?: string | null;
  description?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductCompatibility {
  brand: string;
  model: string;
  years: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  vehicleType: VehicleTypeId;
  compatibleModels: ProductCompatibility[];
  modelYears: string;
  partType: "Genuine Honda" | "Genuine" | "OEM" | "Aftermarket";
  price: number;
  previousPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  images: ProductImage[];
  genuine: boolean;
  installmentAvailable: boolean;
  description: string;
  specifications: { label: string; value: string }[];
  warranty: string;
  deliveryEstimate: string;
}

export interface PromoBannerData {
  id: string;
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  variant: "installment" | "genuine";
}

export interface TrustFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface TopBarItem {
  id: string;
  icon: string;
  label: string;
  href?: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface FilterState {
  partType: string[];
  category: string[];
  brand: string[];
  availability: ("in-stock" | "out-of-stock")[];
  priceMin: number;
  priceMax: number;
  modelYear: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
}

export interface CompareItem {
  id: string;
  productId: string;
}
