"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaymentMethodRow {
  id: string;
  method: string;
  label: string;
  description: string | null;
  enabled: boolean;
}

const icons: Record<string, React.ElementType> = {
  cod: Truck,
  bank_transfer: Wallet,
  koko: Zap,
  mintpay: Zap,
  card: CreditCard,
  installment: CreditCard,
};

export function PaymentMethodsSettings({ initialMethods }: { initialMethods: PaymentMethodRow[] }) {
  const router = useRouter();
  const [methods, setMethods] = useState(initialMethods);
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (id: string, current: boolean) => {
    setBusyId(id);
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !current } : m)));

    const res = await fetch(`/api/admin/payment-methods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !current }),
    });

    setBusyId(null);

    if (!res.ok) {
      // Revert on failure
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: current } : m)));
      return;
    }

    router.refresh();
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {methods.map((m) => {
        const Icon = icons[m.method] ?? CreditCard;
        return (
          <div
            key={m.id}
            className={cn(
              "flex items-start justify-between gap-4 bg-autox-panel border rounded-md p-5 transition-colors",
              m.enabled ? "border-autox-red/40" : "border-autox-border"
            )}
          >
            <div className="flex gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  m.enabled ? "bg-autox-red/15 text-autox-red" : "bg-autox-panel3 text-autox-gray"
                )}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{m.label}</p>
                {m.description && <p className="text-autox-gray text-xs mt-0.5 max-w-[220px]">{m.description}</p>}
                <span
                  className={cn(
                    "inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm",
                    m.enabled ? "text-green-400 bg-green-400/10" : "text-autox-gray bg-autox-panel3"
                  )}
                >
                  {m.enabled ? "Live at checkout" : "Hidden from checkout"}
                </span>
              </div>
            </div>

            <button
              role="switch"
              aria-checked={m.enabled}
              aria-label={`Toggle ${m.label}`}
              disabled={busyId === m.id}
              onClick={() => toggle(m.id, m.enabled)}
              className={cn(
                "relative w-11 h-6 rounded-full shrink-0 border transition-all duration-200 disabled:opacity-50",
                m.enabled ? "border-autox-red bg-autox-red shadow-[0_0_12px_rgba(237,28,36,.22)]" : "border-autox-border bg-autox-panel3"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  m.enabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
