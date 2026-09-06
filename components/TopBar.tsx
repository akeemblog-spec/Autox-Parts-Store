import { Truck, BadgeCheck, RotateCcw, ShieldCheck, HelpCircle, PackageSearch } from "lucide-react";
import Link from "next/link";
import { topBarItems, topBarRightItems } from "@/lib/data/site";

const iconMap = { Truck, BadgeCheck, RotateCcw, ShieldCheck, HelpCircle, PackageSearch };

export function TopBar() {
  return (
    <div className="hidden lg:block bg-black border-b border-autox-border">
      <div className="mx-auto max-w-[1600px] px-6 flex items-center justify-between h-9 text-[11px] text-autox-gray">
        <ul className="flex items-center gap-6">
          {topBarItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.id} className="flex items-center gap-1.5">
                <Icon size={13} className="text-autox-red" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
        <ul className="flex items-center gap-6">
          {topBarRightItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.id}>
                <Link href={item.href ?? "#"} className="flex items-center gap-1.5 hover:text-autox-red transition-colors">
                  <Icon size={13} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
