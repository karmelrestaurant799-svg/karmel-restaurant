"use client";
import Link from "next/link";
import { restaurantInfo } from "@/lib/menuData";
import { useLanguage } from "@/lib/languageContext";

const hostingProvider = process.env.HOSTING_PROVIDER || "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA";
const logRetentionDays = process.env.LOG_RETENTION_DAYS || "30";
const unverifiedAccountRetentionDays = process.env.UNVERIFIED_ACCOUNT_RETENTION_DAYS || "7";
const reservationRetentionMonths = process.env.RESERVATION_RETENTION_MONTHS || "24";
const databaseProvider = process.env.DATABASE_PROVIDER || "Neon/PostgreSQL";
const contactEmail = process.env.CONTACT_EMAIL || "kontakt@karmel-restaurant.de";
const lastUpdated = new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });

export default function DatenschutzContent() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-300 px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-amber-500 text-xs uppercase tracking-widest">
          ← {t.common.back}
        </Link>
        <h1 className="text-3xl md:text-4xl text-white mt-6 mb-4">
          {t.datenschutz.title}
        </h1>
        <p className="text-xs text-stone-500 mb-10">{t.datenschutz.lastUpdated.replace("{date}", lastUpdated)}</p>

        <Section title={t.datenschutz.section1Title}>
          <p>{restaurantInfo.name}</p>
          <p>{t.datenschutz.operatorName}</p>
          <p>{restaurantInfo.address}</p>
          <p>Telefon: {restaurantInfo.phone}</p>
          <p>E-Mail: {contactEmail}</p>
        </Section>

        <Section title={t.datenschutz.section2Title}>
          <p>{t.datenschutz.section2Content}</p>
        </Section>

        <Section title={t.datenschutz.section3Title}>
          <p>{t.datenschutz.section3Content.replace("{hostingProvider}", hostingProvider).replace("{logRetentionDays}", logRetentionDays)}</p>
        </Section>

        <Section title={t.datenschutz.section4Title}>
          <p>{t.datenschutz.section4Content.replace("{unverifiedAccountRetentionDays}", unverifiedAccountRetentionDays)}</p>
        </Section>

        <Section title={t.datenschutz.section5Title}>
          <p>{t.datenschutz.section5Content.replace("{reservationRetentionMonths}", reservationRetentionMonths)}</p>
        </Section>

        <Section title={t.datenschutz.section6Title}>
          <p>{t.datenschutz.section6Content}</p>
        </Section>

        <Section title={t.datenschutz.section7Title}>
          <p>{t.datenschutz.section7Content}</p>
        </Section>

        <Section title={t.datenschutz.section8Title}>
          <p>{t.datenschutz.section8Content}</p>
        </Section>

        <Section title={t.datenschutz.section9Title}>
          <p>{t.datenschutz.section9Content}</p>
        </Section>

        <Section title={t.datenschutz.section10Title}>
          <div dangerouslySetInnerHTML={{ __html: t.datenschutz.section10Content.replace("{databaseProvider}", databaseProvider) }} />
        </Section>

        <Section title={t.datenschutz.section11Title}>
          <p>{t.datenschutz.section11Content}</p>
        </Section>

        <Section title={t.datenschutz.section12Title}>
          <p>{t.datenschutz.section12Content}</p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-amber-500 text-sm uppercase tracking-widest mb-2">{title}</h2>
      <div className="text-sm leading-relaxed space-y-1">{children}</div>
    </section>
  );
}