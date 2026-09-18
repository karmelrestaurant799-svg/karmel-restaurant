"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "de" | "en" | "es" | "fr" | "it" | "nl" | "tr" | "pl" | "ru" | "ar" | "zh" | "ja";

type TranslationKeys = {
  common: {
    loading: string;
    searchLang: string;
    noResults: string;
    back: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    submit: string;
    required: string;
    optional: string;
    download: string;
    signInRequired: string;
    dayNames: string[];
    dayNamesShort: string[];
  };
  nav: {
    home: string;
    experience: string;
    menu: string;
    reservations: string;
    location: string;
    login: string;
    register: string;
    account: string;
    admin: string;
    logout: string;
    impressum: string;
    privacy: string;
    cookieSettings: string;
    language: string;
  };
  hero: {
    title: string;
    subtitle: string;
    visitUs: string;
    reserveTable: string;
  };
  experience: {
    title: string;
    subtitle: string;
    description: string;
    sectionTitle: string;
    sectionSubtitle: string;
    sectionDescription: string;
  };
  menu: {
    title: string;
    subtitle: string;
    categories: Record<string, string>;
    price: string;
    popular: string;
    // Main categories
    breakfast: string;
    breakfastSubtitle: string;
    lunch: string;
    lunchSubtitle: string;
    dinner: string;
    dinnerSubtitle: string;
    drinks: string;
    drinksSubtitle: string;
    // Subcategories
    subcatShakshuka: string;
    subcatBasaliyaThunfisch: string;
    subcatFuulThunfisch: string;
    subcatCanjeelo: string;
    subcatMalawax: string;
    subcatBariis: string;
    subcatMuufo: string;
    subcatSoor: string;
    subcatSnacks: string;
    subcatBaasto: string;
    subcatSabaayad: string;
    subcatWarmeGetranke: string;
    subcatKalteGetranke: string;
    subcatSoftDrinks: string;
    // Category titles and subtitles
    warmeGetrankeTitle: string;
    warmeGetrankeSubtitle: string;
    kalteGetrankeTitle: string;
    kalteGetrankeSubtitle: string;
    fruhstuckTitle: string;
    fruhstuckSubtitle: string;
    pfannkuchenTitle: string;
    pfannkuchenSubtitle: string;
    fladenbrotTitle: string;
    fladenbrotSubtitle: string;
    maisbreiTitle: string;
    maisbreiSubtitle: string;
    snacksTitle: string;
    snacksSubtitle: string;
    spaghettiTitle: string;
    spaghettiSubtitle: string;
    mittagessenTitle: string;
    mittagessenSubtitle: string;
    // Item names and descriptions
    shaahSomali: string;
    shaahSomaliDesc: string;
    schwarzerKaffee: string;
    cappuccino: string;
    cafeLatte: string;
    latteMacchiato: string;
    espresso: string;
    doppelterEspresso: string;
    tigerSpice: string;
    powerMatcha: string;
    mango: string;
    mangoMilch: string;
    avocado: string;
    avocadoMilch: string;
    avocadoMilchBanaana: string;
    strawberry: string;
    strawberryMix: string;
    banana: string;
    bananaMax: string;
    colaFantaSprite: string;
    orangeAyran: string;
    kleinesWasser: string;
    kleinesWasserDesc: string;
    shakshuka: string;
    basaliyaThunfisch: string;
    basaliyaThunfischDesc: string;
    fuulThunfisch: string;
    fuulThunfischDesc: string;
    canjeelo2x: string;
    canjeeloSuqaar: string;
    canjeeloSuqaarDesc: string;
    canjeeloBeer: string;
    canjeeloBeerDesc: string;
    canjeeloKalliyo: string;
    canjeeloKalliyoDesc: string;
    canjeeloKalaankal: string;
    canjeeloKalaankalDesc: string;
    malawax: string;
    malawaxDesc: string;
    malawaxCaanoMacaan: string;
    malawaxCaanoMacaanDesc: string;
    malawaxSuqaar: string;
    malawaxKalaankal: string;
    muufo: string;
    muufoDesc: string;
    muufoMaraq: string;
    muufoMaraqDesc: string;
    muufoSuqaar: string;
    muufoSuqaarDesc: string;
    muufoKalaankal: string;
    muufoKalaankalDesc: string;
    sabaayad: string;
    sabaayadDesc: string;
    sabaayadSuqaar: string;
    sabaayadSuqaarDesc: string;
    sabaayadKalaankal: string;
    sabaayadKalaankalDesc: string;
    sabaayadBeer: string;
    sabaayadBeerDesc: string;
    sabaayadKalliyo: string;
    sabaayadKalliyoDesc: string;
    soorCaano: string;
    soorCaanoDesc: string;
    soorKoosto: string;
    soorKoostoDesc: string;
    soorSuqaar: string;
    soorSuqaarDesc: string;
    sambusa: string;
    sambusaDesc: string;
    burQuraac: string;
    burQuraacDesc: string;
    mashMash: string;
    mashMashDesc: string;
    bajiyo: string;
    bajiyoDesc: string;
    doolshe: string;
    doolsheDesc: string;
    baanKeek: string;
    baanKeekDesc: string;
    checkenCrispy: string;
    checkenWings: string;
    pommes: string;
    baastoSuugo: string;
    baastoSuugoDesc: string;
    baastoSuqaar: string;
    baastoSuqaarDesc: string;
    baastoKalaankal: string;
    baastoKalaankalDesc: string;
    baastoHilibAri: string;
    baastoHilibAriDesc: string;
    bariisChecking: string;
    bariisCheckingDesc: string;
    bariisSuqaar: string;
    bariisSuqaarDesc: string;
    bariisMalaay: string;
    bariisMalaayDesc: string;
    bariisKalaankal: string;
    bariisKalaankalDesc: string;
    bariisHilibAri: string;
    bariisHilibAriDesc: string;
    bariisBaastoHilibAri: string;
    bariisBaastoHilibAriDesc: string;
    bariisLaboQof: string;
    bariisLaboQofDesc: string;
    bariis3Qof: string;
    bariis3QofDesc: string;
    bariis4Qof: string;
    bariis4QofDesc: string;
    bariis56Qof: string;
    bariis56QofDesc: string;
  };
  reservations: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    guests: string;
    date: string;
    time: string;
    selectTime: string;
    notes: string;
    consent: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    required: string;
    consentRequired: string;
    sectionTitle: string;
    sectionSubtitle: string;
    reserveBtn: string;
  };
  location: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    hours: string;
    map: string;
    sectionTitle: string;
    sectionSubtitle: string;
    visitBtn: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    loginBtn: string;
    registerBtn: string;
    forgotPassword: string;
    noAccount: string;
    haveAccount: string;
    signInWith: string;
    google: string;
    facebook: string;
    or: string;
    verifyEmailTitle: string;
    verifyEmailSubtitle: string;
    verifyPhoneTitle: string;
    verifyPhoneSubtitle: string;
    resendCode: string;
    verified: string;
    consent: string;
    consentRequired: string;
    newPassword: string;
    updatePassword: string;
    sendResetLink: string;
    resetLinkSent: string;
    passwordUpdated: string;
  };
  account: {
    title: string;
    profile: string;
    dataPrivacy: string;
    exportData: string;
    deleteAccount: string;
    deleteWarning: string;
    confirmDelete: string;
    cancel: string;
    signOut: string;
    name: string;
    role: string;
    exportDescription: string;
    dangerZone: string;
    signInRequired: string;
  };
  admin: {
    title: string;
    dashboard: string;
    menu: string;
    calendar: string;
    history: string;
    reservations: string;
    settings: string;
    logout: string;
    backToSite: string;
    // Reservations table
    day: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    guests: string;
    tableNumber: string;
    status: string;
    proposeTime: string;
    actions: string;
    pending: string;
    confirmed: string;
    changeRequested: string;
    cancelled: string;
    delete: string;
    send: string;
    close: string;
    previous: string;
    next: string;
    today: string;
    weekOf: string;
    noReservations: string;
    noReservationsYet: string;
    noReservationsThisDay: string;
    noPastReservations: string;
    // Propose time modal
    proposeNewTime: string;
    selectTime: string;
    // Status badges
    confirmedCount: string;
    pendingCount: string;
    // Reservation detail
    table: string;
    partySize: string;
    notes: string;
    viewDetails: string;
    // Menu editor
    addItem: string;
    deleteCategory: string;
    categoryTitle: string;
    categorySubtitle: string;
    itemName: string;
    itemDescription: string;
    itemPrice: string;
    live: string;
    starred: string;
    noItemsYet: string;
    addCategory: string;
    categoryTitlePlaceholder: string;
    categorySubtitlePlaceholder: string;
    deleteCategoryConfirm: string;
    // Main category / Subcategory management
    edit: string;
    cancel: string;
    addSubcategory: string;
    mainCategory: string;
    subCategory: string;
    slug: string;
    // History
    reservationHistory: string;
    // Calendar
    prev: string;
    calendarView: string;
    // Table headers
    tableNumberHeader: string;
    proposeTimeHeader: string;
    actionsHeader: string;
    error: string;
  };
  footer: {
    rights: string;
    impressum: string;
    privacy: string;
    cookieSettings: string;
    address: string;
    phone: string;
  };
  cookieConsent: {
    message: string;
    essentialOnly: string;
    acceptAll: string;
  };
  datenschutz: {
    title: string;
    lastUpdated: string;
    section1Title: string;
    section1Content: string;
    section2Title: string;
    section2Content: string;
    section3Title: string;
    section3Content: string;
    section4Title: string;
    section4Content: string;
    section5Title: string;
    section5Content: string;
    section6Title: string;
    section6Content: string;
    section7Title: string;
    section7Content: string;
    section8Title: string;
    section8Content: string;
    section9Title: string;
    section9Content: string;
    section10Title: string;
    section10Content: string;
    section11Title: string;
    section11Content: string;
    section12Title: string;
    section12Content: string;
    operatorName: string;
    hostingProvider: string;
    logRetentionDays: string;
    unverifiedAccountRetentionDays: string;
    reservationRetentionMonths: string;
    databaseProvider: string;
    contactEmail: string;
  };
};

type TranslationData = {
  [key in Language]?: TranslationKeys;
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  changeLanguage: (newLang: string) => Promise<void>;
  isTranslating: boolean;
  t: TranslationKeys;
  translations: TranslationData;
}

const fallbackTranslations: TranslationData = {
  de: {
    common: {
      loading: "Lädt...",
      searchLang: "Sprache suchen...",
      noResults: "Keine gefunden.",
      back: "Zurück",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      confirm: "Bestätigen",
      submit: "Absenden",
      required: "Pflichtfeld",
      optional: "Optional",
      download: "Herunterladen",
      signInRequired: "Bitte melden Sie sich an, um auf Ihr Konto zuzugreifen.",
      dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    },
    nav: {
      home: "Startseite",
      experience: "Philosophie",
      menu: "Speisekarte",
      reservations: "Reservierung",
      location: "Standort",
      login: "Anmelden",
      register: "Registrieren",
      account: "Mein Konto",
      admin: "Admin",
      logout: "Abmelden",
      impressum: "Impressum",
      privacy: "Datenschutz",
      cookieSettings: "Cookie-Einstellungen",
      language: "Sprache",
    },
    hero: {
      title: "Karmel",
      subtitle: "Café & Restaurant — Somali & African Cuisine",
      visitUs: "Besuchen Sie uns",
      reserveTable: "Tisch reservieren",
    },
    experience: {
      title: "Die Philosophie",
      subtitle: "In Tradition verwurzelt.",
      description: "Vom somalischen Chai und Spezialitätenkaffee zum Frühstück bis zu Bariis- und Baasto-Platten zum Abendessen — Karmel Café & Restaurant ist eine Sinnesreise, verwurzelt in der somalischen und ostafrikanischen Tradition, serviert im Herzen von Schweinfurt.",
      sectionTitle: "Die Philosophie",
      sectionSubtitle: "In Tradition verwurzelt.",
      sectionDescription: "Vom somalischen Chai und Spezialitätenkaffee zum Frühstück bis zu Bariis- und Baasto-Platten zum Abendessen — Karmel Café & Restaurant ist eine Sinnesreise, verwurzelt in der somalischen und ostafrikanischen Tradition, serviert im Herzen von Schweinfurt.",
    },
    menu: {
      title: "Speisekarte",
      subtitle: "Entdecken Sie unsere Gerichte",
      categories: {
        "warme-getranke": "Warme Getränke",
        "kalte-getranke": "Kaltgetränke",
        fruhstuck: "Frühstück",
        pfannkuchen: "Pfannkuchen",
        fladenbrot: "Fladenbrot",
        maisbrei: "Maisbrei",
        snacks: "Snacks",
        spaghetti: "Spaghetti",
        mittagessen: "Mittagessen",
      },
      price: "Preis",
      popular: "Beliebt",
      // Main categories
      breakfast: "Frühstück",
      breakfastSubtitle: "Quraac / Frühstück",
      lunch: "Mittagessen",
      lunchSubtitle: "Qado / Mittagessen",
      dinner: "Abendessen",
      dinnerSubtitle: "Casho / Abendessen",
      drinks: "Getränke",
      drinksSubtitle: "Getränke",
      // Subcategories
      subcatShakshuka: "Shakshuka",
      subcatBasaliyaThunfisch: "Basaliya iyo Thunfisch",
      subcatFuulThunfisch: "Fuul iyo Thunfisch",
      subcatCanjeelo: "Canjeelo / Laxoox Somali",
      subcatMalawax: "Malawax",
      subcatBariis: "Bariis / Reis",
      subcatMuufo: "Muufo Somali",
      subcatSoor: "Soor / Maisbrei",
      subcatSnacks: "Cunto Fudud / Snacks",
      subcatBaasto: "Baasto / Spaghetti",
      subcatSabaayad: "Sabaayad / Chapati",
      subcatWarmeGetranke: "Shaah iyo Kofee",
      subcatKalteGetranke: "Cabitaan Qabow / Mushakal",
      subcatSoftDrinks: "Soft Drinks",
      // Category titles and subtitles
      warmeGetrankeTitle: "Shaah iyo Kofee",
      warmeGetrankeSubtitle: "Warme Getränke",
      kalteGetrankeTitle: "Cabitaan Qabow",
      kalteGetrankeSubtitle: "Kaltgetränke & Mix-Smoothies",
      fruhstuckTitle: "Quraac",
      fruhstuckSubtitle: "Frühstück",
      pfannkuchenTitle: "Canjeelo & Malawax",
      pfannkuchenSubtitle: "Somalische Pfannkuchen",
      fladenbrotTitle: "Muufo & Sabaayad",
      fladenbrotSubtitle: "Somalisches Fladenbrot",
      maisbreiTitle: "Soor",
      maisbreiSubtitle: "Maisbrei",
      snacksTitle: "Cunto Fudud",
      snacksSubtitle: "Snacks",
      spaghettiTitle: "Baasto",
      spaghettiSubtitle: "Spaghetti",
      mittagessenTitle: "Bariis",
      mittagessenSubtitle: "Mittagessen (Reis)",
      // Item names and descriptions
      shaahSomali: "Shaah Somali",
      shaahSomaliDesc: "Somali Chai",
      schwarzerKaffee: "Schwarzer Kaffee",
      cappuccino: "Cappuccino",
      cafeLatte: "Café Latte",
      latteMacchiato: "Latte Macchiato",
      espresso: "Espresso",
      doppelterEspresso: "Doppelter Espresso",
      tigerSpice: "Tiger Spice",
      powerMatcha: "Power Matcha",
      mango: "Mango",
      mangoMilch: "Mango-Milch",
      avocado: "Avocado",
      avocadoMilch: "Avocado-Milch",
      avocadoMilchBanaana: "Avocado-Milch-Banaana",
      strawberry: "Strawberry",
      strawberryMix: "Strawberry Mix",
      banana: "Banana",
      bananaMax: "Banana-Max",
      colaFantaSprite: "Cola / Fanta / Sprite",
      orangeAyran: "Orange und Ayran",
      kleinesWasser: "Kleines Wasser",
      kleinesWasserDesc: "Stilles oder sprudelndes Mineralwasser",
      shakshuka: "Shakshuka",
      basaliyaThunfisch: "Basaliya iyo Thunfisch",
      basaliyaThunfischDesc: "Bazella mit Thunfisch",
      fuulThunfisch: "Fuul iyo Thunfisch",
      fuulThunfischDesc: "Bohnen mit Thunfisch",
      canjeelo2x: "Canjeelo 2x",
      canjeeloSuqaar: "Canjeelo iyo Suqaar",
      canjeeloSuqaarDesc: "mit gekochtem Fleisch und würziger Suppe",
      canjeeloBeer: "Canjeelo iyo Beer",
      canjeeloBeerDesc: "serviert mit gebratener Leber",
      canjeeloKalliyo: "Canjeelo iyo Kalliyo",
      canjeeloKalliyoDesc: "serviert mit gebratenen Nieren",
      canjeeloKalaankal: "Canjeelo iyo Kalaankal",
      canjeeloKalaankalDesc: "mit trocknem gebratenem Fleisch",
      malawax: "Malawax",
      malawaxDesc: "Nur Pfannkuchen",
      malawaxCaanoMacaan: "Malawax iyo Caano-Macaan",
      malawaxCaanoMacaanDesc: "mit gesüßter Kondensmilch",
      malawaxSuqaar: "Malawax iyo Suqaar",
      malawaxKalaankal: "Malawax iyo Kalaankal",
      muufo: "Muufo",
      muufoDesc: "Nur Fladenbrot",
      muufoMaraq: "Muufo iyo Maraq",
      muufoMaraqDesc: "mit aromatischer Suppe",
      muufoSuqaar: "Muufo iyo Suqaar",
      muufoSuqaarDesc: "mit gekochtem Fleisch und würziger Suppe",
      muufoKalaankal: "Muufo iyo Kalaankal",
      muufoKalaankalDesc: "mit trocknem gebratenem Fleisch",
      sabaayad: "Sabaayad",
      sabaayadDesc: "Nur schichtiges Fladenbrot",
      sabaayadSuqaar: "Sabaayad iyo Suqaar",
      sabaayadSuqaarDesc: "mit gekochtem Fleisch und würziger Suppe",
      sabaayadKalaankal: "Sabaayad iyo Kalaankal",
      sabaayadKalaankalDesc: "mit trocknem gebratenem Fleisch",
      sabaayadBeer: "Sabaayad iyo Beer",
      sabaayadBeerDesc: "serviert mit gebratener Leber",
      sabaayadKalliyo: "Sabaayad iyo Kalliyo",
      sabaayadKalliyoDesc: "serviert mit gebratenen Nieren",
      soorCaano: "Soor iyo Caano",
      soorCaanoDesc: "Maisbrei mit warmer Milch",
      soorKoosto: "Soor iyo Koosto",
      soorKoostoDesc: "Maisbrei mit Spinat",
      soorSuqaar: "Soor iyo Suqaar",
      soorSuqaarDesc: "mit gekochtem Fleisch und würziger Suppe",
      sambusa: "Sambusa",
      sambusaDesc: "Teigtasche",
      burQuraac: "Bur / Quraac",
      burQuraacDesc: "Süßes Brot, leicht frittiert",
      mashMash: "Mash Mash",
      mashMashDesc: "Süßer Teig, leicht frittiert",
      bajiyo: "Bajiyo",
      bajiyoDesc: "Frittierte Bohnenbällchen",
      doolshe: "Doolshe",
      doolsheDesc: "Cake",
      baanKeek: "Baan Keek",
      baanKeekDesc: "Pancakes",
      checkenCrispy: "Checken Crispy",
      checkenWings: "Checken Wings",
      pommes: "Pommes",
      baastoSuugo: "Baasto iyo Suugo",
      baastoSuugoDesc: "mit Rindfleisch, klassischer Tomatensauce",
      baastoSuqaar: "Baasto iyo Suqaar",
      baastoSuqaarDesc: "mit gekochtem Fleisch und würziger Suppe",
      baastoKalaankal: "Baasto iyo Kalaankal",
      baastoKalaankalDesc: "mit trocknem gebratenem Fleisch",
      baastoHilibAri: "Baasto iyo Hilib Ari",
      baastoHilibAriDesc: "mit Ziegenfleisch und Sauce",
      bariisChecking: "Bariis iyo Checking",
      bariisCheckingDesc: "Reis mit Hähnchen",
      bariisSuqaar: "Bariis iyo Suqaar",
      bariisSuqaarDesc: "Reis mit gekochtem Fleisch und würziger Suppe",
      bariisMalaay: "Bariis iyo Malaay",
      bariisMalaayDesc: "Reis mit Fisch",
      bariisKalaankal: "Bariis iyo Kalaankal",
      bariisKalaankalDesc: "Reis mit trocknem gebratenem Fleisch",
      bariisHilibAri: "Bariis iyo Hilib Ari",
      bariisHilibAriDesc: "Reis mit Ziegenfleisch",
      bariisBaastoHilibAri: "Bariis, Baasto iyo Hilib Ari",
      bariisBaastoHilibAriDesc: "Reis, Spaghetti mit Ziegenfleisch",
      bariisLaboQof: "Bariis labo qof",
      bariisLaboQofDesc: "Gruppenplatte für 2 Personen, wahlweise mit Pasta",
      bariis3Qof: "Bariis 3 qof",
      bariis3QofDesc: "Gruppenplatte für 3 Personen, wahlweise mit Pasta",
      bariis4Qof: "Bariis 4 qof",
      bariis4QofDesc: "Gruppenplatte für 4 Personen, wahlweise mit Pasta",
      bariis56Qof: "Bariis 5/6 qof",
      bariis56QofDesc: "Gruppenplatte für 5/6 Personen, wahlweise mit Pasta",
    },
    reservations: {
      title: "Tisch reservieren",
      subtitle: "Erleben Sie die Atmosphäre.",
      name: "Vollständiger Name",
      email: "E-Mail",
      phone: "Telefon",
      guests: "Gäste",
      date: "Datum",
      time: "Uhrzeit",
      selectTime: "Uhrzeit wählen",
      notes: "Anmerkungen (optional)",
      consent: "Ich akzeptiere die Verarbeitung meiner Daten für diese Reservierung wie in der Datenschutzerklärung beschrieben.",
      submit: "Reservierung bestätigen",
      sending: "Wird gesendet...",
      success: "Vielen Dank — prüfen Sie Ihre E-Mail zur Bestätigung.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      required: "Dieses Feld ist erforderlich.",
      consentRequired: "Sie müssen der Datenschutzerklärung zustimmen, um eine Reservierung vorzunehmen.",
      sectionTitle: "Tisch reservieren",
      sectionSubtitle: "Erleben Sie die Atmosphäre.",
      reserveBtn: "Tisch reservieren",
    },
    location: {
      title: "Karmel finden",
      subtitle: "Besuchen Sie uns",
      address: "Adresse",
      phone: "Telefon",
      hours: "Öffnungszeiten",
      map: "Karte",
      sectionTitle: "Karmel finden",
      sectionSubtitle: "Karmel besuchen",
      visitBtn: "Karmel besuchen",
    },
    auth: {
      loginTitle: "Anmelden",
      loginSubtitle: "Melden Sie sich an, um auf Ihr Konto zuzugreifen.",
      registerTitle: "Konto erstellen",
      email: "E-Mail-Adresse",
      password: "Passwort",
      name: "Vollständiger Name",
      phone: "Telefon (+49...)",
      loginBtn: "Einloggen",
      registerBtn: "Registrieren",
      forgotPassword: "Passwort vergessen?",
      noAccount: "Noch kein Konto?",
      haveAccount: "Bereits ein Konto?",
      signInWith: "Oder anmelden mit",
      google: "Google",
      facebook: "Facebook",
      or: "oder",
      verifyEmailTitle: "E-Mail verifizieren",
      verifyEmailSubtitle: "Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde.",
      verifyPhoneTitle: "Telefon verifizieren",
      verifyPhoneSubtitle: "Geben Sie den SMS-Code ein, der an Ihre Telefonnummer gesendet wurde.",
      resendCode: "Code erneut senden",
      verified: "Konto verifiziert! Sie können sich jetzt anmelden.",
      consent: "Ich akzeptiere die Verarbeitung meiner Daten wie in der Datenschutzerklärung beschrieben.",
      consentRequired: "Sie müssen der Datenschutzerklärung zustimmen, um ein Konto zu erstellen.",
      newPassword: "Neues Passwort",
      updatePassword: "Passwort aktualisieren",
      sendResetLink: "Reset-Link senden",
      resetLinkSent: "Falls ein Konto für diese E-Mail existiert, wurde ein Reset-Link gesendet.",
      passwordUpdated: "Passwort aktualisiert. Sie können sich jetzt anmelden.",
    },
    account: {
      title: "Mein Konto",
      profile: "Profil",
      dataPrivacy: "Daten & Datenschutz",
      exportData: "Meine Daten exportieren (JSON)",
      deleteAccount: "Konto löschen",
      deleteWarning: "Das Löschen Ihres Kontos entfernt permanent Ihr Profil und Ihre gesamte Reservierungshistorie. Diese Aktion kann nicht rückgängig gemacht werden.",
      confirmDelete: "Löschung bestätigen",
      cancel: "Abbrechen",
      signOut: "Abmelden",
      name: "Name",
      role: "Rolle",
      exportDescription: "Lädt eine JSON-Datei mit Ihren Profilinformationen und Reservierungshistorie herunter.",
      dangerZone: "Gefahrenzone",
      signInRequired: "Bitte melden Sie sich an, um auf Ihr Konto zuzugreifen.",
    },
    admin: {
      title: "Admin-Bereich",
      dashboard: "Dashboard",
      menu: "Speisekarte",
      calendar: "Kalender",
      history: "Verlauf",
      reservations: "Reservierungen",
      settings: "Einstellungen",
      logout: "Abmelden",
      backToSite: "Zurück zur Website",
      // Reservations table
      day: "Tag",
      date: "Datum",
      time: "Uhrzeit",
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      guests: "Gäste",
      tableNumber: "Tisch #",
      status: "Status",
      proposeTime: "Zeit vorschlagen",
      actions: "Aktionen",
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      changeRequested: "Änderung angefragt",
      cancelled: "Storniert",
      delete: "Löschen",
      send: "Senden",
      close: "Schließen",
      previous: "Zurück",
      next: "Weiter",
      today: "Heute",
      weekOf: "Woche vom",
      noReservations: "Keine Reservierungen.",
      noReservationsYet: "Noch keine Reservierungen.",
      noReservationsThisDay: "Keine Reservierungen an diesem Tag.",
      noPastReservations: "Noch keine vergangenen Reservierungen.",
      // Propose time modal
      proposeNewTime: "Neue Zeit vorschlagen",
      selectTime: "Uhrzeit wählen",
      // Status badges
      confirmedCount: "Bestätigt",
      pendingCount: "Ausstehend",
      // Reservation detail
      table: "Tisch",
      partySize: "Personen",
      notes: "Notizen",
      viewDetails: "Details anzeigen",
      // Menu editor
      addItem: "+ Artikel hinzufügen",
      deleteCategory: "Kategorie löschen",
      categoryTitle: "Titel",
      categorySubtitle: "Untertitel",
      itemName: "Name",
      itemDescription: "Beschreibung",
      itemPrice: "Preis",
      live: "Live",
      starred: "★",
      noItemsYet: "Noch keine Artikel.",
      addCategory: "Kategorie hinzufügen",
      categoryTitlePlaceholder: "Titel (z. B. Desserts)",
      categorySubtitlePlaceholder: "Untertitel (z. B. Süße Enden)",
      deleteCategoryConfirm: "Diese ganze Kategorie und ihre Artikel löschen?",
      // Main category / Subcategory management
      edit: "Bearbeiten",
      cancel: "Abbrechen",
      addSubcategory: "Unterkategorie hinzufügen",
      mainCategory: "Hauptkategorie",
      subCategory: "Unterkategorie",
      slug: "Slug (z. B. breakfast)",
      // History
      reservationHistory: "Reservierungsverlauf",
      // Calendar
      prev: "← Zurück",
      calendarView: "Kalender",
      // Table headers
      tableNumberHeader: "Tisch #",
      proposeTimeHeader: "Zeit vorschlagen",
      actionsHeader: "Aktionen",
      error: "Fehler",
    },
    footer: {
      rights: "Alle Rechte vorbehalten.",
      impressum: "Impressum",
      privacy: "Datenschutz",
      cookieSettings: "Cookie-Einstellungen",
      address: "Schultesstraße 14, 97421 Schweinfurt",
      phone: "0176 21313818",
    },
    cookieConsent: {
      message: "Wir verwenden essenzielle Cookies für den Betrieb dieser Seite (Login-Sitzungen). Mit Ihrer Einwilligung laden wir auch Google Maps, wodurch Daten an Google übertragen werden. Details in unserer Datenschutzerklärung.",
      essentialOnly: "Nur essenziell",
      acceptAll: "Alle akzeptieren",
    },
    datenschutz: {
      title: "Datenschutzerklärung",
      lastUpdated: "Stand: {date}",
      section1Title: "1. Verantwortlicher",
      section1Content: "{restaurantName}\n{operatorName}\n{restaurantAddress}\nTelefon: {restaurantPhone}\nE-Mail: {contactEmail}",
      section2Title: "2. Übersicht der Verarbeitungen",
      section2Content: "Wir verarbeiten personenbezogene Daten, wenn Sie ein Konto registrieren, sich anmelden, eine Tischreservierung vornehmen oder unsere Website besuchen. Details zu Art, Umfang, Zweck, Rechtsgrundlage und Speicherdauer finden Sie in den folgenden Abschnitten.",
      section3Title: "3. Hosting und Server-Logfiles",
      section3Content: "Diese Website wird bei {hostingProvider} gehostet. Bei jedem Aufruf erfasst der Hosting-Anbieter automatisch technische Zugriffsdaten (IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, Referrer, Browsertyp) in Server-Logfiles. Diese Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an einem sicheren und funktionsfähigen Betrieb der Website. Logfiles werden nach {logRetentionDays} Tagen automatisch gelöscht, sofern kein Sicherheitsvorfall eine längere Aufbewahrung erfordert.",
      section4Title: "4. Registrierung und Login",
      section4Content: "Bei der Registrierung erheben wir Name, E-Mail-Adresse, Telefonnummer und ein Passwort (gehasht mit bcrypt gespeichert, niemals im Klartext). Zur Bestätigung Ihrer Kontaktdaten senden wir einen Bestätigungscode per E-Mail und, sofern Sie eine Telefonnummer angeben, per SMS (über Firebase Authentication, siehe Abschnitt 7). Alternativ können Sie sich über Google oder Facebook anmelden (siehe Abschnitt 8). Rechtsgrundlage ist die Erfüllung eines Vertrags bzw. vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) sowie unser berechtigtes Interesse an der Verhinderung von Missbrauch (Art. 6 Abs. 1 lit. f DSGVO, z. B. IP-basierte Ratenbegrenzung gegen automatisierte Registrierungsversuche). Nicht verifizierte Konten werden nach {unverifiedAccountRetentionDays} Tagen automatisch gelöscht. Verifizierte Konten werden gespeichert, bis Sie deren Löschung verlangen (siehe Abschnitt 11).",
      section5Title: "5. Tischreservierung",
      section5Content: "Bei einer Reservierung verarbeiten wir Name, E-Mail-Adresse, Telefonnummer, Datum, Uhrzeit, Personenzahl und optionale Anmerkungen, um Ihre Reservierung zu bearbeiten und zu bestätigen (Art. 6 Abs. 1 lit. b DSGVO). Diese Daten werden zusätzlich per E-Mail an das Restaurant weitergeleitet. Reservierungsdaten werden nach Ablauf von {reservationRetentionMonths} Monaten nach dem Reservierungsdatum automatisch gelöscht, sofern keine gesetzliche Aufbewahrungspflicht entgegensteht.",
      section6Title: "6. Cookies und lokaler Speicher",
      section6Content: "Wir setzen ein technisch notwendiges Cookie zur Anmeldesitzung (NextAuth-Session-Cookie) ein; dieses ist gemäß §25 Abs. 2 Nr. 2 TTDSG von der Einwilligungspflicht ausgenommen, da es zur Bereitstellung des von Ihnen ausdrücklich angeforderten Dienstes (Login) erforderlich ist. Ihre Cookie-Auswahl (nur essenziell / alle akzeptieren) speichern wir im lokalen Speicher (localStorage) Ihres Browsers, damit wir Sie nicht bei jedem Besuch erneut fragen müssen. Optionale Inhalte wie die Google-Maps-Karte werden erst nach Ihrer ausdrücklichen Einwilligung geladen (Art. 6 Abs. 1 lit. a DSGVO); Sie können Ihre Auswahl jederzeit über die Löschung der Browserdaten zurücksetzen.",
      section7Title: "7. Firebase Authentication / Google reCAPTCHA (Telefonverifizierung)",
      section7Content: "Zur Verifizierung Ihrer Telefonnummer nutzen wir Firebase Authentication der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (bzw. Google LLC, USA). Ihre Telefonnummer wird an Google übermittelt, um einen SMS-Code zu versenden; zusätzlich wird ein unsichtbares reCAPTCHA von Google geladen, um automatisierte Missbrauchsversuche zu erkennen. Rechtsgrundlage ist unser berechtigtes Interesse an der Verhinderung von Betrug und Missbrauch (Art. 6 Abs. 1 lit. f DSGVO). Diese Verarbeitung findet nur statt, wenn Sie aktiv die Telefonverifizierung während der Registrierung durchführen. Weitere Informationen: Datenschutzerklärung von Google.",
      section8Title: "8. Login mit Google / Facebook",
      section8Content: "Wenn Sie sich über Google oder Facebook anmelden, werden Sie zur jeweiligen Plattform weitergeleitet und melden sich dort mit Ihren Zugangsdaten an. Wir erhalten anschließend Ihren Namen und Ihre E-Mail-Adresse, um Ihr Konto bei uns anzulegen bzw. Sie anzumelden (Art. 6 Abs. 1 lit. b DSGVO). Es werden keine weitergehenden Daten von Google oder Facebook an uns übermittelt. Anbieter: Google Ireland Limited (siehe oben) bzw. Meta Platforms Ireland Limited, 4 Grand Canal Square, Dublin 2, Irland.",
      section9Title: "9. Google Maps",
      section9Content: "Nach Ihrer Einwilligung binden wir eine Karte von Google Maps ein, um den Standort des Restaurants anzuzeigen. Dabei wird Ihre IP-Adresse an Google übertragen. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit mit Wirkung für die Zukunft widerrufen können. Anbieter: Google Ireland Limited (siehe oben).",
      section10Title: "10. Weitere Auftragsverarbeiter",
      section10Content: "<ul><li><strong>Resend</strong> (Resend, Inc., USA) — Versand von Transaktions-E-Mails (Verifizierungscodes, Passwort-Reset, Reservierungsbestätigungen).</li><li><strong>Upstash</strong> (Upstash, Inc., USA) — speichert vorübergehend IP-Adressen bzw. E-Mail-Adressen zur Erkennung von Missbrauch (Ratenbegrenzung).</li><li><strong>{databaseProvider}</strong> — Speicherung aller Konto- und Reservierungsdaten.</li></ul><p>Mit allen Auftragsverarbeitern bestehen bzw. werden Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO abgeschlossen. Soweit Anbieter Daten in die USA übermitteln, stützen wir uns auf deren Zertifizierung unter dem EU-US Data Privacy Framework bzw. auf Standardvertragsklauseln.</p>",
      section11Title: "11. Ihre Rechte",
      section11Content: "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch gegen Verarbeitungen auf Grundlage berechtigten Interesses (Art. 21). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Wenden Sie sich hierfür an die oben genannte Kontaktadresse. Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, z. B. beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA), Promenade 27, 91522 Ansbach.",
      section12Title: "12. Datensicherheit",
      section12Content: "Wir übertragen alle Daten verschlüsselt über TLS/HTTPS. Passwörter werden gehasht (bcrypt) gespeichert, Verifizierungscodes und Passwort-Reset-Token werden ausschließlich als Hash (SHA-256) in der Datenbank abgelegt.",
      operatorName: "[Vollständiger Name des Betreibers/Inhabers bzw. Rechtsform]",
      hostingProvider: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
      logRetentionDays: "30",
      unverifiedAccountRetentionDays: "7",
      reservationRetentionMonths: "24",
      databaseProvider: "Neon/PostgreSQL",
      contactEmail: "kontakt@karmel-restaurant.de",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      searchLang: "Search language...",
      noResults: "None found.",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      confirm: "Confirm",
      submit: "Submit",
      required: "Required",
      optional: "Optional",
      download: "Download",
      signInRequired: "Please sign in to access your account.",
      dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    nav: {
      home: "Home",
      experience: "Experience",
      menu: "Menu",
      reservations: "Reservations",
      location: "Location",
      login: "Sign In",
      register: "Register",
      account: "My Account",
      admin: "Admin",
      logout: "Sign Out",
      impressum: "Legal Notice",
      privacy: "Privacy Policy",
      cookieSettings: "Cookie Settings",
      language: "Language",
    },
    hero: {
      title: "Karmel",
      subtitle: "Café & Restaurant — Somali & African Cuisine",
      visitUs: "Visit Us",
      reserveTable: "Reserve a Table",
    },
    experience: {
      title: "The Philosophy",
      subtitle: "Rooted in tradition.",
      description: "From Somali chai and specialty coffee at breakfast to Bariis and Baasto platters for dinner, Karmel Café & Restaurant is a sensory journey rooted in Somali and East African tradition, served in the heart of Schweinfurt.",
      sectionTitle: "The Philosophy",
      sectionSubtitle: "Rooted in tradition.",
      sectionDescription: "From Somali chai and specialty coffee at breakfast to Bariis and Baasto platters for dinner, Karmel Café & Restaurant is a sensory journey rooted in Somali and East African tradition, served in the heart of Schweinfurt.",
    },
    menu: {
      title: "Menu",
      subtitle: "Discover our dishes",
      categories: {
        "warme-getranke": "Hot Drinks",
        "kalte-getranke": "Cold Drinks",
        fruhstuck: "Breakfast",
        pfannkuchen: "Pancakes",
        fladenbrot: "Flatbread",
        maisbrei: "Corn Porridge",
        snacks: "Snacks",
        spaghetti: "Spaghetti",
        mittagessen: "Lunch",
      },
      price: "Price",
      popular: "Popular",
      // Main categories
      breakfast: "Breakfast",
      breakfastSubtitle: "Quraac / Breakfast",
      lunch: "Lunch",
      lunchSubtitle: "Qado / Lunch",
      dinner: "Dinner",
      dinnerSubtitle: "Casho / Dinner",
      drinks: "Drinks",
      drinksSubtitle: "Drinks",
      // Subcategories
      subcatShakshuka: "Shakshuka",
      subcatBasaliyaThunfisch: "Basaliya iyo Thunfisch",
      subcatFuulThunfisch: "Fuul iyo Thunfisch",
      subcatCanjeelo: "Canjeelo / Laxoox Somali",
      subcatMalawax: "Malawax",
      subcatBariis: "Bariis / Rice",
      subcatMuufo: "Muufo Somali",
      subcatSoor: "Soor / Corn Porridge",
      subcatSnacks: "Cunto Fudud / Snacks",
      subcatBaasto: "Baasto / Spaghetti",
      subcatSabaayad: "Sabaayad / Chapati",
      subcatWarmeGetranke: "Shaah iyo Kofee",
      subcatKalteGetranke: "Cabitaan Qabow / Mushakal",
      subcatSoftDrinks: "Soft Drinks",
      // Category titles and subtitles
      warmeGetrankeTitle: "Shaah iyo Kofee",
      warmeGetrankeSubtitle: "Hot Drinks",
      kalteGetrankeTitle: "Cabitaan Qabow",
      kalteGetrankeSubtitle: "Cold Drinks & Mix-Smoothies",
      fruhstuckTitle: "Quraac",
      fruhstuckSubtitle: "Breakfast",
      pfannkuchenTitle: "Canjeelo & Malawax",
      pfannkuchenSubtitle: "Somali Pancakes",
      fladenbrotTitle: "Muufo & Sabaayad",
      fladenbrotSubtitle: "Somali Flatbread",
      maisbreiTitle: "Soor",
      maisbreiSubtitle: "Corn Porridge",
      snacksTitle: "Cunto Fudud",
      snacksSubtitle: "Snacks",
      spaghettiTitle: "Baasto",
      spaghettiSubtitle: "Spaghetti",
      mittagessenTitle: "Bariis",
      mittagessenSubtitle: "Lunch (Rice)",
      // Item names and descriptions
      shaahSomali: "Shaah Somali",
      shaahSomaliDesc: "Somali Chai",
      schwarzerKaffee: "Black Coffee",
      cappuccino: "Cappuccino",
      cafeLatte: "Café Latte",
      latteMacchiato: "Latte Macchiato",
      espresso: "Espresso",
      doppelterEspresso: "Double Espresso",
      tigerSpice: "Tiger Spice",
      powerMatcha: "Power Matcha",
      mango: "Mango",
      mangoMilch: "Mango-Milk",
      avocado: "Avocado",
      avocadoMilch: "Avocado-Milk",
      avocadoMilchBanaana: "Avocado-Milk-Banana",
      strawberry: "Strawberry",
      strawberryMix: "Strawberry Mix",
      banana: "Banana",
      bananaMax: "Banana-Max",
      colaFantaSprite: "Cola / Fanta / Sprite",
      orangeAyran: "Orange and Ayran",
      kleinesWasser: "Small Water",
      kleinesWasserDesc: "Still or sparkling mineral water",
      shakshuka: "Shakshuka",
      basaliyaThunfisch: "Basaliya iyo Thunfisch",
      basaliyaThunfischDesc: "Bazella with Tuna",
      fuulThunfisch: "Fuul iyo Thunfisch",
      fuulThunfischDesc: "Beans with Tuna",
      canjeelo2x: "Canjeelo 2x",
      canjeeloSuqaar: "Canjeelo iyo Suqaar",
      canjeeloSuqaarDesc: "with boiled meat and spicy soup",
      canjeeloBeer: "Canjeelo iyo Beer",
      canjeeloBeerDesc: "served with fried liver",
      canjeeloKalliyo: "Canjeelo iyo Kalliyo",
      canjeeloKalliyoDesc: "served with fried kidneys",
      canjeeloKalaankal: "Canjeelo iyo Kalaankal",
      canjeeloKalaankalDesc: "with dry fried meat",
      malawax: "Malawax",
      malawaxDesc: "Just Pancakes",
      malawaxCaanoMacaan: "Malawax iyo Caano-Macaan",
      malawaxCaanoMacaanDesc: "with sweetened condensed milk",
      malawaxSuqaar: "Malawax iyo Suqaar",
      malawaxKalaankal: "Malawax iyo Kalaankal",
      muufo: "Muufo",
      muufoDesc: "Just Flatbread",
      muufoMaraq: "Muufo iyo Maraq",
      muufoMaraqDesc: "with aromatic soup",
      muufoSuqaar: "Muufo iyo Suqaar",
      muufoSuqaarDesc: "with boiled meat and spicy soup",
      muufoKalaankal: "Muufo iyo Kalaankal",
      muufoKalaankalDesc: "with dry fried meat",
      sabaayad: "Sabaayad",
      sabaayadDesc: "Just layered flatbread",
      sabaayadSuqaar: "Sabaayad iyo Suqaar",
      sabaayadSuqaarDesc: "with boiled meat and spicy soup",
      sabaayadKalaankal: "Sabaayad iyo Kalaankal",
      sabaayadKalaankalDesc: "with dry fried meat",
      sabaayadBeer: "Sabaayad iyo Beer",
      sabaayadBeerDesc: "served with fried liver",
      sabaayadKalliyo: "Sabaayad iyo Kalliyo",
      sabaayadKalliyoDesc: "served with fried kidneys",
      soorCaano: "Soor iyo Caano",
      soorCaanoDesc: "Corn porridge with warm milk",
      soorKoosto: "Soor iyo Koosto",
      soorKoostoDesc: "Corn porridge with spinach",
      soorSuqaar: "Soor iyo Suqaar",
      soorSuqaarDesc: "with boiled meat and spicy soup",
      sambusa: "Sambusa",
      sambusaDesc: "Dumpling",
      burQuraac: "Bur / Quraac",
      burQuraacDesc: "Sweet bread, lightly fried",
      mashMash: "Mash Mash",
      mashMashDesc: "Sweet dough, lightly fried",
      bajiyo: "Bajiyo",
      bajiyoDesc: "Fried bean balls",
      doolshe: "Doolshe",
      doolsheDesc: "Cake",
      baanKeek: "Baan Keek",
      baanKeekDesc: "Pancakes",
      checkenCrispy: "Chicken Crispy",
      checkenWings: "Chicken Wings",
      pommes: "Fries",
      baastoSuugo: "Baasto iyo Suugo",
      baastoSuugoDesc: "with beef, classic tomato sauce",
      baastoSuqaar: "Baasto iyo Suqaar",
      baastoSuqaarDesc: "with boiled meat and spicy soup",
      baastoKalaankal: "Baasto iyo Kalaankal",
      baastoKalaankalDesc: "with dry fried meat",
      baastoHilibAri: "Baasto iyo Hilib Ari",
      baastoHilibAriDesc: "with goat meat and sauce",
      bariisChecking: "Bariis iyo Checking",
      bariisCheckingDesc: "Rice with chicken",
      bariisSuqaar: "Bariis iyo Suqaar",
      bariisSuqaarDesc: "Rice with boiled meat and spicy soup",
      bariisMalaay: "Bariis iyo Malaay",
      bariisMalaayDesc: "Rice with fish",
      bariisKalaankal: "Bariis iyo Kalaankal",
      bariisKalaankalDesc: "Rice with dry fried meat",
      bariisHilibAri: "Bariis iyo Hilib Ari",
      bariisHilibAriDesc: "Rice with goat meat",
      bariisBaastoHilibAri: "Bariis, Baasto iyo Hilib Ari",
      bariisBaastoHilibAriDesc: "Rice, Spaghetti with goat meat",
      bariisLaboQof: "Bariis labo qof",
      bariisLaboQofDesc: "Platter for 2 people, optionally with pasta",
      bariis3Qof: "Bariis 3 qof",
      bariis3QofDesc: "Platter for 3 people, optionally with pasta",
      bariis4Qof: "Bariis 4 qof",
      bariis4QofDesc: "Platter for 4 people, optionally with pasta",
      bariis56Qof: "Bariis 5/6 qof",
      bariis56QofDesc: "Platter for 5/6 people, optionally with pasta",
    },
    reservations: {
      title: "Reserve a Table",
      subtitle: "Join the atmosphere.",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      guests: "Guests",
      date: "Date",
      time: "Time",
      selectTime: "Select Time",
      notes: "Notes (optional)",
      consent: "I accept the processing of my data for this reservation as described in the privacy policy.",
      submit: "Confirm Reservation",
      sending: "Sending...",
      success: "Thank you — check your email for confirmation.",
      error: "Something went wrong. Please try again.",
      required: "This field is required.",
      consentRequired: "You must accept the privacy policy to make a reservation.",
      sectionTitle: "Reserve a Table",
      sectionSubtitle: "Join the atmosphere.",
      reserveBtn: "Reserve a Table",
    },
    location: {
      title: "Find Karmel",
      subtitle: "Visit Us",
      address: "Address",
      phone: "Phone",
      hours: "Opening Hours",
      map: "Map",
      sectionTitle: "Find Us",
      sectionSubtitle: "Visit Karmel",
      visitBtn: "Visit Karmel",
    },
    auth: {
      loginTitle: "Sign In",
      loginSubtitle: "Sign in to access your account.",
      registerTitle: "Create Account",
      email: "Email Address",
      password: "Password",
      name: "Full Name",
      phone: "Phone (+49...)",
      loginBtn: "Sign In",
      registerBtn: "Register",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      signInWith: "Or continue with",
      google: "Google",
      facebook: "Facebook",
      or: "or",
      verifyEmailTitle: "Verify Email",
      verifyEmailSubtitle: "Enter the 6-digit code sent to your email.",
      verifyPhoneTitle: "Verify Phone",
      verifyPhoneSubtitle: "Enter the SMS code sent to your phone number.",
      resendCode: "Resend Code",
      verified: "Account verified! You can now sign in.",
      consent: "I accept the processing of my data as described in the privacy policy.",
      consentRequired: "You must accept the privacy policy to create an account.",
      newPassword: "New Password",
      updatePassword: "Update Password",
      sendResetLink: "Send Reset Link",
      resetLinkSent: "If an account exists for that email, a reset link has been sent.",
      passwordUpdated: "Password updated. You can now sign in.",
    },
    account: {
      title: "My Account",
      profile: "Profile",
      dataPrivacy: "Data & Privacy",
      exportData: "Export My Data (JSON)",
      deleteAccount: "Delete Account",
      deleteWarning: "Deleting your account will permanently remove your profile and all reservation history. This action cannot be undone.",
      confirmDelete: "Confirm Deletion",
      cancel: "Cancel",
      signOut: "Sign Out",
      name: "Name",
      role: "Role",
      exportDescription: "Downloads a JSON file with your profile information and reservation history.",
      dangerZone: "Danger Zone",
      signInRequired: "Please sign in to access your account.",
    },
    admin: {
      title: "Admin Panel",
      dashboard: "Dashboard",
      menu: "Menu",
      calendar: "Calendar",
      history: "History",
      reservations: "Reservations",
      settings: "Settings",
      logout: "Sign Out",
      backToSite: "Back to Website",
      // Reservations table
      day: "Day",
      date: "Date",
      time: "Time",
      name: "Name",
      email: "Email",
      phone: "Phone",
      guests: "Guests",
      tableNumber: "Table #",
      status: "Status",
      proposeTime: "Propose Time",
      actions: "Actions",
      pending: "Pending",
      confirmed: "Confirmed",
      changeRequested: "Change Requested",
      cancelled: "Cancelled",
      delete: "Delete",
      send: "Send",
      close: "Close",
      previous: "Previous",
      next: "Next",
      today: "Today",
      weekOf: "Week of",
      noReservations: "No reservations.",
      noReservationsYet: "No reservations yet.",
      noReservationsThisDay: "No reservations on this day.",
      noPastReservations: "No past reservations yet.",
      // Propose time modal
      proposeNewTime: "Propose New Time",
      selectTime: "Select Time",
      // Status badges
      confirmedCount: "Confirmed",
      pendingCount: "Pending",
      // Reservation detail
      table: "Table",
      partySize: "Guests",
      notes: "Notes",
      viewDetails: "View Details",
      // Menu editor
      addItem: "+ Add Item",
      deleteCategory: "Delete Category",
      categoryTitle: "Title",
      categorySubtitle: "Subtitle",
      itemName: "Name",
      itemDescription: "Description",
      itemPrice: "Price",
      live: "Live",
      starred: "★",
      noItemsYet: "No items yet.",
      addCategory: "Add Category",
      categoryTitlePlaceholder: "Title (e.g. Desserts)",
      categorySubtitlePlaceholder: "Subtitle (e.g. Sweet endings)",
      deleteCategoryConfirm: "Delete this whole category and its items?",
      // Main category / Subcategory management
      edit: "Edit",
      cancel: "Cancel",
      addSubcategory: "Add Subcategory",
      mainCategory: "Main Category",
      subCategory: "Subcategory",
      slug: "Slug (e.g. breakfast)",
      // History
      reservationHistory: "Reservation History",
      // Calendar
      prev: "← Prev",
      calendarView: "Calendar",
      // Table headers
      tableNumberHeader: "Table #",
      proposeTimeHeader: "Propose Time",
      actionsHeader: "Actions",
      error: "Error",
    },
    footer: {
      rights: "All rights reserved.",
      impressum: "Legal Notice",
      privacy: "Privacy Policy",
      cookieSettings: "Cookie Settings",
      address: "Schultesstraße 14, 97421 Schweinfurt",
      phone: "0176 21313818",
    },
    cookieConsent: {
      message: "We use essential cookies to run this site (login sessions). With your consent we also load Google Maps, which transfers data to Google. See our privacy policy for details.",
      essentialOnly: "Essential only",
      acceptAll: "Accept all",
    },
    datenschutz: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: {date}",
      section1Title: "1. Controller",
      section1Content: "{restaurantName}\n{operatorName}\n{restaurantAddress}\nPhone: {restaurantPhone}\nEmail: {contactEmail}",
      section2Title: "2. Overview of Processing",
      section2Content: "We process personal data when you register an account, sign in, make a table reservation, or visit our website. Details on the type, scope, purpose, legal basis, and retention periods can be found in the following sections.",
      section3Title: "3. Hosting and Server Logfiles",
      section3Content: "This website is hosted by {hostingProvider}. On each visit, the hosting provider automatically captures technical access data (IP address, date/time, requested page, referrer, browser type) in server logfiles. This processing is based on our legitimate interest (Art. 6(1)(f) GDPR) in a secure and functional operation of the website. Logfiles are automatically deleted after {logRetentionDays} days, unless a security incident requires longer retention.",
      section4Title: "4. Registration and Login",
      section4Content: "During registration we collect name, email address, phone number, and a password (stored hashed with bcrypt, never in plaintext). To verify your contact details we send a verification code by email and, if you provide a phone number, by SMS (via Firebase Authentication, see Section 7). Alternatively, you can sign in via Google or Facebook (see Section 8). The legal basis is the performance of a contract or pre-contractual measures (Art. 6(1)(b) GDPR) as well as our legitimate interest in preventing abuse (Art. 6(1)(f) GDPR, e.g., IP-based rate limiting against automated registration attempts). Unverified accounts are automatically deleted after {unverifiedAccountRetentionDays} days. Verified accounts are stored until you request their deletion (see Section 11).",
      section5Title: "5. Table Reservation",
      section5Content: "When making a reservation we process name, email address, phone number, date, time, number of guests, and optional notes to process and confirm your reservation (Art. 6(1)(b) GDPR). This data is also forwarded by email to the restaurant. Reservation data is automatically deleted after {reservationRetentionMonths} months following the reservation date, unless a legal retention obligation applies.",
      section6Title: "6. Cookies and Local Storage",
      section6Content: "We use a technically necessary cookie for the login session (NextAuth session cookie); this is exempt from the consent requirement under §25(2)(2) TTDSG as it is required to provide the service (login) you explicitly requested. Your cookie choice (essential only / accept all) is stored in your browser's localStorage so we don't have to ask again on each visit. Optional content such as the Google Maps map is only loaded after your explicit consent (Art. 6(1)(a) GDPR); you can reset your choice at any time by clearing browser data.",
      section7Title: "7. Firebase Authentication / Google reCAPTCHA (Phone Verification)",
      section7Content: "To verify your phone number we use Firebase Authentication by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (or Google LLC, USA). Your phone number is transmitted to Google to send an SMS code; additionally, an invisible reCAPTCHA by Google is loaded to detect automated abuse attempts. The legal basis is our legitimate interest in preventing fraud and abuse (Art. 6(1)(f) GDPR). This processing only occurs if you actively perform phone verification during registration. For more information: Google Privacy Policy.",
      section8Title: "8. Login with Google / Facebook",
      section8Content: "When you sign in via Google or Facebook, you are redirected to the respective platform and sign in there with your credentials. We then receive your name and email address to create or sign in to your account with us (Art. 6(1)(b) GDPR). No further data from Google or Facebook is transmitted to us. Providers: Google Ireland Limited (see above) and Meta Platforms Ireland Limited, 4 Grand Canal Square, Dublin 2, Ireland.",
      section9Title: "9. Google Maps",
      section9Content: "After your consent we embed a Google Maps map to display the restaurant location. Your IP address is transmitted to Google. The legal basis is your consent (Art. 6(1)(a) GDPR), which you can revoke at any time with effect for the future. Provider: Google Ireland Limited (see above).",
      section10Title: "10. Additional Data Processors",
      section10Content: "<ul><li><strong>Resend</strong> (Resend, Inc., USA) — sending transactional emails (verification codes, password resets, reservation confirmations).</li><li><strong>Upstash</strong> (Upstash, Inc., USA) — temporarily stores IP addresses or email addresses for abuse detection (rate limiting).</li><li><strong>{databaseProvider}</strong> — storage of all account and reservation data.</li></ul><p>Data processing agreements pursuant to Art. 28 GDPR are in place or will be concluded with all processors. Where providers transfer data to the USA, we rely on their certification under the EU-US Data Privacy Framework or on Standard Contractual Clauses.</p>",
      section11Title: "11. Your Rights",
      section11Content: "You have the right to access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and objection to processing based on legitimate interests (Art. 21). Granted consents can be revoked at any time with effect for the future. Please contact us at the above address for this. You also have the right to lodge a complaint with a data protection supervisory authority, e.g., the Bavarian State Office for Data Protection Supervision (BayLDA), Promenade 27, 91522 Ansbach.",
      section12Title: "12. Data Security",
      section12Content: "We transmit all data encrypted via TLS/HTTPS. Passwords are stored hashed (bcrypt), verification codes and password reset tokens are stored exclusively as hashes (SHA-256) in the database.",
      operatorName: "[Full name of operator/owner or legal form]",
      hostingProvider: "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
      logRetentionDays: "30",
      unverifiedAccountRetentionDays: "7",
      reservationRetentionMonths: "24",
      databaseProvider: "Neon/PostgreSQL",
      contactEmail: "kontakt@karmel-restaurant.de",
    },
  },
};

const STORAGE_KEY = "karmel-language";

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const isClient = typeof window !== "undefined";

  const getInitialLang = (): Language => {
    if (!isClient) return "de";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && stored in fallbackTranslations) return stored;
    } catch {
      // ignore
    }
    return "de";
  };

  const [lang, setLangState] = useState<Language>(getInitialLang);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<TranslationData>(fallbackTranslations);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const buildFullSource = useCallback(() => {
    return fallbackTranslations.de;
  }, []);

  const changeLanguage = async (newLang: string) => {
    if (newLang === lang) return;
    if (newLang === "de" || translations[newLang as Language]) {
      setLang(newLang as Language);
      return;
    }

    setIsTranslating(true);
    try {
      const fullSourceDict = buildFullSource();
      const res = await fetch("/api/translate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLang: newLang, sourceDict: fullSourceDict }),
      });
      const data = await res.json();
      if (data.translatedDict) {
        setTranslations((prev) => ({ ...prev, [newLang]: data.translatedDict }));
        setLang(newLang as Language);
      } else if (!res.ok) {
        // Handle any error response (503, 500, 400, etc.)
        console.error("Translation API error:", res.status, data);
        if (res.status === 503 || data.error?.includes("not configured")) {
          console.warn("Translation service not configured. Falling back to German.");
        }
        setLang("de");
      } else {
        throw new Error(data.error || "Translation failed");
      }
    } catch (e) {
      console.error("Translation failed:", e);
      setLang("de");
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (translations[lang] || fallbackTranslations[lang] || fallbackTranslations.de) as TranslationKeys;

  if (!isClient) {
    return (
      <LanguageContext.Provider value={{ lang: "de", setLang: () => {}, changeLanguage: async () => {}, isTranslating: false, t: fallbackTranslations.de as TranslationKeys, translations }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, changeLanguage, isTranslating, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}