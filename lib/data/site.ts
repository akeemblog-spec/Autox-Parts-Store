import { NavLink, PromoBannerData, TopBarItem, TrustFeature } from "@/types";

export const topBarItems: TopBarItem[] = [
  { id: "tb-delivery", icon: "Truck", label: "Islandwide Delivery" },
  { id: "tb-genuine", icon: "BadgeCheck", label: "100% Genuine Parts" },
  { id: "tb-returns", icon: "RotateCcw", label: "Easy Returns" },
  { id: "tb-secure", icon: "ShieldCheck", label: "Secure Payments" },
];

export const topBarRightItems: TopBarItem[] = [
  { id: "tb-help", icon: "HelpCircle", label: "Help & Support", href: "/contact" },
  { id: "tb-track", icon: "PackageSearch", label: "Track Order", href: "/orders/track" },
];

export const mainNavLinks: NavLink[] = [
  { id: "nav-home", label: "Home", href: "/" },
  {
    id: "nav-bikes",
    label: "Bikes",
    href: "/brands",
    children: [
      { label: "Honda", href: "/brands/honda" },
      { label: "Yamaha", href: "/brands/yamaha" },
      { label: "Bajaj", href: "/brands/bajaj" },
      { label: "TVS", href: "/brands/tvs" },
      { label: "Suzuki", href: "/brands/suzuki" },
      { label: "Hero", href: "/brands/hero" },
    ],
  },
  {
    id: "nav-three-wheelers",
    label: "Three Wheelers",
    href: "/three-wheelers",
    children: [
      { label: "Bajaj RE", href: "/brands/bajaj-re" },
      { label: "TVS King", href: "/brands/tvs-king" },
      { label: "Piaggio Ape", href: "/brands/piaggio-ape" },
      { label: "Mahindra Alfa", href: "/brands/mahindra-alfa" },
      { label: "Atul Gem", href: "/brands/atul-gem" },
    ],
  },
  { id: "nav-brands", label: "Brands", href: "/brands" },
  { id: "nav-parts-finder", label: "Parts Finder", href: "/parts-finder" },
  { id: "nav-services", label: "Services", href: "/services" },
  { id: "nav-offers", label: "Offers", href: "/offers" },
  { id: "nav-contact", label: "Contact", href: "/contact" },
];

export const categoryQuickLinks = [
  "All Parts",
  "Engine",
  "Electrical",
  "Body",
  "Brakes",
  "Suspension",
  "Transmission",
  "Filters",
  "Wheels & Tyres",
];

export const popularSearches = [
  "Brake Pad",
  "Clutch Plate",
  "Air Filter",
  "Chain Set",
  "Battery",
  "Engine Oil",
  "Spark Plug",
];

export const promoBanners: PromoBannerData[] = [
  {
    id: "promo-installment",
    title: "EASY INSTALLMENT PLANS",
    highlight: "0% INTEREST PLANS",
    description: "Own the parts you need today, pay in easy monthly installments.",
    ctaLabel: "Learn More",
    ctaHref: "/offers",
    image: "/images/promo/installment-wheel.svg",
    variant: "installment",
  },
  {
    id: "promo-genuine",
    title: "GENUINE PARTS. TRUSTED QUALITY.",
    highlight: "",
    description: "Explore our wide range of 100% genuine parts with warranty.",
    ctaLabel: "Shop Now",
    ctaHref: "/products",
    image: "/images/promo/genuine-parts.svg",
    variant: "genuine",
  },
];

export const trustFeatures: TrustFeature[] = [
  { id: "trust-genuine", icon: "ShieldCheck", title: "100% Genuine Parts", description: "Authentic & Trusted" },
  { id: "trust-price", icon: "BadgeDollarSign", title: "Best Price Guarantee", description: "Lowest prices in Sri Lanka" },
  { id: "trust-delivery", icon: "Truck", title: "Islandwide Delivery", description: "Fast & Reliable" },
  { id: "trust-returns", icon: "RotateCcw", title: "7 Days Easy Returns", description: "Hassle Free Returns" },
  { id: "trust-payments", icon: "Lock", title: "Secure Payments", description: "100% Safe & Secure" },
  { id: "trust-support", icon: "Headset", title: "Expert Support", description: "24/7 Customer Service" },
];

export const heroSlides = [
  {
    id: "slide-1",
    eyebrow: "",
    headline: "Genuine Parts.",
    headlineAccent: "Peak Performance.",
    description:
      "High quality motorcycle and three wheeler parts for every ride. Built to perform. Built to last.",
    image: "/images/hero/hero-bike-1.svg",
  },
];
