import Link from "next/link";

// Renders a static e-recht24 HTML export (lib/legalTexts.ts) in the site's
// dark legal-page style. The HTML is our own constant, never user input.
export default function LegalText({ html, backLabel }: { html: string; backLabel: string }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-stone-300 px-6 py-24 md:py-32">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-amber-500 text-xs uppercase tracking-widest">
          ← {backLabel}
        </Link>
        <div
          className="mt-6 text-sm leading-relaxed break-words
            [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:text-white [&_h1]:mb-10
            [&_h2]:text-amber-500 [&_h2]:text-sm [&_h2]:uppercase [&_h2]:tracking-widest [&_h2]:mt-10 [&_h2]:mb-3
            [&_h3]:text-white [&_h3]:text-base [&_h3]:mt-6 [&_h3]:mb-2
            [&_h4]:text-stone-200 [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1
            [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1
            [&_a]:text-amber-500 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
