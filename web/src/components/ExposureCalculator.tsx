"use client";

import { restoreDashboardLocation } from "@/lib/dashboard-location";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AirReport } from "@/lib/air";
import { isFreshModelIssue } from "@/lib/air-validation";
import {
  ACTIVITY_FACTORS,
  calculateExposure,
  DEFAULT_EXPOSURE_PROFILE,
  isUsableCurrentEstimate,
  isValidConcentration,
  isValidDuration,
  type ActivityLevel,
  type AgeGroup,
  type ExposureBand,
  type ExposureProfile,
  type Sensitivity,
} from "@/lib/exposure";
import { useI18n } from "@/lib/i18n";
import { PlaceOptions } from "./PlaceOptions";
import { PLACES, nearestPlace, inDhakaModelArea } from "@/lib/places";

const WORDS = {
  en: {
    back: "Back to dashboard", heading: "My exposure", intro: "See how much pollution you breathe in, based on what you're doing and how long you're outside.",
    place: "Location", gps: "Saved location near", current: "Use today's air", scenario: "Try my own number",
    loading: "Loading today's air…", error: "Couldn't load air data.",
    stale: "No recent air data right now (that doesn't mean zero). Try entering your own number instead.",
    retry: "Refresh data", pm: "PM2.5 (µg/m³)", sample: "Your own example, not live data.",
    inputMode: "Where the PM2.5 comes from", none: "None", hypothetical: "Example result, not today's air",
    invalidPm: "Enter a number from 0 to 2000.", invalidHours: "Enter a time between 0 and 24 hours.",
    dataKind: "Data type", camsSource: "CAMS (Copernicus) via Open-Meteo", nirmolSource: "CAMS corrected by Nirmol",
    age: "Age group", child: "Under 12", adult: "12–65", elderly: "Over 65",
    sensitivity: "Health conditions (optional)", respiratory: "Breathing problems (asthma etc.)", heart: "Heart problems", pregnant: "Pregnant",
    activity: "Outdoor activity", rest: "Resting / sitting", walking: "Walking", heavy: "Cycling / hard physical work",
    hours: "Hours outside", result: "Your exposure", low: "Low", moderate: "Moderate", high: "High", very_high: "Very high",
    value: "Exposure score (µg·h/m³)", source: "Source", time: "Data time (Dhaka)",
    measured: "Measured at a station", nirmol: "Nirmol model estimate (not measured)",
    cams: "CAMS model estimate (not measured)", demo: "Demo data (not live)",
    scenarioSource: "Your own number (not live)",
    invalid: "Enter PM2.5 between 0 and 2000 and a time between 0 and 24 hours.",
    sensitiveNote: "Because of your age or health, we show a more careful level. The score itself stays the same.",
    guidance: {
      low: "Lower exposure than other options. Keep an eye on the air.",
      moderate: "Try spending a bit less time outside, or do something lighter.",
      high: "Cut down the time outside, or go at a cleaner time of day.",
      very_high: "Put off outdoor exercise if you can, and keep necessary trips short.",
    },
    disclaimer: "This assumes the air stays the same the whole time. It isn't the AQI, the exact amount you breathe in, or a health-risk score. The four levels are Nirmol's own rough guide, not official limits.",
    privacy: "Your choices stay on this page. Nothing is saved or sent.",
  },
  bn: {
    back: "ড্যাশবোর্ডে ফিরুন", heading: "আমার এক্সপোজার", intro: "আপনি কী করছেন আর কতক্ষণ বাইরে থাকছেন, তা থেকে দেখুন কতটা দূষণ শ্বাসে যাচ্ছে।",
    place: "এলাকা", gps: "সেভ করা লোকেশন, কাছাকাছি", current: "আজকের বাতাস ব্যবহার করুন", scenario: "নিজের সংখ্যা দিয়ে দেখুন",
    loading: "আজকের বাতাসের তথ্য লোড হচ্ছে…", error: "বাতাসের তথ্য লোড করা যায়নি।",
    stale: "এখন নতুন বাতাসের তথ্য নেই (এর মানে শূন্য নয়)। নিজের সংখ্যা দিয়ে দেখতে পারেন।",
    retry: "তথ্য আবার আনুন", pm: "PM2.5 (µg/m³)", sample: "আপনার নিজের উদাহরণ, লাইভ ডেটা নয়।",
    inputMode: "PM2.5 কোথা থেকে নেবেন", none: "কোনোটিই নয়", hypothetical: "উদাহরণের ফল, আজকের বাতাস নয়",
    invalidPm: "০ থেকে ২০০০-এর মধ্যে একটি সংখ্যা দিন।", invalidHours: "০ থেকে ২৪ ঘণ্টার মধ্যে সময় দিন।",
    dataKind: "তথ্যের ধরন", camsSource: "Open-Meteo থেকে CAMS (Copernicus)", nirmolSource: "নির্মল-সংশোধিত CAMS",
    age: "বয়স", child: "১২ বছরের কম", adult: "১২–৬৫ বছর", elderly: "৬৫ বছরের বেশি",
    sensitivity: "স্বাস্থ্য সমস্যা (ঐচ্ছিক)", respiratory: "শ্বাসের সমস্যা (হাঁপানি ইত্যাদি)", heart: "হার্টের সমস্যা", pregnant: "গর্ভবতী",
    activity: "বাইরের কাজ", rest: "বিশ্রাম / বসে থাকা", walking: "হাঁটা", heavy: "সাইকেল চালানো / ভারী কাজ",
    hours: "বাইরে কত ঘণ্টা", result: "আপনার এক্সপোজার", low: "কম", moderate: "মাঝারি", high: "বেশি", very_high: "অনেক বেশি",
    value: "এক্সপোজার স্কোর (µg·h/m³)", source: "তথ্যের উৎস", time: "তথ্যের সময় (ঢাকা)",
    measured: "স্টেশনে মাপা", nirmol: "নির্মল মডেলের হিসাব (মাপা নয়)",
    cams: "CAMS মডেলের হিসাব (মাপা নয়)", demo: "ডেমো ডেটা (লাইভ নয়)",
    scenarioSource: "আপনার নিজের সংখ্যা (লাইভ নয়)",
    invalid: "০ থেকে ২০০০-এর মধ্যে PM2.5 আর ০ থেকে ২৪ ঘণ্টার মধ্যে সময় দিন।",
    sensitiveNote: "আপনার বয়স বা স্বাস্থ্যের কারণে একটু বেশি সাবধানী লেভেল দেখানো হচ্ছে। স্কোর একই থাকছে।",
    guidance: {
      low: "অন্য অপশনের চেয়ে এক্সপোজার কম। বাতাসের দিকে খেয়াল রাখুন।",
      moderate: "বাইরে একটু কম সময় থাকুন, বা হালকা কাজ করুন।",
      high: "বাইরের সময় কমান, অথবা দিনের পরিষ্কার সময়ে বের হন।",
      very_high: "সম্ভব হলে বাইরে ব্যায়াম পিছিয়ে দিন, আর দরকারি কাজ ছোট রাখুন।",
    },
    disclaimer: "ধরে নেওয়া হয় পুরো সময় বাতাস একই থাকবে। এটা AQI না, ঠিক কতটা শ্বাসে যাচ্ছে সেটাও না, স্বাস্থ্যঝুঁকির স্কোরও না। চারটি লেভেল নির্মলের নিজস্ব আনুমানিক গাইড, অফিসিয়াল সীমা নয়।",
    privacy: "আপনার বাছাই শুধু এই পেজেই থাকে। কিছু সেভ বা পাঠানো হয় না।",
  },
} as const;

type Mode = "current" | "scenario";
type Location = { lat: number; lon: number; placeId: string | null };
type CurrentAir = Pick<AirReport, "lat" | "lon" | "now"> & { receivedAtMs: number };
type AirState = {
  requestKey: string;
  status: "loading" | "ready" | "error";
  reading: CurrentAir | null;
};

// Validate only the fields this feature consumes; forecast/weather remain the
// responsibility of their callers. A TS assertion cannot validate API JSON.
function readCurrentAir(value: unknown, location: Location): CurrentAir {
  if (typeof value !== "object" || value === null) throw new Error("Missing air report");
  const data = value as Record<string, unknown>;
  if (typeof data.lat !== "number" || typeof data.lon !== "number" ||
      !Number.isFinite(data.lat) || !Number.isFinite(data.lon) ||
      data.lat !== location.lat || data.lon !== location.lon ||
      typeof data.now !== "object" || data.now === null) {
    throw new Error("Air report does not match the requested location");
  }
  const current = data.now as Record<string, unknown>;
  if (current.source === "nirmol" && !inDhakaModelArea(location.lat, location.lon)) throw new Error("Custom model outside evaluated reference");
  if (typeof current.time !== "string" ||
      (current.pm25 !== null && !isValidConcentration(current.pm25)) ||
      (current.kind !== "measured" && current.kind !== "model_estimate" && current.kind !== "demo") ||
      (current.source !== "cams" && current.source !== "nirmol") ||
      // Both supported sources are models; neither can substantiate a measurement.
      current.kind === "measured") {
    throw new Error("Unexpected current air-quality reading");
  }
  if (current.issuedAt !== undefined && (current.source !== "nirmol" || typeof current.issuedAt !== "string" ||
      !isFreshModelIssue(current.issuedAt, Date.now()))) throw new Error("Invalid current model issuance");
  return {
    lat: data.lat, lon: data.lon,
    receivedAtMs: Date.now(),
    now: { pm25: current.pm25, time: current.time, kind: current.kind, source: current.source,
      ...(typeof current.issuedAt === "string" ? { issuedAt: current.issuedAt } : {}) },
  };
}

const INITIAL_LOCATION: Location = { lat: PLACES[0].lat, lon: PLACES[0].lon, placeId: PLACES[0].id };
const ACTIVITIES: ActivityLevel[] = ["rest", "walking", "heavy"];
const AGE_GROUPS: AgeGroup[] = ["child", "adult", "elderly"];
const SENSITIVITIES: Sensitivity[] = ["respiratory", "heart", "pregnant"];
const BAND_STYLES: Record<ExposureBand, string> = {
  low: "border-[var(--accent)] bg-[var(--tile-teal)]", moderate: "border-yellow-600/40 bg-yellow-500/10",
  high: "border-orange-600/40 bg-orange-500/10", very_high: "border-red-600/40 bg-red-500/10",
};
const FOCUS_STYLE = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const FIELD_STYLE = `mt-2 min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-base ${FOCUS_STYLE}`;

export function ExposureCalculator() {
  const { lang, setLang, num } = useI18n();
  const t = WORDS[lang];
  const [location, setLocation] = useState<Location>(INITIAL_LOCATION);
  const [restored, setRestored] = useState(false);
  const [profile, setProfile] = useState<Omit<ExposureProfile, "outdoorHours">>(() => ({
    ageGroup: DEFAULT_EXPOSURE_PROFILE.ageGroup,
    activity: DEFAULT_EXPOSURE_PROFILE.activity,
    sensitivities: [...DEFAULT_EXPOSURE_PROFILE.sensitivities],
  }));
  const [hoursInput, setHoursInput] = useState(String(DEFAULT_EXPOSURE_PROFILE.outdoorHours));
  const [mode, setMode] = useState<Mode>("current");
  const [scenarioPm, setScenarioPm] = useState("80");
  const [airState, setAirState] = useState<AirState | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const requestKey = `${location.lat},${location.lon},${refresh}`;
  // A restored/changed location must never render a previous location's result,
  // even for the render before the new effect starts.
  const status = airState?.requestKey === requestKey ? airState.status : "loading";
  const air = airState?.requestKey === requestKey ? airState.reading : null;

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  // Read only the selected location from the dashboard; do not persist health/sensitivity data.
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
      if (active) setAirState({ requestKey, status: "error", reading: null });
    }, 15000);
    fetch(`/api/air?lat=${location.lat}&lon=${location.lon}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Air-quality API: ${response.status}`);
        const data: unknown = await response.json();
        return readCurrentAir(data, location);
      })
      .then((reading) => {
        if (active && !controller.signal.aborted) {
          setNowMs(Date.now());
          setAirState({ requestKey, status: "ready", reading });
        }
      })
      .catch(() => {
        if (active) setAirState({ requestKey, status: "error", reading: null });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [location, requestKey, restored]);

  const current = status === "ready" && air && nowMs !== null && air.now.kind !== "demo" &&
    // Check receipt time too: a rejected forecast must not become "current"
    // merely because the page's clock eventually catches up with it.
    isValidConcentration(air.now.pm25) && isUsableCurrentEstimate(air.now.time, air.receivedAtMs) &&
    isUsableCurrentEstimate(air.now.time, nowMs) &&
    (air.now.issuedAt === undefined || isFreshModelIssue(air.now.issuedAt, nowMs))
    ? { ...air.now, pm25: air.now.pm25 } : null;
  const usable = current !== null;
  const outdoorHours = hoursInput.trim() === "" ? NaN : Number(hoursInput);
  const durationValid = isValidDuration(outdoorHours);
  const scenarioValue = scenarioPm.trim() === "" ? NaN : Number(scenarioPm);
  const scenarioValid = isValidConcentration(scenarioValue);
  const pm25 = mode === "scenario"
    ? scenarioValue
    : current?.pm25;
  const result = isValidConcentration(pm25) && durationValid
    ? calculateExposure(pm25, { ...profile, outdoorHours })
    : null;

  function updateProfile<K extends keyof typeof profile>(field: K, value: (typeof profile)[K]) {
    setProfile((previous) => ({ ...previous, [field]: value }));
  }
  function toggleSensitivity(value: Sensitivity) {
    setProfile((previous) => ({
      ...previous,
      sensitivities: previous.sensitivities.includes(value)
        ? previous.sensitivities.filter((s) => s !== value)
        : [...previous.sensitivities, value],
    }));
  }
  function changeLocation(placeId: string) {
    const place = PLACES.find((p) => p.id === placeId);
    if (!place) return;
    // Also clear when returning A → B → A before B has finished loading.
    setAirState(null);
    setLocation({ lat: place.lat, lon: place.lon, placeId: place.id });
  }
  function requestRefresh() {
    setRefresh((n) => n + 1);
  }
  const dataKind = air?.now.kind === "measured" ? t.measured :
    air?.now.kind === "demo" ? t.demo : air?.now.source === "nirmol" ? t.nirmol : t.cams;
  const source = air?.now.source === "nirmol" ? t.nirmolSource : t.camsSource;
  const timeLabel = air && isUsableCurrentEstimate(air.now.time, Date.parse(air.now.time))
    ? new Date(air.now.time).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
        timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "medium",
      })
    : null;
  const locationName = location.placeId
    ? PLACES.find((p) => p.id === location.placeId)?.name[lang]
    : `${t.gps} ${nearestPlace(location.lat, location.lon).name[lang]}`;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6 lg:pt-8" lang={lang}>
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className={`back-link ${FOCUS_STYLE}`}>← {t.back}</Link>
        <button type="button" onClick={() => setLang(lang === "bn" ? "en" : "bn")}
          className={`min-h-11 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium ${FOCUS_STYLE}`}>
          {lang === "bn" ? "English" : "বাংলা"}
        </button>
      </header>

      <div>
        <h1 className="text-2xl font-bold">{t.heading}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.intro}</p>
      </div>

      <section className="panel p-4 sm:p-5">
        <label htmlFor="exposure-place" className="text-sm font-semibold">{t.place}</label>
        <select id="exposure-place" value={location.placeId ?? "saved"}
          onChange={(e) => changeLocation(e.target.value)} className={FIELD_STYLE}>
          {location.placeId === null && <option value="saved">{locationName}</option>}
          <PlaceOptions />
        </select>

        <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2" role="group" aria-label={t.inputMode}>
          {(["current", "scenario"] as const).map((nextMode) => (
            <button key={nextMode} type="button" onClick={() => setMode(nextMode)}
              aria-pressed={mode === nextMode}
              className={`min-h-12 rounded-xl px-3 text-sm font-semibold ${FOCUS_STYLE} ${mode === nextMode ? "dashboard-primary" : "border border-[var(--border)]"}`}>
              {nextMode === "current" ? t.current : t.scenario}
            </button>
          ))}
        </div>

        {mode === "current" ? (
          <div className="mt-4 space-y-2" aria-live="polite" aria-busy={status === "loading"}>
            {status === "loading" && <p className="text-sm text-[var(--muted)]">{t.loading}</p>}
            {status === "error" && <p className="text-sm text-[var(--muted)]">{t.error}</p>}
            {status === "ready" && !usable && <p className="text-sm text-[var(--muted)]">{t.stale}</p>}
            {current && <p className="text-2xl font-bold tabular-nums">{num(current.pm25.toFixed(1))} <span className="text-sm font-normal">µg/m³</span></p>}
            <button type="button" onClick={requestRefresh}
              disabled={status === "loading"}
              className={`min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-60 ${FOCUS_STYLE}`}>{t.retry}</button>
          </div>
        ) : (
          <div className="mt-4">
            <label htmlFor="scenario-pm" className="text-sm font-semibold">{t.pm}</label>
            <input id="scenario-pm" type="number" inputMode="decimal" min="0" max="2000" step="any"
              value={scenarioPm} onChange={(e) => setScenarioPm(e.target.value)} className={FIELD_STYLE}
              aria-invalid={!scenarioValid} aria-describedby={`scenario-help${scenarioValid ? "" : " scenario-error"}`} />
            <p id="scenario-help" className="mt-2 text-xs text-[var(--muted)]">{t.sample}</p>
            {!scenarioValid && <p id="scenario-error" className="mt-2 text-sm" aria-live="polite">{t.invalidPm}</p>}
          </div>
        )}
        {mode === "scenario" ? (
          <p className="mt-3 text-xs text-[var(--muted)]">{t.source}: {t.scenarioSource}</p>
        ) : air && (
          <div className="mt-3 space-y-1 break-words text-xs leading-relaxed text-[var(--muted)]">
            <p><strong>{t.dataKind}:</strong> {dataKind}</p>
            <p><strong>{t.source}:</strong> {source}</p>
            {timeLabel && <p><strong>{t.time}:</strong> <time dateTime={air.now.time}>{timeLabel}</time></p>}
          </div>
        )}
      </section>

      <section className="space-y-4 panel p-4 sm:p-5">
        <div>
          <label htmlFor="exposure-age" className="text-sm font-semibold">{t.age}</label>
          <select id="exposure-age" value={profile.ageGroup}
            onChange={(e) => updateProfile("ageGroup", e.target.value as AgeGroup)} className={FIELD_STYLE}>
            {AGE_GROUPS.map((age) => <option key={age} value={age}>{t[age]}</option>)}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">{t.sensitivity}</legend>
          <div className="mt-2 space-y-2">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" checked={profile.sensitivities.length === 0}
                onChange={() => updateProfile("sensitivities", [])}
                className={`h-5 w-5 accent-[var(--accent)] ${FOCUS_STYLE}`} />
              {t.none}
            </label>
            {SENSITIVITIES.map((sensitivity) => (
              <label key={sensitivity} className="flex min-h-10 items-center gap-3 text-sm">
                <input type="checkbox" checked={profile.sensitivities.includes(sensitivity)}
                  onChange={() => toggleSensitivity(sensitivity)} className={`h-5 w-5 accent-[var(--accent)] ${FOCUS_STYLE}`} />
                {t[sensitivity]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="exposure-activity" className="text-sm font-semibold">{t.activity}</label>
          <select id="exposure-activity" value={profile.activity}
            onChange={(e) => updateProfile("activity", e.target.value as ActivityLevel)} className={FIELD_STYLE}>
            {ACTIVITIES.map((activity) => (
              <option key={activity} value={activity}>{t[activity]} (×{num(ACTIVITY_FACTORS[activity].toFixed(1))})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exposure-hours" className="text-sm font-semibold">{t.hours}</label>
          <input id="exposure-hours" type="number" min="0" max="24" step="any" inputMode="decimal"
            value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} className={FIELD_STYLE}
            aria-invalid={!durationValid} aria-describedby={durationValid ? undefined : "hours-error"} />
          {!durationValid && <p id="hours-error" className="mt-2 text-sm" aria-live="polite">{t.invalidHours}</p>}
        </div>
      </section>

      <section className="space-y-3 panel p-4 sm:p-5" aria-live="polite">
        <h2 className="text-lg font-bold">{t.result}</h2>
        {mode === "scenario" && <p className="rounded-xl border border-[var(--warn-border)] bg-[var(--warn-bg)] p-3 text-sm font-semibold">{t.hypothetical}</p>}
        {result === null ? (
          <p className="text-sm text-[var(--muted)]">{
            mode === "current" && !usable
              ? (status === "loading" ? t.loading : status === "error" ? t.error : t.stale)
              : t.invalid
          }</p>
        ) : (
          <>
            <div className={`rounded-xl border p-4 ${BAND_STYLES[result.band]}`}>
              <p className="text-4xl font-bold tabular-nums">{num(result.indicator.toFixed(1))}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{t.value}</p>
              <p className="mt-2 text-base font-semibold">{t[result.band]}</p>
            </div>
            <p className="text-sm">{t.guidance[result.band]}</p>
            {result.sensitive && <p className="text-sm text-[var(--muted)]">{t.sensitiveNote}</p>}
            <p className="rounded-xl bg-[var(--soft)] p-3 text-xs">
              {num(pm25!.toFixed(1))} × {num(outdoorHours)} × {num(result.activityFactor.toFixed(1))} = {num(result.indicator.toFixed(1))}
            </p>
          </>
        )}
        <p className="text-xs leading-relaxed text-[var(--muted)]">{t.disclaimer}</p>
        <p className="text-xs leading-relaxed text-[var(--muted)]">{t.privacy}</p>
      </section>
    </main>
  );
}
