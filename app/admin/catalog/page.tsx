import { asc } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, partTypes, vehicleModels, vehicleTypes } from "@/db/schema";
import { CatalogManager } from "@/components/admin/CatalogManager";
export const dynamic="force-dynamic";
export default async function CatalogPage(){
  const [brandRows,categoryRows,vehicleRows,partRows,modelRows]=await Promise.all([
    db.select().from(brands).orderBy(asc(brands.sortOrder),asc(brands.name)),
    db.select().from(categories).orderBy(asc(categories.sortOrder),asc(categories.name)),
    db.select().from(vehicleTypes).orderBy(asc(vehicleTypes.sortOrder),asc(vehicleTypes.name)),
    db.select().from(partTypes).orderBy(asc(partTypes.sortOrder),asc(partTypes.name)),
    db.select().from(vehicleModels).orderBy(asc(vehicleModels.name)),
  ]);
  return <CatalogManager initial={{brands:brandRows,categories:categoryRows,vehicleTypes:vehicleRows,partTypes:partRows,vehicleModels:modelRows}}/>;
}
