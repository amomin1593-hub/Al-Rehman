import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Change the password in .env.local:  ADMIN_PASSWORD=your-strong-password
// (and in Vercel > Settings > Environment Variables before going live)
const PASSWORD = process.env.ADMIN_PASSWORD || "alrehman123";
export const COOKIE = "art_admin";

export const tokenFor = (pw: string) => createHash("sha256").update("al-rehman::" + pw).digest("hex");
const GOOD = tokenFor(PASSWORD);

export function checkPassword(pw: string) {
  const a = Buffer.from(tokenFor(pw));
  const b = Buffer.from(GOOD);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const c = await cookies();
  return c.get(COOKIE)?.value === GOOD;
}

export const usingDefaultPassword = !process.env.ADMIN_PASSWORD;
export const adminToken = GOOD;
