"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setDone(true);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md border border-white/10 p-10 bg-white/5">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <h1 className="text-2xl text-white mb-8 text-center">{t.auth.forgotPassword}</h1>
        {done ? (
          <p className="text-amber-500 text-sm text-center">
            {t.auth.resetLinkSent}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{t.auth.email}</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                className="bg-transparent border-b border-stone-600 focus:border-amber-500 py-2 text-white outline-none" />
            </label>
            <button type="submit" className="w-full mt-2 py-4 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
              {t.auth.sendResetLink}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}