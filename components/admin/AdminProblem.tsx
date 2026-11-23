import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/** Shown inside the admin instead of crashing, with the real reason in plain words. */
export default function AdminProblem({ title, message, hint }: { title: string; message?: string; hint?: React.ReactNode }) {
  return (
    <div className="border border-sale/40 bg-[#f8ebe7] px-6 py-6 text-sale">
      <p className="flex items-center gap-2 font-medium"><AlertTriangle size={18} /> {title}</p>
      {message && <pre className="mt-3 whitespace-pre-wrap break-words bg-white/60 p-3 text-[12px] text-ink">{message}</pre>}
      {hint && <div className="mt-3 text-[13px] leading-relaxed text-ink-soft">{hint}</div>}
      <Link href="/admin" className="btn-dark mt-5 py-2.5">Back to dashboard</Link>
    </div>
  );
}

export const dbHint = (
  <>
    Check that <code>SUPABASE_URL</code> and <code>SUPABASE_SECRET_KEY</code> are set in your hosting settings (Netlify → Project configuration → Environment variables),
    that <code>supabase/schema.sql</code> was run in Supabase → SQL Editor, then redeploy.
  </>
);

export const noCategoriesHint = (
  <>
    The database has no categories yet, so products can&apos;t be added. Go to the dashboard and click <b>Import starter products</b> first.
  </>
);
