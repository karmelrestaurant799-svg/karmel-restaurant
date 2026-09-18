// Run once: node scripts/seed-menu.mjs
// Moves the menu from lib/menuData.ts into the database so the admin panel can edit it.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const mainCategories = [
  {
    slug: "breakfast",
    title: "Breakfast",
    subtitle: "Quraac / Frühstück",
    order: 0,
    subCategories: [
      {
        slug: "shakshuka",
        title: "Shakshuka",
        subtitle: "Shakshuka",
        items: [
          { name: "Shakshuka", price: "12 €" },
        ],
      },
      {
        slug: "basaliya-thunfisch",
        title: "Basaliya iyo Thunfisch",
        subtitle: "Bazella mit Thunfisch",
        items: [
          { name: "Basaliya iyo Thunfisch", desc: "Bazella mit Thunfisch", price: "11 €" },
        ],
      },
      {
        slug: "fuul-thunfisch",
        title: "Fuul iyo Thunfisch",
        subtitle: "Bohnen mit Thunfisch",
        items: [
          { name: "Fuul iyo Thunfisch", desc: "Bohnen mit Thunfisch", price: "11 €", star: true },
        ],
      },
      {
        slug: "canjeelo",
        title: "Canjeelo / Laxoox Somali",
        subtitle: "Somalische Pfannkuchen",
        items: [
          { name: "Canjeelo 2x", price: "1,0 €" },
          { name: "Canjeelo iyo Suqaar", desc: "mit gekochtem Fleisch und würziger Suppe", price: "13 €" },
          { name: "Canjeelo iyo Beer", desc: "serviert mit gebratener Leber", price: "13 €", star: true },
          { name: "Canjeelo iyo Kalliyo", desc: "serviert mit gebratenen Nieren", price: "13 €" },
          { name: "Canjeelo iyo Kalaankal", desc: "mit trocknem gebratenem Fleisch", price: "14 €" },
        ],
      },
      {
        slug: "malawax",
        title: "Malawax",
        subtitle: "Süßlich-weiche Pfannkuchen",
        items: [
          { name: "Malawax", desc: "Nur Pfannkuchen", price: "1,0 €" },
          { name: "Malawax iyo Caano-Macaan", desc: "mit gesüßter Kondensmilch", price: "1,5 €", star: true },
          { name: "Malawax iyo Suqaar", price: "13 €" },
          { name: "Malawax iyo Kalaankal", price: "14 €" },
        ],
      },
    ],
  },
  {
    slug: "lunch",
    title: "Lunch",
    subtitle: "Qado / Mittagessen",
    order: 1,
    subCategories: [
      {
        slug: "bariis",
        title: "Bariis / Reis",
        subtitle: "Bariis / Reis",
        items: [
          { name: "Bariis iyo Checking", desc: "Reis mit Hähnchen", price: "13 €" },
          { name: "Bariis iyo Suqaar", desc: "Reis mit gekochtem Fleisch und würziger Suppe", price: "13 €" },
          { name: "Bariis iyo Malaay", desc: "Reis mit Fisch", price: "17 €" },
          { name: "Bariis iyo Kalaankal", desc: "Reis mit trocknem gebratenem Fleisch", price: "14 €" },
          { name: "Bariis iyo Hilib Ari", desc: "Reis mit Ziegenfleisch", price: "16 €", star: true },
          { name: "Bariis, Baasto iyo Hilib Ari", desc: "Reis, Spaghetti mit Ziegenfleisch", price: "17 €" },
          { name: "Bariis labo qof", desc: "Gruppenplatte für 2 Personen, wahlweise mit Pasta", price: "30 €" },
          { name: "Bariis 3 qof", desc: "Gruppenplatte für 3 Personen, wahlweise mit Pasta", price: "45 €" },
          { name: "Bariis 4 qof", desc: "Gruppenplatte für 4 Personen, wahlweise mit Pasta", price: "60 €" },
          { name: "Bariis 5/6 qof", desc: "Gruppenplatte für 5/6 Personen, wahlweise mit Pasta", price: "75 €" },
        ],
      },
      {
        slug: "muufo",
        title: "Muufo Somali",
        subtitle: "Somalisches Fladenbrot",
        items: [
          { name: "Muufo", desc: "Nur Fladenbrot", price: "2,0 €" },
          { name: "Muufo iyo Maraq", desc: "mit aromatischer Suppe", price: "8,0 €" },
          { name: "Muufo iyo Suqaar", desc: "mit gekochtem Fleisch und würziger Suppe", price: "13 €" },
          { name: "Muufo iyo Kalaankal", desc: "mit trocknem gebratenem Fleisch", price: "14 €", star: true },
        ],
      },
      {
        slug: "soor",
        title: "Soor / Maisbrei",
        subtitle: "Maisbrei",
        items: [
          { name: "Soor iyo Caano", desc: "Maisbrei mit warmer Milch", price: "10 €" },
          { name: "Soor iyo Koosto", desc: "Maisbrei mit Spinat", price: "12 €", star: true },
          { name: "Soor iyo Suqaar", desc: "mit gekochtem Fleisch und würziger Suppe", price: "13 €" },
        ],
      },
      {
        slug: "snacks",
        title: "Cunto Fudud / Snacks",
        subtitle: "Snacks",
        items: [
          { name: "Sambusa", desc: "Teigtasche", price: "2,0 €", star: true },
          { name: "Bur / Quraac", desc: "Süßes Brot, leicht frittiert", price: "1,00 €" },
          { name: "Mash Mash", desc: "Süßer Teig, leicht frittiert", price: "1,00 €" },
          { name: "Bajiyo", desc: "Frittierte Bohnenbällchen", price: "1,00 €" },
          { name: "Doolshe", desc: "Cake", price: "3,00 €" },
          { name: "Baan Keek", desc: "Pancakes", price: "3,50 €" },
          { name: "Checken Crispy", price: "6,70 €" },
          { name: "Checken Wings", price: "3,99 €" },
          { name: "Pommes", price: "3,70 €" },
        ],
      },
      {
        slug: "baasto",
        title: "Baasto / Spaghetti",
        subtitle: "Spaghetti",
        items: [
          { name: "Baasto iyo Suugo", desc: "mit Rindfleisch, klassischer Tomatensauce", price: "10 €" },
          { name: "Baasto iyo Suqaar", desc: "mit gekochtem Fleisch und würziger Suppe", price: "13 €", star: true },
          { name: "Baasto iyo Kalaankal", desc: "mit trocknem gebratenem Fleisch", price: "14 €" },
          { name: "Baasto iyo Hilib Ari", desc: "mit Ziegenfleisch und Sauce", price: "16 €" },
        ],
      },
    ],
  },
  {
    slug: "dinner",
    title: "Dinner",
    subtitle: "Casho / Abendessen",
    order: 2,
    subCategories: [
      {
        slug: "sabaayad",
        title: "Sabaayad / Chapati",
        subtitle: "Schichtiges somalisches Fladenbrot",
        items: [
          { name: "Sabaayad", desc: "Nur schichtiges Fladenbrot", price: "2,0 €" },
          { name: "Sabaayad iyo Suqaar", desc: "mit gekochtem Fleisch und würziger Suppe", price: "13 €", star: true },
          { name: "Sabaayad iyo Kalaankal", desc: "mit trocknem gebratenem Fleisch", price: "14 €" },
          { name: "Sabaayad iyo Beer", desc: "serviert mit gebratener Leber", price: "14 €" },
          { name: "Sabaayad iyo Kalliyo", desc: "serviert mit gebratenen Nieren", price: "14 €" },
        ],
      },
    ],
  },
  {
    slug: "drinks",
    title: "Drinks",
    subtitle: "Getränke",
    order: 3,
    subCategories: [
      {
        slug: "warme-getranke",
        title: "Shaah iyo Kofee",
        subtitle: "Warme Getränke",
        items: [
          { name: "Shaah Somali", desc: "Somali Chai", price: "2,00 €", star: true },
          { name: "Schwarzer Kaffee", price: "2,85 €" },
          { name: "Cappuccino", price: "3,50 €" },
          { name: "Café Latte", price: "3,50 €" },
          { name: "Latte Macchiato", price: "3,50 €" },
          { name: "Espresso", price: "3,00 €" },
          { name: "Doppelter Espresso", price: "5,00 €" },
          { name: "Tiger Spice", price: "4,00 €" },
          { name: "Power Matcha", price: "4,00 €" },
        ],
      },
      {
        slug: "kalte-getranke",
        title: "Cabitaan Qabow / Mushakal",
        subtitle: "Kaltgetränke & Mix-Smoothies (Klein 4,25 € | Groß 4,99 €)",
        items: [
          { name: "Mango", price: "4,25 € / 4,99 €" },
          { name: "Mango-Milch", price: "4,25 € / 4,99 €", star: true },
          { name: "Avocado", price: "4,25 € / 4,99 €" },
          { name: "Avocado-Milch", price: "4,25 € / 4,99 €" },
          { name: "Avocado-Milch-Banaana", price: "4,25 € / 4,99 €" },
          { name: "Strawberry", price: "4,25 € / 4,99 €" },
          { name: "Strawberry Mix", price: "4,25 € / 4,99 €" },
          { name: "Banana", price: "4,25 € / 4,99 €" },
          { name: "Banana-Max", price: "4,25 € / 4,99 €" },
        ],
      },
      {
        slug: "soft-drinks",
        title: "Soft Drinks",
        subtitle: "Soft Drinks (Klein 2 € | Groß 2,99 €)",
        items: [
          { name: "Cola", price: "2,00 € / 2,99 €" },
          { name: "Fanta", price: "2,00 € / 2,99 €" },
          { name: "Sprite", price: "2,00 € / 2,99 €" },
          { name: "Orange und Ayran", price: "2,00 € / 2,99 €" },
          { name: "Kleines Wasser", desc: "Stilles oder sprudelndes Mineralwasser", price: "2,00 € / 2,99 €" },
        ],
      },
    ],
  },
];

async function main() {
  // Clear existing data
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();

  for (let i = 0; i < mainCategories.length; i++) {
    const mainCat = mainCategories[i];
    
    // Create main category
    const category = await prisma.menuCategory.create({
      data: {
        slug: mainCat.slug,
        title: mainCat.title,
        subtitle: mainCat.subtitle,
        order: mainCat.order,
        isMainCategory: true,
        children: {
          create: mainCat.subCategories.map((sub, j) => ({
            slug: sub.slug,
            title: sub.title,
            subtitle: sub.subtitle,
            order: j,
            isMainCategory: false,
            items: {
              create: sub.items.map((item, k) => ({
                name: item.name,
                desc: item.desc ?? null,
                price: item.price,
                star: !!item.star,
                order: k,
              })),
            },
          })),
        },
      },
    });
    
    console.log(`Created main category: ${mainCat.title} with ${mainCat.subCategories.length} subcategories`);
  }

  console.log("Menu seed complete.");
  await prisma.$disconnect();
}

main().catch(console.error);