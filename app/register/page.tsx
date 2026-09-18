"use client";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

type Step = "form" | "verify-email" | "verify-phone" | "done";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError(t.auth.consentRequired || "You must accept the privacy policy to create an account.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, consent }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error);
    setStep("verify-email");
  }

  async function submitEmailCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error);
    setCode("");
    setStep("verify-phone");
    sendPhoneOtp();
  }

  async function sendPhoneOtp() {
    setError("");
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", { size: "invisible" });
      }
      confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, form.phone, recaptchaRef.current);
    } catch {
      setError("Could not send SMS code. Check the phone number format (+49...).");
    }
  }

  async function submitPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!confirmationRef.current) throw new Error("no-confirmation");
      const result = await confirmationRef.current.confirm(code);
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, phone: form.phone }),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) return setError(json.error);
      setStep("done");
    } catch {
      setLoading(false);
      setError("Incorrect or expired code.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
      <div id="recaptcha-container" />
      <div className="w-full max-w-md border border-white/10 p-10 bg-white/5">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <h1 className="text-2xl text-white mb-8 text-center">{t.auth.registerTitle}</h1>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {step === "form" && (
          <form onSubmit={submitRegister} className="flex flex-col gap-5">
            <Input label={t.auth.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label={t.auth.email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Input label={t.auth.phone} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            <Input label={t.auth.password} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required minLength={8} />
            <label className="flex items-start gap-3 text-xs text-stone-400">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 accent-amber-500"
              />
              <span>
                {t.auth.consent}
              </span>
            </label>
            <SubmitBtn loading={loading} disabled={!consent}>{t.auth.registerBtn}</SubmitBtn>
          </form>
        )}

        {step === "verify-email" && (
          <form onSubmit={submitEmailCode} className="flex flex-col gap-5">
            <p className="text-sm text-stone-400">{t.auth.verifyEmailSubtitle} {form.email}</p>
            <Input label={t.auth.verifyEmailTitle} value={code} onChange={setCode} required />
            <SubmitBtn loading={loading}>{t.auth.verifyEmailTitle}</SubmitBtn>
          </form>
        )}

        {step === "verify-phone" && (
          <form onSubmit={submitPhoneCode} className="flex flex-col gap-5">
            <p className="text-sm text-stone-400">{t.auth.verifyPhoneSubtitle} {form.phone}</p>
            <Input label={t.auth.verifyPhoneTitle} value={code} onChange={setCode} required />
            <SubmitBtn loading={loading}>{t.auth.verifyPhoneTitle}</SubmitBtn>
            <button type="button" onClick={sendPhoneOtp} className="text-xs text-amber-500 text-center">
              {t.auth.resendCode}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center">
            <p className="text-amber-500 mb-6">{t.auth.verified}</p>
            <button
              onClick={() => signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/" })}
              className="w-full py-4 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest"
            >
              {t.auth.loginBtn}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-stone-500 mt-8">
          {t.auth.haveAccount} <Link href="/login" className="text-amber-500">{t.auth.loginBtn}</Link>
        </p>
      </div>
    </main>
  );
}

function Input(
  props: { label: string; onChange: (v: string) => void; value: string } &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">
) {
  const { label, onChange, ...rest } = props;
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{label}</span>
      <input
        {...rest}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-stone-600 focus:border-amber-500 py-2 text-white outline-none"
      />
    </label>
  );
}

function SubmitBtn({ children, loading, disabled }: { children: React.ReactNode; loading: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full mt-2 py-4 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
    >
      {loading ? "..." : children}
    </button>
  );
}