"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type NewReservation = { id: string; name: string; date: string; time: string; partySize: number };

const POLL_MS = 20_000;
const STORAGE_KEY = "karmel-admin-notif-since";

// Plays a short two-tone "ding-dong" using the Web Audio API — no audio file needed.
function playBeep() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  [880, 660].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.22;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export default function NewReservationAlert() {
  const getInitialEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("karmel-admin-notif-enabled") === "true";
    } catch {
      return false;
    }
  };

  const getInitialSince = (): string => {
    if (typeof window === "undefined") return new Date().toISOString();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const [enabled, setEnabled] = useState<boolean>(getInitialEnabled);
  const [toasts, setToasts] = useState<NewReservation[]>([]);
  const [mounted, setMounted] = useState(false);
  const sinceRef = useRef<string>(getInitialSince());

  useEffect(() => {
    setMounted(true);
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(sinceRef.current)}`);
      if (!res.ok) return;
      const data = await res.json();
      sinceRef.current = data.serverTime;
      localStorage.setItem(STORAGE_KEY, data.serverTime);

      if (data.reservations?.length) {
        setToasts((t) => [...data.reservations, ...t].slice(0, 5));
        if (enabled) {
          playBeep();
          for (const r of data.reservations as NewReservation[]) {
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("New reservation", {
                body: `${r.name} — ${new Date(r.date).toLocaleDateString("en-GB")} at ${r.time} (${r.partySize} guests)`,
              });
            }
          }
        }
      }
    } catch {
      // Network hiccup — next poll will retry, nothing to surface to the admin.
    }
  }, [enabled]);

  useEffect(() => {
    const id = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(id);
  }, [poll]);

  async function enableAlerts() {
    // Unlocks audio autoplay (needs a real click) and asks for desktop notifications.
    playBeep();
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    localStorage.setItem("karmel-admin-notif-enabled", "true");
    setEnabled(true);
  }

  return (
    <>
      {!enabled && (
        <button
          onClick={enableAlerts}
          className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black text-xs font-bold uppercase tracking-widest px-5 py-3 shadow-lg hover:bg-amber-400 transition-colors"
        >
          🔔 Enable reservation alerts
        </button>
      )}

      {mounted && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
          {toasts.map((r, i) => (
            <div
              key={r.id + i}
              className="bg-[#111] border border-amber-500/40 text-stone-200 text-sm px-4 py-3 shadow-lg max-w-xs"
            >
              <p className="text-amber-500 text-[10px] uppercase tracking-widest mb-1">New reservation</p>
              <p>{r.name} — {new Date(r.date).toLocaleDateString("en-GB")} at {r.time}</p>
              <p className="text-stone-500 text-xs">{r.partySize} guests</p>
              <button
                onClick={() => setToasts((t) => t.filter((x) => x.id !== r.id))}
                className="text-stone-500 hover:text-stone-300 text-xs mt-1"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}