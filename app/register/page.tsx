import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new AutoX Parts Store account.",
};

export default function RegisterPage() {
  return (
    <>
      <TopBar />
      <Header />
      <MainNavigation />

      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-extrabold text-white text-center mb-1">Create Account</h1>
        <p className="text-autox-gray text-sm text-center mb-8">Join AutoX Parts Store</p>
        <div className="bg-autox-panel border border-autox-border rounded-md p-6">
          <RegisterForm />
        </div>
      </main>

      <Footer />
    </>
  );
}
