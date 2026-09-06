export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-autox-border border-t-autox-red rounded-full animate-spin" />
      <p className="text-autox-gray text-sm">{label}</p>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-autox-panel border border-autox-border rounded-md overflow-hidden animate-pulse">
      <div className="aspect-square bg-autox-panel3" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-autox-panel3 rounded w-1/3" />
        <div className="h-4 bg-autox-panel3 rounded w-3/4" />
        <div className="h-3 bg-autox-panel3 rounded w-1/2" />
        <div className="h-8 bg-autox-panel3 rounded w-full mt-3" />
      </div>
    </div>
  );
}
