import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";
import { MobileFloatingNav } from "@/components/MobileFloatingNav";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <Header />
      <MainNavigation />
      <div className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
        <Footer />
      </div>
      <MobileFloatingNav />
    </>
  );
}
