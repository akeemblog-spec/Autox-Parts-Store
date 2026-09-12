import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";

export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Answers about AutoX ordering, delivery, returns, fitment, warranty, payments and installments." };

const faqs = [
  ["How do I know a part fits my vehicle?", "Check the compatibility information on the product page or shop through the relevant brand/model page. If you are still unsure, contact AutoX before ordering so fitment can be confirmed."],
  ["Do you deliver outside Colombo?", "Yes. AutoX supports islandwide delivery. Colombo and out-of-Colombo fees are calculated separately and the checkout updates the delivery price from the destination district."],
  ["What is the difference between standard and express delivery?", "Standard delivery is the regular courier service. Express adds a priority fee and is intended for faster dispatch/delivery where courier coverage allows it."],
  ["Can I track my order?", "Yes. Use Track Order or open My Account > My Orders to view your current order status and timeline."],
  ["What payment methods are available?", "Checkout only shows payment methods that are currently enabled by AutoX. Depending on configuration this may include card, cash on delivery, bank transfer and supported installment providers."],
  ["How do 3-month and 6-month installments work?", "Eligible products display an Installments option. The modal shows the estimated monthly split for 3 or 6 months. Final eligibility, approval and provider terms are confirmed by the selected payment provider during checkout."],
  ["Can I return a part?", "Eligible items can be requested for return through the AutoX returns flow. Items must satisfy the Returns & Refund Policy, including condition and time-window requirements."],
  ["What does the product warranty cover?", "Coverage depends on the product and manufacturer. The warranty shown on the product page applies together with the AutoX Warranty Policy. Wear, misuse, incorrect installation and accidental damage are generally excluded."],
  ["What if my item arrives damaged or incorrect?", "Keep the packaging, take clear photos and contact AutoX as soon as possible. Do not install or use an incorrect or visibly damaged part before support reviews the issue."],
  ["Can I change an order after placing it?", "Contact support immediately. Changes are only possible before processing/dispatch and cannot be guaranteed once fulfilment has started."],
];

export default function FaqPage() {
  return <InfoPageShell eyebrow="Help Centre" title="Questions, answered." accent="Ride with confidence." description="Quick answers for ordering, delivery, fitment, returns, warranty, payments and installments." icon={CircleHelp}>
    <div className="space-y-3">{faqs.map(([q,a],i)=><details key={q} className="group rounded-2xl bg-[#0b0b0d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.045)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-white"><span><span className="mr-3 text-autox-red">{String(i+1).padStart(2,"0")}</span>{q}</span><span className="text-xl font-light text-autox-red transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-4xl border-t border-white/[.06] pt-4 text-sm leading-7 text-zinc-400">{a}</p></details>)}</div>
  </InfoPageShell>;
}
