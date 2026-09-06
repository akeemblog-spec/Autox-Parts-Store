import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { VehicleFinder } from "@/components/VehicleFinder";
import { Headphones, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Parts Finder",
  description: "Find the exact genuine or aftermarket part for your motorcycle or three wheeler by vehicle, brand, model and year.",
};

export default function PartsFinderPage() {
  return (
    <>
      
      
      
      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Parts Finder" }]} />
        </div>
        <section className="mx-auto max-w-[1600px] px-4 pb-4 lg:px-6">
          <h1 className="text-2xl font-extrabold text-white">Parts Finder</h1>
          <p className="mt-1 max-w-2xl text-sm text-autox-gray">Select your vehicle type and brand, then optionally choose a model and year to narrow the catalog to compatible parts.</p>
        </section>
        <VehicleFinder />
        <section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-md border border-autox-border bg-gradient-to-r from-autox-redDark/20 via-autox-panel to-black p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-autox-red/40 bg-autox-red/15"><Headphones size={20} className="text-autox-red" /></span>
              <div><p className="font-bold text-white">Still not sure which part fits?</p><p className="text-sm text-autox-gray">Send our support team the vehicle details or part number and we&apos;ll help you confirm compatibility.</p></div>
            </div>
            <Link href="/contact" className="flex shrink-0 items-center gap-2 rounded-sm bg-autox-red px-4 py-2.5 text-xs font-bold uppercase text-white">Contact Support <ArrowRight size={14} /></Link>
          </div>
        </section>
      </main>
      
    </>
  );
}
