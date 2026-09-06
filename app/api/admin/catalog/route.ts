import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, partTypes, vehicleModels, vehicleTypes, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";

const slug = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const brandSchema = z.object({ id:z.string().uuid().optional(), slug, name:z.string().min(1), logo:z.string().min(1), vehicleImage:z.string().min(1), coverImage:z.string().nullable().optional(), vehicleType:z.string().min(1), description:z.string().nullable().optional(), active:z.boolean(), sortOrder:z.number().int() });
const categorySchema = z.object({ id:z.string().uuid().optional(), slug, name:z.string().min(1), image:z.string().min(1), icon:z.string().min(1), coverImage:z.string().nullable().optional(), description:z.string().nullable().optional(), active:z.boolean(), sortOrder:z.number().int() });
const vehicleTypeSchema = z.object({ id:z.string().uuid().optional(), slug, name:z.string().min(1), image:z.string().nullable().optional(), active:z.boolean(), sortOrder:z.number().int() });
const partTypeSchema = z.object({ id:z.string().uuid().optional(), slug, name:z.string().min(1), description:z.string().nullable().optional(), active:z.boolean(), sortOrder:z.number().int() });
const vehicleModelSchema = z.object({ id:z.string().uuid().optional(), slug, brandId:z.string().uuid(), name:z.string().min(1), image:z.string().min(1), yearFrom:z.number().int().min(1950).max(2200), yearTo:z.string().min(1).refine(v=>v.toLowerCase()==="present" || /^\d{4}$/.test(v),"Use a four-digit year or Present") });

type Entity = "brand"|"category"|"vehicleType"|"partType"|"vehicleModel";
const schemas:Record<Entity,z.ZodTypeAny>={brand:brandSchema,category:categorySchema,vehicleType:vehicleTypeSchema,partType:partTypeSchema,vehicleModel:vehicleModelSchema};

export async function GET(){
  const guard=await requireAdmin(); if(guard)return guard;
  const [brandRows,categoryRows,vehicleRows,partRows,modelRows]=await Promise.all([
    db.select().from(brands).orderBy(asc(brands.sortOrder),asc(brands.name)),
    db.select().from(categories).orderBy(asc(categories.sortOrder),asc(categories.name)),
    db.select().from(vehicleTypes).orderBy(asc(vehicleTypes.sortOrder),asc(vehicleTypes.name)),
    db.select().from(partTypes).orderBy(asc(partTypes.sortOrder),asc(partTypes.name)),
    db.select().from(vehicleModels).orderBy(asc(vehicleModels.name)),
  ]);
  return NextResponse.json({brands:brandRows,categories:categoryRows,vehicleTypes:vehicleRows,partTypes:partRows,vehicleModels:modelRows});
}

export async function POST(req:NextRequest){
  const guard=await requireAdmin(); if(guard)return guard;
  const body=await req.json().catch(()=>null); const type=body?.type as Entity;
  if(!schemas[type])return NextResponse.json({error:"Invalid type"},{status:400});
  const parsed=schemas[type].safeParse(body.data); if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Invalid input"},{status:400});
  try{
    let row:any;
    if(type==='brand')[row]=await db.insert(brands).values(parsed.data as z.infer<typeof brandSchema>).returning();
    else if(type==='category')[row]=await db.insert(categories).values(parsed.data as z.infer<typeof categorySchema>).returning();
    else if(type==='vehicleType')[row]=await db.insert(vehicleTypes).values(parsed.data as z.infer<typeof vehicleTypeSchema>).returning();
    else if(type==='partType')[row]=await db.insert(partTypes).values(parsed.data as z.infer<typeof partTypeSchema>).returning();
    else [row]=await db.insert(vehicleModels).values(parsed.data as z.infer<typeof vehicleModelSchema>).returning();
    return NextResponse.json({item:row},{status:201});
  }catch{return NextResponse.json({error:"Unable to create item. Check that the slug and related fields are valid."},{status:400});}
}

export async function PATCH(req:NextRequest){
  const guard=await requireAdmin(); if(guard)return guard;
  const body=await req.json().catch(()=>null); const type=body?.type as Entity;
  if(!schemas[type])return NextResponse.json({error:"Invalid type"},{status:400});
  const parsed=schemas[type].safeParse(body.data); if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Invalid input"},{status:400});
  const parsedData=parsed.data as any; if(!parsedData.id)return NextResponse.json({error:"Missing item id"},{status:400});
  const {id,...data}=parsedData; let row:any;
  if(type==='brand')[row]=await db.update(brands).set(data).where(eq(brands.id,id)).returning();
  else if(type==='category')[row]=await db.update(categories).set(data).where(eq(categories.id,id)).returning();
  else if(type==='vehicleType')[row]=await db.update(vehicleTypes).set(data).where(eq(vehicleTypes.id,id)).returning();
  else if(type==='partType')[row]=await db.update(partTypes).set(data).where(eq(partTypes.id,id)).returning();
  else [row]=await db.update(vehicleModels).set(data).where(eq(vehicleModels.id,id)).returning();
  return NextResponse.json({item:row});
}

export async function DELETE(req:NextRequest){
  const guard=await requireAdmin(); if(guard)return guard;
  const body=await req.json().catch(()=>null); const type=body?.type as Entity;
  if(!body?.id||!schemas[type])return NextResponse.json({error:"Invalid request"},{status:400});

  if(type==='brand'){
    const [usage]=await db.select({count:sql<number>`count(*)::int`}).from(products).where(eq(products.brandId,body.id));
    const [modelUsage]=await db.select({count:sql<number>`count(*)::int`}).from(vehicleModels).where(eq(vehicleModels.brandId,body.id));
    const count=(usage?.count??0)+(modelUsage?.count??0);
    if(count>0)return NextResponse.json({error:`This brand is used by ${count} product/model record(s). Reassign them first, or disable the brand.`},{status:409});
    await db.delete(brands).where(eq(brands.id,body.id));
  } else if(type==='category'){
    const [usage]=await db.select({count:sql<number>`count(*)::int`}).from(products).where(eq(products.categoryId,body.id));
    if((usage?.count??0)>0)return NextResponse.json({error:`This category is used by ${usage.count} product(s). Reassign or delete those products first, or disable the category.`},{status:409});
    await db.delete(categories).where(eq(categories.id,body.id));
  } else if(type==='vehicleType'){
    const [row]=await db.select({slug:vehicleTypes.slug}).from(vehicleTypes).where(eq(vehicleTypes.id,body.id)).limit(1);
    if(row){
      const [[productUsage],[brandUsage]]=await Promise.all([
        db.select({count:sql<number>`count(*)::int`}).from(products).where(eq(products.vehicleType,row.slug)),
        db.select({count:sql<number>`count(*)::int`}).from(brands).where(eq(brands.vehicleType,row.slug)),
      ]);
      const count=(productUsage?.count??0)+(brandUsage?.count??0);
      if(count>0)return NextResponse.json({error:`This vehicle type is still used by products or brands (${count} references). Reassign them first, or disable it.`},{status:409});
    }
    await db.delete(vehicleTypes).where(eq(vehicleTypes.id,body.id));
  } else if(type==='partType'){
    const [row]=await db.select({slug:partTypes.slug}).from(partTypes).where(eq(partTypes.id,body.id)).limit(1);
    if(row){const [usage]=await db.select({count:sql<number>`count(*)::int`}).from(products).where(eq(products.partType,row.slug));if((usage?.count??0)>0)return NextResponse.json({error:`This part type is used by ${usage.count} product(s). Reassign them first, or disable it.`},{status:409});}
    await db.delete(partTypes).where(eq(partTypes.id,body.id));
  } else {
    await db.delete(vehicleModels).where(eq(vehicleModels.id,body.id));
  }
  return NextResponse.json({ok:true});
}
