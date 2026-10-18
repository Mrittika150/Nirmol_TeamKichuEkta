"use client";

import { restoreDashboardLocation } from "@/lib/dashboard-location";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ACTIVITY_FACTORS, DEFAULT_EXPOSURE_PROFILE, isValidDuration,
  type ActivityLevel, type AgeGroup, type Sensitivity,
} from "@/lib/exposure";
import { PlaceOptions } from "./PlaceOptions";
import { useI18n } from "@/lib/i18n";
import { nearestPlace, PLACES } from "@/lib/places";
import {
  dhakaInput, isFreshTravelReport, parseDhakaInput, planTravel, readTravelAir,
  type TravelAir, type TravelOption, type TravelPlan,
} from "@/lib/travel";

const WORDS = {
  en: {
    back: "Back to dashboard", heading: "Best time to leave", intro: "Tell us when you can leave and how long the trip takes. We'll find the time with the least pollution.",
    place: "Location", saved: "Saved location near", earliest: "Leave from", latest: "Leave by",
    clock: "All times are Dhaka time. If your window goes past midnight, pick the next date for the end.",
    duration: "Trip length (hours)", age: "Age group", child: "Under 12", adult: "12–65", elderly: "Over 65",
    activity: "Activity", rest: "Resting / sitting", walking: "Walking", heavy: "Cycling / hard physical work",
    sensitivity: "Health conditions (optional)", respiratory: "Breathing problems (asthma etc.)", heart: "Heart problems", pregnant: "Pregnant",
    loading: "Loading forecast...", error: "Couldn't load the forecast. Tap refresh to try again.", refresh: "Refresh forecast",
    invalid: "Pick a window of up to 24 hours (start before end) and a trip longer than 0, up to 24 hours.",
    noOptions: "We don't have forecast data for every hour of these times. Change the times or trip length, or refresh.",
    recommended: "Best time to leave", alternatives: "Other good times", all: "More options",
    relative: "This time has the lowest pollution of your options. If two are equal, we pick the earlier one. It isn't a safety guarantee.",
    arrival: "Arrival", indicator: "Exposure score (µg·h/m³)",
    low: "Low", moderate: "Moderate", high: "High", very_high: "Very high",
    compared: "Times compared", excluded: "Times skipped (already passed, too far ahead, or missing forecast)",
    resolution: "We check every minute in your window, but the forecast itself is hourly.",
    source: "Forecast source", cams: "CAMS model estimate (Copernicus)", nirmol: "Nirmol model estimate (corrected CAMS)",
    fetched: "Data fetched", issued: "Model updated", coverage: "Forecast hours", run: "These are forecasts, not measurements.",
    method: "Each hour's forecast is used until the next hour. Exposure = PM2.5 × hours outside × activity level. Missing hours are not filled in.",
    limits: "Forecasts can be wrong, and pollution varies from street to street. This compares leaving times from one place; it doesn't plan your route or include traffic or the air inside a vehicle.",
    provisional: "The levels are Nirmol's own rough guide, not official limits. The score isn't the AQI or a health-risk score.",
    sensitive: "Age or health changes the level we show, not the score.",
    privacy: "Your choices stay on this page. Nothing is saved or sent.",
  },
  bn: {
    back: "ড্যাশবোর্ডে ফিরুন", heading: "কখন বের হবেন", intro: "কখন বের হতে পারবেন আর যাত্রায় কতক্ষণ লাগবে জানান। সবচেয়ে কম দূষণের সময়টা আমরা খুঁজে দেব।",
    place: "এলাকা", saved: "সেভ করা লোকেশন, কাছাকাছি", earliest: "কখন থেকে", latest: "কখনের মধ্যে",
    clock: "সব সময় ঢাকার সময়ে। সময় মধ্যরাত পার হলে শেষের জন্য পরের তারিখ বেছে নিন।",
    duration: "যাত্রার সময় (ঘণ্টা)", age: "বয়স", child: "১২ বছরের কম", adult: "১২–৬৫ বছর", elderly: "৬৫ বছরের বেশি",
    activity: "কাজের ধরন", rest: "বিশ্রাম / বসে থাকা", walking: "হাঁটা", heavy: "সাইকেল চালানো / ভারী কাজ",
    sensitivity: "স্বাস্থ্য সমস্যা (ঐচ্ছিক)", respiratory: "শ্বাসের সমস্যা (হাঁপানি ইত্যাদি)", heart: "হার্টের সমস্যা", pregnant: "গর্ভবতী",
    loading: "পূর্বাভাস আনা হচ্ছে...", error: "পূর্বাভাস লোড করা যায়নি। আবার চেষ্টা করতে রিফ্রেশ চাপুন।", refresh: "পূর্বাভাস আবার আনুন",
    invalid: "২৪ ঘণ্টার মধ্যে একটি সময় বেছে নিন (শুরু আগে, শেষ পরে), আর যাত্রার সময় ০ থেকে ২৪ ঘণ্টার মধ্যে দিন।",
    noOptions: "এই সময়ের প্রতিটি ঘণ্টার পূর্বাভাস নেই। সময় বা যাত্রার দৈর্ঘ্য বদলান, অথবা রিফ্রেশ করুন।",
    recommended: "বের হওয়ার সেরা সময়", alternatives: "অন্য ভালো সময়", all: "আরও অপশন",
    relative: "আপনার অপশনগুলোর মধ্যে এই সময়ে দূষণ সবচেয়ে কম। দুটো সমান হলে আগেরটা দেখানো হয়। এটা নিরাপত্তার নিশ্চয়তা নয়।",
    arrival: "পৌঁছানোর সময়", indicator: "এক্সপোজার স্কোর (µg·h/m³)",
    low: "কম", moderate: "মাঝারি", high: "বেশি", very_high: "অনেক বেশি",
    compared: "যে সময়গুলো তুলনা করা হয়েছে", excluded: "যে সময়গুলো বাদ গেছে (পার হয়ে গেছে, অনেক পরে, বা পূর্বাভাস নেই)",
    resolution: "আপনার সময়ের প্রতিটি মিনিট চেক করা হয়, তবে পূর্বাভাস ঘণ্টাভিত্তিক।",
    source: "পূর্বাভাসের উৎস", cams: "CAMS মডেলের হিসাব (Copernicus)", nirmol: "নির্মল মডেলের হিসাব (CAMS সংশোধিত)",
    fetched: "তথ্য আনার সময়", issued: "মডেল আপডেট", coverage: "পূর্বাভাসের ঘণ্টা", run: "এগুলো পূর্বাভাস, মাপা মান নয়।",
    method: "প্রতি ঘণ্টার পূর্বাভাস পরের ঘণ্টা পর্যন্ত ধরা হয়। এক্সপোজার = PM2.5 × বাইরে থাকার ঘণ্টা × কাজের ধরন। যে ঘণ্টার তথ্য নেই তা আন্দাজে ভরা হয় না।",
    limits: "পূর্বাভাস ভুল হতে পারে, আর রাস্তাভেদে দূষণ আলাদা হয়। এটা একটি জায়গা থেকে বের হওয়ার সময় তুলনা করে; রুট ঠিক করে না, ট্রাফিক বা গাড়ির ভেতরের বাতাস ধরে না।",
    provisional: "লেভেলগুলো নির্মলের নিজস্ব আনুমানিক গাইড, অফিসিয়াল সীমা নয়। স্কোরটা AQI বা স্বাস্থ্যঝুঁকির স্কোর নয়।",
    sensitive: "বয়স বা স্বাস্থ্যের কারণে দেখানো লেভেল বদলায়, স্কোর নয়।",
    privacy: "আপনার বাছাই শুধু এই পেজেই থাকে। কিছু সেভ বা পাঠানো হয় না।",
  },
} as const;

type Location = { lat: number; lon: number; placeId: string | null };
type AirState = { key: string; report: TravelAir | null; status: "ready" | "error" };
const INITIAL_LOCATION: Location = { ...PLACES[0], placeId: PLACES[0].id };
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const FIELD = `mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base ${FOCUS}`;
const CARD = "min-w-0 space-y-3 panel p-4 sm:p-5";

export function TravelPlanner() {
  const { lang, setLang, num } = useI18n();
  const t = WORDS[lang];
  const [location, setLocation] = useState<Location>(INITIAL_LOCATION);
  const [restored, setRestored] = useState(false);
  const [profile, setProfile] = useState(() => ({
    ageGroup: DEFAULT_EXPOSURE_PROFILE.ageGroup, activity: DEFAULT_EXPOSURE_PROFILE.activity,
    sensitivities: [] as Sensitivity[],
  }));
  const [duration, setDuration] = useState("1");
  const [windowInput, setWindowInput] = useState<{ earliest: string; latest: string } | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [airState, setAirState] = useState<AirState | null>(null);
  const [refresh, setRefresh] = useState(0);
  const key = `${location.lat},${location.lon},${refresh}`;
  const status = airState?.key === key ? airState.status : "loading";
  const report = airState?.key === key ? airState.report : null;

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const start = Math.ceil(Date.now() / 60_000) * 60_000;
    setWindowInput({ earliest: dhakaInput(start), latest: dhakaInput(start + 6 * 3_600_000) });
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); };
  }, []);

  useEffect(() => {
    setLocation(restoreDashboardLocation(() => localStorage.getItem("nirmol.loc")));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (active) setAirState({ key, report: null, status: "error" });
    }, 15000);
    fetch(`/api/air?lat=${location.lat}&lon=${location.lon}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Forecast request failed");
        return readTravelAir(await response.json(), location, Date.now());
      })
      .then((report) => {
        if (active && !controller.signal.aborted) setAirState({ key, report, status: "ready" });
      })
      .catch(() => { if (active) setAirState({ key, report: null, status: "error" }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [key, location, restored]);

  const outdoorHours = duration.trim() ? Number(duration) : NaN;
  const earliest = parseDhakaInput(windowInput?.earliest ?? "");
  const latest = parseDhakaInput(windowInput?.latest ?? "");
  const validInput = isValidDuration(outdoorHours) && Number.isFinite(earliest) && Number.isFinite(latest) &&
    latest >= earliest && latest - earliest <= 24 * 3_600_000;
  const fresh = report !== null && nowMs !== null && isFreshTravelReport(report, nowMs);
  let plan: TravelPlan | null = null;
  let invalidForecast = false;
  if (validInput && fresh) {
    try { plan = planTravel(report.forecast, earliest, latest, { ...profile, outdoorHours }, nowMs); }
    catch { invalidForecast = true; }
  }
  const best = plan?.options[0];
  const formatTime = (ms: number) => new Date(ms).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short",
  });
  const optionContent = (option: TravelOption) => <>
    <p className="font-semibold"><time dateTime={new Date(option.departureMs).toISOString()}>{formatTime(option.departureMs)}</time></p>
    <p className="text-sm">{t.arrival}: <time dateTime={new Date(option.arrivalMs).toISOString()}>{formatTime(option.arrivalMs)}</time></p>
    <p className="text-xl font-bold tabular-nums" data-testid="travel-indicator">{num(option.indicator.toFixed(1))} <span className="text-sm font-normal">µg·h/m³</span></p>
    <p className="text-sm">{t[option.band]}</p>
  </>;
  const forecastTimes = report?.forecast.map((p) => Date.parse(p.time)).sort((a, b) => a - b) ?? [];

  return <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6 lg:pt-8" lang={lang}>
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className={`back-link ${FOCUS}`}>← {t.back}</Link>
      <button type="button" className={`min-h-11 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 ${FOCUS}`}
        onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "English" : "বাংলা"}</button>
    </header>
    <div><h1 className="text-2xl font-bold">{t.heading}</h1><p className="mt-1 text-sm text-[var(--muted)]">{t.intro}</p></div>

    <section className={CARD}>
      <div>
        <label htmlFor="travel-place" className="block text-sm font-semibold">{t.place}</label>
        <select id="travel-place" className={FIELD} value={location.placeId ?? "saved"} onChange={(e) => {
          const p = PLACES.find((p) => p.id === e.target.value);
          if (p) { setAirState(null); setLocation({ lat: p.lat, lon: p.lon, placeId: p.id }); }
        }}>
          {location.placeId === null && <option value="saved">{t.saved} {nearestPlace(location.lat, location.lon).name[lang]}</option>}
          <PlaceOptions />
        </select>
      </div>
      <p className="text-xs text-[var(--muted)]" id="travel-clock">{t.clock}</p>
      <label className="block min-w-0 text-sm font-semibold">{t.earliest}
        <input type="datetime-local" step="60" className={FIELD} value={windowInput?.earliest ?? ""} aria-describedby="travel-clock" aria-invalid={!validInput}
          onChange={(e) => setWindowInput({ earliest: e.target.value, latest: windowInput?.latest ?? "" })} />
      </label>
      <label className="block min-w-0 text-sm font-semibold">{t.latest}
        <input type="datetime-local" step="60" className={FIELD} value={windowInput?.latest ?? ""} aria-describedby="travel-clock" aria-invalid={!validInput}
          onChange={(e) => setWindowInput({ latest: e.target.value, earliest: windowInput?.earliest ?? "" })} />
      </label>
      <label className="block text-sm font-semibold">{t.duration}
        <input type="number" inputMode="decimal" min="0" max="24" step="any" value={duration} className={FIELD}
          aria-invalid={!isValidDuration(outdoorHours)} onChange={(e) => setDuration(e.target.value)} />
      </label>
      <div>
        <label htmlFor="travel-activity" className="block text-sm font-semibold">{t.activity}</label>
        <select id="travel-activity" className={FIELD} value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value as ActivityLevel })}>
          {(["rest", "walking", "heavy"] as const).map((v) => <option key={v} value={v}>{t[v]} (×{num(ACTIVITY_FACTORS[v])})</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="travel-age" className="block text-sm font-semibold">{t.age}</label>
        <select id="travel-age" className={FIELD} value={profile.ageGroup} onChange={(e) => setProfile({ ...profile, ageGroup: e.target.value as AgeGroup })}>
          {(["child", "adult", "elderly"] as const).map((v) => <option key={v} value={v}>{t[v]}</option>)}
        </select>
      </div>
      <fieldset><legend className="text-sm font-semibold">{t.sensitivity}</legend>
        {(["respiratory", "heart", "pregnant"] as const).map((v) => <label key={v} className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className={`h-5 w-5 accent-[var(--accent)] ${FOCUS}`} checked={profile.sensitivities.includes(v)} onChange={() => setProfile({
            ...profile, sensitivities: profile.sensitivities.includes(v) ? profile.sensitivities.filter((s) => s !== v) : [...profile.sensitivities, v],
          })} />{t[v]}</label>)}
      </fieldset>
      {!validInput && windowInput && <p role="alert" className="text-sm">{t.invalid}</p>}
    </section>

    <section className={CARD} aria-live="polite" aria-busy={status === "loading"}>
      <h2 className="text-lg font-bold">{t.recommended}</h2>
      {status === "loading" ? <p>{t.loading}</p> : status === "error" || !fresh || invalidForecast ? <p>{t.error}</p> :
        !validInput ? <p>{t.invalid}</p> : !best ? <p>{t.noOptions}</p> : <>
          <div data-testid="recommendation" className="space-y-2 rounded-xl border border-[var(--accent)] bg-[var(--tile-teal)] p-4">{optionContent(best)}</div>
          <p className="text-xs text-[var(--muted)]">{t.indicator}</p>
          <p className="text-sm">{t.relative}</p>
          {best.sensitive && <p className="text-sm">{t.sensitive}</p>}
        </>}
      {plan && <p className="text-xs">{t.compared}: {num(plan.options.length)}. {t.excluded}: {num(plan.excluded)}.</p>}
      <button type="button" disabled={status === "loading"} className={`min-h-11 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-60 ${FOCUS}`}
        onClick={() => setRefresh((n) => n + 1)}>{t.refresh}</button>
      <p className="text-xs text-[var(--muted)]">{t.resolution}</p>
    </section>

    {plan && plan.options.length > 1 && <section className={CARD}>
      <h2 className="text-lg font-bold">{t.alternatives}</h2>
      <ol className="space-y-3">{plan.options.slice(1, 6).map((option) => <li key={option.departureMs} className="space-y-1 rounded-xl bg-[var(--soft)] p-3">{optionContent(option)}</li>)}</ol>
      {plan.options.length > 6 && <details><summary className={`min-h-11 cursor-pointer py-3 text-sm ${FOCUS}`}>{t.all} ({num(plan.options.length - 6)})</summary>
        <ol className="space-y-3">{plan.options.slice(6).map((option) => <li key={option.departureMs} className="space-y-1 rounded-xl bg-[var(--soft)] p-3">{optionContent(option)}</li>)}</ol>
      </details>}
    </section>}

    <section className={`${CARD} break-words text-xs leading-relaxed text-[var(--muted)]`}>
      <h2 className="text-base font-bold">{t.source}</h2>
      {report && <>
        <p>{t[report.forecastSource]}</p>
        <p>{t.fetched}: <time dateTime={report.fetchedAt}>{formatTime(Date.parse(report.fetchedAt))}</time></p>
        {report.forecastIssuedAt && <p>{t.issued}: <time dateTime={report.forecastIssuedAt}>{formatTime(Date.parse(report.forecastIssuedAt))}</time></p>}
        {forecastTimes.length > 0 && <p>{t.coverage}: {formatTime(forecastTimes[0])} → {formatTime(forecastTimes[forecastTimes.length - 1])}</p>}
      </>}
      <p>{t.run}</p><p>{t.method}</p><p>{t.limits}</p><p>{t.provisional}</p><p>{t.privacy}</p>
      <a className={`underline ${FOCUS}`} href="https://open-meteo.com/en/docs/air-quality-api">CAMS / Open-Meteo</a>
    </section>
  </main>;
}
