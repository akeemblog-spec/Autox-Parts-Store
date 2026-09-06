import "server-only";
import crypto from "crypto";
import {and,eq,gt} from "drizzle-orm";
import {db} from "@/db";
import {verificationTokens} from "@/db/schema";
export function createRawToken(){return crypto.randomBytes(32).toString("hex");}
export function hashToken(token:string){return crypto.createHash("sha256").update(token).digest("hex");}
export async function replaceAuthToken(identifier:string,raw:string,minutes:number){await db.delete(verificationTokens).where(eq(verificationTokens.identifier,identifier));await db.insert(verificationTokens).values({identifier,token:hashToken(raw),expires:new Date(Date.now()+minutes*60_000)});}
export async function consumeAuthToken(identifier:string,raw:string){const hashed=hashToken(raw);const rows=await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier,identifier),eq(verificationTokens.token,hashed),gt(verificationTokens.expires,new Date()))).returning({token:verificationTokens.token});return rows.length===1;}
