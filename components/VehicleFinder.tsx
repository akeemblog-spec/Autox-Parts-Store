"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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
  const [vehicleType, setVehicleType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState<V[]>((cached?.vehicleTypes ?? []) as V[]);
  const [brands, setBrands] = useState<B[]>((cached?.brands ?? []) as B[]);
  const [models, setModels] = useState<M[]>((cached?.models ?? []) as M[]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCatalogOptions().then((data) => {
      if (!data) return;
      setVehicleTypes((data.vehicleTypes ?? []) as V[]);
      setBrands((data.brands ?? []) as B[]);
      setModels((data.models ?? []) as M[]);
    });
  }, []);

  const visibleBrands = useMemo(() => vehicleType ? brands.filter((b) => b.vehicleType === vehicleType) : brands, [brands, vehicleType]);
  const selectedBrand = brands.find((b) => b.value === brand);
  const visibleModels = useMemo(() => selectedBrand ? models.filter((m) => m.brandId === selectedBrand.id) : [], [models, selectedBrand]);
  const selectedModel = visibleModels.find((m) => m.value === model);
  const years = yearRange(selectedModel);

  const search = () => {
    if (!vehicleType || !brand) {
      setMessage("Select a vehicle type and brand to search compatible parts.");
      return;
    }
    const params = new URLSearchParams({ vehicleType, brand });
    if (selectedModel?.label) params.set("model", selectedModel.label);
    if (year) params.set("year", year);
    router.push(`/products?${params.toString()}`);
  };

  const popular = (term: string) => router.push(`/products?q=${encodeURIComponent(term)}`);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-10 lg:px-6">
      <div className="overflow-hidden rounded-md border border-autox-border bg-autox-panel">
        <div className="p-5 lg:p-6">
          <h2 className="text-sm font-bold text-white lg:text-base">FIND PARTS FOR <span className="text-autox-red">YOUR VEHICLE</span></h2>
          <p className="mt-1 text-xs text-autox-gray">Choose as much fitment information as you know. Brand is required; model and year refine the results.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select aria-label="Select vehicle type" value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setBrand(""); setModel(""); setYear(""); setMessage(""); }} className="h-11 rounded-sm border border-autox-border bg-autox-panel3 px-3 text-sm text-white outline-none focus:border-autox-red">
              <option value="">Select Vehicle Type</option>{vehicleTypes.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <select aria-label="Select brand" value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); setYear(""); setMessage(""); }} disabled={!vehicleType} className="h-11 rounded-sm border border-autox-border bg-autox-panel3 px-3 text-sm text-white outline-none focus:border-autox-red disabled:opacity-50">
              <option value="">Select Brand</option>{visibleBrands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <select aria-label="Select model" value={model} onChange={(e) => { setModel(e.target.value); setYear(""); }} disabled={!brand || visibleModels.length === 0} className="h-11 rounded-sm border border-autox-border bg-autox-panel3 px-3 text-sm text-white outline-none focus:border-autox-red disabled:opacity-50">
              <option value="">{visibleModels.length ? "Any Model" : "No Models Configured"}</option>{visibleModels.map((m) => <option key={m.id} value={m.value}>{m.label}</option>)}
            </select>
            <select aria-label="Select year" value={year} onChange={(e) => setYear(e.target.value)} disabled={!model || years.length === 0} className="h-11 rounded-sm border border-autox-border bg-autox-panel3 px-3 text-sm text-white outline-none focus:border-autox-red disabled:opacity-50">
              <option value="">Any Year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <Button type="button" onClick={search} className="h-11 w-full"><Search size={15} /> Search Parts</Button>
          </div>
          {message && <p className="mt-3 text-xs text-autox-red">{message}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="text-autox-gray">Popular Searches:</span>{popularSearches.map((s) => <button type="button" onClick={() => popular(s)} key={s} className="rounded-sm border border-autox-border bg-autox-panel3 px-3 py-1.5 text-autox-gray hover:border-autox-red/50 hover:text-white">{s}</button>)}</div>
        </div>
      </div>
    </section>
  );
}
