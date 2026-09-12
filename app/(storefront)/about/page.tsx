import type { Metadata } from "next";
import { BadgeCheck, Bike, ShieldCheck, Truck, Wrench } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";

export const metadata: Metadata = { title: "About AutoX", description: "Learn about AutoX Parts Store and our focus on genuine motorcycle and three-wheeler parts in Sri Lanka." };

export default function AboutPage() {
  return <InfoPageShell eyebrow="About AutoX" title="Built for the ride." accent="Backed by the right parts." description="AutoX is a Sri Lankan motorcycle and three-wheeler parts store focused on genuine fitment, dependable service and a cleaner way to find the parts your vehicle actually needs." icon={Bike} sections={[
    { title: "Genuine-first sourcing", body: "We prioritise genuine and clearly identified parts so riders can shop with more confidence. Product pages surface brand, fitment, warranty and stock information before you buy.", bullets: ["Clear genuine/OEM/aftermarket labelling", "Vehicle compatibility shown where available", "Product warranty information shown on each listing"] },
    { title: "Fitment before guesswork", body: "AutoX is designed around vehicle compatibility rather than forcing customers to browse endless generic lists.", bullets: ["Shop by brand and model", "Use Parts Finder when you are unsure", "Contact support for fitment confirmation before ordering"] },
    { title: "Islandwide fulfilment", body: "Orders can be delivered across Sri Lanka with standard and eligible express options. Delivery pricing is calculated from the destination district during checkout.", bullets: ["Colombo and out-of-Colombo delivery zones", "Order tracking after purchase", "Saved delivery addresses for returning customers"] },
    { title: "A store built around trust", body: "From secure account flows to order history, returns and product reviews, AutoX is designed to make after-sales support part of the buying experience rather than an afterthought.", bullets: ["Order history and tracking", "Returns request workflow", "Verified-purchase review flow"] },
  ]}/>;
}
