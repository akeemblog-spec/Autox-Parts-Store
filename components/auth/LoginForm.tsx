"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const stateRes = await fetch("/api/auth/security-state", { cache: "no-store" });
    const state = await stateRes.json().catch(() => ({}));
    if (state?.role === "admin" || state?.role === "super_admin") {
      if (state.setupRequired) router.push("/mfa/setup");
      else if (!state.mfaVerified) router.push(`/mfa?callbackUrl=${encodeURIComponent(callbackUrl === "/" ? "/admin" : callbackUrl)}`);
      else router.push(callbackUrl === "/" ? "/admin" : callbackUrl);
    } else router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-autox-red/10 border border-autox-red/40 rounded-sm px-3 py-2.5 text-sm text-autox-red">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-autox-gray mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 bg-autox-panel3 border border-autox-border rounded-sm px-3 text-sm text-white outline-none focus:border-autox-red"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-autox-gray mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 bg-autox-panel3 border border-autox-border rounded-sm px-3 text-sm text-white outline-none focus:border-autox-red"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <div className="text-right"><Link href="/forgot-password" className="text-xs font-semibold text-autox-red hover:underline">Forgot password?</Link></div>
      <p className="text-center text-xs text-autox-gray">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-autox-red font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
