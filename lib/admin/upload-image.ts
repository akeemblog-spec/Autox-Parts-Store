export async function uploadAdminImage(file: File): Promise<string> {
  if (file.size > 4 * 1024 * 1024) throw new Error("Image must be 4 MB or smaller.");
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WEBP or GIF image.");
  }

  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/admin/uploads", { method: "POST", body });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.url !== "string" || !result.url) {
    throw new Error(result.error || `Image upload failed (HTTP ${response.status}).`);
  }
  return result.url;
}
