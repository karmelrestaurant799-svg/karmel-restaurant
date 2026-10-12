"use client";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/languageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  );
}
