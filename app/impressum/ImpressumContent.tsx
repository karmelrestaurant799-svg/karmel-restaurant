"use client";
import LegalText from "@/components/LegalText";
import { impressumDe, impressumEn } from "@/lib/legalTexts";
import { useLanguage } from "@/lib/languageContext";

// German is shown for "de"; every other language gets the English site notice.
export default function ImpressumContent() {
  const { lang, t } = useLanguage();
  return <LegalText html={lang === "de" ? impressumDe : impressumEn} backLabel={t.common.back} />;
}
