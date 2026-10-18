"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icon";
import { SlotIcon, type Tone } from "./SlotIcon";

const COPY = {
  en: {
    title: "How to use Nirmol", intro: "Four quick steps. No account needed.", step: "Step",
    steps: [
      { icon: "pin", tone: "teal", title: "Pick your area", body: "Search for your area, like Uttara or Mirpur. Or tap “My location”.", link: "/", cta: "Choose area" },
      { icon: "trend", tone: "sky", title: "Read the air", body: "See PM2.5 now and the next 24 hours. The colour shows how clean the air is.", link: "/", cta: "See forecast" },
      { icon: "route", tone: "leaf", title: "Plan your day", body: "Find the best time to go out, or check how much pollution you will breathe.", link: "/travel", cta: "Open travel planner" },
      { icon: "bell", tone: "sun", title: "Stay alert", body: "Set an alert level. See smoke or dust? Report it so others know.", link: "/alerts", cta: "Set an alert" },
    ],
    faqTitle: "Quick answers",
    faq: [
      ["Why do nearby areas show the same number?", "The numbers come from a wide-area model, not a sensor on your street. Areas close to each other can fall in the same model cell."],
      ["Do I need an account?", "No. All air tools are open to everyone. An account only saves your places and language."],
      ["Is this medical advice?", "No. It is general guidance. Talk to a doctor about health problems."],
    ],
    guideLink: "Read the full guide",
  },
  bn: {
    title: "নির্মল কীভাবে ব্যবহার করবেন", intro: "মাত্র চার ধাপ। অ্যাকাউন্ট লাগবে না।", step: "ধাপ",
    steps: [
      { icon: "pin", tone: "teal", title: "এলাকা বাছুন", body: "সার্চ করে আপনার এলাকা বাছুন, যেমন উত্তরা বা মিরপুর। অথবা “আমার লোকেশন” চাপুন।", link: "/", cta: "এলাকা বাছুন" },
      { icon: "trend", tone: "sky", title: "বাতাস দেখুন", body: "এখনকার PM2.5 ও আগামী ২৪ ঘণ্টার পূর্বাভাস দেখুন। রং দেখে বুঝুন বাতাস কেমন।", link: "/", cta: "পূর্বাভাস দেখুন" },
      { icon: "route", tone: "leaf", title: "দিনের পরিকল্পনা করুন", body: "কখন বের হলে ভালো, বা কতটা দূষণ শ্বাসে যাবে, তা দেখুন।", link: "/travel", cta: "যাত্রা পরিকল্পনা খুলুন" },
      { icon: "bell", tone: "sun", title: "সতর্ক থাকুন", body: "সতর্কবার্তার মাত্রা ঠিক করুন। ধোঁয়া বা ধুলা দেখলে রিপোর্ট করুন।", link: "/alerts", cta: "সতর্কবার্তা ঠিক করুন" },
    ],
    faqTitle: "সহজ উত্তর",
    faq: [
      ["কাছাকাছি এলাকায় একই সংখ্যা কেন?", "সংখ্যাগুলো বড় এলাকার মডেল থেকে আসে, আপনার রাস্তার সেন্সর থেকে নয়। কাছাকাছি এলাকা একই ঘরে পড়তে পারে।"],
      ["অ্যাকাউন্ট লাগবে?", "না। সব টুল সবার জন্য খোলা। অ্যাকাউন্টে শুধু আপনার স্থান ও ভাষা জমা থাকে।"],
      ["এটা কি ডাক্তারের পরামর্শ?", "না। এটা সাধারণ পরামর্শ। স্বাস্থ্য সমস্যায় ডাক্তারের সাথে কথা বলুন।"],
    ],
    guideLink: "পুরো গাইড পড়ুন",
  },
} as const;

export function HowToUse({ full = false }: { full?: boolean }) {
  const { lang, num } = useI18n();
  const t = COPY[lang];
  return (
    <section id="how-to-use" aria-labelledby="how-to-use-title" className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="how-to-use-title" className="text-xl font-semibold">{t.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.intro}</p>
        </div>
        {!full && <Link href="/guide" className="back-link">{t.guideLink}<Icon name="arrow" size={16} /></Link>}
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.title} className="panel relative flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <SlotIcon name={step.icon} tone={step.tone as Tone} size="lg" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{t.step} {num(i + 1)}</span>
            </div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
            <Link href={step.link} className="back-link mt-auto">{step.cta}<Icon name="arrow" size={16} /></Link>
            {i < t.steps.length - 1 && <span aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] lg:grid"><Icon name="arrow" size={12} /></span>}
          </li>
        ))}
      </ol>
      {full && <div className="panel grid gap-1 p-5">
        <h2 className="mb-2 font-semibold">{t.faqTitle}</h2>
        {t.faq.map(([q, a]) => (
          <details key={q} className="group border-t border-[var(--border)] py-3 first-of-type:border-t-0">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium">{q}<Icon name="plus" size={18} className="shrink-0 text-[var(--muted)] transition-transform group-open:rotate-45" /></summary>
            <p className="pb-1 text-sm leading-relaxed text-[var(--muted)]">{a}</p>
          </details>
        ))}
      </div>}
    </section>
  );
}
