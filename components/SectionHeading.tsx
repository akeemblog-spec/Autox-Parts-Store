import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  accent?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeading({ title, accent, viewAllHref, viewAllLabel = "View All" }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-5">
      <h2 className="text-lg lg:text-xl font-extrabold text-white uppercase tracking-wide">
        {title} {accent && <span className="text-autox-red">{accent}</span>}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs font-semibold text-autox-red hover:underline shrink-0"
        >
          {viewAllLabel} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
