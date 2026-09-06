import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const MFA_COOKIE = "autox_mfa_proof";

type Proof = { uid: string; nonce: string; sv: number; exp: number };

function signingKey() {
  const material = process.env.MFA_PROOF_SECRET || process.env.AUTH_SECRET;
  if (!material) throw new Error("AUTH_SECRET is required for MFA proof signing");
  return crypto.createHash("sha256").update(material).digest();
}

function sign(body: string) {
  return crypto.createHmac("sha256", signingKey()).update(body).digest("base64url");
}

export function createMfaProof(payload: Omit<Proof, "exp">, maxAgeSeconds = 12 * 60 * 60) {
  const proof: Proof = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds };
  const body = Buffer.from(JSON.stringify(proof)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyMfaProof(value: string | undefined, expected: { uid: string; nonce: string; sv: number }) {
  if (!value) return false;
  const [body, signature] = value.split(".");
  if (!body || !signature) return false;
  const calculated = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(calculated);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const proof = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Proof;
    return proof.uid === expected.uid && proof.nonce === expected.nonce && proof.sv === expected.sv && proof.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function hasValidMfaProof(expected: { uid: string; nonce: string; sv: number }) {
  const store = await cookies();
  return verifyMfaProof(store.get(MFA_COOKIE)?.value, expected);
}
