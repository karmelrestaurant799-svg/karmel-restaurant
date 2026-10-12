"use client";
import { useState } from "react";
import { restaurantInfo } from "@/lib/menuData";
import { useEmbeddingConsent } from "@/lib/consent";
import { useLanguage } from "@/lib/languageContext";

// Shown before the map loads. German for "de", English for every other language.
const NOTICE = {
  de: {
    text: "Beim Laden der Karte werden Daten (u. a. Ihre IP-Adresse) an Google übertragen. Mehr dazu in unserer Datenschutzerklärung.",
    load: "Karte laden",
    open: "In Google Maps öffnen",
  },
  en: {
    text: "Loading the map sends data (including your IP address) to Google. See our privacy policy for details.",
    load: "Load map",
    open: "Open in Google Maps",
  },
};

export default function MapEmbed() {
  // Allowed for good via the "Google Maps" embedding in CCM19, or for this
  // visit by clicking "Load map" (2-click solution).
  const mapsAllowed = useEmbeddingConsent("Google Maps");
  const [loadedOnce, setLoadedOnce] = useState(false);
  const { lang, t } = useLanguage();
  const notice = lang === "de" ? NOTICE.de : NOTICE.en;

  if (!mapsAllowed && !loadedOnce) {
    return (
      <div className="w-full h-52 sm:h-64 md:h-80 border border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 text-center px-6">
        <p className="text-stone-400 text-xs sm:text-sm max-w-sm">
          {notice.text}
        </p>
        <button
          onClick={() => setLoadedOnce(true)}
          className="px-5 py-2.5 text-[10px] sm:text-xs uppercase tracking-widest bg-amber-500 text-black font-bold hover:bg-white transition-colors"
        >
          {notice.load}
        </button>
        <a
          href={restaurantInfo.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-xs text-amber-500 underline"
        >
          {notice.open}
        </a>
      </div>
    );
  }

  return (
    <a
      href={restaurantInfo.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full h-52 sm:h-64 md:h-80 border border-white/10 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden group"
      aria-label={`${t.location.map} ${restaurantInfo.name}`}
    >
      <iframe
        src={restaurantInfo.mapsEmbedUrl}
        className="w-full h-full pointer-events-none"
        loading="lazy"
        title={`${restaurantInfo.name} ${t.location.map}`}
      />
      <div className="absolute inset-0 flex items-end justify-start p-3 sm:p-4 bg-linear-to-t from-black/70 to-transparent">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold group-hover:text-white transition-colors">
          {t.location.map}
        </span>
      </div>
    </a>
  );
}
