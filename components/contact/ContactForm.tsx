"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const input = "w-full bg-autox-panel3 border border-autox-border rounded-sm px-3 text-sm text-white outline-none focus:border-autox-red";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage(""); setOk(false);
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    setOk(response.ok);
    setMessage(data.message || data.error || "Unable to send your message.");
    if (response.ok) setForm({ name: "", email: "", subject: "", message: "" });
  };

  return <form onSubmit={submit} className="space-y-4 rounded-md border border-autox-border bg-autox-panel p-6">
    <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold text-autox-gray">Full Name</span><input required minLength={2} maxLength={100} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className={`${input} h-11`} autoComplete="name" /></label><label><span className="mb-1.5 block text-xs font-semibold text-autox-gray">Email Address</span><input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className={`${input} h-11`} autoComplete="email" /></label></div>
    <label><span className="mb-1.5 block text-xs font-semibold text-autox-gray">Subject</span><input maxLength={160} value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} className={`${input} h-11`} /></label>
    <label><span className="mb-1.5 block text-xs font-semibold text-autox-gray">Message</span><textarea required minLength={10} maxLength={3000} rows={5} value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} className={`${input} resize-none py-2.5`} /></label>
    {message&&<p className={`flex items-center gap-2 text-xs ${ok?"text-green-400":"text-autox-red"}`}>{ok&&<CheckCircle2 size={14}/>} {message}</p>}
    <Button type="submit" disabled={busy} className="w-full sm:w-auto"><Send size={15}/>{busy?"Sending...":"Send Message"}</Button>
  </form>;
}
