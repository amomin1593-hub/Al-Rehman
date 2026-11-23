import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { isReadOnlyError, READ_ONLY_MSG } from "./db";

export const fail = (message: string, status = 400) => NextResponse.json({ ok: false, error: message }, { status });

/** Runs fn only for a signed-in admin, and turns errors into friendly messages. */
export async function adminOnly(fn: () => Promise<Response>) {
  if (!(await isAdmin())) return fail("Please sign in again.", 401);
  return handle(fn);
}

export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    if (isReadOnlyError(e)) return fail(READ_ONLY_MSG, 503);
    console.error(e);
    const status = (e as { status?: number }).status ?? 500;
    return fail((e as Error).message || "Something went wrong", status);
  }
}
