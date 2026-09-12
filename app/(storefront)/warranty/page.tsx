import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";
export const metadata: Metadata = { title: "Warranty Policy" };
export default function WarrantyPage(){return <InfoPageShell eyebrow="Customer Care" title="Warranty Policy" description="A practical guide to product warranty coverage, claims and exclusions. Product-specific warranty periods shown on product pages take priority where they differ." icon={ShieldCheck} updated="September 2026" sections={[
 {title:"Coverage",body:"Eligible products are covered for the warranty period stated on the product page or supplied by the manufacturer. Warranty applies to verified manufacturing defects under normal intended use."},
 {title:"What is not covered",bullets:["Normal wear items and consumables unless confirmed defective on arrival","Damage caused by accident, misuse, racing, modification or improper storage","Incorrect installation, incompatible fitment or work performed contrary to manufacturer guidance","Cosmetic damage after installation or use"]},
 {title:"Making a claim",bullets:["Provide the AutoX order number","Describe the fault and when it appeared","Provide clear photos/video where requested","Do not continue using a part if doing so could cause further damage"]},
 {title:"Assessment and remedy",body:"AutoX may request inspection or manufacturer assessment. Where a valid warranty claim is confirmed, the remedy may be repair, replacement, store credit or refund depending on the product and applicable provider terms."},
]}/>}
