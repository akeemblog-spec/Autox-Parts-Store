import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";
export const metadata: Metadata = { title: "Returns & Refund Policy" };
export default function ReturnsPage(){return <InfoPageShell eyebrow="Customer Care" title="Returns & Refunds" description="How AutoX handles eligible returns, incorrect items, damaged deliveries and approved refunds." icon={RotateCcw} updated="September 2026" sections={[
 {title:"Return window",body:"Return requests should be submitted within 7 days of delivery unless a longer product-specific warranty or mandatory legal right applies."},
 {title:"Eligible condition",bullets:["Item is unused, uninstalled and in resaleable condition","Original packaging, labels, accessories and documentation are retained","Order number and reason for return are provided","The item is not a non-returnable consumable or specially sourced item unless defective"]},
 {title:"Incorrect or damaged order",body:"If AutoX supplied the wrong item or an item arrives damaged, contact support promptly with photos. Keep all packaging until the case is reviewed."},
 {title:"Refund processing",body:"Approved refunds are returned using the supported method available for the original transaction or another agreed method. Payment-provider processing time can vary after AutoX approves the refund."},
]}/>}
