import type { Metadata } from "next";
import { PackageCheck } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";
export const metadata: Metadata = { title: "Shipping Policy" };
export default function ShippingPolicyPage(){return <InfoPageShell eyebrow="Delivery" title="Shipping Policy" description="Delivery zones, fees, dispatch expectations and practical information for AutoX orders across Sri Lanka." icon={PackageCheck} updated="September 2026" sections={[
 {title:"Delivery zones",body:"AutoX separates Colombo District and out-of-Colombo destinations so checkout can show the relevant standard and express fee."},
 {title:"Estimated delivery windows",bullets:["Colombo standard: usually 1–2 business days after dispatch","Out of Colombo standard: usually 2–4 business days after dispatch","Colombo express: same-day or next-business-day target where eligible","Out of Colombo express: priority service, typically 1–2 business days where courier coverage permits"]},
 {title:"Express availability",body:"Express service is subject to cut-off time, stock readiness, destination and courier coverage. Selecting express prioritises fulfilment but does not override events outside AutoX or courier control."},
 {title:"Tracking and receiving",body:"Track your order from the AutoX Track Order page. Please provide an accurate phone number and delivery address and inspect parcels for visible damage when received."},
]}/>}
