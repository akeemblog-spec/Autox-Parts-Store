import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth-guards";
import { hasValidMfaProof } from "@/lib/security/mfa-proof";
export async function GET(){
  const u=await getCurrentAccount();
  if(!u)return NextResponse.json({authenticated:false},{status:401});
  const admin=["admin","super_admin"].includes(u.role);
  const mfaVerified=admin&&u.mfaEnabled?await hasValidMfaProof({uid:u.id,nonce:u.sessionNonce,sv:u.sessionVersion}):!admin;
  return NextResponse.json({authenticated:true,role:u.role,mfaEnabled:u.mfaEnabled,mfaVerified,setupRequired:admin&&!u.mfaEnabled});
}
