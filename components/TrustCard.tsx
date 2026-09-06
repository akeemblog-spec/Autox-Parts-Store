import * as Icons from "lucide-react";
import { TrustFeature } from "@/types";

export function TrustCard({ feature }: { feature: TrustFeature }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[feature.icon] ?? Icons.ShieldCheck;
  return (
    <div className="flex flex-col items-center text-center bg-autox-panel border border-autox-border rounded-md p-5 hover:border-autox-red/50 transition-colors">
      <div className="w-11 h-11 rounded-full bg-autox-red/10 border border-autox-red/30 flex items-center justify-center mb-3">
        <Icon size={20} className="text-autox-red" />
      </div>
      <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
      <p className="text-autox-gray text-xs mt-1">{feature.description}</p>
    </div>
  );
}
