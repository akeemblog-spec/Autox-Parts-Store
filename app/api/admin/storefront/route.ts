import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { banners, heroSlides, siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";

const slideSchema = z.object({
  id: z.string().uuid().optional(), eyebrow: z.string().nullable().optional(), headline: z.string().min(1), headlineAccent: z.string().nullable().optional(), description: z.string().nullable().optional(),
  image: z.string().min(1), mobileImage: z.string().nullable().optional(), primaryLabel: z.string().min(1), primaryHref: z.string().min(1), secondaryLabel: z.string().nullable().optional(), secondaryHref: z.string().nullable().optional(), active: z.boolean(), sortOrder: z.number().int(),
});
const bannerSchema = z.object({ id: z.string().uuid().optional(), title: z.string().min(1), description: z.string().nullable().optional(), image: z.string().min(1), ctaLabel: z.string().nullable().optional(), ctaHref: z.string().nullable().optional(), active: z.boolean(), sortOrder: z.number().int() });

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard;
  const [slides, promo, settings] = await Promise.all([
    db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder)),
    db.select().from(banners).orderBy(asc(banners.sortOrder)),
    db.select().from(siteSettings),
  ]);
  return NextResponse.json({ slides, banners: promo, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.type !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (body.type === "slide") {
    const parsed = slideSchema.safeParse(body.data); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const [row] = await db.insert(heroSlides).values(parsed.data).returning(); return NextResponse.json({ item: row }, { status: 201 });
  }
  if (body.type === "banner") {
    const parsed = bannerSchema.safeParse(body.data); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const [row] = await db.insert(banners).values(parsed.data).returning(); return NextResponse.json({ item: row }, { status: 201 });
  }
  if (body.type === "settings") {
    const data = z.record(z.string(), z.string()).safeParse(body.data); if (!data.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
    await db.transaction(async (tx) => { for (const [key, value] of Object.entries(data.data)) await tx.insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } }); });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (body?.type === "slide") { const p = slideSchema.safeParse(body.data); if (!p.success || !p.data.id) return NextResponse.json({ error: "Invalid slide" }, { status: 400 }); const { id, ...data } = p.data; const [row] = await db.update(heroSlides).set(data).where(eq(heroSlides.id, id)).returning(); return NextResponse.json({ item: row }); }
  if (body?.type === "banner") { const p = bannerSchema.safeParse(body.data); if (!p.success || !p.data.id) return NextResponse.json({ error: "Invalid banner" }, { status: 400 }); const { id, ...data } = p.data; const [row] = await db.update(banners).set(data).where(eq(banners.id, id)).returning(); return NextResponse.json({ item: row }); }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.type) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (body.type === "slide") await db.delete(heroSlides).where(eq(heroSlides.id, body.id));
  else if (body.type === "banner") await db.delete(banners).where(eq(banners.id, body.id));
  else return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
