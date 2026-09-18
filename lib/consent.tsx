"use client";
import { createContext, useContext, useSyncExternalStore } from "react";

export type ConsentState = "unset" | "essential" | "all";

const STORAGE_KEY = "karmel-cookie-consent";

type Listener = () => void;
let listeners: Listener[] = [];
let cached: ConsentState | null = null;

function readFromStorage(): ConsentState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "essential" || stored === "all") return stored;
  } catch {
    // localStorage unavailable (private browsing, etc.) — treat as unset for this session
  }
  return "unset";
}

function subscribe(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): ConsentState {
  if (cached === null) cached = readFromStorage();
  return cached;
}

function getServerSnapshot(): ConsentState {
  return "unset";
}

function setConsentValue(value: ConsentState) {
  cached = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore — consent still applies for this session via the in-memory cache
  }
  listeners.forEach((l) => l());
}

type ConsentContextValue = {
  consent: ConsentState;
  acceptAll: () => void;
  acceptEssential: () => void;
  resetConsent: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function resetConsent() {
    cached = null;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  }

  return (
    <ConsentContext.Provider
      value={{
        consent,
        acceptAll: () => setConsentValue("all"),
        acceptEssential: () => setConsentValue("essential"),
        resetConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
