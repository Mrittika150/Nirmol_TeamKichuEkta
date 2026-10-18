"use client";

import { useI18n } from "@/lib/i18n";
import { HowToUse } from "./HowToUse";

export function GuidePage() {
  const { lang } = useI18n();
  return (
    <main className="shell-width flex flex-col gap-6 pb-16 pt-6 lg:pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">{lang === "bn" ? "ব্যবহারের গাইড" : "Guide"}</h1>
      <HowToUse full />
    </main>
  );
}
