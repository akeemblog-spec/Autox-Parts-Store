"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Music2,
  MessageCircle,
} from "lucide-react";
import { getCachedFooter, loadFooterPayload } from "@/lib/client/storefront-cache";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Bikes", href: "/bikes" },
  { label: "Three Wheelers", href: "/three-wheelers" },
  { label: "Brands", href: "/brands" },
  { label: "Parts Finder", href: "/parts-finder" },
];

const serviceLinks = [
  { label: "Services", href: "/services" },
  { label: "Offers", href: "/offers" },
  { label: "Contact", href: "/contact" },
  { label: "About Us", href: "/contact" },
];

const customerCareLinks = [
  { label: "Help & Support", href: "/contact" },
  { label: "Track Order", href: "/orders/track" },
  { label: "My Account", href: "/account" },
];

type FooterBrand = {
  id: string;
  name: string;
  slug: string;
};

type FooterPayload = {
  bikeBrands: FooterBrand[];
  threeWheelerBrands: FooterBrand[];
  allBrands: FooterBrand[];
  settings: Record<string, string>;
};

const fallbackPayload: FooterPayload = { bikeBrands: [], threeWheelerBrands: [], allBrands: [], settings: {} };

export function Footer() {
  const [payload, setPayload] = useState<FooterPayload>(() => (getCachedFooter() as FooterPayload | null) ?? fallbackPayload);

  useEffect(() => {
    let active = true;

    async function loadFooter() {
      try {
        const data = await loadFooterPayload();
        if (active && data) setPayload(data as FooterPayload);
      } catch {
        // Footer has safe fallbacks; a failed content request should never
        // take down the storefront or cart pages.
      }
    }

    void loadFooter();
    return () => {
      active = false;
    };
  }, []);

  const { allBrands, settings } = payload;

  const social = useMemo(
    () =>
      [
        { key: "social_facebook", label: "Facebook", icon: Facebook },
        { key: "social_instagram", label: "Instagram", icon: Instagram },
        { key: "social_youtube", label: "YouTube", icon: Youtube },
        { key: "social_tiktok", label: "TikTok", icon: Music2 },
        { key: "social_whatsapp", label: "WhatsApp", icon: MessageCircle },
        { key: "social_x", label: "X", icon: Music2 },
      ].filter((item) => Boolean(settings[item.key])),
    [settings],
  );

  const bottom = settings.footer_bottom_text || "Made with ♥ in Sri Lanka";

  return (
    <footer className="border-t border-autox-border bg-black">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 lg:grid-cols-5 lg:px-6">
        <div className="col-span-2 lg:col-span-1">
          <span className="text-2xl font-extrabold text-white">
            AUTO<span className="text-autox-red">X</span>
          </span>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.3em] text-autox-gray">
            PARTS STORE
          </p>
          <p className="mt-4 max-w-xs text-xs text-autox-gray">
            Quality parts. Peak performance. Powered by passion for every ride,
            islandwide.
          </p>
          {social.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {social.map(({ key, label, icon: Icon }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-autox-border text-autox-gray transition-colors hover:border-autox-red hover:text-autox-red"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-autox-gray hover:text-autox-red"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            More
          </h3>
          <ul className="space-y-2.5">
            {serviceLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-autox-gray hover:text-autox-red"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            Top Brands
          </h3>
          <ul className="space-y-2.5">
            {allBrands.length > 0 ? (
              allBrands.slice(0, 5).map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="text-sm text-autox-gray hover:text-autox-red"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-autox-gray">Browse our brands</li>
            )}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">
            Customer Support
          </h3>
          <p className="mb-4 text-xs leading-5 text-autox-gray">
            Need help with fitment, delivery or an order? Use the support links below.
          </p>
          <div className="mt-6">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white">
              Customer Care
            </h4>
            <ul className="space-y-1.5">
              {customerCareLinks.slice(0, 3).map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-autox-gray hover:text-autox-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-autox-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-autox-gray sm:flex-row lg:px-6">
          <p>
            &copy; {new Date().getFullYear()} {settings.footer_copyright || "AutoX Parts Store. All Rights Reserved."}
          </p>
          <p>
            {bottom.includes("♥") ? (
              <>
                {bottom.split("♥")[0]}
                <span className="text-autox-red">♥</span>
                {bottom.split("♥").slice(1).join("♥")}
              </>
            ) : (
              bottom
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
