import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
export async function PATCH(req:NextRequest){const s=await auth();if(!s?.user?.id||s.user.invalidated)return NextResponse.json({error:'Not authenticated'},{status:401});const p=z.object({name:z.string().trim().min(2),phone:z.string().trim().min(7)}).safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:p.error.issues[0]?.message},{status:400});const [u]=await db.update(users).set(p.data).where(eq(users.id,s.user.id)).returning({name:users.name,phone:users.phone,email:users.email});return NextResponse.json({user:u});}
