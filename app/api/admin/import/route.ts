import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminOnly } from "@/lib/server/api";
import { importStarterData } from "@/lib/server/db";

// One-time: copy the starter products + home page from /data into Supabase
export async function POST() {
  return adminOnly(async () => {
    const result = await importStarterData();
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, ...result });
  });
}
