import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AppUIProvider } from "@/components/ui/AppUIProvider";

export const metadata: Metadata = {
  title: {
    default: "AutoX Parts Store | Genuine Motorcycle & Three Wheeler Parts",
    template: "%s | AutoX Parts Store",
  },
  description:
    "Shop genuine motorcycle and three wheeler parts online in Sri Lanka. Islandwide delivery, easy installment plans, and 100% genuine parts for Honda, Yamaha, Bajaj, TVS, Suzuki, Hero and more.",
  keywords: ["motorcycle parts", "bike parts Sri Lanka", "genuine parts", "Honda parts", "three wheeler parts"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="font-sans bg-black text-white antialiased">
        <SessionProvider><AppUIProvider>{children}</AppUIProvider></SessionProvider>
      </body>
    </html>
  );
}
