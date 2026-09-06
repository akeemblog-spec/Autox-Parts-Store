import { NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/db-queries/payment-methods";

export const dynamic = "force-dynamic";

// Public — used by the checkout page to know which payment methods to show.
// Only returns methods the admin has enabled.
export async function GET() {
  const methods = await getEnabledPaymentMethods();
  return NextResponse.json({ methods });
}
