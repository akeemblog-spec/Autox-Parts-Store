import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-autox-gray py-3">
      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight size={12} className="text-autox-border" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-autox-red transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
