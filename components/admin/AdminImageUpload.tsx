import { ImagePlus } from "lucide-react";

export function AdminImageUpload({ onSelect, busy = false, compact = false, title = "Upload image from device" }: {
  onSelect: (file: File) => void;
  busy?: boolean;
  compact?: boolean;
  title?: string;
}) {
  return <label className={`relative inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-autox-red/40 bg-autox-red/10 px-3 text-xs font-semibold text-white transition-colors hover:border-autox-red hover:bg-autox-red/20 focus-within:ring-2 focus-within:ring-autox-red ${busy ? "pointer-events-none opacity-50" : ""}`}>
    <ImagePlus size={18} aria-hidden="true" className="text-autox-red" />
    <span className={compact ? "sr-only" : ""}>{busy ? "Uploading…" : title}</span>
    <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/gif" aria-label={title} disabled={busy} onChange={(event) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = "";
      if (file) onSelect(file);
    }} />
  </label>;
}
