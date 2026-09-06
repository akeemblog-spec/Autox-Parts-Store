import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";

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
      {children}
      <Footer />
    </>
  );
}
