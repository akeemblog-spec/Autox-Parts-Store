"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean };
type PromptOptions = { title: string; description?: string; label?: string; placeholder?: string; defaultValue?: string; confirmLabel?: string; inputMode?: "text" | "number" | "textarea" };
type Resolver<T> = (value: T) => void;

type AppUIContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  toast: (message: string, tone?: ToastTone) => void;
};

const AppUIContext = createContext<AppUIContextValue | null>(null);

export function AppUIProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [promptState, setPromptState] = useState<PromptOptions | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [toasts, setToasts] = useState<{ id: number; message: string; tone: ToastTone }[]>([]);
  const confirmResolver = useRef<Resolver<boolean> | null>(null);
  const promptResolver = useRef<Resolver<string | null> | null>(null);
  const nextToastId = useRef(1);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    confirmResolver.current = resolve;
    setConfirmState(options);
  }), []);

  const prompt = useCallback((options: PromptOptions) => new Promise<string | null>((resolve) => {
    promptResolver.current = resolve;
    setPromptValue(options.defaultValue ?? "");
    setPromptState(options);
  }), []);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = nextToastId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500);
  }, []);

  const closeConfirm = (value: boolean) => {
    const resolver = confirmResolver.current;
    confirmResolver.current = null;
    setConfirmState(null);
    resolver?.(value);
  };

  const closePrompt = (value: string | null) => {
    const resolver = promptResolver.current;
    promptResolver.current = null;
    setPromptState(null);
    resolver?.(value);
  };

  const value = useMemo(() => ({ confirm, prompt, toast }), [confirm, prompt, toast]);

  return <AppUIContext.Provider value={value}>
    {children}
    {confirmState && <div className="fixed inset-0 z-[200] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0" aria-label="Close confirmation" onClick={() => closeConfirm(false)} />
      <div className="relative w-full max-w-md rounded-md border border-autox-border bg-[#0c0c0c] shadow-2xl">
        <div className="flex items-start gap-3 border-b border-autox-border p-5">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${confirmState.destructive ? "bg-autox-red/10 text-autox-red" : "bg-white/5 text-white"}`}><AlertTriangle size={18}/></div>
          <div className="min-w-0 flex-1"><h2 className="text-base font-extrabold text-white">{confirmState.title}</h2>{confirmState.description && <p className="mt-1.5 text-sm leading-6 text-autox-gray">{confirmState.description}</p>}</div>
          <button onClick={() => closeConfirm(false)} className="text-autox-gray hover:text-white" aria-label="Close"><X size={18}/></button>
        </div>
        <div className="flex justify-end gap-3 p-4"><button onClick={() => closeConfirm(false)} className="rounded-sm border border-autox-border px-4 py-2 text-sm font-semibold text-autox-gray hover:text-white">{confirmState.cancelLabel ?? "Cancel"}</button><button onClick={() => closeConfirm(true)} className={`rounded-sm px-4 py-2 text-sm font-bold text-white ${confirmState.destructive ? "bg-autox-red hover:bg-autox-redDark" : "bg-white/10 hover:bg-white/15"}`}>{confirmState.confirmLabel ?? "Confirm"}</button></div>
      </div>
    </div>}
    {promptState && <div className="fixed inset-0 z-[200] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0" aria-label="Close prompt" onClick={() => closePrompt(null)} />
      <div className="relative w-full max-w-md rounded-md border border-autox-border bg-[#0c0c0c] shadow-2xl">
        <div className="flex items-start justify-between border-b border-autox-border p-5"><div><h2 className="text-base font-extrabold text-white">{promptState.title}</h2>{promptState.description && <p className="mt-1.5 text-sm leading-6 text-autox-gray">{promptState.description}</p>}</div><button onClick={() => closePrompt(null)} className="text-autox-gray hover:text-white" aria-label="Close"><X size={18}/></button></div>
        <div className="p-5">{promptState.label && <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-autox-gray">{promptState.label}</label>}{promptState.inputMode === "textarea" ? <textarea autoFocus rows={4} value={promptValue} onChange={(e) => setPromptValue(e.target.value)} placeholder={promptState.placeholder} className="w-full rounded-sm border border-autox-border bg-autox-panel3 px-3 py-2 text-sm text-white outline-none ring-0 focus:border-autox-red focus:ring-0"/> : <input autoFocus type={promptState.inputMode === "number" ? "number" : "text"} value={promptValue} onChange={(e) => setPromptValue(e.target.value)} placeholder={promptState.placeholder} className="w-full rounded-sm border border-autox-border bg-autox-panel3 px-3 py-2 text-sm text-white outline-none ring-0 focus:border-autox-red focus:ring-0"/>}</div>
        <div className="flex justify-end gap-3 border-t border-autox-border p-4"><button onClick={() => closePrompt(null)} className="rounded-sm border border-autox-border px-4 py-2 text-sm font-semibold text-autox-gray hover:text-white">Cancel</button><button onClick={() => closePrompt(promptValue.trim() || null)} className="rounded-sm bg-autox-red px-4 py-2 text-sm font-bold text-white hover:bg-autox-redDark">{promptState.confirmLabel ?? "Continue"}</button></div>
      </div>
    </div>}
    <div className="pointer-events-none fixed bottom-5 right-5 z-[250] flex w-[min(92vw,360px)] flex-col gap-2">{toasts.map((item) => <div key={item.id} className={`pointer-events-auto flex items-start gap-3 rounded-md border bg-[#101010] p-3 shadow-2xl ${item.tone === "error" ? "border-autox-red/40" : item.tone === "success" ? "border-emerald-400/30" : "border-autox-border"}`}>{item.tone === "success" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400"/> : item.tone === "error" ? <AlertTriangle size={17} className="mt-0.5 shrink-0 text-autox-red"/> : <Info size={17} className="mt-0.5 shrink-0 text-autox-gray"/>}<p className="flex-1 text-sm leading-5 text-white">{item.message}</p><button aria-label="Dismiss notification" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== item.id))} className="text-autox-gray hover:text-white"><X size={15}/></button></div>)}</div>
  </AppUIContext.Provider>;
}

export function useAppUI() {
  const value = useContext(AppUIContext);
  if (!value) throw new Error("useAppUI must be used inside AppUIProvider");
  return value;
}
