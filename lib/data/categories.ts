import { Category } from "@/types";

export const categories: Category[] = [
  { id: "cat-engine", slug: "engine-parts", name: "Engine Parts", image: "/images/categories/engine.svg", productCount: 350, icon: "Cog" },
  { id: "cat-electrical", slug: "electrical-parts", name: "Electrical Parts", image: "/images/categories/electrical.svg", productCount: 280, icon: "Zap" },
  { id: "cat-body", slug: "body-parts", name: "Body Parts", image: "/images/categories/body.svg", productCount: 400, icon: "Shield" },
  { id: "cat-braking", slug: "braking-system", name: "Braking System", image: "/images/categories/braking.svg", productCount: 300, icon: "Disc" },
  { id: "cat-suspension", slug: "suspension", name: "Suspension", image: "/images/categories/suspension.svg", productCount: 250, icon: "Waves" },
  { id: "cat-transmission", slug: "transmission", name: "Transmission", image: "/images/categories/transmission.svg", productCount: 200, icon: "Settings" },
  { id: "cat-filters", slug: "filters-oil", name: "Filters & Oil", image: "/images/categories/filters.svg", productCount: 220, icon: "Droplet" },
  { id: "cat-chain", slug: "chain-sprocket", name: "Chain & Sprocket", image: "/images/categories/chain.svg", productCount: 180, icon: "Link2" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
