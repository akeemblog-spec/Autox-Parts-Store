import { DefaultSession } from "next-auth";
type AutoXRole = "customer" | "admin" | "super_admin";
declare module "next-auth" {
  interface Session { user: { id: string; role: AutoXRole; sessionVersion: number; sessionNonce: string; mfaEnabled: boolean; invalidated?: boolean } & DefaultSession["user"]; }
  interface User { role?: AutoXRole; sessionVersion?: number; mfaEnabled?: boolean; }
}
declare module "next-auth/jwt" { interface JWT { id: string; role: AutoXRole; sessionVersion: number; sessionNonce: string; mfaEnabled: boolean; invalidated?: boolean; } }
