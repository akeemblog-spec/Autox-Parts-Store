import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkRateLimit, requestIp } from "@/lib/security/rate-limit";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.trim().toLowerCase();
        const limiter = await checkRateLimit("login", `${requestIp(request)}:${email}`, 5, 15 * 60_000);
        if (!limiter.allowed) return null;
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user || !user.passwordHash || !user.active || !user.emailVerified) return null;
        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, sessionVersion: user.sessionVersion, mfaEnabled: user.mfaEnabled };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as any).role ?? "customer";
        token.sessionVersion = (user as any).sessionVersion ?? 1;
        token.mfaEnabled = Boolean((user as any).mfaEnabled);
        token.sessionNonce = crypto.randomUUID();
        token.invalidated = false;
      } else if (token.id) {
        const [current] = await db.select({ role: users.role, active: users.active, sessionVersion: users.sessionVersion, mfaEnabled: users.mfaEnabled }).from(users).where(eq(users.id, token.id as string)).limit(1);
        if (!current || !current.active || current.sessionVersion !== token.sessionVersion) token.invalidated = true;
        else { token.role = current.role; token.mfaEnabled = current.mfaEnabled; token.invalidated = false; }
      }
      return token;
    },
    async session({ session, token }) {
      // Preserve the real UUID even when a JWT has been invalidated. Using an
      // empty string here caused PostgreSQL UUID errors in cart/wishlist APIs.
      // Every protected consumer must reject session.user.invalidated.
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.sessionVersion = Number(token.sessionVersion ?? 1);
        session.user.sessionNonce = String(token.sessionNonce ?? "");
        session.user.mfaEnabled = Boolean(token.mfaEnabled);
        session.user.invalidated = Boolean(token.invalidated);
      }
      return session;
    },  },
});
