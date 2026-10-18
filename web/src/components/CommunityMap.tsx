"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATEGORY_LABELS, communityQuery, readCommunityPage, reportCells, validCommunityFilters, type CommunityFilters } from "@/lib/community";
import { REPORT_CATEGORIES, type PublicReport, type ReportCategory } from "@/lib/reports";

const Canvas = dynamic(() => import("./CommunityMapCanvas"), { ssr: false, loading: () => <p role="status" className="h-[380px] sm:h-[480px]">Loading map / ম্যাপ আনা হচ্ছে…</p> });
const TEXT = {
  en: { title:"Community Map", intro:"Pollution sources reported by people across Bangladesh and checked by our moderators. These are what people saw, not official measurements.", privacy:"Each pin shows a rough area of about 5 km, not the exact spot. Only the type, date and rough area are public. Photos, notes and names stay private.", reports:"Report pollution / My reports", moderation:"Moderator dashboard", category:"Type", all:"All types", from:"From (date)", to:"To (date)", apply:"Apply", refresh:"Refresh", loading:"Loading reports…", empty:"No reports for these filters yet. Seen something? Send a report.", unavailable:"Couldn't load reports. Please try again.", invalid:"The start date must be on or before the end date.", list:"Reports", loaded:"reports shown", more:"Show more", cap:"Showing up to 200 reports. Pick a type or dates to narrow it down.", details:"Area details", choose:"Tap a numbered pin or a report below to see details.", observed:"Seen on", submitted:"Reported on", area:"Area centre", view:"Show on map", stale:"Updates every minute while this page is open.", back:"Dashboard", approved:"Approved", forwarded:"Sent to authorities", resolved:"Resolved", outline:"The Bangladesh border on the map is approximate." },
  bn: { title:"কমিউনিটি ম্যাপ", intro:"সারা দেশের মানুষ যে দূষণের উৎস রিপোর্ট করেছেন, আমাদের মডারেটররা চেক করার পর এখানে দেখানো হয়। এগুলো মানুষের দেখা ঘটনা, অফিসিয়াল মাপ নয়।", privacy:"প্রতিটি পিন প্রায় ৫ কিমির একটি আনুমানিক এলাকা দেখায়, ঠিক জায়গা নয়। শুধু ধরন, তারিখ আর আনুমানিক এলাকা পাবলিক। ছবি, নোট আর নাম প্রাইভেট থাকে।", reports:"দূষণ রিপোর্ট / আমার রিপোর্ট", moderation:"মডারেটর ড্যাশবোর্ড", category:"ধরন", all:"সব ধরন", from:"শুরুর তারিখ", to:"শেষের তারিখ", apply:"দেখুন", refresh:"রিফ্রেশ", loading:"রিপোর্ট লোড হচ্ছে…", empty:"এই ফিল্টারে এখনো কোনো রিপোর্ট নেই। কিছু দেখেছেন? রিপোর্ট পাঠান।", unavailable:"রিপোর্ট লোড করা যায়নি। আবার চেষ্টা করুন।", invalid:"শুরুর তারিখ শেষের তারিখের আগে বা একই দিন হতে হবে।", list:"রিপোর্টগুলো", loaded:"টি রিপোর্ট দেখানো হচ্ছে", more:"আরও দেখুন", cap:"সর্বোচ্চ ২০০টি রিপোর্ট দেখানো হয়। ধরন বা তারিখ বেছে কমিয়ে আনুন।", details:"এলাকার বিস্তারিত", choose:"বিস্তারিত দেখতে নম্বর দেওয়া পিন বা নিচের রিপোর্টে ট্যাপ করুন।", observed:"দেখার তারিখ", submitted:"রিপোর্টের তারিখ", area:"এলাকার কেন্দ্র", view:"ম্যাপে দেখুন", stale:"পেজ খোলা থাকলে প্রতি মিনিটে আপডেট হয়।", back:"ড্যাশবোর্ড", approved:"অনুমোদিত", forwarded:"কর্তৃপক্ষকে পাঠানো হয়েছে", resolved:"সমাধান হয়েছে", outline:"ম্যাপে বাংলাদেশের সীমানা আনুমানিক।" },
};
const EMPTY: CommunityFilters = { category: "", from: "", to: "" };
export function CommunityMap() {
  const { lang, setLang, num } = useI18n(), t = TEXT[lang];
  const [draft, setDraft] = useState<CommunityFilters>(EMPTY), [filters, setFilters] = useState<CommunityFilters>(EMPTY);
  const [reports, setReports] = useState<PublicReport[]>([]), [next, setNext] = useState<string | null>(null), [selected, select] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false), [invalid, setInvalid] = useState(false);
  const request = useRef<AbortController | null>(null), sequence = useRef(0), detail = useRef<HTMLElement>(null);
  const cancel = useCallback(() => { ++sequence.current; request.current?.abort(); }, []);
  const load = useCallback(async (after: string | null = null) => {
    const version = ++sequence.current; request.current?.abort(); const abort = new AbortController(); request.current = abort;
    setLoading(true); setError(false); select(null);
    if (!after) { setReports([]); setNext(null); }
    const timer = setTimeout(() => abort.abort(), 12000);
    try {
      const response = await fetch(`/api/reports/public?${communityQuery(filters, after)}`, { cache: "no-store", signal: abort.signal, credentials: "omit" });
      const page = response.ok ? readCommunityPage(await response.json(), filters, after) : null;
      if (!page) throw Error("invalid_public_response");
      if (version !== sequence.current) return;
      setReports(old => after ? [...old, ...page.reports] : page.reports); setNext(page.next);
    } catch { if (version === sequence.current) { setReports([]); setNext(null); setError(true); } }
    finally { clearTimeout(timer); if (version === sequence.current) setLoading(false); }
  }, [filters]);
  useEffect(() => {
    void load();
    const refresh = () => { if (!document.hidden) void load(); else { ++sequence.current; request.current?.abort(); setReports([]); select(null); setNext(null); } };
    const restore = (e: PageTransitionEvent) => { if (e.persisted) refresh(); };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh); window.addEventListener("pageshow", restore);
    return () => { cancel(); clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("pageshow", restore); };
  }, [load, cancel]);
  const cells = useMemo(() => reportCells(reports), [reports]), chosen = cells.find(cell => cell.key === selected);
  const onSelect = useCallback((key: string) => { select(key); detail.current?.focus({ preventScroll: true }); }, []);
  const day = (v: string) => new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(`${v}T06:00:00Z`));
  const coordinate = (v: number) => new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-GB", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v);
  return <main className="dashboard community-page shell-width flex flex-col gap-5 pb-16 pt-6 lg:pt-8">
    <header className="flex flex-wrap items-center justify-end gap-3"><Link href="/" className="sr-only">{lang === "en" ? "Nirmol" : "নির্মল"}</Link><button className="community-button" onClick={() => setLang(lang === "en" ? "bn" : "en")} aria-label={`Switch language: ${lang === "en" ? "বাংলা" : "English"}`}>{lang === "en" ? "বাংলা" : "English"}</button></header>
    <nav aria-label={t.title} className="flex flex-wrap gap-2"><Link className="community-link" href="/moderation">{t.moderation}</Link></nav>
    <section className="community-card"><h1 className="text-3xl font-semibold">{t.title}</h1><p>{t.intro}</p><p className="text-sm text-[var(--muted)]">{t.privacy}</p></section>
    <form className="community-card grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={e => { e.preventDefault(); if (!validCommunityFilters(draft)) { setInvalid(true); return; } setInvalid(false); if (JSON.stringify(filters) === JSON.stringify(draft)) void load(); else setFilters({ ...draft }); }}>
      <label>{t.category}<select className="community-input" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as ReportCategory | "" })}><option value="">{t.all}</option>{REPORT_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[lang][c]}</option>)}</select></label>
      <label>{t.from}<input type="date" className="community-input" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} /></label>
      <label>{t.to}<input type="date" className="community-input" value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} /></label>
      <div className="flex flex-wrap items-end gap-2"><button className="community-button dashboard-primary" type="submit">{t.apply}</button><button className="community-button" type="button" onClick={() => void load()} disabled={loading}>{t.refresh}</button></div>
      {invalid && <p role="alert" className="col-span-full">{t.invalid}</p>}
    </form>
    <div className="panel grid gap-1 p-4 text-sm"><p className="text-[var(--muted)]">{t.stale}</p>
    {loading && <p role="status">{t.loading}</p>}{error && <p role="alert">{t.unavailable}</p>}</div>
    {!loading && !error && !reports.length && <p role="status" className="community-card">{t.empty}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section className="community-card min-w-0"><Canvas cells={cells} selected={selected} onSelect={onSelect} lang={lang} /><p className="text-xs text-[var(--muted)]">{t.outline}</p></section>
      <section ref={detail} tabIndex={-1} aria-label={t.details} className="community-card min-w-0"><h2 className="text-lg font-semibold">{t.details}</h2>{chosen ? <><p>{t.area}: {coordinate(chosen.lat)}, {coordinate(chosen.lon)} · 0.05°</p><ul className="space-y-3">{chosen.reports.map(r => <li key={r.id} className="rounded-lg bg-[var(--soft)] p-3"><h3 className="font-semibold">{CATEGORY_LABELS[lang][r.category]}</h3><p>{t.observed}: {day(r.observedDate)}</p><p>{t.submitted}: {day(r.submittedDate)}</p><p>{t[r.status]}</p></li>)}</ul></> : <p>{t.choose}</p>}</section>
    </div>
    <section aria-label={t.list} className="community-card"><h2 className="text-xl font-semibold">{t.list}</h2><p role="status">{num(reports.length)} {t.loaded}</p><ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{reports.map(r => <li className="rounded-xl border border-[var(--border)] p-4" key={r.id}><h3 className="font-semibold">{CATEGORY_LABELS[lang][r.category]}</h3><p>{t.observed}: {day(r.observedDate)}</p><p>{t.area}: {coordinate(r.location.lat)}, {coordinate(r.location.lon)}</p><button className="community-button mt-2" onClick={() => onSelect(`${r.location.lat},${r.location.lon}`)}>{t.view}</button></li>)}</ul>{next && reports.length < 200 && <button className="community-button" disabled={loading} onClick={() => void load(next)}>{t.more}</button>}{next && reports.length >= 200 && <p>{t.cap}</p>}</section>
  </main>;
}
