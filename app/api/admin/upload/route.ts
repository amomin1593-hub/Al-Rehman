import { NextResponse } from "next/server";
import { adminOnly, fail } from "@/lib/server/api";
import { uploadImage } from "@/lib/server/db";

// Upload: multipart form with "file" and "folder" (products | home)
export async function POST(req: Request) {
  return adminOnly(async () => {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "products");
    if (!(file instanceof File)) return fail("No file received");
    if (folder !== "products" && folder !== "home") return fail("Bad folder");
    const url = await uploadImage(file, folder);
    return NextResponse.json({ ok: true, url });
  });
}
