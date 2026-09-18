"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

function ResetForm() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const json = await res.json();
    if (!res.ok) return setError(json.error);
    setDone(true);
  }

  return (
    <div className="w-full max-w-md border border-white/10 p-10 bg-white/5">
      <div className="flex justify-center mb-6">
        <Logo size="md" />
      </div>
      <h1 className="text-2xl text-white mb-8 text-center">{t.auth.newPassword}</h1>
      {done ? (
        <p className="text-amber-500 text-sm text-center">{t.auth.passwordUpdated}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{t.auth.newPassword}</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required
              className="bg-transparent border-b border-stone-600 focus:border-amber-500 py-2 text-white outline-none" />
          </label>
          <button type="submit" className="w-full mt-2 py-4 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
            {t.auth.updatePassword}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </main>
  );
}