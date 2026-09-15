import * as Icons from "lucide-react";
import { TrustFeature } from "@/types";

export function TrustCard({ feature }: { feature: TrustFeature }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[feature.icon] ?? Icons.ShieldCheck;
  return (
    <div className="autox-neon-frame group flex flex-col items-center rounded-2xl border bg-autox-panel p-5 text-center transition-[border-color,box-shadow]">
      <div className="autox-neon-icon mb-3 flex h-11 w-11 items-center justify-center">
        <Icon size={20} className="autox-neon-mark" />
      </div>
      <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
      <p className="text-autox-gray text-xs mt-1">{feature.description}</p>
    </div>
  );
}
