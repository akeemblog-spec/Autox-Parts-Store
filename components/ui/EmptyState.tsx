import { PackageX, LucideIcon } from "lucide-react";
import { IconChip } from "./IconChip";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, action, icon = PackageX }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[.03] via-[#101012] to-[#0c0c0e] px-6 py-16 text-center shadow-[0_18px_50px_rgba(0,0,0,.24)] ring-1 ring-inset ring-white/[.06]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-autox-red/[.08] blur-3xl"
      />
      <div className="relative flex flex-col items-center">
        <IconChip icon={icon} tone="red" size="lg" className="mb-5" />
        <h3 className="text-lg font-extrabold text-white">{title}</h3>
        {description && <p className="mt-2 max-w-sm text-sm leading-6 text-autox-gray">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
