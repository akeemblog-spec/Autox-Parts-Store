import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CircleHelp } from "lucide-react";
import { StandardPageHero } from "./StandardPageHero";

export type InfoSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export function InfoPageShell({
  eyebrow,
  title,
  accent,
  description,
  icon: Icon,
  sections,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  icon: LucideIcon;
  sections?: InfoSection[];
  updated?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="bg-[#050506]">
      <StandardPageHero eyebrow={eyebrow} title={title} accent={accent} description={description} icon={Icon} updated={updated} />

      <section className="mx-auto max-w-[1200px] px-4 py-10 lg:px-6 lg:py-14">
        {children ?? (
          <div className="grid gap-4 lg:grid-cols-2">
            {sections?.map((section, index) => (
              <article key={section.title} className="rounded-2xl bg-[#0b0b0d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.045),0_16px_40px_rgba(0,0,0,.22)] sm:p-6">
                <div className="mb-4 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-autox-red/10 text-[10px] font-black text-autox-red ring-1 ring-inset ring-autox-red/15">{String(index + 1).padStart(2, "0")}</span><h2 className="text-base font-extrabold text-white">{section.title}</h2></div>
                {section.body && <p className="text-sm leading-7 text-zinc-400">{section.body}</p>}
                {section.bullets && <ul className="mt-4 space-y-2.5">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-2.5 text-sm leading-6 text-zinc-400"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-autox-red"/>{bullet}</li>)}</ul>}
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-[linear-gradient(105deg,rgba(237,28,36,.13),rgba(255,255,255,.025)_48%,rgba(237,28,36,.07))] p-5 ring-1 ring-inset ring-white/[.06] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/35 text-autox-red"><CircleHelp size={18}/></span><div><h2 className="text-sm font-extrabold text-white">Still need an answer?</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Our support team can help with fitment, orders, delivery and product questions.</p></div></div>
          <Link href="/contact" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-autox-red px-5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-600 sm:mt-0">Contact AutoX<ArrowRight size={14}/></Link>
        </div>
      </section>
    </main>
  );
}
