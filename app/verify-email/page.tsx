"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const p = useSearchParams();

  const [email, setEmail] = useState(p.get("email") || "");
  const token = p.get("token") || "";

  const [msg, setMsg] = useState(
    token
      ? "Verifying your email..."
      : "Enter your email to resend verification."
  );

  const [ok, setOk] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token || !email) return;

    let cancelled = false;

    const verifyEmail = async () => {
      try {
        const r = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        });

        const d = await r.json();

        if (cancelled) return;

        setOk(r.ok);
        setMsg(
          r.ok
            ? "Your email is verified. You can now sign in."
            : d.error || "Verification failed."
        );
      } catch {
        if (cancelled) return;

        setOk(false);
        setMsg("Verification failed. Please try again.");
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token, email]);

  const resend = async () => {
    if (!email.trim()) {
      setMsg("Please enter your email address.");
      return;
    }

    setResending(true);

    try {
      await fetch("/api/auth/verify/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setMsg(
        "If that account needs verification, a new email has been sent."
      );
    } catch {
      setMsg("Unable to send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-md border border-autox-border bg-autox-panel p-7">
        <div className="mb-6 text-2xl font-black text-white">
          AUTO<span className="text-autox-red">X</span>
        </div>

        <h1 className="text-xl font-bold text-white">
          Email confirmation
        </h1>

        <p className="mt-3 text-sm text-autox-gray">{msg}</p>

        {!token && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="mt-5 w-full rounded-sm border border-autox-border bg-autox-panel3 px-3 py-3 text-sm text-white outline-none focus:border-autox-red"
            />

            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="mt-3 w-full bg-autox-red px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification"}
            </button>
          </>
        )}

        {ok && (
          <Link
            href="/login"
            className="mt-5 block bg-autox-red px-4 py-3 text-center text-sm font-bold text-white"
          >
            Sign In
          </Link>
        )}
      </div>
    </main>
  );
}

function VerifyEmailLoading() {
  return (
    <main className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-sm text-autox-gray">
        Loading email verification...
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}