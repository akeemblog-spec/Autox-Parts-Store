import type { Metadata } from "next";
import { getAllPaymentMethods } from "@/lib/db-queries/payment-methods";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";
import { PaymentMethodsSettings } from "@/components/admin/PaymentMethodsSettings";
import { AdminGeneralSettings } from "@/components/admin/AdminGeneralSettings";
export const metadata:Metadata={title:"Admin Settings"};export const dynamic="force-dynamic";
export default async function AdminSettingsPage(){const[methods,settings]=await Promise.all([getAllPaymentMethods(),getStorefrontSettings()]);return <div><div className="mb-6"><h1 className="text-2xl font-extrabold text-white">Settings</h1><p className="mt-1 text-sm text-autox-gray">Store, payment and shipping controls.</p></div><div className="space-y-6"><AdminGeneralSettings initial={settings}/><section id="payment" className="rounded-md border border-autox-border bg-autox-panel p-5"><h2 className="mb-1 font-bold text-white">Payment Methods</h2><p className="mb-5 text-xs text-autox-gray">Disabled methods disappear from checkout immediately.</p><PaymentMethodsSettings initialMethods={methods}/></section></div></div>}
