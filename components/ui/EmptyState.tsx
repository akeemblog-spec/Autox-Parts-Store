import { PackageX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-autox-border rounded-md bg-autox-panel">
      <div className="w-14 h-14 rounded-full bg-autox-panel3 flex items-center justify-center mb-4">
        <PackageX className="text-autox-red" size={26} />
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-autox-gray text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
