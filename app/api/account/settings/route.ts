import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
export async function PATCH(req:NextRequest){const s=await auth();if(!s?.user?.id||s.user.invalidated)return NextResponse.json({error:'Not authenticated'},{status:401});const p=z.object({orderUpdates:z.boolean(),promotions:z.boolean(),productNews:z.boolean()}).safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:'Invalid settings'},{status:400});const [row]=await db.insert(userPreferences).values({userId:s.user.id,...p.data}).onConflictDoUpdate({target:userPreferences.userId,set:{...p.data,updatedAt:new Date()}}).returning();return NextResponse.json({settings:row});}
