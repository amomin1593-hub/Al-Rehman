"use client";
import { useRouter } from "next/navigation";
import { Database, CheckCircle2, AlertTriangle } from "lucide-react";
import { api, Status, useStatus } from "./ui";

type S = { mode: "supabase" | "files"; ok: boolean; empty: boolean; error: string };

export default function DbStatus({ status }: { status: S }) {
  const router = useRouter();
  const { state, run, busy } = useStatus();

  if (status.mode === "files")
    return (
      <Box tone="warn" icon={<AlertTriangle size={18} />} title="Supabase is not connected">
        Products are being read from the project files. Changes save only on your computer (npm run dev), and the live site can't save.
        Add <code>SUPABASE_URL</code> and <code>SUPABASE_SECRET_KEY</code> to connect (see README → Connect Supabase).
      </Box>
    );

  if (!status.ok)
    return (
      <Box tone="err" icon={<AlertTriangle size={18} />} title="Can't reach the database">
        {status.error}
        <br />
        If it says a table does not exist, run <code>supabase/schema.sql</code> in Supabase → SQL Editor.
      </Box>
    );

  if (status.empty)
    return (
      <Box tone="warn" icon={<Database size={18} />} title="Supabase is connected, but it has no products yet">
        <p className="mb-3">Import the current products, categories and home page into Supabase. You only need to do this once.</p>
        <div className="flex items-center gap-4">
          <button
            disabled={busy}
            onClick={() => run(async () => { await api("/api/admin/import", "POST"); router.refresh(); }, "Imported")}
            className="btn-dark py-2.5"
          >
            {busy ? "Importing…" : "Import starter products"}
          </button>
          <Status state={state} />
        </div>
      </Box>
    );

  return (
    <Box tone="ok" icon={<CheckCircle2 size={18} />} title="Connected to Supabase">
      Products, stock, home page, orders and uploaded photos are saved online. Changes show on the live site immediately.
    </Box>
  );
}

function Box({ tone, icon, title, children }: { tone: "ok" | "warn" | "err"; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const cls =
    tone === "ok" ? "border-[#b9cdb3] bg-[#eef4ec] text-[#3f5d3a]" : tone === "err" ? "border-sale/40 bg-[#f8ebe7] text-sale" : "border-bronze/40 bg-[#f6efe3] text-bronze-dark";
  return (
    <div className={`mb-8 flex gap-3 border px-5 py-4 text-[14px] ${cls}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-medium">{title}</p>
        <div className="mt-1 text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
