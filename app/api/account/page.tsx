"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  if (status === "loading") return null;
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  async function downloadData() {
    const res = await fetch("/api/account/export");
    if (!res.ok) return setError("Could not export your data. Try again.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "karmel-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setDeleting(true);
    setError("");
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      return setError("Could not delete your account. Try again or contact us.");
    }
    await signOut({ callbackUrl: "/" });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-200 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg border border-white/10 p-10 bg-white/5">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <h1 className="text-2xl text-white mb-2 text-center">My Data</h1>
        <p className="text-stone-400 text-sm text-center mb-10">
          Signed in as {session.user.email}
        </p>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        <div className="border-b border-white/10 pb-8 mb-8">
          <h2 className="text-sm uppercase tracking-widest text-amber-500 mb-2">Export your data</h2>
          <p className="text-stone-400 text-sm mb-4">
            Download everything we hold about you and your reservations as a JSON file (Art. 20 GDPR).
          </p>
          <button
            onClick={downloadData}
            className="py-3 px-6 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
          >
            Download my data
          </button>
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-widest text-red-400 mb-2">Delete your account</h2>
          <p className="text-stone-400 text-sm mb-4">
            Permanently deletes your account and reservation history. This cannot be undone (Art. 17 GDPR).
          </p>
          {!deleting ? (
            <button
              onClick={() => setDeleting(true)}
              className="py-3 px-6 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-stone-400">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm.
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-transparent border-b border-stone-600 focus:border-red-400 py-2 text-white outline-none w-32"
              />
              <div className="flex gap-3">
                <button
                  disabled={confirmText !== "DELETE"}
                  onClick={deleteAccount}
                  className="py-3 px-6 bg-red-500 text-black text-xs font-bold uppercase tracking-widest hover:bg-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => { setDeleting(false); setConfirmText(""); }}
                  className="py-3 px-6 border border-stone-600 text-stone-400 text-xs uppercase tracking-widest hover:border-stone-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}