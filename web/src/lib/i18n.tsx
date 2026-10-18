"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AqiLevel } from "./aqi";

export type Lang = "bn" | "en";

const STRINGS = {
  bn: {
    tagline: "নির্মল বাতাস, সুস্থ জীবন।",
    useMyLocation: "আমার লোকেশন",
    locating: "লোকেশন খোঁজা হচ্ছে…",
    locationDenied: "লোকেশন পাওয়া যায়নি। লিস্ট থেকে একটি এলাকা বেছে নিন।",
    myLocation: "আমার লোকেশন",
    pm25Now: "এখন PM2.5",
    aqiLabel: "AQI (আনুমানিক)",
    aqiGuidance: "এই AQI শুধু এখনকার PM2.5 থেকে হিসাব করা, তাই এটি আনুমানিক। অফিসিয়াল AQI কয়েক ঘণ্টার গড় ধরে বের করা হয়।",
    updated: "আপডেট",
    minutesAgo: (m: number) => `${toBn(m)} মিনিট আগে`,
    hoursAgo: (h: number) => `${toBn(h)} ঘণ্টা আগে`,
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    wind: "বাতাস",
    forecastTitle: "আগামী ২৪ ঘণ্টা",
    likelyRange: "সম্ভাব্য রেঞ্জ",
    peak: "সবচেয়ে বেশি",
    lowest: "সবচেয়ে কম",
    at: "সময়",
    planTrip: "যাত্রার প্ল্যান করুন",
    reportPollution: "দূষণ রিপোর্ট করুন",
    comingSoon: "শীঘ্রই আসছে",
    sourceNirmol: "নির্মল মডেলের হিসাব (CAMS সংশোধিত)",
    sourceCams: "CAMS মডেলের হিসাব (Copernicus)",
    camsWarning:
      "খেয়াল করুন: ২০২২–২৫ সালের শীতে ঢাকায় আসল দূষণ CAMS-এর দেখানো মানের প্রায় দ্বিগুণ ছিল। আপনার এলাকায় আসল মান বেশি হতে পারে।",
    whatIsThis: "এই তথ্য কোথা থেকে আসে?",
    sourceExplain:
      "এটি মডেলের হিসাব, সরাসরি মাপা নয়। নির্মল পুরনো ডেটা দিয়ে CAMS-এর ভুল ঠিক করে, আর ঢাকার মার্কিন দূতাবাসের মনিটরের সাথে মিলিয়ে দেখেছে। প্রতিটি রাস্তা বা পুরো দেশের জন্য এটি যাচাই করা নয়।",
    error: "এই মুহূর্তে বাতাসের তথ্য আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
    retry: "আবার চেষ্টা করুন",
    unavailable: "তথ্য নেই",
    notMedical: "এটি সাধারণ পরামর্শ, ডাক্তারি পরামর্শ নয়।",
    levels: {
      good: "ভালো",
      moderate: "মাঝারি",
      usg: "সংবেদনশীলদের জন্য খারাপ",
      unhealthy: "অস্বাস্থ্যকর",
      very_unhealthy: "খুব অস্বাস্থ্যকর",
      hazardous: "বিপজ্জনক",
    } satisfies Record<AqiLevel, string>,
    advice: {
      good: "বাতাস ভালো। বাইরে স্বাভাবিকভাবে চলাফেরা করুন।",
      moderate: "বেশিরভাগ মানুষের জন্য ঠিক আছে। শ্বাসের সমস্যা থাকলে বাইরে বেশিক্ষণ ভারী কাজ করবেন না।",
      usg: "শিশু, বয়স্ক আর শ্বাসকষ্টের রোগীরা বাইরে বেশিক্ষণ থাকবেন না।",
      unhealthy: "বাইরে কম সময় থাকুন। বের হলে N95/KN95 মাস্ক পরুন।",
      very_unhealthy: "খুব দরকার না হলে বাইরে যাবেন না। জানালা বন্ধ রাখুন, বের হলে N95 মাস্ক পরুন।",
      hazardous: "সবাই ঘরে থাকুন। বের হতেই হলে N95 মাস্ক পরে অল্প সময়ের মধ্যে ফিরে আসুন।",
    } satisfies Record<AqiLevel, string>,
  },
  en: {
    tagline: "Clean air, healthy life.",
    useMyLocation: "My location",
    locating: "Finding your location…",
    locationDenied: "Couldn't find your location. Choose an area from the list.",
    myLocation: "My location",
    pm25Now: "PM2.5 now",
    aqiLabel: "AQI (estimate)",
    aqiGuidance: "This AQI is worked out from the current PM2.5 only, so it's an estimate. The official AQI uses an average over several hours.",
    updated: "Updated",
    minutesAgo: (m: number) => `${m} min ago`,
    hoursAgo: (h: number) => `${h} h ago`,
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    forecastTitle: "Next 24 hours",
    likelyRange: "Likely range",
    peak: "Highest",
    lowest: "Lowest",
    at: "at",
    planTrip: "Plan a trip",
    reportPollution: "Report pollution",
    comingSoon: "Coming soon",
    sourceNirmol: "Nirmol model estimate (corrected CAMS)",
    sourceCams: "CAMS model estimate (Copernicus)",
    camsWarning:
      "Heads up: in Dhaka's 2022–25 winters, real pollution was about twice what CAMS showed. The real level near you may be higher.",
    whatIsThis: "Where does this come from?",
    sourceExplain:
      "This is a model estimate, not a direct measurement. Nirmol uses past data to correct CAMS, and we checked it against the US Embassy monitor in Dhaka. It isn't checked for every street or the whole country.",
    error: "We can't load air data right now. Please try again in a moment.",
    retry: "Try again",
    unavailable: "No data",
    notMedical: "General guidance, not medical advice.",
    levels: {
      good: "Good",
      moderate: "Moderate",
      usg: "Unhealthy for sensitive groups",
      unhealthy: "Unhealthy",
      very_unhealthy: "Very unhealthy",
      hazardous: "Hazardous",
    } satisfies Record<AqiLevel, string>,
    advice: {
      good: "The air is good. Enjoy your normal outdoor activities.",
      moderate: "Fine for most people. If you have breathing problems, avoid long, heavy activity outside.",
      usg: "Children, older people and anyone with breathing problems should limit time outside.",
      unhealthy: "Spend less time outside. Wear an N95/KN95 mask when you go out.",
      very_unhealthy: "Stay in unless you really need to go out. Keep windows shut and wear an N95 outside.",
      hazardous: "Everyone should stay indoors. If you must go out, wear an N95 and come back quickly.",
    } satisfies Record<AqiLevel, string>,
  },
};

export type Strings = (typeof STRINGS)["en"];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function toBn(n: number | string): string {
  return String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

type Ctx = { lang: Lang; t: Strings; setLang: (l: Lang) => void; num: (n: number | string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nirmol.lang");
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("nirmol.lang", l);
    } catch {}
  };

  const value: Ctx = {
    lang,
    t: STRINGS[lang] as Strings,
    setLang,
    num: (n) => (lang === "bn" ? toBn(n) : String(n)),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
