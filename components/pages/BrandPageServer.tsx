import { notFound } from "next/navigation";
import { ShieldCheck, BadgeCheck, Truck, Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { getBrandBySlugDb, getAllCategories } from "@/lib/db-queries/products";

const featureCards = [
  { icon: BadgeCheck, label: "100% Genuine Parts" },
  { icon: Wrench, label: "Perfect Fit" },
  { icon: ShieldCheck, label: "Warranty Assured" },
  { icon: Truck, label: "Fast Delivery" },
];

export async function BrandPageServer({ slug }: { slug: string }) {
  const brand = await getBrandBySlugDb(slug);
  if (!brand) notFound();

  const categories = await getAllCategories();
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));

  return (
    <>
      
      
      

      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]} />
        </div>

        <section className="relative bg-black border-y border-autox-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,rgba(237,28,36,0.18),transparent_60%)]" />
          <div className="mx-auto max-w-[1600px] px-4 lg:px-6 relative grid lg:grid-cols-[1fr_1.3fr] gap-6 items-center py-10">
            <div>
              <div className="text-autox-red font-black text-3xl tracking-tight uppercase">{brand.name}</div><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-autox-gray">{brand.productCount} {brand.productCount === 1 ? "Part" : "Parts"} Available</p>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-3 leading-tight">
                Genuine Parts.
                <br />
                <span className="text-autox-red">Perfect Fit.</span>
              </h1>
              {brand.description && <p className="text-autox-gray text-sm mt-3 max-w-sm">{brand.description}</p>}
              <div className="grid grid-cols-2 gap-2 mt-5 max-w-md">
                {featureCards.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 bg-autox-panel border border-autox-border rounded-xl px-3 py-2.5">
                    <f.icon size={16} className="text-autox-red shrink-0" />
                    <span className="text-[11px] font-semibold text-white leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-first lg:order-none flex justify-center">
              <img
                src={brand.coverImage || brand.vehicleImage}
                alt={`${brand.name} vehicle`}
                className="w-full max-w-lg object-contain drop-shadow-[0_20px_60px_rgba(237,28,36,0.35)] rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-8">
          <LiveProductGrid brandSlug={slug} showPartTypeFilter categoryOptions={categoryOptions} />
        </section>
      </main>

      
    </>
  );
}
