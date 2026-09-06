import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentAccount } from "@/lib/auth-guards";
import { encryptSecret, decryptSecret, generateRecoveryCodes, hashSecurityValue, normalizeRecoveryCode } from "@/lib/security/crypto";
import { buildOtpAuthUri, generateTotpSecret, verifyTotp } from "@/lib/security/totp";
import { checkRateLimit, requestIp } from "@/lib/security/rate-limit";
import { cookies } from "next/headers";
import { createMfaProof, MFA_COOKIE } from "@/lib/security/mfa-proof";

export async function GET(){
  const u=await getCurrentAccount();
  if(!u||!["admin","super_admin"].includes(u.role))return NextResponse.json({error:"Admin access required"},{status:403});
  const [row]=await db.select({secret:users.mfaSecretEncrypted,mfaEnabled:users.mfaEnabled,email:users.email}).from(users).where(eq(users.id,u.id)).limit(1);
  if(!row)return NextResponse.json({error:"Account not found"},{status:404});
  if(row.mfaEnabled)return NextResponse.json({enabled:true});
  let secret:string;
  if(row.secret){try{secret=decryptSecret(row.secret)}catch{secret=generateTotpSecret();await db.update(users).set({mfaSecretEncrypted:encryptSecret(secret)}).where(eq(users.id,u.id));}}
  else {secret=generateTotpSecret();await db.update(users).set({mfaSecretEncrypted:encryptSecret(secret)}).where(eq(users.id,u.id));}
  return NextResponse.json({enabled:false,secret,otpauthUri:buildOtpAuthUri(secret,row.email)});
}

export async function POST(req:NextRequest){
  const u=await getCurrentAccount();
  if(!u||!["admin","super_admin"].includes(u.role))return NextResponse.json({error:"Admin access required"},{status:403});
  const limit=await checkRateLimit("mfa-setup",`${u.id}:${requestIp(req)}`,10,15*60_000);if(!limit.allowed)return NextResponse.json({error:"Too many attempts. Try again later."},{status:429,headers:{"Retry-After":String(limit.retryAfterSeconds)}});
  const code=String((await req.json().catch(()=>null))?.code||"");
  const [row]=await db.select({secret:users.mfaSecretEncrypted}).from(users).where(eq(users.id,u.id)).limit(1);
  if(!row?.secret)return NextResponse.json({error:"Start MFA setup first."},{status:400});
  let secret:string;try{secret=decryptSecret(row.secret)}catch{return NextResponse.json({error:"MFA setup is invalid. Start again."},{status:400});}
  if(!verifyTotp(secret,code))return NextResponse.json({error:"Invalid authenticator code."},{status:400});
  const recoveryCodes=generateRecoveryCodes(10);
  const hashes=recoveryCodes.map(c=>hashSecurityValue(normalizeRecoveryCode(c)));
  await db.update(users).set({mfaEnabled:true,mfaRecoveryCodes:JSON.stringify(hashes),mfaVerifiedAt:new Date()}).where(eq(users.id,u.id));
  const store=await cookies();store.set(MFA_COOKIE,createMfaProof({uid:u.id,nonce:u.sessionNonce,sv:u.sessionVersion}),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:12*60*60});
  return NextResponse.json({ok:true,recoveryCodes});
}
