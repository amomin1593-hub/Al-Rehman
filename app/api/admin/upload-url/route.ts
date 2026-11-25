import { NextResponse } from "next/server";
import { adminOnly, fail } from "@/lib/server/api";
import { signedUpload } from "@/lib/server/db";

// POST { name, type, size, folder } -> { mode: "signed", uploadUrl, publicUrl } or { mode: "direct" }
export async function POST(req: Request) {
  return adminOnly(async () => {
    const { name, type, size, folder } = await req.json();
    if (folder !== "products" && folder !== "home") return fail("Bad folder");
    const r = await signedUpload(String(name || "file"), String(type || ""), Number(size) || 0, folder);
    return NextResponse.json({ ok: true, ...r });
  });
}
