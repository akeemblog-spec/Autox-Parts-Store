import { MobileAccountNav } from "@/components/account/MobileAccountNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileAccountNav />
      {children}
    </>
  );
}
