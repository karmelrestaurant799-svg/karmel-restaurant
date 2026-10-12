"use client";
import LegalText from "@/components/LegalText";
import { datenschutzDe } from "@/lib/legalTexts";
import { useLanguage } from "@/lib/languageContext";

// Only a German version is generated; it is the legally binding text.
export default function DatenschutzContent() {
  const { t } = useLanguage();
  return <LegalText html={datenschutzDe} backLabel={t.common.back} />;
}
