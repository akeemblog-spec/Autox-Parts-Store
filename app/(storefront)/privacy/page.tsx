import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { InfoPageShell } from "@/components/content/InfoPageShell";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPage(){return <InfoPageShell eyebrow="Legal" title="Privacy Policy" description="How AutoX uses account, order and support information to operate the store and serve customers." icon={LockKeyhole} updated="September 2026" sections={[
 {title:"Information we use",bullets:["Account details such as name and email","Delivery address, phone number and order information","Support messages, returns and review activity","Technical/security information needed to protect accounts and operate the service"]},
 {title:"Why we use it",body:"Information is used to provide accounts, process orders, deliver purchases, communicate order updates, provide support, prevent abuse, maintain security and improve the store experience."},
 {title:"Payments and service providers",body:"Payment and delivery partners may receive the minimum information required to provide their service. AutoX does not need to store full card credentials when payment processing is handled by a payment provider."},
 {title:"Your choices",body:"You may update supported account details through My Account and contact AutoX about privacy questions or requests relating to information held by the store."},
]}/>}
