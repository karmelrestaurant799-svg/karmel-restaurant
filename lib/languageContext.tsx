"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { fallbackTranslations, type Language, type TranslationKeys, type TranslationData } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  changeLanguage: (newLang: string) => Promise<void>;
  isTranslating: boolean;
  t: TranslationKeys;
  translations: TranslationData;
}


const STORAGE_KEY = "karmel-language";

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const isClient = typeof window !== "undefined";

  const getInitialLang = (): Language => {
    if (!isClient) return "de";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && stored in fallbackTranslations) return stored;
    } catch {
      // ignore
    }
    return "de";
  };

  const [lang, setLangState] = useState<Language>(getInitialLang);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationData>(fallbackTranslations);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const changeLanguage = async (newLang: string) => {
    if (newLang === lang) return;
    if (newLang === "de" || translations[newLang as Language]) {
      setLang(newLang as Language);
      return;
    }

    setIsTranslating(true);
    try {
      // The server translates its own German dictionary; the client only picks the language.
      const res = await fetch("/api/translate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLang: newLang }),
      });
      const data = await res.json();
      if (data.translatedDict) {
        setTranslations((prev) => ({ ...prev, [newLang]: data.translatedDict }));
        setLang(newLang as Language);
      } else if (!res.ok) {
        // Handle any error response (503, 500, 400, etc.)
        console.error("Translation API error:", res.status, data);
        if (res.status === 503 || data.error?.includes("not configured")) {
          console.warn("Translation service not configured. Falling back to German.");
        }
        setLang("de");
      } else {
        throw new Error(data.error || "Translation failed");
      }
    } catch (e) {
      console.error("Translation failed:", e);
      setLang("de");
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (translations[lang] || fallbackTranslations[lang] || fallbackTranslations.de) as TranslationKeys;

  if (!isClient) {
    return (
      <LanguageContext.Provider value={{ lang: "de", setLang: () => {}, changeLanguage: async () => {}, isTranslating: false, t: fallbackTranslations.de as TranslationKeys, translations }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, changeLanguage, isTranslating, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}