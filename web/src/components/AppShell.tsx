"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Icon, type IconName } from "./Icon";

const NAV: { href: string; icon: IconName; en: string; bn: string }[] = [
  { href: "/", icon: "dashboard", en: "Dashboard", bn: "ড্যাশবোর্ড" },
  { href: "/alerts", icon: "bell", en: "Alerts", bn: "সতর্কবার্তা" },
  { href: "/exposure", icon: "activity", en: "Exposure", bn: "এক্সপোজার" },
  { href: "/travel", icon: "route", en: "Travel planner", bn: "যাত্রা পরিকল্পনা" },
  { href: "/simulator", icon: "sliders", en: "Compare plans", bn: "প্ল্যান তুলনা" },
  { href: "/diary", icon: "book", en: "Diary", bn: "ডায়েরি" },
  { href: "/community", icon: "map", en: "Community", bn: "কমিউনিটি" },
  { href: "/reports", icon: "flag", en: "Report pollution", bn: "দূষণ জানান" },
  { href: "/advisor", icon: "chat", en: "AI advisor", bn: "AI পরামর্শ" },
];

/** Account and help live beside the theme switch so the tab row holds only the main tools. */
const UTILITY: { href: string; icon: IconName; en: string; bn: string }[] = [
  { href: "/guide", icon: "info", en: "How to use", bn: "কীভাবে ব্যবহার করবেন" },
  { href: "/my-nirmol", icon: "user", en: "My Nirmol", bn: "আমার নির্মল" },
];

type Theme = "light" | "dark";

function ThemeToggle() {
  const { lang } = useI18n();
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    const set = document.documentElement.dataset.theme;
    setTheme(set === "dark" || set === "light" ? set : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = lang === "bn" ? (next === "dark" ? "গাঢ় থিম চালু করুন" : "হালকা থিম চালু করুন") : `Switch to ${next} theme`;
  return (
    <button type="button" aria-label={label} title={label}
      className="inline-grid size-11 place-items-center rounded-lg border border-white/25 text-[var(--sidebar-ink)] hover:bg-[var(--sidebar-hover)]"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("nirmol.theme", next); } catch {}
        setTheme(next);
      }}>
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useI18n();
  const nav = useRef<HTMLElement>(null);
  const login = pathname === "/login";
  // Hidden scrollbar: keep the current page's tab visible and fade the edges that have more tabs.
  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const edges = () => {
      el.dataset.more = `${el.scrollLeft > 4 ? "l" : ""}${el.scrollLeft + el.clientWidth < el.scrollWidth - 4 ? "r" : ""}`;
    };
    const current = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (current) el.scrollLeft = Math.max(0, current.offsetLeft - (el.clientWidth - current.offsetWidth) / 2);
    edges();
    el.addEventListener("scroll", edges, { passive: true });
    window.addEventListener("resize", edges);
    return () => { el.removeEventListener("scroll", edges); window.removeEventListener("resize", edges); };
  }, [pathname, lang, login]);
  if (login) return <>{children}</>;
  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="app-shell">
      <header className="app-sidebar sticky top-0 z-40">
        <div className="shell-width flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e]"><Icon name="wind" size={22} /></span>
            <span className="min-w-0">
              <span className="block font-semibold leading-tight">{lang === "bn" ? "নির্মল" : "Nirmol"}</span>
              <span className="block truncate text-xs opacity-90">{lang === "bn" ? "বাংলাদেশের বায়ুমান" : "Air quality · Bangladesh"}</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {UTILITY.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} aria-current={active(item.href) ? "page" : undefined}
                aria-label={item[lang]} title={item[lang]}
                className="app-utility inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-3 text-sm font-medium">
                <Icon name={item.icon} size={18} />
                <span className="hidden md:inline">{item[lang]}</span>
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
        <nav ref={nav} aria-label={lang === "bn" ? "প্রধান মেনু" : "Main menu"}
          className="app-nav shell-width flex gap-1 overflow-x-auto pb-3 pt-1 lg:flex-wrap lg:justify-between lg:gap-0.5 lg:overflow-visible xl:gap-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} aria-current={active(item.href) ? "page" : undefined}
              className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm lg:gap-1.5 lg:px-2 xl:gap-2 xl:px-3">
              <Icon name={item.icon} size={18} />
              {item[lang]}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
