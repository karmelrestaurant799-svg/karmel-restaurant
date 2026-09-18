"use client";
import { useConsent } from "@/lib/consent";
import { useLanguage } from "@/lib/languageContext";

export default function CookieConsentBanner() {
  const { consent, acceptAll, acceptEssential } = useConsent();
  const { t } = useLanguage();

  if (consent !== "unset") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-amber-500/30 px-6 py-6 md:py-5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-xs md:text-sm text-stone-300 max-w-2xl">
          {t.cookieConsent.message}
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={acceptEssential}
            className="px-5 py-2.5 text-xs uppercase tracking-widest border border-stone-600 text-stone-300 hover:border-amber-500 transition-colors"
          >
            {t.cookieConsent.essentialOnly}
          </button>
          <button
            onClick={acceptAll}
            className="px-5 py-2.5 text-xs uppercase tracking-widest bg-amber-500 text-black font-bold hover:bg-white transition-colors"
          >
            {t.cookieConsent.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
