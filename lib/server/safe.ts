import "server-only";
/** Runs a data load and returns [data, null] or [null, errorMessage] instead of throwing. */
export async function safe<T>(p: Promise<T>): Promise<[T, null] | [null, string]> {
  try {
    return [await p, null];
  } catch (e) {
    console.error(e);
    return [null, (e as Error)?.message || String(e)];
  }
}
