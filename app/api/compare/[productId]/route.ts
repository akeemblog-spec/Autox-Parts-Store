import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { compareItems } from "@/db/schema";
export async function DELETE(_:Request,{params}:{params:Promise<{productId:string}>}){const session=await auth();if(!session?.user?.id||session.user.invalidated)return NextResponse.json({error:"Not authenticated"},{status:401});const {productId}=await params;await db.delete(compareItems).where(and(eq(compareItems.userId,session.user.id),eq(compareItems.productId,productId)));return NextResponse.json({ok:true});}
