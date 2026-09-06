import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages, adminNotifications } from "@/db/schema";
import { checkRateLimit, requestIp } from "@/lib/security/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(req: NextRequest) {
  const limiter = await checkRateLimit("contact", requestIp(req), 5, 60 * 60_000);
  if (!limiter.allowed) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message" }, { status: 400 });
  const [created] = await db.insert(contactMessages).values({ ...parsed.data, subject: parsed.data.subject || null }).returning({ id: contactMessages.id });
  await db.insert(adminNotifications).values({type:"message",title:"New customer message",message:parsed.data.subject||parsed.data.name,href:"/admin/messages",entityKey:`message:${created.id}`}).onConflictDoNothing();
  return NextResponse.json({ ok: true, id: created.id, message: "Thanks. Your message has been sent to AutoX support." }, { status: 201 });
}
