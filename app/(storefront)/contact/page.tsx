import type { Metadata } from "next";
import { Phone, Mail, MapPin, Headphones } from "lucide-react";
import { StandardPageHero } from "@/components/content/StandardPageHero";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Get in touch with AutoX Parts Store for help & support, order tracking, or general enquiries.",
};

export default function ContactPage() {
  return (
    <>
      
      
      

      <main>
        <StandardPageHero eyebrow="Contact" title="Get in touch." accent="We’re here to help." description="Questions about a part, fitment, delivery or an order? Contact the AutoX support team." icon={Headphones} showHelp={false}/>

        <section className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 lg:grid-cols-[1fr_1.4fr] lg:px-6 lg:py-14">
          <div>
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
