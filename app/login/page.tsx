import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { MainNavigation } from "@/components/MainNavigation";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AutoX Parts Store account.",
};

export default function LoginPage() {
  return (
    <>
      <TopBar />
      <Header />
      <MainNavigation />

      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-extrabold text-white text-center mb-1">Welcome Back</h1>
        <p className="text-autox-gray text-sm text-center mb-8">Sign in to your AutoX account</p>
        <div className="bg-autox-panel border border-autox-border rounded-md p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}
