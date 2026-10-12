"use client";
import { useSyncExternalStore } from "react";

// Consent is managed by CCM19 (loaded in app/layout.tsx). This module only
// reads its state so React components can gate third-party embeds on it.
//
// The Google Maps embedding must exist in the CCM19 dashboard with a name
// containing "Google Maps" — that name is how we find it here.

type Ccm19 = {
  acceptedEmbeddings?: { id: string; name: string }[];
  openWidget?: () => void;
};

declare global {
  interface Window {
    CCM?: Ccm19;
  }
}

// CCM19 fires these on window when the visitor's choice changes; "load" covers
// the script finishing after hydration.
const CCM_EVENTS = ["load", "ccm19WidgetClosed", "ccm19EmbeddingAccepted", "ccm19CookieAccepted"];

function subscribe(onChange: () => void) {
  CCM_EVENTS.forEach((e) => window.addEventListener(e, onChange));
  return () => CCM_EVENTS.forEach((e) => window.removeEventListener(e, onChange));
}

function embeddingAccepted(name: string): boolean {
  const accepted = window.CCM?.acceptedEmbeddings ?? [];
  return accepted.some((e) => e.name.toLowerCase().includes(name.toLowerCase()));
}

/** True once the visitor has allowed the named CCM19 embedding. Always false on the server. */
export function useEmbeddingConsent(name: string): boolean {
  return useSyncExternalStore(subscribe, () => embeddingAccepted(name), () => false);
}

/** Opens the CCM19 settings dialog (footer "Cookie settings", map placeholder). */
export function openConsentSettings() {
  window.CCM?.openWidget?.();
}
