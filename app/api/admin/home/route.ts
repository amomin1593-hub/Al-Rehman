import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminOnly, fail } from "@/lib/server/api";
import { saveHome } from "@/lib/server/db";
import type { HomeContent } from "@/lib/home";

export async function PUT(req: Request) {
  return adminOnly(async () => {
    const body = (await req.json()) as HomeContent;
    if (!Array.isArray(body.slides) || body.slides.length === 0) return fail("Keep at least one banner slide");
    if (!Array.isArray(body.tiles)) return fail("Tiles missing");
    await saveHome({
      announcement: String(body.announcement || ""),
      slides: body.slides,
      tiles: body.tiles,
      ...(body.story ? { story: body.story } : {}),
      ...(body.video ? { video: body.video } : {}),
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  });
}
