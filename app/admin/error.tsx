"use client";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="border border-sale/40 bg-[#f8ebe7] px-6 py-6 text-[14px] text-sale">
      <p className="font-medium">Something went wrong in the admin.</p>
      <p className="mt-2 text-ink-soft">{error.message || "Unknown error"}{error.digest ? ` (ref ${error.digest})` : ""}</p>
      <p className="mt-2 text-[13px] text-ink-soft">The full error is in Netlify → Logs → Functions. Send it to your developer if this keeps happening.</p>
      <div className="mt-5 flex gap-3">
        <button onClick={reset} className="btn-dark py-2.5">Try again</button>
        <Link href="/admin" className="btn-line py-2.5">Dashboard</Link>
      </div>
    </div>
  );
}
