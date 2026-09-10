export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-white/[.06]" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-autox-red border-r-autox-red/40 shadow-[0_0_18px_rgba(237,28,36,.35)]" />
        <span className="h-2 w-2 rounded-full bg-autox-red" />
      </div>
      <p className="text-sm font-semibold text-autox-gray">{label}</p>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel animate-pulse">
      <div className="aspect-square bg-autox-panel3" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 rounded-full bg-autox-panel3" />
        <div className="h-4 w-3/4 rounded-full bg-autox-panel3" />
        <div className="h-3 w-1/2 rounded-full bg-autox-panel3" />
        <div className="mt-3 h-9 w-full rounded-xl bg-autox-panel3" />
      </div>
    </div>
  );
}
