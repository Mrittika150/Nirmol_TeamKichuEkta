"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { evaluateAlerts, type PollutionAlert } from "@/lib/alerts";
import {
  ALERT_THRESHOLD_PRESETS, DEFAULT_ALERT_PREFERENCES, isValidAlertPreferences,
  resetAlertPreferences, restoreAlertPreferences, saveAlertPreferences, type AlertPreferences,
} from "@/lib/alert-preferences";
import { absoluteTime } from "@/lib/air-validation";
import { DEFAULT_DASHBOARD_LOCATION, restoreDashboardLocation, type DashboardLocation } from "@/lib/dashboard-location";
import { PlaceOptions } from "./PlaceOptions";
import { useI18n } from "@/lib/i18n";
import { nearestPlace, PLACES } from "@/lib/places";

const WORDS = {
  en: {
    heading: "Pollution alerts", back: "Back to dashboard", language: "Switch language to বাংলা",
    intro: "Set your PM2.5 limit. We'll warn you if the air now or in the coming hours goes over it.",
    delivery: "Alerts show here in the app while this page is open. We don't send SMS, email or push notifications yet.",
    place: "Location", saved: "Saved coordinates near", confirmLocation: "Use this place for alerts.",
    preferences: "Alert preferences", preset: "Alert preset", custom: "Custom", threshold: "PM2.5 alert threshold (µg/m³)",
    lookAhead: "Forecast look-ahead", hours: "hours", apply: "Apply preferences", reset: "Reset preferences",
    preferenceRule: "35, 75 and 150 µg/m³ are quick presets, not medical danger levels. You get an alert when PM2.5 reaches your limit.",
    invalid: "Enter a limit from 0 to 2000 µg/m³ and choose 6, 12 or 24 hours.",
    applied: "Applied threshold", forecastWindow: "Future window", exclusiveStart: "after", inclusiveEnd: "through (inclusive)",
    refresh: "Refresh data", visible: "visible alerts", showDismissed: "Show dismissed alerts", dismiss: "Dismiss alert",
    dismissed: "Hidden alerts are just hidden; the air hasn't changed.",
    dismissalRule: "Hidden alerts stay hidden while this page is open. A new reading brings them back.",
    loading: "Loading pollution data…", refreshing: "Refreshing pollution data…", error: "Couldn't load air data. Tap refresh to try again.",
    available_with_alerts: "Threshold alerts available.", available_without_alerts: "Good news: nothing goes over your limit. Still, this isn't a safety guarantee.",
    stale: "This data is old. Refresh to check again.", unavailable: "No air data right now (that doesn't mean zero).",
    preferences_pending: "Save your settings to start checking alerts.",
    currentTitle: "Current conditions", forecastTitle: "Upcoming forecast alerts", currentAlert: "Current threshold reached", forecastAlert: "Forecast threshold reached",
    noCurrent: "Right now the air is below your limit.", noForecast: "The forecast stays below your limit for this period.",
    available: "Eligible data available", current: "Current condition", forecast: "Future prediction times", source: "Source", valid: "Reading valid time",
    cams: "CAMS model estimate (not measured)", nirmol: "Nirmol CAMS-correction model — not a measurement",
    issued: "Model issued", issuanceUnknown: "CAMS doesn't say exactly when its forecast was made.",
    fetched: "API retrieved", evaluated: "Evaluated at", first: "First qualifying prediction", last: "Last qualifying prediction (inclusive)",
    maximum: "Maximum qualifying prediction", minimum: "Minimum qualifying prediction", count: "Qualifying hourly predictions",
    coverage: "Available future coverage", complete: "Forecast available for every hour.", partial: "Some forecast hours are missing.",
    availablePoints: "valid predictions", expectedPoints: "expected hourly predictions", missingPoints: "missing or invalid predictions",
    discrete: "Start and end show the first and last forecast hours over your limit. Hours in a row are grouped together.",
    privacy: "Only your limit and time window are saved, in this browser tab. No health or diary data is used. Only your location is used to fetch air data.",
    memory: "Couldn't save your settings in this browser. They'll work until you close the page.",
    corrupt: "Your saved settings couldn't be read. Tap reset to start fresh.",
    resetFailed: "Couldn't remove your saved settings. Defaults are used for now.",
    session: "Settings are kept until you close this tab.",
    limits: "Alerts are based on estimates. They aren't medical advice or official health warnings. The Nirmol model was tested in Dhaka, not on every street.",
    actions: "Plan your next step", actionNote: "Each tool loads fresh data when you open it.",
    exposure: "Personal exposure", travel: "Smart travel planner", simulator: "Compare plans", diary: "Exposure diary",
  },
  bn: {
    heading: "দূষণ অ্যালার্ট", back: "ড্যাশবোর্ডে ফিরুন", language: "English ভাষায় পরিবর্তন করুন",
    intro: "আপনার PM2.5 লিমিট সেট করুন। এখন বা সামনের কয়েক ঘণ্টায় বাতাস সেই লিমিট পার হলে আমরা জানাব।",
    delivery: "এই পেজ খোলা থাকলে অ্যালার্ট অ্যাপেই দেখাবে। এখনো SMS, ইমেইল বা পুশ নোটিফিকেশন পাঠানো হয় না।",
    place: "এলাকা", saved: "সেভ করা লোকেশন, কাছাকাছি", confirmLocation: "অ্যালার্টের জন্য এই জায়গা ব্যবহার করুন।",
    preferences: "সতর্কবার্তার পছন্দ", preset: "পূর্বনির্ধারিত সীমা", custom: "নিজের পছন্দ", threshold: "PM2.5 সতর্কবার্তার সীমা (µg/m³)",
    lookAhead: "কত ঘণ্টার পূর্বাভাস", hours: "ঘণ্টা", apply: "পছন্দ প্রয়োগ করুন", reset: "পছন্দ রিসেট করুন",
    preferenceRule: "৩৫, ৭৫ আর ১৫০ µg/m³ দ্রুত বাছাইয়ের জন্য, ডাক্তারি বিপদসীমা নয়। PM2.5 আপনার লিমিটে পৌঁছালে অ্যালার্ট পাবেন।",
    invalid: "০ থেকে ২০০০ µg/m³-এর মধ্যে লিমিট দিন এবং ৬, ১২ বা ২৪ ঘণ্টা বেছে নিন।",
    applied: "প্রয়োগ করা সীমা", forecastWindow: "ভবিষ্যৎ সময়সীমা", exclusiveStart: "এর পরে", inclusiveEnd: "পর্যন্ত (শেষ সময়সহ)",
    refresh: "আবার তথ্য আনুন", visible: "দৃশ্যমান সতর্কবার্তা", showDismissed: "লুকানো সতর্কবার্তা দেখুন", dismiss: "সতর্কবার্তা লুকান",
    dismissed: "লুকানো অ্যালার্ট শুধু লুকানো, বাতাস বদলায়নি।",
    dismissalRule: "পেজ খোলা থাকা পর্যন্ত লুকানো অ্যালার্ট লুকানো থাকবে। নতুন তথ্য এলে আবার দেখাবে।",
    loading: "দূষণের তথ্য আনা হচ্ছে…", refreshing: "দূষণের তথ্য আবার আনা হচ্ছে…", error: "বাতাসের তথ্য লোড হয়নি। আবার চেষ্টা করতে রিফ্রেশ চাপুন।",
    available_with_alerts: "নির্বাচিত সীমার সতর্কবার্তা পাওয়া যাচ্ছে।", available_without_alerts: "ভালো খবর: কিছুই আপনার লিমিট পার হচ্ছে না। তবে এটা নিরাপত্তার নিশ্চয়তা নয়।",
    stale: "তথ্য পুরনো হয়ে গেছে। আবার দেখতে রিফ্রেশ করুন।", unavailable: "এখন বাতাসের তথ্য নেই (এর মানে শূন্য নয়)।",
    preferences_pending: "অ্যালার্ট চেক শুরু করতে সেটিংস সেভ করুন।",
    currentTitle: "বর্তমান অবস্থা", forecastTitle: "আগামী সময়ের পূর্বাভাসের সতর্কবার্তা", currentAlert: "বর্তমানে নির্বাচিত সীমায় পৌঁছেছে", forecastAlert: "পূর্বাভাসে নির্বাচিত সীমায় পৌঁছেছে",
    noCurrent: "এই মুহূর্তে বাতাস আপনার লিমিটের নিচে।", noForecast: "এই সময়ে পূর্বাভাস আপনার লিমিটের নিচে থাকছে।",
    available: "বৈধ তথ্য পাওয়া যাচ্ছে", current: "বর্তমান অবস্থা", forecast: "ভবিষ্যৎ পূর্বাভাসের সময়", source: "উৎস", valid: "মানের বৈধ সময়",
    cams: "CAMS মডেলের হিসাব (মাপা নয়)", nirmol: "নির্মলের CAMS-সংশোধন মডেল — পরিমাপ নয়",
    issued: "মডেল প্রকাশ", issuanceUnknown: "CAMS তাদের পূর্বাভাস ঠিক কখন তৈরি করেছে তা জানায় না।",
    fetched: "API থেকে তথ্য আনা", evaluated: "মূল্যায়নের সময়", first: "সীমায় পৌঁছানো প্রথম পূর্বাভাস", last: "সীমায় পৌঁছানো শেষ পূর্বাভাস (এই সময়সহ)",
    maximum: "সীমায় পৌঁছানো সর্বোচ্চ পূর্বাভাস", minimum: "সীমায় পৌঁছানো সর্বনিম্ন পূর্বাভাস", count: "সীমায় পৌঁছানো ঘণ্টাভিত্তিক পূর্বাভাস",
    coverage: "উপলব্ধ ভবিষ্যৎ পূর্বাভাস", complete: "প্রতিটি ঘণ্টার পূর্বাভাস আছে।", partial: "কিছু ঘণ্টার পূর্বাভাস নেই।",
    availablePoints: "বৈধ পূর্বাভাস", expectedPoints: "প্রত্যাশিত ঘণ্টাভিত্তিক পূর্বাভাস", missingPoints: "অনুপস্থিত বা অবৈধ পূর্বাভাস",
    discrete: "শুরু আর শেষ মানে লিমিট পার হওয়া প্রথম আর শেষ ঘণ্টা। পরপর ঘণ্টাগুলো একসাথে দেখানো হয়।",
    privacy: "শুধু আপনার লিমিট আর সময় এই ব্রাউজার ট্যাবে সেভ হয়। স্বাস্থ্য বা ডায়েরির তথ্য ব্যবহার হয় না। বাতাসের তথ্য আনতে শুধু লোকেশন ব্যবহার হয়।",
    memory: "এই ব্রাউজারে সেটিংস সেভ করা যায়নি। পেজ বন্ধ না করা পর্যন্ত কাজ করবে।",
    corrupt: "সেভ করা সেটিংস পড়া যায়নি। নতুন করে শুরু করতে রিসেট চাপুন।",
    resetFailed: "সেভ করা সেটিংস মোছা যায়নি। আপাতত ডিফল্ট সেটিংস চলছে।",
    session: "এই ট্যাব বন্ধ না করা পর্যন্ত সেটিংস থাকবে।",
    limits: "অ্যালার্ট হিসাবের ওপর ভিত্তি করে। এটা ডাক্তারি পরামর্শ বা অফিসিয়াল স্বাস্থ্য সতর্কতা নয়। নির্মল মডেল ঢাকায় যাচাই করা, প্রতিটি রাস্তায় নয়।",
    actions: "পরবর্তী পদক্ষেপ পরিকল্পনা করুন", actionNote: "প্রতিটি টুল খোলার সময় নতুন তথ্য আনে।",
    exposure: "ব্যক্তিগত এক্সপোজার", travel: "যাত্রার সময় পরিকল্পনা", simulator: "প্ল্যান তুলনা", diary: "এক্সপোজার ডায়েরি",
  },
};

type LoadState = { location: DashboardLocation; revision: number; phase: "pending" | "ready" | "error"; value: unknown; receivedAtMs: number };
type PreferenceIssue = "ready" | "unavailable" | "corrupt" | "reset_failed";
const CARD = "min-w-0 space-y-3 panel p-4 sm:p-5";
const FIELD = "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const BUTTON = "min-h-11 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold disabled:opacity-60";

export function PollutionAlerts() {
  const { lang, setLang, num } = useI18n();
  const t = WORDS[lang];
  const [location, setLocation] = useState<DashboardLocation>(DEFAULT_DASHBOARD_LOCATION);
  const [preferences, setPreferences] = useState<AlertPreferences>({ ...DEFAULT_ALERT_PREFERENCES });
  const [draftThreshold, setDraftThreshold] = useState(String(DEFAULT_ALERT_PREFERENCES.threshold));
  const [draftLookAhead, setDraftLookAhead] = useState<number>(DEFAULT_ALERT_PREFERENCES.lookAheadHours);
  const [preferenceIssue, setPreferenceIssue] = useState<PreferenceIssue>("ready");
  const [readOnly, setReadOnly] = useState(false);
  const [restored, setRestored] = useState(false);
  const [clock, setClock] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  const [pendingPhase, setPendingPhase] = useState<"loading" | "refreshing">("loading");
  const [loaded, setLoaded] = useState<LoadState>({ location: DEFAULT_DASHBOARD_LOCATION, revision: 0, phase: "pending", value: null, receivedAtMs: 0 });
  const [dismissed, setDismissed] = useState<string[]>([]);
  const focusDismissed = useRef(false);
  const showDismissedButton = useRef<HTMLButtonElement>(null);
  const thresholdField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocation(restoreDashboardLocation(() => localStorage.getItem("nirmol.loc")));
    const saved = restoreAlertPreferences(() => sessionStorage);
    setPreferences(saved.preferences); setDraftThreshold(String(saved.preferences.threshold)); setDraftLookAhead(saved.preferences.lookAheadHours);
    setPreferenceIssue(saved.status); setReadOnly(saved.readOnly); setRestored(true); setClock(Date.now());
    const tick = () => { if (!document.hidden) setClock(Date.now()); };
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick); document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, []);

  useEffect(() => {
    if (!restored) return;
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => {
      controller.abort();
      if (active) setLoaded({ location, revision, phase: "error", value: null, receivedAtMs: 0 });
    }, 15000);
    setLoaded({ location, revision, phase: "pending", value: null, receivedAtMs: 0 });
    fetch(`/api/air?lat=${location.lat}&lon=${location.lon}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Air data unavailable"); return await response.json() as unknown; })
      .then((value) => {
        if (active && !controller.signal.aborted) {
          const receivedAtMs = Date.now(); setClock(receivedAtMs);
          setLoaded({ location, revision, phase: "ready", value, receivedAtMs });
        }
      })
      .catch(() => { if (active) setLoaded({ location, revision, phase: "error", value: null, receivedAtMs: 0 }); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, [location, revision, restored]);

  useEffect(() => {
    if (focusDismissed.current) { showDismissedButton.current?.focus(); focusDismissed.current = false; }
  }, [dismissed]);

  const owner = loaded.location === location && loaded.revision === revision;
  const phase = owner ? loaded.phase : "pending";
  const evaluation = phase === "ready" && clock !== null && clock >= loaded.receivedAtMs
    ? evaluateAlerts(loaded.value, location, preferences, clock, loaded.receivedAtMs) : null;
  const draft = { threshold: draftThreshold.trim() ? Number(draftThreshold) : NaN, lookAheadHours: draftLookAhead };
  const validDraft = isValidAlertPreferences(draft);
  const dirty = !validDraft || draft.threshold !== preferences.threshold || draft.lookAheadHours !== preferences.lookAheadHours;
  const dataStatus = phase === "pending" ? pendingPhase : phase === "error" ? "error" : dirty ? "preferences_pending" : evaluation?.state ?? "unavailable";
  const visible = evaluation && !dirty ? evaluation.alerts.filter((alert) => !dismissed.includes(alert.id)) : [];
  const available = dataStatus === "available_with_alerts" || dataStatus === "available_without_alerts";
  const placeName = location.placeId ? (PLACES.find((place) => place.id === location.placeId) ?? PLACES[0]).name[lang]
    : `${t.saved} ${nearestPlace(location.lat, location.lon).name[lang]}`;
  const formatTime = (time: string) => Number.isFinite(absoluteTime(time)) ? new Date(time).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }) : t.unavailable;
  const time = (value: string) => <time dateTime={value}>{formatTime(value)}</time>;
  const source = (value: "cams" | "nirmol" | null) => value === "cams" ? t.cams : value === "nirmol" ? t.nirmol : t.unavailable;
  const applyPreferences = () => {
    if (!isValidAlertPreferences(draft) || readOnly) return;
    const saved = saveAlertPreferences(() => sessionStorage, draft);
    setPreferences(draft); setDismissed([]);
    setPreferenceIssue(saved.status === "corrupt" ? "corrupt" : saved.ok ? "ready" : "unavailable");
    if (saved.status === "corrupt") setReadOnly(true);
  };
  const resetPreferences = () => {
    const reset = resetAlertPreferences(() => sessionStorage);
    setPreferences(reset.preferences); setDraftThreshold(String(reset.preferences.threshold)); setDraftLookAhead(reset.preferences.lookAheadHours); setDismissed([]);
    setPreferenceIssue(reset.ok ? "ready" : "reset_failed");
    if (reset.ok) setReadOnly(false);
  };
  const refresh = () => { if (phase !== "pending") { setPendingPhase("refreshing"); setRevision((value) => value + 1); } };
  const eventCard = (alert: PollutionAlert) => <li key={alert.id} data-testid="alert-card" data-alert-kind={alert.category}
    className="space-y-2 rounded-xl border-l-4 border-amber-700 bg-[var(--soft)] p-3">
    <h3 className="font-semibold">{alert.category === "current" ? t.currentAlert : t.forecastAlert}</h3>
    <p>{t.applied}: <strong>{num(alert.threshold)} µg/m³</strong></p>
    {alert.category === "current" ? <p className="font-semibold">PM2.5: {num(alert.pm25)} µg/m³</p> : <>
      <p>{t.maximum}: {num(alert.maxPm25)} µg/m³</p><p>{t.minimum}: {num(alert.minPm25)} µg/m³</p>
      <p>{t.count}: {num(alert.pointCount)}</p>
    </>}
    <p>{alert.category === "current" ? t.valid : t.first}: {time(alert.startTime)}</p>
    {alert.category === "forecast" && <p>{t.last}: {time(alert.endTime)}</p>}
    <p className="text-xs">{t.source}: {source(alert.source)}</p>
    {alert.issuedAt && <p className="text-xs">{t.issued}: {time(alert.issuedAt)}</p>}
    <button type="button" className={BUTTON} onClick={() => {
      focusDismissed.current = true;
      setDismissed((previous) => [...previous.filter((id) => id !== alert.id).slice(-63), alert.id]);
    }}>{t.dismiss}</button>
  </li>;
  const eventsFor = (category: "current" | "forecast") => {
    if (!evaluation || !available) return null;
    const events = visible.filter((alert) => alert.category === category);
    if (events.length) return <ul className="space-y-3">{events.map(eventCard)}</ul>;
    return <p>{evaluation.alerts.some((alert) => alert.category === category) ? t.dismissed : category === "current" ? t.noCurrent : t.noForecast}</p>;
  };

  return <main className="dashboard mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className="back-link">← {t.back}</Link>
      <button type="button" className={BUTTON} aria-label={t.language} onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button>
    </header>
    <div className="space-y-2"><h1 className="text-2xl font-bold">{t.heading}</h1><p>{t.intro}</p><p className="panel p-3 text-sm text-[var(--muted)]">{t.delivery}</p></div>
    <section className={CARD}>
      <label htmlFor="alerts-location" className="block font-semibold">{t.place}</label>
      <select id="alerts-location" className={FIELD} value={location.placeId ?? ""} onChange={(event) => {
        const place = PLACES.find((item) => item.id === event.target.value);
        if (place) { setPendingPhase("loading"); setDismissed([]); setLocation({ lat: place.lat, lon: place.lon, placeId: place.id }); }
      }}>
        {location.placeId === null && <option value="">{placeName}</option>}
        <PlaceOptions />
      </select>
      <p className="text-sm">{placeName} · {num(location.lat.toFixed(4))}, {num(location.lon.toFixed(4))}</p>
      <p className="text-xs text-[var(--muted)]">{t.confirmLocation}</p>
    </section>
    <section className={CARD} aria-labelledby="alerts-preferences-title">
      <h2 id="alerts-preferences-title" className="text-lg font-bold">{t.preferences}</h2>
      <fieldset disabled={readOnly} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div><label htmlFor="alerts-preset" className="block text-sm font-semibold">{t.preset}</label>
          <select id="alerts-preset" className={FIELD} value={ALERT_THRESHOLD_PRESETS.some((value) => value === Number(draftThreshold)) ? String(Number(draftThreshold)) : "custom"}
            onChange={(event) => {
              setDraftThreshold(event.target.value === "custom" ? "" : event.target.value);
              if (event.target.value === "custom") thresholdField.current?.focus();
            }}>
            <option value="custom">{t.custom}</option>{ALERT_THRESHOLD_PRESETS.map((value) => <option key={value} value={value}>{num(value)} µg/m³</option>)}
          </select></div>
        <div><label htmlFor="alerts-threshold" className="block text-sm font-semibold">{t.threshold}</label>
          <input ref={thresholdField} id="alerts-threshold" className={FIELD} type="number" min="0" max="2000" step="any" value={draftThreshold}
            aria-invalid={!validDraft} aria-describedby="alerts-threshold-help" onChange={(event) => setDraftThreshold(event.target.value)} /></div>
        <div><label htmlFor="alerts-lookahead" className="block text-sm font-semibold">{t.lookAhead}</label>
          <select id="alerts-lookahead" className={FIELD} value={draftLookAhead} onChange={(event) => setDraftLookAhead(Number(event.target.value))}>
            {[6, 12, 24].map((value) => <option key={value} value={value}>{num(value)} {t.hours}</option>)}
          </select></div>
        <button type="button" className={`dashboard-primary ${BUTTON} self-end`} onClick={applyPreferences}>{t.apply}</button>
      </fieldset>
      <p id="alerts-threshold-help" className="text-xs text-[var(--muted)]">{t.preferenceRule}</p>
      {!validDraft && <p role="alert" className="text-sm">{t.invalid}</p>}
      <p className="text-sm">{t.applied}: <strong>{num(preferences.threshold)} µg/m³</strong> · {num(preferences.lookAheadHours)} {t.hours}</p>
      <button type="button" className={BUTTON} onClick={resetPreferences}>{t.reset}</button>
      {preferenceIssue !== "ready" && <p role="status" className="text-sm">{preferenceIssue === "corrupt" ? t.corrupt : preferenceIssue === "reset_failed" ? t.resetFailed : t.memory}</p>}
      <p className="text-xs text-[var(--muted)]">{t.session}</p>
    </section>
    <section className={CARD}>
      <p data-testid="alerts-status" data-status={dataStatus} role={dataStatus === "error" ? "alert" : "status"} aria-atomic="true">
        {t[dataStatus]} {available && `${num(visible.length)} ${t.visible}.`}
        {available && <span className="sr-only">{visible.map((alert) => `${alert.category === "current" ? t.currentAlert : t.forecastAlert}: ${num(alert.pm25)} µg/m³, ${formatTime(alert.startTime)}, ${source(alert.source)}.`).join(" ")}</span>}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={BUTTON} disabled={phase === "pending"} onClick={refresh}>{t.refresh}</button>
        {dismissed.length > 0 && <button ref={showDismissedButton} type="button" className={BUTTON} onClick={() => setDismissed([])}>{t.showDismissed}</button>}
      </div>
      <p className="text-xs text-[var(--muted)]">{t.dismissalRule}</p>
    </section>
    {evaluation && !dirty && <>
      <section data-testid="alerts-current" data-status={evaluation.current.status} className={CARD} aria-labelledby="alerts-current-title">
        <h2 id="alerts-current-title" className="text-lg font-bold">{t.currentTitle}</h2>
        <p>{evaluation.current.status === "available" ? t.available : t[evaluation.current.status]}</p>
        {evaluation.current.status === "available" && evaluation.current.pm25 !== null && <p className="text-xl font-bold">PM2.5: {num(evaluation.current.pm25)} µg/m³</p>}
        <p className="text-xs">{t.source}: {source(evaluation.current.source)}</p>
        {evaluation.current.time && <p className="text-xs">{t.valid}: {time(evaluation.current.time)}</p>}
        {evaluation.current.issuedAt && <p className="text-xs">{t.issued}: {time(evaluation.current.issuedAt)}</p>}
        {evaluation.current.status === "available" && eventsFor("current")}
      </section>
      <section data-testid="alerts-forecast" data-status={evaluation.forecast.status} className={CARD} aria-labelledby="alerts-forecast-title">
        <h2 id="alerts-forecast-title" className="text-lg font-bold">{t.forecastTitle}</h2>
        <p>{evaluation.forecast.status === "available" ? t.available : t[evaluation.forecast.status]}</p>
        <p className="text-xs">{t.source}: {source(evaluation.forecast.source)}</p>
        {evaluation.forecast.issuedAt ? <p className="text-xs">{t.issued}: {time(evaluation.forecast.issuedAt)}</p> : evaluation.forecast.source === "cams" && <p className="text-xs">{t.issuanceUnknown}</p>}
        <p className="text-sm">{t.coverage}: {num(evaluation.forecast.validPoints)} {t.availablePoints} / {num(evaluation.forecast.expectedPoints)} {t.expectedPoints}; {num(evaluation.forecast.missingPoints)} {t.missingPoints}.</p>
        <p className="text-xs">{evaluation.forecast.complete ? t.complete : t.partial}</p>
        {evaluation.forecast.firstTime && evaluation.forecast.lastTime && <p className="text-xs">{time(evaluation.forecast.firstTime)} → {time(evaluation.forecast.lastTime)}</p>}
        <p className="text-xs">{t.forecastWindow}: {t.exclusiveStart} {time(evaluation.evaluatedAt)} → {t.inclusiveEnd} {time(new Date(Date.parse(evaluation.evaluatedAt) + preferences.lookAheadHours * 3_600_000).toISOString())}</p>
        {evaluation.forecast.status === "available" && eventsFor("forecast")}
        <p className="text-xs text-[var(--muted)]">{t.discrete}</p>
      </section>
      <div className="panel space-y-1 p-3 text-xs text-[var(--muted)]">{evaluation.fetchedAt && <p>{t.fetched}: {time(evaluation.fetchedAt)}</p>}<p>{t.evaluated}: {time(evaluation.evaluatedAt)} · Asia/Dhaka</p></div>
    </>}
    <section className={CARD} aria-labelledby="alerts-actions-title">
      <h2 id="alerts-actions-title" className="text-lg font-bold">{t.actions}</h2><p className="text-sm text-[var(--muted)]">{t.actionNote}</p>
      <div className="grid gap-3 sm:grid-cols-2">{[["/exposure", t.exposure], ["/travel", t.travel], ["/simulator", t.simulator], ["/diary", t.diary]].map(([href, label]) =>
        <Link key={href} href={href} prefetch={false} className="back-link">{label} →</Link>)}
      </div>
    </section>
    <footer className="panel space-y-3 p-4 text-xs leading-relaxed text-[var(--muted)]"><p>{t.limits}</p><p>{t.privacy}</p>
      <a className="inline-block min-h-11 underline" href="https://open-meteo.com/">CAMS / Open-Meteo (CC BY 4.0)</a>
    </footer>
  </main>;
}
