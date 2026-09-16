import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Keep multipart requests below Vercel's 4.5 MB function limit.
const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
};

function matchesMagic(buf: Buffer, mime: string) {
  if (mime === "image/jpeg") return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png") return buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/gif") return buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a";
  if (mime === "image/webp") return buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!mimeToExt[file.type]) return NextResponse.json({ error: "Only JPG, PNG, WEBP and GIF images are allowed." }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!matchesMagic(bytes, file.type)) return NextResponse.json({ error: "The uploaded file content does not match its image type." }, { status: 400 });

    const name = `${Date.now()}-${randomUUID()}.${mimeToExt[file.type]}`;
    const pathname = `uploads/products/${name}`;
    if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(pathname, bytes, { access: "public", contentType: file.type });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Image storage is not configured. Connect a public Vercel Blob store to this project and redeploy." }, { status: 503 });
    }

    // Local development convenience. Production uploads must use durable storage.
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes, { flag: "wx" });
    return NextResponse.json({ url: `/${pathname}` }, { status: 201 });
  } catch (error) {
    console.error("Admin image upload failed:", error);
    return NextResponse.json({ error: "Image upload failed. Check image storage settings or try again." }, { status: 500 });
  }
}
