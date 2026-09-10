import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get in touch with AutoX Parts Store for help & support, order tracking, or general enquiries.",
};

export default function ContactPage() {
  return (
    <>
      
      
      

      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        </div>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 pb-14 grid lg:grid-cols-[1fr_1.4fr] gap-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Get in Touch</h1>
            <p className="text-autox-gray text-sm mb-6">
              Have a question about a part, an order, or a fitment? We&apos;re here to help.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-autox-panel border border-autox-border rounded-2xl p-4">
                <Phone size={18} className="text-autox-red" />
                <div>
                  <p className="text-white text-sm font-semibold">+94 11 234 5678</p>
                  <p className="text-autox-gray text-xs">Mon–Sat, 8:30 AM – 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-autox-panel border border-autox-border rounded-2xl p-4">
                <Mail size={18} className="text-autox-red" />
                <div>
                  <p className="text-white text-sm font-semibold">support@autoxparts.lk</p>
                  <p className="text-autox-gray text-xs">We reply within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-autox-panel border border-autox-border rounded-2xl p-4">
                <MapPin size={18} className="text-autox-red" />
                <div>
                  <p className="text-white text-sm font-semibold">Colombo, Sri Lanka</p>
                  <p className="text-autox-gray text-xs">Islandwide delivery available</p>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </section>
      </main>

      
    </>
  );
}
