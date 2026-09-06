import { VehicleModel } from "@/types";

export const hondaModels: VehicleModel[] = [
  { id: "model-cbr150r", slug: "cbr-150r", brandId: "brand-honda", name: "CBR 150R", image: "/images/models/honda-cbr150r.svg", yearFrom: 2016, yearTo: "Present" },
  { id: "model-hornet2", slug: "hornet-2-0", brandId: "brand-honda", name: "Hornet 2.0", image: "/images/models/honda-hornet2.svg", yearFrom: 2020, yearTo: "Present" },
  { id: "model-unicorn150", slug: "unicorn-150", brandId: "brand-honda", name: "Unicorn 150", image: "/images/models/honda-unicorn150.svg", yearFrom: 2005, yearTo: "Present" },
  { id: "model-shine", slug: "shine", brandId: "brand-honda", name: "Shine", image: "/images/models/honda-shine.svg", yearFrom: 2006, yearTo: "Present" },
  { id: "model-xr150l", slug: "xr-150l", brandId: "brand-honda", name: "XR 150L", image: "/images/models/honda-xr150l.svg", yearFrom: 2019, yearTo: "Present" },
  { id: "model-wave", slug: "wave", brandId: "brand-honda", name: "Wave", image: "/images/models/honda-wave.svg", yearFrom: 2002, yearTo: "Present" },
];

export const modelsByBrandId: Record<string, VehicleModel[]> = {
  "brand-honda": hondaModels,
};

export function getModelsForBrand(brandId: string): VehicleModel[] {
  return modelsByBrandId[brandId] ?? [];
}
