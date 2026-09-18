"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { Playfair_Display, Montserrat } from "next/font/google";
import { useSession, signOut } from "next-auth/react";
import MenuSection from "@/components/MenuSection";
import MapEmbed from "@/components/MapEmbed";
import ReservationForm from "@/components/ReservationForm";
import Logo from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/lib/languageContext";
import { restaurantInfo } from "@/lib/menuData";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export default function Home() {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileOpenRef = useRef(mobileOpen);
  const [navVisible, setNavVisible] = useState(true);
  const [pastHero, setPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
    if (mobileOpen) setNavVisible(true);
  }, [mobileOpen]);

  const heroBgY = useTransform(scrollY, [0, 1000], ["0%", "30%"]);
  const heroTextY = useTransform(scrollY, [0, 600], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  const { data: session } = useSession();

  // Auto-hide navbar + scroll-spy, combined into a single rAF-throttled scroll
  // handler so we only do one layout read per frame instead of two separate
  // scroll listeners fighting for the same paint.
  useEffect(() => {
    const sectionIds = ["experience", "menu", "reservations", "location"];
    const heroThreshold = window.innerHeight * 0.7;
    let ticking = false;
    let prevY = window.scrollY;

    const measure = () => {
      ticking = false;
      const y = window.scrollY;
      const goingDown = y > prevY;
      const atTop = y < 40;
      const beyondHero = y > heroThreshold;

      setPastHero(beyondHero);

      setNavVisible((prevVisible) => {
        if (atTop || mobileOpenRef.current) return true;
        if (beyondHero && goingDown && y - prevY > 4) return false;
        if (!goingDown && prevY - y > 4) return true;
        return prevVisible;
      });

      // Scroll-spy: section whose band contains the viewport midpoint
      const mid = y + window.innerHeight * 0.35;
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        if (mid >= top && mid < top + el.offsetHeight) {
          current = id;
          break;
        }
      }
      if (!current) {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= mid) current = id;
        }
      }
      if (y < window.innerHeight * 0.45) current = "";

      setActiveSection((prev) => (prev === current ? prev : current));
      const desired = current ? `#${current}` : "";
      if (window.location.hash !== desired) {
        window.history.replaceState(
          null,
          "",
          current ? `#${current}` : window.location.pathname + window.location.search
        );
      }

      prevY = y;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  // Desktop: reveal nav when pointer approaches the top edge
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 72) setNavVisible(true);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 45, damping: 20 },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
};

  const navLinks = (
    <>
      <Link
        href="#experience"
        onClick={() => setMobileOpen(false)}
        className={`transition-colors duration-300 relative group ${
          activeSection === "experience" ? "text-amber-500" : "hover:text-amber-500"
        }`}
      >
        {t.nav.experience}
        <span className={`absolute -bottom-1 left-0 h-px-amber-500 transition-all duration-300 hidden md:block ${
          activeSection === "experience" ? "w-full" : "w-0 group-hover:w-full"
        }`} />
      </Link>
      <Link
        href="#menu"
        onClick={() => setMobileOpen(false)}
        className={`transition-colors duration-300 relative group ${
          activeSection === "menu" ? "text-amber-500" : "hover:text-amber-500"
        }`}
      >
        {t.nav.menu}
        <span className={`absolute -bottom-1 left-0 h-px bg-amber-500 transition-all duration-300 hidden md:block ${
          activeSection === "menu" ? "w-full" : "w-0 group-hover:w-full"
        }`} />
      </Link>
      <Link
        href="#location"
        onClick={() => setMobileOpen(false)}
        className={`transition-colors duration-300 relative group ${
          activeSection === "location" ? "text-amber-500" : "hover:text-amber-500"
        }`}
      >
        {t.nav.location}
        <span className={`absolute -bottom-1 left-0 h-px bg-amber-500 transition-all duration-300 hidden md:block ${
          activeSection === "location" ? "w-full" : "w-0 group-hover:w-full"
        }`} />
      </Link>
    </>
  );

  const userMenu = (
    <>
      {session?.user ? (
        <>
          {(session.user as { role?: string }).role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="hover:text-amber-500 transition-colors duration-300"
            >
              {t.nav.admin}
            </Link>
          )}
          <Link
            href="/account"
            onClick={() => setMobileOpen(false)}
            className="hover:text-amber-500 transition-colors duration-300 flex items-center gap-1"
            aria-label={t.nav.account}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <button
            onClick={() => {
              setMobileOpen(false);
              signOut();
            }}
            className="hover:text-amber-500 transition-colors duration-300 flex items-center gap-1"
            aria-label={t.nav.logout}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={() => setMobileOpen(false)}
          className="hover:text-amber-500 transition-colors duration-300"
        >
          {t.nav.login}
        </Link>
      )}
    </>
  );

  return (
    <main
      className={`min-h-screen bg-[#0a0a0a] text-stone-200 ${montserrat.className} selection:bg-amber-600 selection:text-white overflow-x-hidden`}
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-100 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ========== NAV ========== */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: navVisible ? 0 : -100,
          opacity: navVisible ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed w-full z-50 flex items-center px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-5 md:py-6 transition-colors duration-300 ${
          pastHero
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5"
            : "bg-linear-to-b from-[#0a0a0a]/95 to-transparent"
        }`}
      >
        {/* Left: Logo */}
        <div className="w-1/3 flex justify-start">
          <Link href="/" className="group relative flex items-center transition-transform duration-500 group-hover:scale-[1.02]">
            <Logo size="md" />
          </Link>
        </div>

        {/* Center: Nav links */}
        <div className="w-1/3 flex justify-center gap-10 lg:gap-14 text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] uppercase font-medium invisible md:visible">
          {navLinks}
        </div>

        {/* Right: User menu, language selector, reservation button */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          {/* User menu / login */}
          <div className="hidden md:flex items-center gap-3">
            {userMenu}
          </div>

          {/* Language selector */}
          <div className="hidden md:flex items-center">
            <LanguageSelector />
          </div>

          {/* Reservation button */}
          <Link
            href="#reservations"
            className={`group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-medium ${
              activeSection === "reservations" ? "text-amber-400" : "text-amber-500"
            }`}
          >
            <span className="hidden sm:block">{t.nav.reservations}</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 text-sm">
              {/* Cocktail glass — on-theme for the bar's reservations CTA */}
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5h14M5 4.5 12 13m7-8.5L12 13m0 0v5.5M8.5 18.5h7" />
                <circle cx="15.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className={`md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 border rounded-full ml-2 transition-colors duration-300 ${
              mobileOpen ? "border-amber-500 bg-amber-500/10" : "border-stone-700"
            }`}
          >
            <span
              className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
                mobileOpen ? "w-4 rotate-45 translate-y-1 bg-amber-500" : "w-4"
              }`}
            />
            <span
              className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
                mobileOpen ? "w-4 opacity-0" : "w-2.5"
              }`}
            />
            <span
              className={`block h-[1.5px] bg-stone-200 transition-all duration-300 ${
                mobileOpen ? "w-4 -rotate-45 -translate-y-1 bg-amber-500" : "w-4"
              }`}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[78%] max-w-xs bg-[#0a0a0a] border-l border-stone-800 p-8 pt-24 flex flex-col gap-6 text-sm uppercase tracking-[0.2em] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {navLinks}
          <div className="flex flex-col gap-3 pt-4 border-t border-stone-800">
            {session?.user ? (
              <>
                {(session.user as { role?: string }).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-center hover:text-amber-500 transition-colors"
                  >
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-center hover:text-amber-500 transition-colors"
                >
                  {t.nav.account}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="text-center hover:text-amber-500 transition-colors bg-transparent p-0 text-left"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center hover:text-amber-500 transition-colors"
              >
                {t.nav.login}
              </Link>
            )}
          </div>
          <div className="flex justify-center pt-4 border-t border-stone-800">
            <LanguageSelector />
          </div>
          <Link
            href="#reservations"
            onClick={() => setMobileOpen(false)}
            className="mt-4 py-3 text-center bg-amber-500 text-black font-bold tracking-[0.2em] text-xs"
          >
            {t.reservations.reserveBtn}
          </Link>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <section className="relative h-svh min-h-120-h-[900px] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#0a0a0a]">
        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 z-0 h-[120%] top-[-10%]"
        >
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a] z-10" />
          <Image
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
            alt="Bar Texture"
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
        </motion.div>

        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center w-full mt-10 sm:mt-16"
        >
<motion.h1
            variants={fadeInUp}
            className={`karmel-title-fill text-[18vw] sm:text-[15vw] md:text-[13vw] lg:text-[11vw] font-black uppercase tracking-tighter leading-[0.85] mb-3 sm:mb-4 ${playfair.className}`}
          >
            {t.hero.title}
          </motion.h1>

          <motion.h2
            variants={fadeInUp}
            className="text-[11px] sm:text-sm md:text-base lg:text-lg font-medium uppercase tracking-[0.25em] sm:tracking-[0.4em] text-stone-200 max-w-xs sm:max-w-none drop-shadow-lg"
          >
            {t.hero.subtitle}
          </motion.h2>
        </motion.div>
      </section>

      {/* ========== EXPERIENCE ========== */}
      <section
        id="experience"
        className="relative py-16 sm:py-24 md:py-28 lg:py-0 px-4 sm:px-6 md:px-10 lg:px-0 min-h-0 lg:h-screen lg:min-h-160 lg:max-h-225 flex items-center bg-[#0a0a0a] overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-[#0a0a0a]/80 to-[#0a0a0a] z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a] via-transparent to-transparent z-10" />
          <Image
            src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2070&auto=format&fit=crop"
            alt="Coffee Roasting"
            fill
            className="object-cover opacity-40 sm:opacity-50"
            sizes="100vw"
          />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative z-20 max-w-7xl lg:max-w-none mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-0 items-center h-full"
        >
<motion.div
            variants={fadeInUp}
            className="z-20 p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20 bg-[#0a0a0a]/70 backdrop-blur-md border border-white/5 lg:border-0 lg:h-full lg:flex lg:flex-col lg:justify-center"
          >
            <h2 className="text-[9px] sm:text-[10px] tracking-[0.4em] font-bold text-amber-500 uppercase mb-5 sm:mb-8 flex items-center gap-3 sm:gap-4">
              <span className="w-6 sm:w-8 h-px bg-amber-500" /> {t.experience.sectionTitle}
            </h2>
            <h3
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 sm:mb-8 leading-[1.15] text-white ${playfair.className}`}
            >
              {(t.experience.sectionSubtitle || "Rooted in tradition.").split('. ')[0]} <br />
              <span className="italic text-stone-400">{(t.experience.sectionSubtitle || "Rooted in tradition.").split('. ')[1] || "Rooted in tradition."}</span>
            </h3>
            <p className="text-stone-300 font-light leading-relaxed sm:leading-loose text-sm md:text-base max-w-md">
              {t.experience.sectionDescription || "From Somali chai and specialty coffee at breakfast to Bariis and Baasto platters for dinner, Karmel Café & Restaurant is a sensory journey rooted in Somali and East African tradition, served in the heart of Schweinfurt."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-full w-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop"
              alt="Coffee"
              fill
              className="object-cover shadow-2xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </motion.div>
      </section>

      <MenuSection />

      {/* ========== RESERVATIONS ========== */}
      <section
        id="reservations"
        className="relative py-16 sm:py-24 md:py-28 lg:py-0 lg:h-screen lg:min-h-160 lg:max-h-225 px-4 sm:px-6 flex items-center justify-center"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1574096079513-d8259312b78a?q=80&w=2070&auto=format&fit=crop"
            alt="Cocktails at the bar"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/65 to-[#0a0a0a]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative z-10 w-full max-w-3xl bg-[#0a0a0a]/75 backdrop-blur-2xl p-5 sm:p-8 md:p-12 lg:p-16 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.7)]"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 text-white ${playfair.className}`}
            >
              {t.reservations.sectionTitle}
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm tracking-widest font-light">
              {t.reservations.sectionSubtitle}
            </p>
          </div>
          <ReservationForm />
        </motion.div>
      </section>

      {/* ========== LOCATION ========== */}
      <section
        id="location"
        className="relative bg-[#0a0a0a] py-14 sm:py-20 md:py-24 lg:py-0 lg:h-screen lg:min-h-140 lg:max-h-2004 sm:px-6 md:px-10 lg:px-16 border-t border-stone-900 flex items-center"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
          <div>
            <h2 className="text-[9px] sm:text-[10px] tracking-[0.4em] font-bold text-amber-500 uppercase mb-3 sm:mb-4">
              {t.location.sectionTitle}
            </h2>
            <h3
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5 sm:mb-8 text-white ${playfair.className}`}
            >
              {t.location.sectionSubtitle}
            </h3>
            <a
              href={restaurantInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-stone-300 hover:text-amber-500 transition-colors mb-2 underline underline-offset-4 text-sm sm:text-base"
            >
              {restaurantInfo.address}
            </a>
            <a
              href={restaurantInfo.phoneHref}
              className="block text-stone-300 hover:text-amber-500 transition-colors mb-6 sm:mb-8 underline underline-offset-4 text-sm sm:text-base"
            >
              {restaurantInfo.phone}
            </a>
            <div className="text-stone-400 text-xs sm:text-sm space-y-1.5">
              {restaurantInfo.hours.map((h) => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const dayIndex = dayNames.indexOf(h.day.slice(0, 3));
                const dateStr = `2024-01-${dayIndex + 1}`;
                const dayNum = new Date(dateStr).getDay();
                const dayName = t.common.dayNamesShort?.[dayNum] || dayNames[dayNum];
                return (
                  <div key={h.day} className="flex justify-between max-w-xs gap-4">
                    <span>{dayName}</span>
                    <span className="text-stone-300 whitespace-nowrap">{h.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <MapEmbed />
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative py-16 sm:py-24 md:py-28 text-center flex flex-col items-center border-t border-stone-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=2070&auto=format&fit=crop"
            alt="Bar Bottles"
            fill
            className="object-cover opacity-30 sm:opacity-40 grayscale"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
            <Logo size="sm" />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-stone-300 items-center">
              <a
                href={restaurantInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-500 transition-colors text-center"
              >
                {t.footer.address}
              </a>
              <p className="hidden sm:block text-amber-500">|</p>
              <a
                href={restaurantInfo.phoneHref}
                className="hover:text-amber-500 transition-colors"
              >
                {t.footer.phone}
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-4 sm:gap-6 mt-10 sm:mt-16 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-stone-500">
            <Link href="/impressum" className="hover:text-amber-500 transition-colors">{t.footer.impressum}</Link>
            <span className="text-stone-700">|</span>
            <Link href="/datenschutz" className="hover:text-amber-500 transition-colors">{t.footer.privacy}</Link>
            <span className="text-stone-700">|</span>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("karmel-cookie-consent");
                  window.location.reload();
                }
              }}
              className="hover:text-amber-500 transition-colors bg-transparent p-0"
            >
              {t.footer.cookieSettings}
            </button>
          </div>
          <p className="text-stone-500 text-[8px] sm:text-[9px] uppercase tracking-[0.25em] mt-4">
            &copy; {new Date().getFullYear()} Karmel Café & Restaurant. {t.footer.rights}
          </p>
        </div>
      </footer>
    </main>
  );
}