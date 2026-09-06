import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { addresses, wishlistItems } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { AccountSectionShell } from "@/components/account/AccountSectionShell";
import { AddressManager } from "@/components/account/AddressManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) redirect("/login?callbackUrl=/account/addresses");
  const [rows, wishlist] = await Promise.all([
    db.query.addresses.findMany({ where: and(eq(addresses.userId, session.user.id), eq(addresses.isSaved, true)) }),
    db.query.wishlistItems.findMany({ where: eq(wishlistItems.userId, session.user.id) }),
  ]);
  return (
    <AccountSectionShell title="Addresses" subtitle="Manage delivery addresses used at checkout." wishlistCount={wishlist.length}>
      <AddressManager initial={rows.map((a) => ({ ...a, line2: a.line2 ?? "", postalCode: a.postalCode ?? "" }))} />
    </AccountSectionShell>
  );
}
