"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { popularSearches } from "@/lib/data/site";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type V = { label: string; value: string };
type B = V & { id: string; vehicleType: string };
type M = V & { id: string; brandId: string; yearFrom: number; yearTo: string };

function yearRange(model?: M) {
  if (!model) return [];
  const now = new Date().getFullYear();
  const end = model.yearTo.toLowerCase() === "present" ? now : Number(model.yearTo) || now;
  const start = Math.min(model.yearFrom, end);
  const years: string[] = [];
  for (let y = end; y >= start && years.length < 40; y--) years.push(String(y));
  return years;
}

export function VehicleFinder() {
  const router = useRouter();
  const cached = getCachedCatalogOptions();
  const [vehicleType, setVehicleType] = useState(""); const [brand, setBrand] = useState(""); const [model, setModel] = useState(""); const [year, setYear] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<V[]>((cached?.vehicleTypes ?? []) as V[]); const [brands, setBrands] = useState<B[]>((cached?.brands ?? []) as B[]); const [models, setModels] = useState<M[]>((cached?.models ?? []) as M[]); const [message, setMessage] = useState("");
  useEffect(() => { loadCatalogOptions().then((data) => { if (data) { setVehicleTypes((data.vehicleTypes ?? []) as V[]); setBrands((data.brands ?? []) as B[]); setModels((data.models ?? []) as M[]); } }); }, []);
  const visibleBrands = useMemo(() => vehicleType ? brands.filter((b) => b.vehicleType === vehicleType) : brands, [brands, vehicleType]);
  const selectedBrand = brands.find((b) => b.value === brand);
  const visibleModels = useMemo(() => selectedBrand ? models.filter((m) => m.brandId === selectedBrand.id) : [], [models, selectedBrand]);
  const selectedModel = visibleModels.find((m) => m.value === model); const years = yearRange(selectedModel);
  const search = () => { if (!vehicleType || !brand) { setMessage("Select a vehicle type and brand to search compatible parts."); return; } const params = new URLSearchParams({ vehicleType, brand }); if (selectedModel?.label) params.set("model", selectedModel.label); if (year) params.set("year", year); router.push(`/products?${params.toString()}`); };
  const popular = (term: string) => router.push(`/products?q=${encodeURIComponent(term)}`);
  const fieldClass = "h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white outline-none transition focus:border-autox-red/70 focus:ring-2 focus:ring-autox-red/10 disabled:cursor-not-allowed disabled:opacity-45";

  return <section className="relative z-20 mx-auto max-w-[1600px] px-4 pb-10 pt-5 lg:px-6 lg:pt-7">
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/95 shadow-[0_24px_70px_rgba(0,0,0,.35)] backdrop-blur-xl">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-start gap-3"><span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-autox-red/10 text-autox-red"><SlidersHorizontal size={18}/></span><div><h2 className="text-sm font-black uppercase tracking-[.04em] text-white sm:text-base">Find Parts For <span className="text-autox-red">Your Vehicle</span></h2><p className="mt-1 text-xs leading-5 text-zinc-500">Choose what you know. Brand is required; model and year refine the match.</p></div></div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          <select aria-label="Select vehicle type" value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setBrand(""); setModel(""); setYear(""); setMessage(""); }} className={fieldClass}><option value="">Vehicle Type</option>{vehicleTypes.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select>
          <select aria-label="Select brand" value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); setYear(""); setMessage(""); }} disabled={!vehicleType} className={fieldClass}><option value="">Brand</option>{visibleBrands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select>
          <select aria-label="Select model" value={model} onChange={(e) => { setModel(e.target.value); setYear(""); }} disabled={!brand || visibleModels.length === 0} className={fieldClass}><option value="">{visibleModels.length ? "Any Model" : "Model"}</option>{visibleModels.map((m) => <option key={m.id} value={m.value}>{m.label}</option>)}</select>
          <select aria-label="Select year" value={year} onChange={(e) => setYear(e.target.value)} disabled={!model || years.length === 0} className={fieldClass}><option value="">Any Year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
          <Button type="button" onClick={search} className="h-12 w-full rounded-xl"><Search size={15}/> Find Parts</Button>
        </div>
        {message && <p className="mt-3 text-xs font-medium text-autox-red">{message}</p>}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 autox-overlay-scroll"><span className="shrink-0 py-1.5 text-xs text-zinc-600">Popular:</span>{popularSearches.map((s) => <button type="button" onClick={() => popular(s)} key={s} className="shrink-0 rounded-full border border-white/[.08] bg-white/[.025] px-3 py-1.5 text-xs text-zinc-400 hover:border-autox-red/40 hover:text-white">{s}</button>)}</div>
      </div>
    </div>
  </section>;
}
