import { NextResponse } from "next/server";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";
export async function GET(){const s=await getStorefrontSettings();return NextResponse.json({standardDeliveryFee:Math.max(0,Number(s.delivery_fee??500)||0),expressDeliveryFee:Math.max(0,Number(s.express_delivery_fee??750)||0),expressEnabled:(s.express_delivery_enabled??'true')==='true'});}
