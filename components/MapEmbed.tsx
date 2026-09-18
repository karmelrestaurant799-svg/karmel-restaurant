"use client";
import { restaurantInfo } from "@/lib/menuData";
import { useConsent } from "@/lib/consent";
import { useLanguage } from "@/lib/languageContext";

export default function MapEmbed() {
  const { consent, acceptAll } = useConsent();
  const { t } = useLanguage();

  if (consent !== "all") {
    return (
      <div className="w-full h-52 sm:h-64 md:h-80 border border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 text-center px-6">
        <p className="text-stone-400 text-xs sm:text-sm max-w-sm">
          {t.location.map}
        </p>
        <button
          onClick={acceptAll}
          className="px-5 py-2.5 text-[10px] sm:text-xs uppercase tracking-widest bg-amber-500 text-black font-bold hover:bg-white transition-colors"
        >
          {t.location.map}
        </button>
        <a
          href={restaurantInfo.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-xs text-amber-500 underline"
        >
          {t.location.map}
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
