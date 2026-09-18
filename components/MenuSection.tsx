"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Playfair_Display } from "next/font/google";
import { useLanguage } from "@/lib/languageContext";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });

type MenuItem = { id: string; name: string; desc: string | null; price: string; star: boolean; available: boolean };
type SubCategory = { id: string; slug: string; title: string; subtitle: string; order: number; items: MenuItem[] };
type MainCategory = { id: string; slug: string; title: string; subtitle: string; order: number; children: SubCategory[] };

// Map database item names to translation keys
const itemTranslationMap: Record<string, { nameKey: string; descKey?: string }> = {
  "Shaah Somali": { nameKey: "shaahSomali", descKey: "shaahSomaliDesc" },
  "Schwarzer Kaffee": { nameKey: "schwarzerKaffee" },
  "Cappuccino": { nameKey: "cappuccino" },
  "Café Latte": { nameKey: "cafeLatte" },
  "Latte Macchiato": { nameKey: "latteMacchiato" },
  "Espresso": { nameKey: "espresso" },
  "Doppelter Espresso": { nameKey: "doppelterEspresso" },
  "Tiger Spice": { nameKey: "tigerSpice" },
  "Power Matcha": { nameKey: "powerMatcha" },
  "Mango": { nameKey: "mango" },
  "Mango-Milch": { nameKey: "mangoMilch" },
  "Avocado": { nameKey: "avocado" },
  "Avocado-Milch": { nameKey: "avocadoMilch" },
  "Avocado-Milch-Banaana": { nameKey: "avocadoMilchBanaana" },
  "Strawberry": { nameKey: "strawberry" },
  "Strawberry Mix": { nameKey: "strawberryMix" },
  "Banana": { nameKey: "banana" },
  "Banana-Max": { nameKey: "bananaMax" },
  "Cola": { nameKey: "colaFantaSprite" },
  "Fanta": { nameKey: "colaFantaSprite" },
  "Sprite": { nameKey: "colaFantaSprite" },
  "Orange und Ayran": { nameKey: "orangeAyran" },
  "Kleines Wasser": { nameKey: "kleinesWasser", descKey: "kleinesWasserDesc" },
  "Shakshuka": { nameKey: "shakshuka" },
  "Basaliya iyo Thunfisch": { nameKey: "basaliyaThunfisch", descKey: "basaliyaThunfischDesc" },
  "Fuul iyo Thunfisch": { nameKey: "fuulThunfisch", descKey: "fuulThunfischDesc" },
  "Canjeelo 2x": { nameKey: "canjeelo2x" },
  "Canjeelo iyo Suqaar": { nameKey: "canjeeloSuqaar", descKey: "canjeeloSuqaarDesc" },
  "Canjeelo iyo Beer": { nameKey: "canjeeloBeer", descKey: "canjeeloBeerDesc" },
  "Canjeelo iyo Kalliyo": { nameKey: "canjeeloKalliyo", descKey: "canjeeloKalliyoDesc" },
  "Canjeelo iyo Kalaankal": { nameKey: "canjeeloKalaankal", descKey: "canjeeloKalaankalDesc" },
  "Malawax": { nameKey: "malawax", descKey: "malawaxDesc" },
  "Malawax iyo Caano-Macaan": { nameKey: "malawaxCaanoMacaan", descKey: "malawaxCaanoMacaanDesc" },
  "Malawax iyo Suqaar": { nameKey: "malawaxSuqaar" },
  "Malawax iyo Kalaankal": { nameKey: "malawaxKalaankal" },
  "Muufo": { nameKey: "muufo", descKey: "muufoDesc" },
  "Muufo iyo Maraq": { nameKey: "muufoMaraq", descKey: "muufoMaraqDesc" },
  "Muufo iyo Suqaar": { nameKey: "muufoSuqaar", descKey: "muufoSuqaarDesc" },
  "Muufo iyo Kalaankal": { nameKey: "muufoKalaankal", descKey: "muufoKalaankalDesc" },
  "Sabaayad": { nameKey: "sabaayad", descKey: "sabaayadDesc" },
  "Sabaayad iyo Suqaar": { nameKey: "sabaayadSuqaar", descKey: "sabaayadSuqaarDesc" },
  "Sabaayad iyo Kalaankal": { nameKey: "sabaayadKalaankal", descKey: "sabaayadKalaankalDesc" },
  "Sabaayad iyo Beer": { nameKey: "sabaayadBeer", descKey: "sabaayadBeerDesc" },
  "Sabaayad iyo Kalliyo": { nameKey: "sabaayadKalliyo", descKey: "sabaayadKalliyoDesc" },
  "Soor iyo Caano": { nameKey: "soorCaano", descKey: "soorCaanoDesc" },
  "Soor iyo Koosto": { nameKey: "soorKoosto", descKey: "soorKoostoDesc" },
  "Soor iyo Suqaar": { nameKey: "soorSuqaar", descKey: "soorSuqaarDesc" },
  "Sambusa": { nameKey: "sambusa", descKey: "sambusaDesc" },
  "Bur / Quraac": { nameKey: "burQuraac", descKey: "burQuraacDesc" },
  "Mash Mash": { nameKey: "mashMash", descKey: "mashMashDesc" },
  "Bajiyo": { nameKey: "bajiyo", descKey: "bajiyoDesc" },
  "Doolshe": { nameKey: "doolshe", descKey: "doolsheDesc" },
  "Baan Keek": { nameKey: "baanKeek", descKey: "baanKeekDesc" },
  "Checken Crispy": { nameKey: "checkenCrispy" },
  "Checken Wings": { nameKey: "checkenWings" },
  "Pommes": { nameKey: "pommes" },
  "Baasto iyo Suugo": { nameKey: "baastoSuugo", descKey: "baastoSuugoDesc" },
  "Baasto iyo Suqaar": { nameKey: "baastoSuqaar", descKey: "baastoSuqaarDesc" },
  "Baasto iyo Kalaankal": { nameKey: "baastoKalaankal", descKey: "baastoKalaankalDesc" },
  "Baasto iyo Hilib Ari": { nameKey: "baastoHilibAri", descKey: "baastoHilibAriDesc" },
  "Bariis iyo Checking": { nameKey: "bariisChecking", descKey: "bariisCheckingDesc" },
  "Bariis iyo Suqaar": { nameKey: "bariisSuqaar", descKey: "bariisSuqaarDesc" },
  "Bariis iyo Malaay": { nameKey: "bariisMalaay", descKey: "bariisMalaayDesc" },
  "Bariis iyo Kalaankal": { nameKey: "bariisKalaankal", descKey: "bariisKalaankalDesc" },
  "Bariis iyo Hilib Ari": { nameKey: "bariisHilibAri", descKey: "bariisHilibAriDesc" },
  "Bariis, Baasto iyo Hilib Ari": { nameKey: "bariisBaastoHilibAri", descKey: "bariisBaastoHilibAriDesc" },
  "Bariis labo qof": { nameKey: "bariisLaboQof", descKey: "bariisLaboQofDesc" },
  "Bariis 3 qof": { nameKey: "bariis3Qof", descKey: "bariis3QofDesc" },
  "Bariis 4 qof": { nameKey: "bariis4Qof", descKey: "bariis4QofDesc" },
  "Bariis 5/6 qof": { nameKey: "bariis56Qof", descKey: "bariis56QofDesc" },
};

export default function MenuSection() {
  const { t } = useLanguage();
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [activeMainSlug, setActiveMainSlug] = useState<string>("");
  const [activeSubSlug, setActiveSubSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        setMainCategories(data.mainCategories || []);
        if (data.mainCategories?.length) {
          const firstMain = data.mainCategories[0];
          setActiveMainSlug(firstMain.slug);
          if (firstMain.children?.length) {
            setActiveSubSlug(firstMain.children[0].slug);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeMain = mainCategories.find((c) => c.slug === activeMainSlug);
  const activeSub = activeMain?.children?.find((c) => c.slug === activeSubSlug);

  // Get translated main category title
  const translatedMainTitle = activeMain ? (t.menu[activeMain.slug as keyof typeof t.menu] as string || activeMain.title) : "";
  const translatedMainSubtitle = activeMain ? (t.menu[`${activeMain.slug}Subtitle` as keyof typeof t.menu] as string || activeMain.subtitle) : "";

  const translatedSubSubtitle = activeSub ? activeSub.subtitle : "";

  // Translate items for active subcategory
  const translatedItems = activeSub
    ? activeSub.items
        .filter((item) => item.available)
        .map((item) => {
          const translation = itemTranslationMap[item.name];
          if (translation) {
            return {
              ...item,
              name: t.menu[translation.nameKey as keyof typeof t.menu] as string,
              desc: translation.descKey ? t.menu[translation.descKey as keyof typeof t.menu] as string : item.desc,
            };
          }
          return item;
        })
    : [];

  const mid = Math.ceil(translatedItems.length / 2);
  const colA = translatedItems.slice(0, mid);
  const colB = translatedItems.slice(mid);

  if (loading) {
    return (
      <section id="menu" className="relative bg-[#0a0a0a] py-32 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-stone-500 text-sm tracking-widest uppercase">Loading menu…</div>
      </section>
    );
  }

  if (!activeMain) return null;

  return (
    <section id="menu" className="relative bg-[#0a0a0a] py-32 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Main category title */}
        <div className="mb-10 border-b border-stone-800 pb-8">
          <h2 className="text-[10px] tracking-[0.4em] font-bold text-amber-500 uppercase mb-3">{translatedMainTitle}</h2>
          <h3 className={`text-5xl md:text-7xl text-white ${playfair.className}`}>{translatedMainSubtitle}</h3>
        </div>

        {/* Main category tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 sm:justify-center">
          {mainCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveMainSlug(cat.slug);
                if (cat.children?.length) setActiveSubSlug(cat.children[0].slug);
              }}
              className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-semibold border transition-all duration-300 whitespace-nowrap ${
                activeMainSlug === cat.slug
                  ? "bg-amber-500 text-black border-amber-500"
                  : "border-stone-700 text-stone-300 hover:border-amber-500 hover:text-amber-500"
              }`}
            >
              {t.menu[cat.slug as keyof typeof t.menu] as string || cat.title}
            </button>
          ))}
        </div>

        {/* Subcategory tabs */}
        {activeMain && activeMain.children.length > 0 && (
          <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 sm:justify-center">
            {activeMain.children.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubSlug(sub.slug)}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-medium border transition-all duration-300 whitespace-nowrap ${
                  activeSubSlug === sub.slug
                    ? "bg-white/10 text-white border-amber-500"
                    : "border-stone-700 text-stone-400 hover:border-amber-500 hover:text-white"
                }`}
              >
                {t.menu[`subcat${sub.slug.charAt(0).toUpperCase() + sub.slug.slice(1)}` as keyof typeof t.menu] as string || sub.title}
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubSlug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-stone-500 text-sm tracking-widest uppercase mb-10">{translatedSubSubtitle || (activeSub ? t.menu[`subcat${activeSub.slug.charAt(0).toUpperCase() + activeSub.slug.slice(1)}` as keyof typeof t.menu] as string : "")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
              {[colA, colB].map((col, i) => (
                <div key={i} className="flex flex-col gap-8">
                  {col.map((item) => (
                    <div key={item.id} className="group">
                      <div className="flex justify-between items-baseline gap-4 border-b border-stone-800 pb-2 group-hover:border-amber-500 transition-colors">
                        <h5 className={`text-xl md:text-2xl text-white group-hover:text-amber-500 transition-colors ${playfair.className}`}>
                          {item.name} {item.star && <span className="text-amber-500 text-sm align-super">★</span>}
                        </h5>
                        <span className="text-amber-500 font-medium text-lg whitespace-nowrap">{item.price}</span>
                      </div>
                      {item.desc && <p className="text-stone-400 text-sm font-light mt-1.5 leading-relaxed">{item.desc}</p>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}