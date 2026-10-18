"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AirReport } from "@/lib/air";
import { forecastWindow, isCompleteForecast, isFreshModelIssue, readAirReport, readCurrent, readWeather } from "@/lib/air-validation";
import { LEVEL_COLORS, pm25ToAqi } from "@/lib/aqi";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_DASHBOARD_LOCATION, restoreDashboardLocation, type DashboardLocation } from "@/lib/dashboard-location";
import { PLACES, nearestPlace, placeLabel, searchPlaces } from "@/lib/places";
import { readGpsPosition } from "@/lib/location";
import { ForecastChart } from "./ForecastChart";
import { Icon, type IconName } from "./Icon";
import { PlaceOptions } from "./PlaceOptions";
import { SlotIcon } from "./SlotIcon";
import { HowToUse } from "./HowToUse";

type Loc = DashboardLocation;
type LoadState = { location: Loc; revision: number; report: AirReport | null; status: "loading" | "ready" | "error" };
const DEFAULT = DEFAULT_DASHBOARD_LOCATION;
const LOCATION_WORDS = {
  en: { search: "Search area or city", placeholder: "Try Uttara, Mirpur or Sylhet", empty: "No match. Pick from the list or tap My location.",
    denied: "Location permission was denied. Pick a place, or allow location in your browser and try again.", unavailable: "GPS is unavailable. Pick a place or try again outdoors.", timeout: "Location request timed out. Try again or pick a place.", outside: "This point is outside supported Bangladesh coverage. Pick a place in Bangladesh.", invalid: "GPS gave unusable data. Try again or pick a place.", expired: "The GPS reading is too old. Try again for a new one.", poor: "GPS accuracy is worse than 1,000 metres. Try again outdoors or pick a place.", locating: "Finding your location… You can pick a place meanwhile.",
    privacy: "Your place is saved only in this browser. GPS runs only when you tap My location.",
    accuracy: "GPS accuracy", unknown: "GPS accuracy is unavailable.", captured: "GPS captured", saved: "Saved GPS point.", city: "Using the centre of the place you picked.", source: "Air numbers come from a wide-area model, not a sensor on your street. Nearby areas can show the same value.", grid: "Model grid centre", selected: "Picked at",
    areaNote: "Neighbourhoods use their approximate centre." },
  bn: { search: "এলাকা বা শহর খুঁজুন", placeholder: "যেমন উত্তরা, মিরপুর, সিলেট", empty: "কিছু পাওয়া যায়নি। লিস্ট থেকে বাছুন বা “আমার লোকেশন” চাপুন।",
    denied: "লোকেশনের অনুমতি দেওয়া হয়নি। একটি জায়গা বাছুন, অথবা ব্রাউজারে অনুমতি দিয়ে আবার চেষ্টা করুন।", unavailable: "GPS পাওয়া যাচ্ছে না। একটি জায়গা বাছুন বা বাইরে গিয়ে আবার চেষ্টা করুন।", timeout: "লোকেশন পেতে বেশি সময় লাগছে। আবার চেষ্টা করুন বা জায়গা বাছুন।", outside: "জায়গাটি বাংলাদেশের বাইরে। বাংলাদেশের একটি জায়গা বাছুন।", invalid: "GPS-এর তথ্য ঠিক নেই। আবার চেষ্টা করুন বা জায়গা বাছুন।", expired: "GPS-এর তথ্য পুরোনো। নতুন তথ্যের জন্য আবার চেষ্টা করুন।", poor: "GPS ঠিকমতো ধরছে না (১,০০০ মিটারের বেশি ভুল হতে পারে)। বাইরে গিয়ে চেষ্টা করুন বা জায়গা বাছুন।", locating: "আপনার লোকেশন খোঁজা হচ্ছে… এর মধ্যে জায়গাও বাছতে পারেন।",
    privacy: "আপনার জায়গা শুধু এই ব্রাউজারে জমা থাকে। “আমার লোকেশন” চাপলেই GPS চলে।",
    accuracy: "GPS-এর ভুলের সীমা", unknown: "GPS কতটা নির্ভুল, তা জানা নেই।", captured: "GPS নেওয়ার সময়", saved: "জমা রাখা GPS লোকেশন।", city: "আপনার বাছা জায়গার মাঝামাঝি বিন্দু ধরা হয়েছে।", source: "বাতাসের সংখ্যা বড় এলাকার মডেল থেকে আসে, আপনার রাস্তার সেন্সর থেকে নয়। কাছাকাছি এলাকায় একই সংখ্যা দেখা যেতে পারে।", grid: "মডেলের ঘরের কেন্দ্র", selected: "বাছাইয়ের সময়",
    areaNote: "এলাকার আনুমানিক মাঝামাঝি বিন্দু ধরা হয়।" },
};
const WORDS = {
  en: { complete: "24-hour forecast window", partial: "Partial forecast coverage", coverage: "Coverage window",
    issued: "Model issued", retrieved: "API retrieved", reading: "Reading valid time", unknown: "Source issuance time is not supplied; retrieval is not model generation.",
    expired: "Data expired. Refresh data.", refresh: "Refresh data", clock: "All times are Bangladesh time (Asia/Dhaka).",
    place: "Place", near: "near", loading: "Loading air-quality data…", actions: "What would you like to do?",
    currentContext: "A recent current estimate is available.", forecastContext: "Forecast is available for the next hours.",
    noContext: "No recent air data. Refresh, or pick another place.",
    confirm: "Each tool loads fresh data when you open it.",
    exposure: "Personal exposure", exposureHint: "See how much pollution you breathe for an activity.",
    travel: "Smart travel planner", travelHint: "Find the best time to leave.",
    simulator: "Compare plans", simulatorHint: "Leave now or later? Walk or rickshaw? See which plan means less pollution.",
    diary: "Exposure diary", diaryHint: "Keep notes of your days outside.",
    alerts: "Pollution alerts", alertsHint: "Get notified when PM2.5 crosses your limit." },
  bn: { complete: "আগামী ২৪ ঘণ্টার পূর্বাভাস", partial: "অল্প সময়ের পূর্বাভাস", coverage: "পূর্বাভাসের সময়",
    issued: "মডেল তৈরির সময়", retrieved: "তথ্য আনার সময়", reading: "তথ্য কোন সময়ের", unknown: "মডেল কখন তৈরি হয়েছে, তা জানা নেই। তথ্য আনার সময়ই মডেল তৈরির সময় নয়।",
    expired: "তথ্য পুরোনো হয়ে গেছে। আবার আনুন।", refresh: "আবার আনুন", clock: "সব সময় বাংলাদেশের সময়ে।",
    place: "স্থান", near: "কাছে", loading: "বাতাসের তথ্য আনা হচ্ছে…", actions: "এখন কী করবেন?",
    currentContext: "এখনকার তথ্য পাওয়া গেছে।", forecastContext: "আগামী কয়েক ঘণ্টার পূর্বাভাস আছে।",
    noContext: "নতুন তথ্য নেই। আবার আনুন, অথবা অন্য জায়গা বাছুন।",
    confirm: "প্রতিটি টুল খোলার সময় নতুন তথ্য আনে।",
    exposure: "ব্যক্তিগত এক্সপোজার", exposureHint: "কোনো কাজে কতটা দূষণ শ্বাসে যাবে, দেখুন।",
    travel: "যাত্রার সময় ঠিক করুন", travelHint: "কখন বের হলে ভালো, জেনে নিন।",
    simulator: "প্ল্যান তুলনা", simulatorHint: "এখন বের হবেন নাকি পরে? হেঁটে নাকি রিকশায়? কোন প্ল্যানে দূষণ কম, দেখুন।",
    diary: "এক্সপোজার ডায়েরি", diaryHint: "বাইরে কাটানো সময়ের নোট রাখুন।",
    alerts: "দূষণের সতর্কবার্তা", alertsHint: "PM2.5 আপনার সীমা ছাড়ালে জানতে পারবেন।" },
};

export function Dashboard() {
  const { t, lang, setLang, num } = useI18n();
  const [loc, setLoc] = useState<Loc>(DEFAULT);
  const [restored, setRestored] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState<LoadState>({ location: DEFAULT, revision: 0, report: null, status: "loading" });
  const [locMsg, setLocMsg] = useState<"denied" | "unavailable" | "timeout" | "outside" | "invalid" | "expired" | "poor" | "locating" | null>(null);
  const [search, setSearch] = useState("");
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoRequest = useRef(0);
  const words = WORDS[lang];
  const locationWords = LOCATION_WORDS[lang];
  const matches = searchPlaces(search, 9);

  useEffect(() => {
    setLoc(restoreDashboardLocation(() => localStorage.getItem("nirmol.loc")));
    setRestored(true);
    return () => { geoRequest.current += 1; if (geoTimer.current) clearTimeout(geoTimer.current); };
  }, []);

  useEffect(() => {
    if (!restored) return;
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(() => {
      controller.abort();
      if (active) setLoaded({ location: loc, revision, report: null, status: "error" });
    }, 15000);
    setLoaded({ location: loc, revision, report: null, status: "loading" });
    fetch(`/api/air?lat=${loc.lat}&lon=${loc.lon}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Air request failed");
        return readAirReport(await response.json(), loc, Date.now());
      })
      .then((report) => {
        if (active && !controller.signal.aborted) {
          setLoaded({ location: loc, revision, report, status: "ready" });
        }
      })
      .catch(() => {
        if (active) setLoaded({ location: loc, revision, report: null, status: "error" });
      }).finally(() => window.clearTimeout(timer));
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, [loc, revision, restored]);

  // Object identity also distinguishes A → B → A and hides stale data during
  // the render before effect cleanup. Retry has its own request revision.
  const ownsRequest = loaded.location === loc && loaded.revision === revision;
  const report = ownsRequest ? loaded.report : null;
  const status = ownsRequest ? loaded.status : "loading";

  const chooseLoc = (next: Loc) => {
    // A newer selection owns the location even if an earlier GPS call finishes.
    geoRequest.current += 1;
    if (geoTimer.current) clearTimeout(geoTimer.current);
    setLocMsg(null);
    setSearch("");
    setLoc(next);
    try {
      localStorage.setItem("nirmol.loc", JSON.stringify(next));
    } catch {}
  };

  const useMyLocation = () => {
    const request = ++geoRequest.current;
    if (geoTimer.current) clearTimeout(geoTimer.current);
    if (!navigator.geolocation) return setLocMsg("unavailable");
    setLocMsg("locating");
    // Browsers cannot cancel getCurrentPosition. Invalidate callbacks on timeout,
    // repeated attempts, manual selection and unmount, including broken transports.
    geoTimer.current = setTimeout(() => {
      if (request === geoRequest.current) { geoRequest.current += 1; setLocMsg("timeout"); }
    }, 11000);
    try { navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (request !== geoRequest.current) return;
        if (geoTimer.current) clearTimeout(geoTimer.current);
        geoRequest.current += 1;
        const result = readGpsPosition(pos, Date.now());
        if (!result.ok) return setLocMsg(result.reason);
        chooseLoc({ lat: result.lat, lon: result.lon, placeId: null, evidence: result.evidence });
      },
      (error) => { if (request === geoRequest.current) {
        geoRequest.current += 1;
        if (geoTimer.current) clearTimeout(geoTimer.current);
        setLocMsg(error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable");
      } },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
    ); } catch { if (geoTimer.current) clearTimeout(geoTimer.current); geoRequest.current += 1; setLocMsg("unavailable"); }
  };

  const chooseCity = (p: typeof PLACES[number]) => chooseLoc({ lat: p.lat, lon: p.lon, placeId: p.id,
    evidence: { source: "manual-city", selectedAt: new Date().toISOString(), coverage: "BD-ADM0-71232402" } });

  const placeName = loc.placeId
    ? placeLabel(PLACES.find((p) => p.id === loc.placeId) ?? PLACES[0], lang)
    : `${t.myLocation} · ${words.near} ${nearestPlace(loc.lat, loc.lon).name[lang]}`;

  return (
    <main className="dashboard shell-width flex flex-col gap-6 pb-16 pt-6 lg:pt-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{lang === "bn" ? "বায়ুমানের সারসংক্ষেপ" : "Air quality overview"}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.tagline}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-[var(--soft)]"><Icon name="login" size={18} />{lang === "bn" ? "সাইন ইন" : "Sign in"}<span className="sr-only">{lang === "bn" ? " / অ্যাকাউন্ট তৈরি" : " / Create account"}</span></Link>
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium hover:bg-[var(--soft)]"
            aria-label={`Switch language: ${lang === "bn" ? "English" : "বাংলা"}`}
          >
            {lang === "bn" ? "English" : "বাংলা"}
          </button>
        </div>
      </header>

      <section aria-label={lang === "bn" ? "লোকেশন বাছাই" : "Location selection"} className="panel grid gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SlotIcon name="pin" tone="teal" className="hidden sm:inline-grid" />
          <select
            value={loc.placeId ?? ""}
            onChange={(e) => {
              const p = PLACES.find((x) => x.id === e.target.value);
              if (p) chooseCity(p);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base"
            aria-label={words.place}
          >
            {!loc.placeId && <option value="">{placeName}</option>}
            <PlaceOptions />
          </select>
          <button onClick={useMyLocation} className="dashboard-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold">
            <Icon name="pin" size={18} />{t.useMyLocation}
          </button>
        </div>
        {locMsg && <p role="status" className="text-sm text-[var(--muted)]">{locationWords[locMsg]}</p>}
        <div>
          <label className="text-xs font-medium text-[var(--muted)]" htmlFor="location-search">{locationWords.search}</label>
          <div className="relative mt-1">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input id="location-search" type="search" value={search} maxLength={80} placeholder={locationWords.placeholder} onChange={(e) => setSearch(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-base" />
          </div>
        </div>
        {search.trim() && <div aria-live="polite">{matches.length ? <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{matches.map((p) => <li key={p.id}><button type="button" className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-sm hover:bg-[var(--soft)]" onClick={() => chooseCity(p)}>{p.name[lang]}{p.city && <span className="block text-xs text-[var(--muted)]">{PLACES.find((c) => c.id === p.city)?.name[lang]}</span>}</button></li>)}</ul> : <p className="text-sm">{locationWords.empty}</p>}</div>}
      </section>

      {status === "error" && (
        <div role="alert" className="panel p-6 text-center">
          <p>{t.error}</p>
          <button onClick={() => setRevision((value) => value + 1)} className="dashboard-primary mt-3 min-h-11 rounded-xl px-4 py-2 text-sm font-semibold">
            {t.retry}
          </button>
        </div>
      )}

      {status === "loading" && !report && <><p role="status" className="sr-only">{words.loading}</p><Skeleton /></>}

      {report && status !== "error" ? <Report report={report} placeName={placeName} onRefresh={() => setRevision((value) => value + 1)} />
        : <Actions current={false} forecast={false} />}

      <HowToUse />

      <section aria-label={lang === "bn" ? "লোকেশনের তথ্য" : "About your location"} className="panel grid gap-1 p-4 text-xs leading-relaxed text-[var(--muted)]">
        <p>{locationWords.privacy}</p>
        <p className="break-words">{loc.placeId ? (PLACES.find((p) => p.id === loc.placeId)?.city ? locationWords.areaNote : locationWords.city) : locationWords.saved}
          {loc.evidence && <> {locationWords.selected}: <time dateTime={loc.evidence.selectedAt}>{new Date(loc.evidence.selectedAt).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka" })}</time>.</>}
          {loc.evidence?.source === "gps" && <> {typeof loc.evidence.accuracyM !== "number" ? locationWords.unknown : `${locationWords.accuracy}: ${num(loc.evidence.accuracyM)} m.`} {locationWords.captured}: <time dateTime={loc.evidence.capturedAt}>{new Date(loc.evidence.capturedAt!).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka" })}</time>.</>}
        </p>
      </section>

      <footer className="panel p-4 text-xs leading-relaxed text-[var(--muted)]">
        {t.notMedical} Data: CAMS via{" "}
        <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>{" "}
        (CC BY 4.0). {num(new Date().getFullYear())}
      </footer>
    </main>
  );

}

function Report({ report, placeName, onRefresh }: { report: AirReport; placeName: string; onRefresh: () => void }) {
    const { t, lang, num } = useI18n();
    const words = WORDS[lang];
    const [showSource, setShowSource] = useState(false);
    // Stable component identity preserves selected-hour state and keyboard focus.
    const [clock, setClock] = useState(() => Date.now());
    useEffect(() => {
      const tick = () => setClock(Date.now());
      const timer = window.setInterval(tick, 1000);
      document.addEventListener("visibilitychange", tick);
      return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
    }, []);
    const freshFetch = isFreshModelIssue(report.fetchedAt, clock);
    const weather = readWeather(report.weather, clock);
    const current = freshFetch ? readCurrent(report.now, clock) : { ...report.now, pm25: null, time: "" };
    const forecastFresh = freshFetch && (report.forecastIssuedAt === undefined || isFreshModelIssue(report.forecastIssuedAt, clock));
    const forecast = forecastFresh ? forecastWindow(report.forecast, clock) : [];
    const expired = !freshFetch || !forecastFresh || (report.now.pm25 !== null && current.pm25 === null);
    const pm = current.pm25;
    const aqi = pm == null ? null : pm25ToAqi(pm);
    const ageMin = Math.floor((clock - new Date(current.time).getTime()) / 60000);
    const age = ageMin < 90 ? t.minutesAgo(ageMin) : t.hoursAgo(Math.round(ageMin / 60));

    const valid = forecast.filter((p) => p.pm25 != null) as { time: string; pm25: number }[];
    const peak = valid.reduce((a, b) => (b.pm25 > a.pm25 ? b : a), valid[0]);
    const low = valid.reduce((a, b) => (b.pm25 < a.pm25 ? b : a), valid[0]);
    const hour = (iso: string) =>
      new Date(iso).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-GB", { hour: "numeric", minute: "2-digit", hour12: lang !== "bn", timeZone: "Asia/Dhaka" });
    const timestamp = (iso: string) => <time dateTime={iso}>{new Date(iso).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
      timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
    })}</time>;

    return (
      <>
        <section className="grid items-start gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="rounded-[14px] bg-[var(--hero)] p-6 text-[var(--hero-ink)] shadow-sm sm:p-7 lg:col-span-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-[var(--hero-muted)]">
                  {placeName} · {t.pm25Now}
                </p>
                <p className="mt-2 break-words text-5xl font-semibold tabular-nums sm:text-6xl">
                  {pm == null ? t.unavailable : num(Math.round(pm))}
                  {pm != null && <span className="ml-2 text-lg font-medium text-[var(--hero-muted)]">µg/m³</span>}
                </p>
                {aqi && <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span data-aqi-level={aqi.level} className="inline-block max-w-full rounded-full px-3 py-1 text-sm font-semibold" style={{ background: LEVEL_COLORS[aqi.level], color: aqi.level === "hazardous" ? "#ffffff" : "#111111" }}>
                    {t.levels[aqi.level]}
                  </span>
                  <span className="text-sm text-[var(--hero-muted)]">{t.aqiLabel}: <strong className="text-base font-semibold tabular-nums text-[var(--hero-ink)]">{num(aqi.aqi)}</strong></span>
                </div>}
              </div>
              <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-[var(--hero-chip)] sm:grid"><Icon name="wind" size={28} /></span>
            </div>
            {aqi && <p className="mt-5 rounded-xl bg-[var(--hero-chip)] p-3 text-sm leading-relaxed">{t.advice[aqi.level]}</p>}
            <Link href="/reports" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0f5f59] hover:bg-[#f0fdfa]"><Icon name="flag" size={18} />{lang === "bn" ? "দূষণের উৎস রিপোর্ট" : "Report a pollution source"}</Link>
          </div>

          <div className="grid gap-4 lg:col-span-5">
            <div className="panel grid grid-cols-3 divide-x divide-[var(--border)] py-2">
              <Stat label={t.temperature} value={freshFetch ? weather.temperature : null} unit="°C" icon="thermometer" tone="sun" />
              <Stat label={t.humidity} value={freshFetch ? weather.humidity : null} unit="%" icon="droplet" tone="sky" />
              <Stat label={t.wind} value={freshFetch ? weather.windSpeed : null} unit="km/h" icon="wind" tone="teal" />
            </div>
            <div className="panel p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 font-medium">
                  {pm === null ? t.unavailable : report.now.source === "nirmol" ? t.sourceNirmol : t.sourceCams}
                </span>
                {pm !== null && Number.isFinite(ageMin) && ageMin >= 0 && <span className="text-[var(--muted)]">
                  {t.updated} {age}
                </span>}
                <button onClick={() => setShowSource(!showSource)} aria-expanded={showSource} aria-controls="dashboard-source-details" className="inline-flex min-h-11 items-center gap-1 text-[var(--accent)] underline">
                  <Icon name="info" size={14} />{t.whatIsThis}
                </button>
              </div>
              {showSource && <p id="dashboard-source-details" className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t.sourceExplain}</p>}
              <div className="mt-1 grid gap-1 text-xs text-[var(--muted)] sm:grid-cols-2">
                {pm !== null && <p>{words.reading}: {timestamp(current.time)}</p>}
                {current.issuedAt && <p>{words.issued}: {timestamp(current.issuedAt)}</p>}
              </div>
              {aqi && <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{t.aqiGuidance} <a className="underline" href="https://www.airnow.gov/aqi/aqi-basics/using-air-quality-index/" target="_blank" rel="noreferrer">AirNow</a></p>}
              {report.forecastSource === "cams" && (
                <p className="warn-note mt-3 p-3 text-xs leading-relaxed">{t.camsWarning}</p>
              )}
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <section data-testid="dashboard-forecast" className="panel min-w-0 p-5 lg:col-span-2">
            <div className="mb-1 flex items-center gap-2">
              <Icon name="trend" size={18} className="text-[var(--accent)]" />
              <h2 className="font-semibold">{isCompleteForecast(forecast, clock) ? words.complete : words.partial}</h2>
            </div>
            <p className="mb-2 text-xs text-[var(--muted)]">
              {report.forecastSource === "nirmol" ? t.sourceNirmol : t.sourceCams}
            </p>
            {valid.length > 0 && (
              <p className="mb-3 text-xs text-[var(--muted)]">
                {t.peak}: {num(Math.round(peak.pm25))} µg/m³ ({hour(peak.time)}) · {t.lowest}: {num(Math.round(low.pm25))} µg/m³ (
                {hour(low.time)})
              </p>
            )}
            <ForecastChart points={forecast} source={report.forecastSource} />
            <div className="mt-3 space-y-1 break-words text-xs text-[var(--muted)]">
              {report.forecastIssuedAt ? <p>{words.issued}: {timestamp(report.forecastIssuedAt)}</p> : <p>{words.unknown}</p>}
              <p>{words.retrieved}: {timestamp(report.fetchedAt)}</p>
              {forecast.length > 0 && <p>{words.coverage}: {timestamp(forecast[0].time)} → {timestamp(forecast[forecast.length - 1].time)}</p>}
              <p>{words.clock}</p>
              {expired && <p role="status">{words.expired}</p>}
              <button onClick={onRefresh} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-3 font-medium text-[var(--foreground)] hover:bg-[var(--soft)]"><Icon name="refresh" size={16} />{words.refresh}</button>
            </div>
          </section>
          <div className="grid min-w-0 gap-6">
            <Actions current={pm !== null} forecast={valid.length > 0} />
            <aside className="panel p-4 text-xs leading-relaxed text-[var(--muted)]">
              {LOCATION_WORDS[lang].source}
              {report.camsGrid && <p className="mt-2">{LOCATION_WORDS[lang].grid}: {num(report.camsGrid.lat)}, {num(report.camsGrid.lon)}</p>}
            </aside>
          </div>
        </div>
      </>
    );
}

function Stat({ label, value, unit, icon, tone }: { label: string; value: number | null; unit: string; icon: IconName; tone: "sun" | "sky" | "teal" }) {
    const { num } = useI18n();
    return (
      <div className="flex min-w-0 items-center gap-3 px-3 py-2 sm:px-4">
        <SlotIcon name={icon} tone={tone} className="hidden shrink-0 sm:inline-grid" />
        <div className="min-w-0">
          <p className="truncate text-xs text-[var(--muted)]">{label}</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">
            {value == null ? "—" : num(Math.round(value))}
            <span className="ml-1 text-sm font-normal text-[var(--muted)]">{unit}</span>
          </p>
        </div>
      </div>
    );
  }

const TOOLS = [
  { href: "/exposure", key: "exposure", icon: "activity", tone: "teal" },
  { href: "/travel", key: "travel", icon: "route", tone: "sky" },
  { href: "/simulator", key: "simulator", icon: "sliders", tone: "leaf" },
  { href: "/diary", key: "diary", icon: "book", tone: "sun" },
  { href: "/alerts", key: "alerts", icon: "bell", tone: "teal" },
] as const;

function Actions({ current, forecast }: { current: boolean; forecast: boolean }) {
  const { lang } = useI18n();
  const words = WORDS[lang];
  return <section aria-labelledby="dashboard-actions" className="panel p-5">
    <h2 id="dashboard-actions" className="font-semibold">{words.actions}</h2>
    <p className="mt-2 text-sm text-[var(--muted)]">{current && `${words.currentContext} `}{forecast && words.forecastContext}{!current && !forecast && words.noContext}</p>
    <p className="mt-2 text-xs text-[var(--muted)]">{words.confirm}</p>
    <ul className="mt-4 grid gap-2">
      {TOOLS.map(({ href, key, icon, tone }) => <li key={href}>
        <Link href={href} prefetch={false} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] p-3 hover:bg-[var(--soft)]">
          <SlotIcon name={icon} tone={tone} />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{words[key]}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--muted)]">{words[`${key}Hint`]}</span>
          </span>
          <Icon name="arrow" size={16} className="shrink-0 text-[var(--muted)]" />
        </Link>
      </li>)}
    </ul>
  </section>;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-56 animate-pulse rounded-[14px] bg-[var(--soft)]" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-[14px] bg-[var(--soft)]" />
        <div className="h-24 animate-pulse rounded-[14px] bg-[var(--soft)]" />
        <div className="h-24 animate-pulse rounded-[14px] bg-[var(--soft)]" />
      </div>
      <div className="h-72 animate-pulse rounded-[14px] bg-[var(--soft)]" />
    </div>
  );
}
