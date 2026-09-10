"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyOrderNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard API unavailable — fail silently, button still gives feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy order number"
      className="flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 transition-colors hover:border-autox-red/40 hover:bg-autox-red/10 hover:text-autox-red"
    >
      {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}
