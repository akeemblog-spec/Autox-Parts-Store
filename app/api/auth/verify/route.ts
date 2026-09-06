import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { consumeAuthToken } from "@/lib/email/auth-tokens";
export async function POST(req:NextRequest){const body=await req.json().catch(()=>null);const email=String(body?.email||"").trim().toLowerCase();const token=String(body?.token||"");if(!email||!token)return NextResponse.json({error:"Invalid verification link"},{status:400});if(!(await consumeAuthToken(`verify:${email}`,token)))return NextResponse.json({error:"This verification link is invalid or expired."},{status:400});await db.update(users).set({emailVerified:new Date()}).where(eq(users.email,email));return NextResponse.json({ok:true});}
