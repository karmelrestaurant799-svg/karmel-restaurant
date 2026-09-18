"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "EMAIL_NOT_VERIFIED" ? "Please verify your email first." : "Invalid email or password.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md border border-white/10 p-10 bg-white/5">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <h1 className="text-2xl text-white mb-8 text-center">{t.auth.loginTitle}</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{t.auth.email}</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              className="bg-transparent border-b border-stone-600 focus:border-amber-500 py-2 text-white outline-none" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{t.auth.password}</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              className="bg-transparent border-b border-stone-600 focus:border-amber-500 py-2 text-white outline-none" />
          </label>
          <button disabled={loading} type="submit" className="w-full mt-2 py-4 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
            {loading ? "..." : t.auth.loginBtn}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6 text-stone-600 text-xs">
          <div className="h-px bg-stone-700 flex-1" /> {t.auth.or} <div className="h-px bg-stone-700 flex-1" />
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="py-3 border border-stone-600 hover:border-amber-500 text-sm">
            {t.auth.google}
          </button>
          <button onClick={() => signIn("facebook", { callbackUrl: "/" })} className="py-3 border border-stone-600 hover:border-amber-500 text-sm">
            {t.auth.facebook}
          </button>
        </div>

        <div className="flex justify-between text-xs text-stone-500 mt-8">
          <Link href="/forgot-password" className="text-amber-500">{t.auth.forgotPassword}</Link>
          <Link href="/register" className="text-amber-500">{t.auth.registerBtn}</Link>
        </div>
      </div>
    </main>
  );
}