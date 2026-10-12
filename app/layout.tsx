import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karmel Café & Restaurant",
  description:
    "Karmel Café & Restaurant — Schweinfurt. Somali & African cuisine, coffee, and reservations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* CCM19 cookie consent (e-recht24). Loads before any app code so it can block embeds. */}
        <Script
          src="https://cloud.ccm19.de/app.js?apiKey=f050a6e9893ec6c97db1c20deb45ff9ef2e0db92d3fa8bc2&domain=6acd37655ed51430dc0aad45"
          referrerPolicy="origin"
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}