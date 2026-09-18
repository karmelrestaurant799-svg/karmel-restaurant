"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function AccountPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `karmel-account-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Deletion failed");
      }
      await signOut({ callbackUrl: "/" });
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md border border-white/10 p-10 bg-white/5 text-center">
          <p className="text-stone-400 mb-4">{t.account.signInRequired}</p>
          <Link href="/login" className="text-amber-500 hover:underline">{t.auth.loginBtn}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-amber-500 text-xs uppercase tracking-widest inline-block mb-6">
          ← {t.common.back}
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <Logo size="sm" />
          <div>
            <h1 className="text-2xl text-white">{t.account.title}</h1>
            <p className="text-stone-500 text-sm">{session.user.email}</p>
          </div>
        </div>

        <section className="border border-white/10 p-6 mb-8">
          <h2 className="text-amber-500 text-xs uppercase tracking-widest mb-4">{t.account.profile}</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <dt className="text-stone-500">{t.account.name}</dt>
            <dd className="text-white font-medium">{session.user.name || "—"}</dd>
            <dt className="text-stone-500">{t.auth.email}</dt>
            <dd className="text-white font-medium">{session.user.email}</dd>
            <dt className="text-stone-500">{t.account.role}</dt>
            <dd className="text-white font-medium capitalize">{(session.user as { role?: string }).role?.toLowerCase() || "user"}</dd>
          </dl>
        </section>

        <section className="border border-white/10 p-6 mb-8">
          <h2 className="text-amber-500 text-xs uppercase tracking-widest mb-4">{t.account.dataPrivacy}</h2>
          <div className="space-y-4">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-3 border border-stone-600 hover:border-amber-500 text-left px-4 transition-colors flex items-center justify-between"
            >
              <span>{t.account.exportData}</span>
              {exporting ? t.common.loading : t.common.download}
            </button>
            <p className="text-xs text-stone-500">
              {t.account.exportDescription}
            </p>
          </div>
        </section>

        <section className="border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="text-red-400 text-xs uppercase tracking-widest mb-4">{t.account.dangerZone}</h2>
          <p className="text-stone-400 text-sm mb-4">
            {t.account.deleteWarning}
          </p>
          {deleteError && <p className="text-red-400 text-sm mb-4">{deleteError}</p>}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-left px-4 transition-colors"
            >
              {t.account.deleteAccount}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-red-400 disabled:opacity-50"
              >
                {deleting ? t.common.loading : t.account.confirmDelete}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-stone-600 hover:border-amber-500 text-xs font-bold uppercase tracking-widest"
              >
                {t.common.cancel}
              </button>
            </div>
          )}
        </section>

        <div className="mt-8 pt-8 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 border border-stone-600 hover:border-amber-500 text-xs uppercase tracking-widest"
          >
            {t.account.signOut}
          </button>
        </div>
      </div>
    </main>
  );
}