"use client";

import { ImagePlus, Save } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { campaignSetting, getHomeCampaign, HomeCampaign } from "@/lib/home-campaigns";

const campaigns: { key: HomeCampaign; label: string; position: string }[] = [
  { key: "finder", label: "Parts Finder Banner", position: "After Shop By Category" },
  { key: "threewheel", label: "Three Wheeler Banner", position: "After Three Wheeler Brands" },
  { key: "accessories", label: "Accessories Promotion", position: "Left promotion card" },
  { key: "offers", label: "Special Offers Promotion", position: "Right promotion card" },
];
const fieldClass = "w-full rounded-md border border-autox-border bg-autox-panel3 px-3 py-2 text-sm text-white outline-none focus:border-autox-red";
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wide text-autox-gray";

export function HomeCampaignEditor({ settings, change, save, upload, busy, uploadBusy }: {
  settings: Record<string, string>;
  change: (key: string, value: string) => void;
  save: (key: HomeCampaign) => void;
  upload: (key: HomeCampaign, file: File) => void;
  busy: boolean;
  uploadBusy: boolean;
}) {
  return <section className="space-y-4">
    <div><h2 className="text-lg font-bold text-white">Homepage Feature Banners</h2><p className="mt-1 text-xs text-autox-gray">Edit the image, copy and destination for each banner. Text is displayed over the image on the homepage.</p></div>
    {campaigns.map(({ key, label, position }) => {
      const data = getHomeCampaign(key, settings);
      const update = (field: keyof typeof data, value: string) => change(campaignSetting(key, field), value);
      return <div key={key} className="rounded-lg border border-autox-border bg-autox-panel p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">{label}</h3><p className="text-xs text-autox-gray">{position}</p></div><button type="button" disabled={busy || uploadBusy || !data.title.trim() || !data.button.trim() || !data.href.trim() || !data.image.trim()} onClick={() => save(key)} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-autox-red px-4 text-xs font-bold text-white disabled:opacity-50"><Save size={15} /> Save Banner</button></div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="overflow-hidden rounded-lg border border-autox-border bg-black"><img src={data.image} alt={`${label} image preview`} className="aspect-[2/1] h-full w-full object-cover" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Small heading</span><input className={fieldClass} value={data.eyebrow} onChange={e => update("eyebrow", e.target.value)} /></label>
            <label><span className={labelClass}>Heading (white)</span><input className={fieldClass} value={data.title} onChange={e => update("title", e.target.value)} /></label>
            <label><span className={labelClass}>Heading (red)</span><input className={fieldClass} value={data.accent} onChange={e => update("accent", e.target.value)} /></label>
            {key === "threewheel" && <label><span className={labelClass}>Heading second line</span><input className={fieldClass} value={data.secondLine} onChange={e => update("secondLine", e.target.value)} /></label>}
            <label><span className={labelClass}>Button text</span><input className={fieldClass} value={data.button} onChange={e => update("button", e.target.value)} /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea rows={2} className={fieldClass} value={data.description} onChange={e => update("description", e.target.value)} /></label>
            <label><span className={labelClass}>Button link</span><input className={fieldClass} value={data.href} onChange={e => update("href", e.target.value)} /></label>
            <div className="sm:col-span-2"><span className={labelClass}>Background image</span><div className="flex gap-2"><input className={fieldClass} value={data.image} onChange={e => update("image", e.target.value)} aria-label={`${label} background image URL`} /><AdminImageUpload compact title={`Upload ${label} background`} busy={uploadBusy} onSelect={file => upload(key, file)} /></div><p className="mt-1 flex items-center gap-1 text-[10px] text-autox-gray"><ImagePlus size={12} /> Upload from your device or paste an image URL, then save this banner.</p></div>
          </div>
        </div>
      </div>;
    })}
  </section>;
}
