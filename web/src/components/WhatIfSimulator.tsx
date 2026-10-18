"use client";

import { restoreDashboardLocation } from "@/lib/dashboard-location";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ACTIVITY_FACTORS, DEFAULT_EXPOSURE_PROFILE, isValidConcentration, isValidDuration,
  type ActivityLevel, type AgeGroup,
} from "@/lib/exposure";
import { PlaceOptions } from "./PlaceOptions";
import { useI18n } from "@/lib/i18n";
import { nearestPlace, PLACES } from "@/lib/places";
import {
  compareCurrent, compareForecast, compareHypothetical, readSimulatorCurrent,
  type SimulatorComparison, type SimulatorCurrent, type SimulatorPerson,
} from "@/lib/simulator";
import { dhakaInput, parseDhakaInput, readTravelAir, type TravelAir } from "@/lib/travel";

const WORDS = {
  en: {
    heading: "Compare plans", intro: "Compare two plans side by side, e.g. leaving now vs. later, or walking vs. a rickshaw.", back: "Back to dashboard",
    mode: "Input source", hypothetical: "Hypothetical PM2.5", current: "Current estimate", forecast: "Forecast departures",
    place: "Location", saved: "Saved location near", baseline: "Plan A", alternative: "Plan B",
    pm: "PM2.5 (µg/m³)", hours: "Hours outdoors", activity: "Outdoor activity", departure: "Departure (Bangladesh time)",
    rest: "Resting / sitting", walking: "Walking", heavy: "Cycling / physical labour",
    age: "Age group", child: "Under 12", adult: "12–65", elderly: "Over 65",
    sensitivity: "Additional sensitivities (optional)", respiratory: "Respiratory condition", heart: "Heart condition", pregnant: "Pregnant",
    compare: "Plan A vs Plan B", value: "Nirmol Exposure Indicator (µg·h/m³)", difference: "Change (Plan B minus Plan A)", absolute: "Absolute difference",
    percentage: "Indicator change relative to baseline", noPercent: "Can't show a percentage (the first plan's score is zero).",
    lower: "Plan B means less pollution exposure.", equal: "The indicators are equal.", higher: "Plan B means more pollution exposure.",
    low: "Low", moderate: "Moderate", high: "High", very_high: "Very high",
    loading: "Loading air-quality data...", error: "Couldn't load air data. Tap refresh to try again.", retry: "Refresh data",
    invalid: "Enter PM2.5 from 0 to 2000, a time between 0 and 24 hours, and leaving times where needed.",
    coverage: "We need forecast data for both trips in the next 24 hours. Change the leaving times or trip lengths.",
    clock: "All times are Dhaka time. If a trip goes past midnight, pick the next date.",
    source: "Source and timestamps", example: "Your own example numbers, not live data.",
    cams: "CAMS model estimate (Copernicus)", nirmol: "Model estimate — CAMS corrected by Nirmol",
    reading: "Current reading time", fetched: "API response fetched", issued: "Model issued", forecastTimes: "Forecast timestamps", currentPm: "Current PM2.5",
    currentNote: "Both plans use today's air and assume it stays the same. This isn't a forecast.",
    forecastNote: "Uses the hourly forecast, the same way as the travel planner. Missing hours are not filled in.",
    forecastLimit: "Forecasts can be wrong, and pollution varies from street to street.",
    disclaimer: "This compares exposure scores, not health risk. It isn't the AQI or a safety guarantee. The levels are Nirmol's own rough guide, not official limits.",
    rounding: "Numbers are rounded for display only.",
    sensitive: "Age and health change the level we show, not the score.",
    privacy: "Your age and health choices stay on this page. They aren't saved or sent. Only your location is used to fetch air data.",
  },
  bn: {
    heading: "প্ল্যান তুলনা", intro: "দুটো প্ল্যান পাশাপাশি তুলনা করুন, যেমন এখন বনাম পরে বের হওয়া, বা হেঁটে বনাম রিকশায়।", back: "ড্যাশবোর্ডে ফিরুন",
    mode: "তথ্যের ধরন", hypothetical: "কাল্পনিক PM2.5", current: "বর্তমান হিসাব", forecast: "পূর্বাভাসের যাত্রা",
    place: "এলাকা", saved: "সেভ করা লোকেশন, কাছাকাছি", baseline: "প্ল্যান A", alternative: "প্ল্যান B",
    pm: "PM2.5 (µg/m³)", hours: "বাইরে থাকার সময় (ঘণ্টা)", activity: "বাইরের কাজ", departure: "যাত্রা শুরুর সময় (বাংলাদেশ)",
    rest: "বিশ্রাম / বসে থাকা", walking: "হাঁটা", heavy: "সাইকেল / শারীরিক শ্রম",
    age: "বয়স", child: "১২ বছরের কম", adult: "১২–৬৫ বছর", elderly: "৬৫ বছরের বেশি",
    sensitivity: "অতিরিক্ত সংবেদনশীলতা (ঐচ্ছিক)", respiratory: "শ্বাসতন্ত্রের সমস্যা", heart: "হৃদ্‌রোগ", pregnant: "গর্ভবতী",
    compare: "প্ল্যান A বনাম প্ল্যান B", value: "নির্মল এক্সপোজার সূচক (µg·h/m³)", difference: "পার্থক্য (প্ল্যান B থেকে প্ল্যান A বাদ)", absolute: "পার্থক্যের পরিমাণ",
    percentage: "মূল সূচকের তুলনায় শতকরা পরিবর্তন", noPercent: "শতাংশ দেখানো যাচ্ছে না (প্রথম প্ল্যানের স্কোর শূন্য)।",
    lower: "প্ল্যান B-তে এক্সপোজার কম।", equal: "দুই সূচক সমান।", higher: "প্ল্যান B-তে এক্সপোজার বেশি।",
    low: "কম", moderate: "মাঝারি", high: "বেশি", very_high: "অনেক বেশি",
    loading: "বায়ুর তথ্য আনা হচ্ছে...", error: "বাতাসের তথ্য লোড হয়নি। আবার চেষ্টা করতে রিফ্রেশ চাপুন।", retry: "তথ্য আবার আনুন",
    invalid: "০ থেকে ২০০০-এর মধ্যে PM2.5, ০ থেকে ২৪ ঘণ্টার মধ্যে সময়, আর দরকার হলে বের হওয়ার সময় দিন।",
    coverage: "দুটো যাত্রার জন্যই আগামী ২৪ ঘণ্টার পূর্বাভাস লাগবে। বের হওয়ার সময় বা যাত্রার দৈর্ঘ্য বদলান।",
    clock: "সব সময় ঢাকার সময়ে। যাত্রা মধ্যরাত পার হলে পরের তারিখ বেছে নিন।",
    source: "তথ্যের উৎস ও সময়", example: "আপনার নিজের উদাহরণ, লাইভ ডেটা নয়।",
    cams: "CAMS মডেলের হিসাব (Copernicus)", nirmol: "মডেলের হিসাব — নির্মল-সংশোধিত CAMS",
    reading: "বর্তমান তথ্যের সময়", fetched: "API থেকে তথ্য আনার সময়", issued: "মডেল প্রকাশের সময়", forecastTimes: "পূর্বাভাসের সময়সীমা", currentPm: "বর্তমান PM2.5",
    currentNote: "দুটো প্ল্যানেই আজকের বাতাস ধরা হয়েছে এবং ধরে নেওয়া হয়েছে বাতাস একই থাকবে। এটা পূর্বাভাস নয়।",
    forecastNote: "যাত্রা প্ল্যানারের মতোই ঘণ্টাভিত্তিক পূর্বাভাস ব্যবহার হয়। যে ঘণ্টার তথ্য নেই তা ভরা হয় না।",
    forecastLimit: "পূর্বাভাস ভুল হতে পারে, আর রাস্তাভেদে দূষণ আলাদা হয়।",
    disclaimer: "এটা এক্সপোজার স্কোর তুলনা করে, স্বাস্থ্যঝুঁকি নয়। এটা AQI বা নিরাপত্তার নিশ্চয়তা নয়। লেভেলগুলো নির্মলের নিজস্ব আনুমানিক গাইড, অফিসিয়াল সীমা নয়।",
    rounding: "সংখ্যাগুলো শুধু দেখানোর জন্য রাউন্ড করা।",
    sensitive: "বয়স আর স্বাস্থ্যের কারণে দেখানো লেভেল বদলায়, স্কোর নয়।",
    privacy: "আপনার বয়স আর স্বাস্থ্যের বাছাই শুধু এই পেজে থাকে, সেভ বা পাঠানো হয় না। বাতাসের তথ্য আনতে শুধু লোকেশন ব্যবহার হয়।",
  },
} as const;

type Mode = "hypothetical" | "current" | "forecast";
type Location = { lat: number; lon: number; placeId: string | null };
type InputScenario = { pm25: string; hours: string; activity: ActivityLevel; departure: string };
type ScenarioName = "baseline" | "alternative";
type AirState = { key: string } & (
  { status: "ready"; mode: "current"; data: SimulatorCurrent } |
  { status: "ready"; mode: "forecast"; data: TravelAir } | { status: "error" }
);
const INITIAL_LOCATION: Location = { lat: PLACES[0].lat, lon: PLACES[0].lon, placeId: PLACES[0].id };
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const FIELD = `mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base ${FOCUS}`;
const CARD = "min-w-0 space-y-3 panel p-4 sm:p-5";
const numberInput = (value: string) => value.trim() === "" ? NaN : Number(value);

export function WhatIfSimulator() {
  const { lang, setLang, num } = useI18n();
  const t = WORDS[lang];
  const [mode, setMode] = useState<Mode>("hypothetical");
  const [location, setLocation] = useState<Location>(INITIAL_LOCATION);
  const [restored, setRestored] = useState(false);
  const [person, setPerson] = useState<SimulatorPerson>({ ageGroup: DEFAULT_EXPOSURE_PROFILE.ageGroup, sensitivities: [] });
  const [scenarios, setScenarios] = useState<Record<ScenarioName, InputScenario>>({
    baseline: { pm25: "80", hours: "2", activity: "walking", departure: "" },
    alternative: { pm25: "40", hours: "1", activity: "walking", departure: "" },
  });
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [airState, setAirState] = useState<AirState | null>(null);
  const [refresh, setRefresh] = useState(0);
  const key = `${mode},${location.lat},${location.lon},${refresh}`;
  const live = airState?.key === key && airState.status === "ready" ? airState : null;
  const status = airState?.key === key ? airState.status : "loading";

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const start = Math.ceil(Date.now() / 60_000) * 60_000;
    setScenarios((previous) => ({
      baseline: { ...previous.baseline, departure: dhakaInput(start) },
      alternative: { ...previous.alternative, departure: dhakaInput(start + 3_600_000) },
    }));
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, []);

  useEffect(() => {
    setLocation(restoreDashboardLocation(() => localStorage.getItem("nirmol.loc")));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored || mode === "hypothetical") return;
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (active) setAirState({ key, status: "error" });
    }, 15000);
    fetch(`/api/air?lat=${location.lat}&lon=${location.lon}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Air-quality request failed");
        const raw: unknown = await response.json();
        return mode === "current"
          ? { mode, data: readSimulatorCurrent(raw, location, Date.now()) }
          : { mode, data: readTravelAir(raw, location, Date.now()) };
      })
      .then((payload) => {
        if (active && !controller.signal.aborted) {
          // Receipt can fall between interval ticks, especially after a retry.
          setNowMs(Date.now());
          setAirState({ ...payload, key, status: "ready" });
        }
      })
      .catch(() => { if (active) setAirState({ key, status: "error" }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [key, location, mode, restored]);

  function updateScenario(name: ScenarioName, field: keyof InputScenario, value: string) {
    setScenarios((previous) => ({ ...previous, [name]: { ...previous[name], [field]: value } }));
  }
  const parsed = (name: ScenarioName) => ({
    activity: scenarios[name].activity, outdoorHours: numberInput(scenarios[name].hours),
    pm25: numberInput(scenarios[name].pm25), departureMs: parseDhakaInput(scenarios[name].departure),
  });
  const baseline = parsed("baseline"), alternative = parsed("alternative");
  const valid = [baseline, alternative].every((v) => isValidDuration(v.outdoorHours) &&
    (mode !== "hypothetical" || isValidConcentration(v.pm25)) && (mode !== "forecast" || Number.isFinite(v.departureMs)));
  let result: SimulatorComparison | null = null;
  let dataError = false;
  try {
    if (live && nowMs !== null) {
      if (live.mode === "current") readSimulatorCurrent(live.data, location, nowMs);
      else readTravelAir(live.data, location, nowMs);
    }
    if (valid) {
      if (mode === "hypothetical") result = compareHypothetical(person, baseline, alternative);
      else if (live && nowMs !== null) result = live.mode === "current"
        ? compareCurrent(live.data, location, person, baseline, alternative, nowMs)
        : compareForecast(live.data, location, person, baseline, alternative, nowMs);
    }
  } catch { dataError = true; }
  const message = mode !== "hypothetical" && status === "loading" ? t.loading :
    dataError || (mode !== "hypothetical" && status === "error") ? t.error : !valid ? t.invalid : t.coverage;
  const formatTime = (time: string) => new Date(time).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short",
  });
  const signed = (value: number) => num(`${value > 0 ? "+" : ""}${value.toFixed(1)}`);
  const forecastTimes = live?.mode === "forecast" ? live.data.forecast.map((p) => p.time).sort((a, b) => Date.parse(a) - Date.parse(b)) : [];
  const issuedAt = live?.mode === "current" ? live.data.now.issuedAt : live?.data.forecastIssuedAt;

  return <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6 lg:pt-8" lang={lang}>
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className={`back-link ${FOCUS}`}>← {t.back}</Link>
      <button type="button" className={`min-h-11 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 ${FOCUS}`}
        onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "English" : "বাংলা"}</button>
    </header>
    <div><h1 className="text-2xl font-bold">{t.heading}</h1><p className="mt-1 text-sm text-[var(--muted)]">{t.intro}</p></div>
    <section className={CARD}>
      <div role="group" aria-label={t.mode} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["hypothetical", "current", "forecast"] as const).map((value) => <button type="button" key={value} aria-pressed={mode === value}
          className={`min-h-12 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold ${FOCUS} ${mode === value ? "bg-[var(--foreground)] text-[var(--background)]" : ""}`}
          onClick={() => { if (mode !== value) { setAirState(null); setMode(value); } }}>{t[value]}</button>)}
      </div>
      <div><label htmlFor="simulator-place" className="text-sm font-semibold">{t.place}</label>
        <select id="simulator-place" className={FIELD} value={location.placeId ?? "saved"} onChange={(e) => {
          const p = PLACES.find((p) => p.id === e.target.value);
          if (p) { setAirState(null); setLocation({ lat: p.lat, lon: p.lon, placeId: p.id }); }
        }}>
          {location.placeId === null && <option value="saved">{t.saved} {nearestPlace(location.lat, location.lon).name[lang]}</option>}
          <PlaceOptions />
        </select>
      </div>
      <div><label htmlFor="simulator-age" className="text-sm font-semibold">{t.age}</label>
        <select id="simulator-age" className={FIELD} value={person.ageGroup} onChange={(e) => setPerson({ ...person, ageGroup: e.target.value as AgeGroup })}>
          {(["child", "adult", "elderly"] as const).map((v) => <option key={v} value={v}>{t[v]}</option>)}
        </select>
      </div>
      <fieldset><legend className="text-sm font-semibold">{t.sensitivity}</legend>
        {(["respiratory", "heart", "pregnant"] as const).map((v) => <label key={v} className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" className={`h-5 w-5 accent-[var(--accent)] ${FOCUS}`} checked={person.sensitivities.includes(v)}
            onChange={() => setPerson({ ...person, sensitivities: person.sensitivities.includes(v) ? person.sensitivities.filter((s) => s !== v) : [...person.sensitivities, v] })} />{t[v]}</label>)}
      </fieldset>
      {mode === "forecast" && <p id="simulator-clock" className="text-xs text-[var(--muted)]">{t.clock}</p>}
    </section>

    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
      {(["baseline", "alternative"] as const).map((name) => <fieldset key={name} className={CARD}>
        <legend className="text-lg font-semibold">{t[name]}</legend>
        {mode === "hypothetical" && <div><label htmlFor={`${name}-pm`} className="text-sm font-semibold">{t.pm}</label>
          <input id={`${name}-pm`} className={FIELD} type="number" inputMode="decimal" min="0" max="2000" step="any" value={scenarios[name].pm25}
            aria-invalid={!isValidConcentration(numberInput(scenarios[name].pm25))} aria-describedby={!valid ? "simulator-error" : undefined}
            onChange={(e) => updateScenario(name, "pm25", e.target.value)} /></div>}
        <div><label htmlFor={`${name}-hours`} className="text-sm font-semibold">{t.hours}</label>
          <input id={`${name}-hours`} className={FIELD} type="number" inputMode="decimal" min="0" max="24" step="any" value={scenarios[name].hours}
            aria-invalid={!isValidDuration(numberInput(scenarios[name].hours))} aria-describedby={!valid ? "simulator-error" : undefined}
            onChange={(e) => updateScenario(name, "hours", e.target.value)} /></div>
        <div><label htmlFor={`${name}-activity`} className="text-sm font-semibold">{t.activity}</label>
          <select id={`${name}-activity`} className={FIELD} value={scenarios[name].activity} onChange={(e) => updateScenario(name, "activity", e.target.value)}>
            {(["rest", "walking", "heavy"] as const).map((v) => <option key={v} value={v}>{t[v]} (×{num(ACTIVITY_FACTORS[v])})</option>)}
          </select></div>
        {mode === "forecast" && <div><label htmlFor={`${name}-departure`} className="text-sm font-semibold">{t.departure}</label>
          <input id={`${name}-departure`} className={FIELD} type="datetime-local" step="60" value={scenarios[name].departure}
            aria-describedby={`simulator-clock${!valid ? " simulator-error" : ""}`} aria-invalid={!Number.isFinite(parseDhakaInput(scenarios[name].departure))}
            onChange={(e) => updateScenario(name, "departure", e.target.value)} /></div>}
      </fieldset>)}
    </div>
    {!valid && <p id="simulator-error" role="alert" className="text-sm">{t.invalid}</p>}

    <section className={CARD} aria-live="polite" aria-busy={mode !== "hypothetical" && status === "loading"}>
      <h2 className="text-lg font-bold">{t.compare}</h2>
      {result && !dataError ? <div data-testid="comparison" className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["baseline", "alternative"] as const).map((name) => <div key={name} className="space-y-2 rounded-xl bg-[var(--soft)] p-3">
            <h3 className="font-semibold">{t[name]}</h3>
            <p data-testid={`${name}-indicator`} className="text-3xl font-bold tabular-nums">{num(result[name].indicator.toFixed(1))}</p>
            <p className="text-xs text-[var(--muted)]">{t.value}</p><p data-testid={`${name}-band`}>{t[result[name].band]}</p>
          </div>)}
        </div>
        <p className="font-semibold">{t[result.direction]}</p>
        <dl className="space-y-2 text-sm">
          <div><dt>{t.difference}</dt><dd data-testid="difference" className="text-xl font-bold">{signed(result.difference)} µg·h/m³</dd></div>
          <div><dt>{t.absolute}</dt><dd data-testid="absolute-difference">{num(result.absoluteDifference.toFixed(1))} µg·h/m³</dd></div>
          <div><dt>{t.percentage}</dt><dd data-testid="percent-change">{result.percentChange === null ? t.noPercent : `${signed(result.percentChange)}%`}</dd></div>
        </dl>
        {(result.baseline.sensitive || result.alternative.sensitive) && <p className="text-xs">{t.sensitive}</p>}
      </div> : <p data-testid="comparison-status" className="text-sm">{message}</p>}
      {mode !== "hypothetical" && <button type="button" disabled={status === "loading"} className={`min-h-11 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-60 ${FOCUS}`}
        onClick={() => setRefresh((v) => v + 1)}>{t.retry}</button>}
      <p className="text-xs text-[var(--muted)]">{t.rounding}</p>
    </section>

    <section className={`${CARD} break-words text-xs leading-relaxed text-[var(--muted)]`}>
      <h2 className="text-base font-bold">{t.source}</h2>
      {mode === "hypothetical" ? <p>{t.example}</p> : live && !dataError && <>
        <p>{t[live.mode === "current" ? live.data.now.source : live.data.forecastSource]}</p>
        {live.mode === "current" && <><p>{t.currentPm}: {num(live.data.now.pm25.toFixed(1))} µg/m³</p>
          <p>{t.reading}: <time dateTime={live.data.now.time}>{formatTime(live.data.now.time)}</time></p></>}
        <p>{t.fetched}: <time dateTime={live.data.fetchedAt}>{formatTime(live.data.fetchedAt)}</time></p>
        {issuedAt && <p>{t.issued}: <time dateTime={issuedAt}>{formatTime(issuedAt)}</time></p>}
        {forecastTimes.length > 0 && <p>{t.forecastTimes}: <time dateTime={forecastTimes[0]}>{formatTime(forecastTimes[0])}</time> → <time dateTime={forecastTimes[forecastTimes.length - 1]}>{formatTime(forecastTimes[forecastTimes.length - 1])}</time></p>}
      </>}
      {mode === "current" && <p>{t.currentNote}</p>}
      {mode === "forecast" && <><p>{t.forecastNote}</p><p>{t.forecastLimit}</p></>}
      <p>{t.disclaimer}</p><p>{t.privacy}</p>
      {mode !== "hypothetical" && <a className={`underline ${FOCUS}`} href="https://open-meteo.com/en/docs/air-quality-api">CAMS / Open-Meteo</a>}
    </section>
  </main>;
}
