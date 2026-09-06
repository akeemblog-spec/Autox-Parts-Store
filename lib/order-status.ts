export const ORDER_STAGES = [
  { key: "pending", label: "Order Placed", description: "Thank you. Your order has been received." },
  { key: "confirmed", label: "Confirmed", description: "Your order has been confirmed and is being prepared." },
  { key: "shipped", label: "In Transit", description: "Your order has been shipped and is on the way." },
  { key: "out_for_delivery", label: "Out for Delivery", description: "Your order is with the delivery team." },
  { key: "delivered", label: "Delivered", description: "Your order has been delivered successfully." },
] as const;

export function canonicalHistoryStatus(status: string) {
  if (status === "paid" || status === "processing") return "confirmed";
  if (status === "shipped") return "shipped";
  if (status === "out_for_delivery") return "out_for_delivery";
  if (status === "delivered") return "delivered";
  if (status === "pending") return "pending";
  return status;
}

export function stageForOrderStatus(status: string) {
  if (status === "delivered") return 5;
  if (status === "out_for_delivery") return 4;
  if (status === "shipped") return 3;
  if (status === "paid" || status === "processing") return 2;
  if (status === "pending") return 1;
  return 0;
}

export function historyMeta(status: string) {
  const canonical = canonicalHistoryStatus(status);
  return ORDER_STAGES.find((s) => s.key === canonical) ?? { key: canonical, label: status.replaceAll("_", " "), description: "Order status updated." };
}
