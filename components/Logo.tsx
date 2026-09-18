import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800"] });

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const textSize = { sm: "text-lg", md: "text-2xl md:text-3xl", lg: "text-4xl md:text-5xl" }[size];

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={dims} height={dims} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="karmelGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="8" stroke="url(#karmelGrad)" strokeWidth="1.5" opacity="0.4" />
        <path d="M13 9V31" stroke="url(#karmelGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 20L26 9" stroke="url(#karmelGrad)" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 20L26 31" stroke="url(#karmelGrad)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span
        className={`${textSize} tracking-[0.2em] uppercase font-black ${playfair.className} bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent`}
      >
        Karmel
      </span>
    </span>
  );
}