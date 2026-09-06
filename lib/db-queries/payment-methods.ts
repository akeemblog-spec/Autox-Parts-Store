import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getEnabledPaymentMethods() {
  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.enabled, true))
    .orderBy(asc(paymentMethods.sortOrder));
}

export async function getAllPaymentMethods() {
  return db.select().from(paymentMethods).orderBy(asc(paymentMethods.sortOrder));
}

export async function isPaymentMethodEnabled(method: string) {
  const [row] = await db
    .select({ enabled: paymentMethods.enabled })
    .from(paymentMethods)
    .where(eq(paymentMethods.method, method as "card" | "cod" | "bank_transfer" | "installment" | "koko" | "mintpay"))
    .limit(1);
  return row?.enabled ?? false;
}
