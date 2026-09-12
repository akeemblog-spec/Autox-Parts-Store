import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";
export const metadata: Metadata = { title: "Terms & Conditions" };
export default function TermsPage(){return <InfoPageShell eyebrow="Legal" title="Terms & Conditions" description="The core terms for using AutoX Parts Store, placing orders and purchasing products." icon={ScrollText} updated="September 2026" sections={[
 {title:"Store use",body:"Use AutoX lawfully and provide accurate account, delivery and order information. Attempts to misuse accounts, pricing, inventory, coupons or store systems may result in cancellation or access restriction."},
 {title:"Products, pricing and availability",body:"AutoX aims to keep product, price, fitment and stock information accurate. Orders remain subject to validation, stock availability and acceptance. Obvious pricing or listing errors may be corrected before fulfilment."},
 {title:"Orders and payment",body:"An order is created after checkout completes successfully. Payment-provider approval may still be required for card or installment transactions. AutoX may contact you when order verification is needed."},
 {title:"Delivery, returns and warranty",body:"Delivery is governed by the Shipping Policy. Eligible returns/refunds follow the Returns & Refund Policy, while product defects and warranty claims follow the Warranty Policy."},
]}/>}
