import { NextResponse } from "next/server";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";
export async function GET(){
  const s=await getStorefrontSettings();
  const colomboStandard=Math.max(0,Number(s.delivery_fee_colombo??s.delivery_fee??500)||0);
  const outsideStandard=Math.max(0,Number(s.delivery_fee_outside_colombo??850)||0);
  const colomboExpress=Math.max(0,Number(s.express_delivery_fee_colombo??250)||0);
  const outsideExpress=Math.max(0,Number(s.express_delivery_fee_outside_colombo??450)||0);
  return NextResponse.json({
    colomboStandardDeliveryFee:colomboStandard,
    outsideColomboStandardDeliveryFee:outsideStandard,
    colomboExpressExtraFee:colomboExpress,
    outsideColomboExpressExtraFee:outsideExpress,
    standardDeliveryFee:colomboStandard,
    expressDeliveryFee:colomboExpress,
    expressEnabled:(s.express_delivery_enabled??"true")==="true",
  });
}
