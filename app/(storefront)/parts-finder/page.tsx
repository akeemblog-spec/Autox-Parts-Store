import type { Metadata } from "next";
import Link from "next/link";
import { StandardPageHero } from "@/components/content/StandardPageHero";
import { VehicleFinder } from "@/components/VehicleFinder";
import { Headphones, ArrowRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Parts Finder",
  description: "Find the exact genuine or aftermarket part for your motorcycle or three wheeler by vehicle, brand, model and year.",
};

export default function PartsFinderPage() {
  return (
    <>
      
      
      
      <main>
        <StandardPageHero eyebrow="Parts Finder" title="Find the right part." accent="Skip the guesswork." description="Select your vehicle type, brand, model and year to narrow the catalog to compatible parts." icon={Search}/>
        <VehicleFinder />
        <section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-autox-border bg-gradient-to-r from-autox-redDark/20 via-autox-panel to-black p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-autox-red/40 bg-autox-red/15"><Headphones size={20} className="text-autox-red" /></span>
              <div><p className="font-bold text-white">Still not sure which part fits?</p><p className="text-sm text-autox-gray">Send our support team the vehicle details or part number and we&apos;ll help you confirm compatibility.</p></div>
            </div>
            <Link href="/contact" className="flex shrink-0 items-center gap-2 rounded-xl bg-autox-red px-4 py-2.5 text-xs font-bold uppercase text-white">Contact Support <ArrowRight size={14} /></Link>
          </div>
        </section>
      </main>
      
    </>
  );
}
