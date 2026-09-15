import type { SVGProps } from "react";

export function WhatsAppIcon({size=24,...props}:SVGProps<SVGSVGElement>&{size?:number|string}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5.2 17.7 3.8 21l3.5-1.2a9 9 0 1 0-2.1-2.1Z"/>
    <path d="M8.5 8.4c.2 3.7 3.4 6.9 7.1 7.1l1-1-2.2-1.4-1.1 1c-1.4-.6-2.6-1.8-3.2-3.2l1-1.1-1.4-2.2-1.2.8Z"/>
  </svg>;
}
