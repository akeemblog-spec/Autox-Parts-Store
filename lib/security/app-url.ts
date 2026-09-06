import "server-only";

export function getAppUrl() {
  const configured = process.env.APP_URL || process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("APP_URL must be configured in production");
  return "http://localhost:3000";
}
