"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

const NAV_LINKS = [
  { href: "/admin", label: "Reservations" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/history", label: "History" },
  { href: "/admin/menu", label: "Menu" },
];

export function AdminHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 relative z-50 bg-[#0a0a0a]">
      <div className="px-6 md:px-16 py-6 flex items-center justify-between">
        <Logo size="sm" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest">
          <nav className="flex gap-8 overflow-x-auto scrollbar-none pb-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-amber-500 transition-colors whitespace-nowrap ${
                  pathname === item.href ? "text-amber-500" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            ← {t.admin.backToSite}
          </Link>
        </div>

        {/* Mobile hamburger — same morph-to-X treatment as the main site nav */}
        <button
          type="button"
          aria-label="Toggle admin menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 border rounded-full transition-colors duration-300 ${
            open ? "border-amber-500 bg-amber-500/10" : "border-stone-700"
          }`}
        >
          <span
            className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
              open ? "w-4 rotate-45 translate-y-1 bg-amber-500" : "w-4"
            }`}
          />
          <span
            className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
              open ? "w-4 opacity-0" : "w-2.5"
            }`}
          />
          <span
            className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
              open ? "w-4 -rotate-45 -translate-y-1 bg-amber-500" : "w-4"
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown — houses all nav links + back-to-site so nothing
          overflows or gets clipped on small screens */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-80 border-t border-white/10" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-2 text-sm uppercase tracking-widest">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-3.5 border-b border-white/5 transition-colors ${
                pathname === item.href ? "text-amber-500" : "hover:text-amber-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="py-3.5 text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            ← {t.admin.backToSite}
          </Link>
        </nav>
      </div>
    </div>
  );
}
