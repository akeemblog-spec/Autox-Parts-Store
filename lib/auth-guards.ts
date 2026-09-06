import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hasValidMfaProof } from "@/lib/security/mfa-proof";

export async function getCurrentAccount() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return null;
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, sessionVersion: users.sessionVersion, mfaEnabled: users.mfaEnabled }).from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user || !user.active || user.sessionVersion !== session.user.sessionVersion) return null;
  return { ...user, sessionNonce: session.user.sessionNonce };
}

export async function requireAdmin() {
  const user = await getCurrentAccount();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!["admin", "super_admin"].includes(user.role)) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  if (!user.mfaEnabled) return NextResponse.json({ error: "MFA setup required", code: "MFA_SETUP_REQUIRED" }, { status: 428 });
  if (!(await hasValidMfaProof({ uid: user.id, nonce: user.sessionNonce, sv: user.sessionVersion }))) return NextResponse.json({ error: "MFA verification required", code: "MFA_REQUIRED" }, { status: 428 });
  return null;
}

export async function requireSuperAdmin() {
  const user = await getCurrentAccount();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "super_admin") return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
  if (!user.mfaEnabled) return NextResponse.json({ error: "MFA setup required", code: "MFA_SETUP_REQUIRED" }, { status: 428 });
  if (!(await hasValidMfaProof({ uid: user.id, nonce: user.sessionNonce, sv: user.sessionVersion }))) return NextResponse.json({ error: "MFA verification required", code: "MFA_REQUIRED" }, { status: 428 });
  return null;
}
