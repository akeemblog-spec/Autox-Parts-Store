import type { Metadata } from "next";
import { Wrench, ShieldCheck, Truck, Search, Settings, Headset } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services",
  description: "AutoX Parts Store services: parts finding, fitment consultation, delivery, warranty and customer support.",
};

const services = [
  { icon: Search, title: "Parts Finder", description: "Search by vehicle type, brand, model and year to narrow the catalog to compatible parts." },
  { icon: Settings, title: "Fitment Consultation", description: "Not sure if a part fits your model and year? Contact our team before you order." },
  { icon: ShieldCheck, title: "Warranty Support", description: "See the warranty information attached to each product and contact support if you need help." },
  { icon: Truck, title: "Islandwide Delivery", description: "Standard and express delivery options are calculated at checkout from current store settings." },
  { icon: Wrench, title: "Product Guidance", description: "Use product specifications and compatibility information to confirm the right replacement part." },
  { icon: Headset, title: "Customer Support", description: "Send a support message for order, fitment or product questions and track it with our store team." },
];

export default function ServicesPage() {
  return <><main><div className="mx-auto max-w-[1600px] px-4 lg:px-6"><Breadcrumb items={[{label:"Home",href:"/"},{label:"Services"}]}/></div><section className="mx-auto max-w-[1600px] px-4 pb-4 lg:px-6"><h1 className="text-2xl font-extrabold text-white">Services</h1><p className="mt-1 max-w-2xl text-sm text-autox-gray">Practical tools and support to help you choose, buy and receive the right part.</p></section><section className="mx-auto max-w-[1600px] px-4 py-6 pb-14 lg:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((s)=><div key={s.title} className="rounded-2xl border border-autox-border bg-autox-panel p-5 transition-colors hover:border-autox-red/50"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-autox-red/30 bg-autox-red/10"><s.icon size={20} className="text-autox-red"/></div><h3 className="font-semibold text-white">{s.title}</h3><p className="mt-1 text-sm leading-6 text-autox-gray">{s.description}</p></div>)}</div><div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-autox-border bg-autox-panel p-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-white">Need help choosing a part?</h2><p className="mt-1 text-sm text-autox-gray">Use Parts Finder first, or send our support team your vehicle details.</p></div><div className="flex gap-2"><ButtonLink href="/parts-finder" variant="outline">Parts Finder</ButtonLink><ButtonLink href="/contact">Contact Support</ButtonLink></div></div></section></main></>;
}
