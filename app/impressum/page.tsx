import Link from "next/link";
import { restaurantInfo } from "@/lib/menuData";

export const metadata = { title: "Impressum — Karmel Café & Restaurant" };

const operatorName = process.env.OPERATOR_NAME || "[Vollständiger Name des Betreibers/Inhabers bzw. Rechtsform, z. B. „Max Mustermann“ oder „Karmel GmbH“]";
const contactEmail = process.env.CONTACT_EMAIL || "kontakt@karmel-restaurant.de";
const vatId = process.env.VAT_ID || "";
const commercialRegister = process.env.COMMERCIAL_REGISTER || "";
const contentResponsible = process.env.CONTENT_RESPONSIBLE || "[Name und Anschrift der verantwortlichen Person]";
const participatesInDisputeResolution = process.env.PARTICIPATES_IN_DISPUTE_RESOLUTION === "true";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-300 px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-amber-500 text-xs uppercase tracking-widest">
          ← Zurück
        </Link>
        <h1 className="text-3xl md:text-4xl text-white mt-6 mb-10">Impressum</h1>

        <Section title="Angaben gemäß § 5 DDG">
          <p>{restaurantInfo.name}</p>
          <p>{operatorName}</p>
          <p>{restaurantInfo.address}</p>
        </Section>

        <Section title="Kontakt">
          <p>Telefon: {restaurantInfo.phone}</p>
          <p>E-Mail: {contactEmail}</p>
        </Section>

        {vatId && (
          <Section title="Umsatzsteuer-ID">
            <p>Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: {vatId}</p>
          </Section>
        )}

        {commercialRegister && (
          <Section title="Handelsregister">
            <p>{commercialRegister}</p>
          </Section>
        )}

        <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
          <p>{contentResponsible}</p>
        </Section>

        <Section title="EU-Streitschlichtung">
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse finden Sie oben. {participatesInDisputeResolution
              ? "Wir sind bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."}
          </p>
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
