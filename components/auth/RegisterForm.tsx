"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-autox-red/10 border border-autox-red/40 rounded-xl px-3 py-2.5 text-sm text-autox-red">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-autox-gray mb-1.5">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 bg-autox-panel3 border border-autox-border rounded-xl px-3 text-sm text-white outline-none focus:border-autox-red"
        />
      </div>
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
          className="w-full h-11 bg-autox-panel3 border border-autox-border rounded-xl px-3 text-sm text-white outline-none focus:border-autox-red"
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 bg-autox-panel3 border border-autox-border rounded-xl px-3 text-sm text-white outline-none focus:border-autox-red"
        />
        <p className="text-[11px] text-autox-gray mt-1">At least 8 characters.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11">
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-xs text-autox-gray">
        Already have an account?{" "}
        <Link href="/login" className="text-autox-red font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
