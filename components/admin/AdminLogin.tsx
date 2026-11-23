"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./ui";

export default function AdminLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5">
      <form
        className="w-full max-w-sm bg-paper p-10"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          try {
            await api("/api/admin/login", "POST", { password: pw });
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
            setBusy(false);
          }
        }}
      >
        <Image src="/logo-dark.png" alt="" width={56} height={56} className="mx-auto" />
        <h1 className="h-display mt-6 text-center text-[36px]">Admin</h1>
        <p className="mb-8 text-center text-[13px] text-muted">Al-Rehman Traders store manager</p>
        <label className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted" htmlFor="pw">Password</label>
        <input id="pw" type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} className="field" />
        {err && <p className="mt-2 text-[13px] text-sale">{err}</p>}
        <button disabled={busy || !pw} className="btn-dark mt-6 w-full">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
