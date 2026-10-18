"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACCOUNT_LOCATION_LIMIT, parseAccountSettings, type AccountSettings } from "@/lib/account";
import { useI18n } from "@/lib/i18n";
import { notifyAuthChange } from "@/lib/auth-events";
import { PLACES, placeLabel } from "@/lib/places";
import { Icon } from "./Icon";
import { PlaceOptions } from "./PlaceOptions";
import { SlotIcon } from "./SlotIcon";
import type { AirReport } from "@/lib/air";
import { forecastWindow, isCompleteForecast, isFreshModelIssue, readAirReport, readCurrent } from "@/lib/air-validation";

const TEXT = {
  en: {
    title: "My Nirmol", intro: "Your saved places and settings.", public: "Home", language: "Language / ভাষা", identity: "Account", confirmed: "Email confirmed", unconfirmed: "Email not confirmed yet", logout: "Sign out", signingOut: "Signing out…", session: "Your session can no longer be verified. Sign in again to access your account.", signin: "Sign in again", loading: "Loading saved preferences…", unavailable: "Account storage is unavailable or its migration has not been applied. Your draft has not been saved. Public tools still work.", retry: "Reload saved settings", discard: "Reloading will discard your unsaved account changes. Continue?", conflict: "Your account changed in another tab. Your draft is preserved. Reload saved settings before editing again.", invalid: "Use a name of 1–80 characters and a point inside Bangladesh. Pick a saved default place, or none.", saved: "Account preferences saved.", saving: "Saving…", save: "Save account preferences", preferences: "Your places", privacy: "Only your place names and language are saved to your account. Diary notes, symptoms and alert settings stay in this browser.", preferred: "Preferred language", default: "Default location", none: "No saved default", name: "Location name", latitude: "Latitude", longitude: "Longitude", add: "Add location to draft", preset: "Start with a place", remove: "Remove", confirmRemove: "Remove this place from your draft? Save to keep the change.", yes: "Confirm removal", cancel: "Cancel", limit: "You can save up to 10 places.", empty: "No saved places yet.", overview: "Air at your default place", fallback: "Dhaka · shown until you save a default", loadingAir: "Loading air data…", errorAir: "Environmental data is unavailable. Try again.", refresh: "Refresh air data", reading: "Reading valid time", fetched: "API retrieved", issued: "Model issued", model: "Model estimate – CAMS corrected by Nirmol", cams: "Model estimate – CAMS", missing: "Unavailable", complete: "24-hour forecast window", partial: "Partial forecast coverage", noForecast: "No usable forecast readings", window: "Coverage window", unknownIssue: "Source issuance is not supplied; retrieval is not model generation.", range: "Forecast PM2.5 range", points: "valid forecast points", clock: "All times are Bangladesh time. Missing hours are not filled in.", tools: "Your tools", toolHint: "Each tool loads fresh data when you open it.", exposure: "Exposure calculator", exposureHint: "How much pollution you breathe.", travel: "Travel-time planner", travelHint: "Best time to leave.", simulator: "Compare plans", simulatorHint: "See which plan means less pollution.", alerts: "In-app alerts", alertsHint: "Warnings at your limit.", diary: "Private browser diary", diaryHint: "Notes on your days outside.", reports: "Report pollution", consent: "General advice is public. Sharing your places with the advisor needs your OK each time.", settings: "Account settings", reset: "Recover or change password", shared: "Using a shared device? Sign out when you finish. Your diary stays in this browser; delete it from the diary page.", noRisk: "These tools give general guidance. They do not measure health risk or promise a safe trip.", failedLogout: "Sign-out could not be confirmed. Try again; do not leave a shared device signed in.",
    community: "Community", communityHint: "Report pollution you see, and view approved reports on the map.", map: "Community Map", moderation: "Moderator dashboard", advisorTitle: "Nirmol AI Advisor", advisorHint: "Ask about air quality and your next step. Your places are shared only if you choose.", now: "PM2.5 now", defaultBadge: "Default",
  },
  bn: {
    title: "আমার নির্মল", intro: "আপনার জমা রাখা জায়গা ও সেটিংস।", public: "হোম", language: "ভাষা / Language", identity: "অ্যাকাউন্ট", confirmed: "ইমেইল যাচাই হয়েছে", unconfirmed: "ইমেইল এখনো যাচাই হয়নি", logout: "সাইন আউট", signingOut: "সাইন আউট হচ্ছে…", session: "আপনার সেশন শেষ হয়ে গেছে। অ্যাকাউন্ট দেখতে আবার সাইন ইন করুন।", signin: "আবার সাইন ইন করুন", loading: "জমা রাখা সেটিংস আনা হচ্ছে…", unavailable: "অ্যাকাউন্টের জমা রাখার সেবা এখন পাওয়া যাচ্ছে না। আপনার পরিবর্তন জমা হয়নি। পাবলিক টুল ঠিকমতো চলবে।", retry: "জমা সেটিংস আবার আনুন", discard: "আবার আনলে জমা না করা পরিবর্তন হারিয়ে যাবে। এগোবেন?", conflict: "অন্য ট্যাবে আপনার অ্যাকাউন্ট বদলেছে। আপনার লেখা মুছে যায়নি। আবার সেটিংস আনুন, তারপর বদলান।", invalid: "নাম ১–৮০ অক্ষরের মধ্যে দিন এবং বাংলাদেশের ভেতরের একটি জায়গা দিন। ডিফল্ট জায়গা বাছুন, বা কিছুই না বাছুন।", saved: "সেটিংস জমা হয়েছে।", saving: "জমা হচ্ছে…", save: "সেটিংস জমা করুন", preferences: "আপনার জায়গা", privacy: "শুধু জায়গার নাম ও ভাষা অ্যাকাউন্টে জমা থাকে। ডায়েরির নোট, উপসর্গ ও সতর্কবার্তার সেটিংস এই ব্রাউজারেই থাকে।", preferred: "পছন্দের ভাষা", default: "ডিফল্ট জায়গা", none: "কোনোটি নয়", name: "জায়গার নাম", latitude: "অক্ষাংশ (Latitude)", longitude: "দ্রাঘিমাংশ (Longitude)", add: "জায়গা যোগ করুন", preset: "লিস্ট থেকে বাছুন", remove: "বাদ দিন", confirmRemove: "জায়গাটি বাদ দেবেন? পরিবর্তন রাখতে “সেটিংস জমা করুন” চাপুন।", yes: "হ্যাঁ, বাদ দিন", cancel: "না", limit: "সর্বোচ্চ ১০টি জায়গা জমা রাখা যায়।", empty: "এখনো কোনো জায়গা জমা নেই।", overview: "ডিফল্ট জায়গার বাতাস", fallback: "ঢাকা · ডিফল্ট জমা না করা পর্যন্ত এটি দেখানো হবে", loadingAir: "বাতাসের তথ্য আনা হচ্ছে…", errorAir: "বাতাসের তথ্য পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।", refresh: "বাতাসের তথ্য আবার আনুন", reading: "তথ্য কোন সময়ের", fetched: "তথ্য আনার সময়", issued: "মডেল তৈরির সময়", model: "মডেলের হিসাব – নির্মল ঠিক করা CAMS", cams: "মডেলের হিসাব – CAMS", missing: "পাওয়া যাচ্ছে না", complete: "আগামী ২৪ ঘণ্টার পূর্বাভাস", partial: "অল্প সময়ের পূর্বাভাস", noForecast: "ব্যবহার করার মতো পূর্বাভাস নেই", window: "পূর্বাভাসের সময়", unknownIssue: "মডেল কখন তৈরি হয়েছে, জানা নেই।", range: "পূর্বাভাসের PM2.5 (সর্বনিম্ন–সর্বোচ্চ)", points: "টি পূর্বাভাস", clock: "সব সময় বাংলাদেশের সময়ে। যে ঘণ্টার তথ্য নেই, তা ফাঁকা থাকে।", tools: "আপনার টুল", toolHint: "প্রতিটি টুল খোলার সময় নতুন তথ্য আনে।", exposure: "এক্সপোজার ক্যালকুলেটর", exposureHint: "কতটা দূষণ শ্বাসে যাবে।", travel: "যাত্রার সময় ঠিক করুন", travelHint: "কখন বের হলে ভালো।", simulator: "প্ল্যান তুলনা", simulatorHint: "কোন প্ল্যানে দূষণ কম, দেখুন।", alerts: "সতর্কবার্তা", alertsHint: "আপনার সীমা ছাড়ালে জানাবে।", diary: "ব্যক্তিগত ডায়েরি", diaryHint: "বাইরে কাটানো সময়ের নোট।", reports: "দূষণ রিপোর্ট করুন", consent: "সাধারণ পরামর্শ সবার জন্য। আপনার জায়গা পরামর্শককে দিতে প্রতিবার আপনার অনুমতি লাগবে।", settings: "অ্যাকাউন্ট সেটিংস", reset: "পাসওয়ার্ড ভুলে গেলে বা বদলাতে", shared: "অন্যের ডিভাইসে থাকলে কাজ শেষে সাইন আউট করুন। ডায়েরি এই ব্রাউজারেই থাকে; মুছতে চাইলে ডায়েরি পেজ থেকে মুছুন।", noRisk: "এসব টুল সাধারণ পরামর্শ দেয়। এগুলো স্বাস্থ্যঝুঁকি মাপে না, বা নিরাপদ যাত্রার নিশ্চয়তাও দেয় না।", failedLogout: "সাইন আউট হয়েছে কি না নিশ্চিত হওয়া যায়নি। আবার চেষ্টা করুন; অন্যের ডিভাইসে সাইন ইন রেখে যাবেন না।",
    community: "কমিউনিটি", communityHint: "যে দূষণ দেখছেন তা জানান, আর অনুমোদিত রিপোর্ট ম্যাপে দেখুন।", map: "কমিউনিটি ম্যাপ", moderation: "মডারেটর ড্যাশবোর্ড", advisorTitle: "নির্মল AI পরামর্শক", advisorHint: "বাতাস নিয়ে প্রশ্ন করুন, পরের করণীয় জানুন। আপনি চাইলেই শুধু আপনার জায়গার তথ্য ব্যবহার হবে।", now: "এখন PM2.5", defaultBadge: "ডিফল্ট",
  },
};
const BOX = "panel p-5";
const INPUT = "min-h-11 min-w-0 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-base";
const BUTTON = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold hover:bg-[var(--soft)] disabled:opacity-60";
type Identity = { id: string; email: string; emailConfirmed: boolean };

export function MyNirmol({ user }: { user: Identity }) {
  const { lang, setLang } = useI18n(), t = TEXT[lang], router = useRouter();
  const applyLanguage = useRef(setLang);
  useEffect(() => { applyLanguage.current = setLang; }, [setLang]);
  const [settings, setSettings] = useState<AccountSettings | null>(null), [draft, setDraft] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true), [notice, setNotice] = useState<"" | "unavailable" | "conflict" | "invalid" | "saved" | "failedLogout">("");
  const [expired, setExpired] = useState(false), [saving, setSaving] = useState(false), [signingOut, setSigningOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const retryVerification = useRef<() => void>(() => {});
  const [name, setName] = useState(""), [lat, setLat] = useState(""), [lon, setLon] = useState(""), [removeId, setRemoveId] = useState<string | null>(null);
  const loadId = useRef(0), dead = useRef(false), pending = useRef(false), heartbeat = useRef(false);
  const cancelLoads = useCallback(() => { dead.current = true; ++loadId.current; }, []);
  const expire = useCallback(() => { cancelLoads(); setExpired(true); setSettings(null); setDraft(null); setName(""); setLat(""); setLon(""); setRemoveId(null); }, [cancelLoads]);
  const reload = useCallback(async () => {
    const id = ++loadId.current; setLoading(true); setNotice("");
    const abort = new AbortController(), timer = window.setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch("/api/account", { cache: "no-store", signal: abort.signal });
      if (dead.current || id !== loadId.current) return;
      if (response.status === 401) { expire(); return; }
      const value = await response.json();
      if (dead.current || id !== loadId.current) return;
      if (response.ok && value.userId !== user.id) { expire(); return; }
      const parsed = response.ok ? parseAccountSettings(value.settings) : null;
      if (!parsed) { setNotice("unavailable"); return; }
      setSettings(parsed); setDraft(parsed);
      if (parsed.revision > 0) applyLanguage.current(parsed.language);
    } catch { if (!dead.current && id === loadId.current) setNotice("unavailable"); }
    finally { window.clearTimeout(timer); if (!dead.current && id === loadId.current) setLoading(false); }
  }, [expire, user.id]);
  useEffect(() => {
    dead.current = false; void reload();
    let verificationAbort: AbortController | null = null;
    const verify = async (hide = false) => {
      if (heartbeat.current || dead.current || document.visibilityState === "hidden") return;
      const abort = new AbortController();
      verificationAbort = abort;
      heartbeat.current = true;
      if (hide) setChecking(true);
      const timeout = window.setTimeout(() => abort.abort(), 15000);
      try {
        const response = await fetch("/api/auth", { cache: "no-store", signal: abort.signal });
        const data = await response.json();
        if (dead.current) return;
        if (response.status === 401 || (response.ok && data.user?.id !== user.id)) expire();
        else if (!response.ok) setVerificationError(true);
        else setVerificationError(false);
      } catch { if (!dead.current) setVerificationError(true); }
      finally { window.clearTimeout(timeout); verificationAbort = null; heartbeat.current = false; if (!dead.current) setChecking(false); }
    };
    retryVerification.current = () => { void verify(true); };
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel("nirmol.auth.v1");
      channel.onmessage = (event) => {
        // An older in-flight check must never undo an explicit session change.
        if (event.data === "session-changed") expire();
        else if (event.data === "verify-session") {
          if (heartbeat.current) expire(); else void verify(true);
        }
      };
      // Covers new server-rendered account pages after a PKCE callback without
      // disclosing an identity/token to other tabs or writing browser storage.
      channel.postMessage("verify-session");
    } catch { /* Optional browser API; focus/pageshow checks remain. */ }
    const restore = (event: PageTransitionEvent) => { if (event.persisted) void verify(true); };
    const focus = () => { void verify(true); };
    const interval = window.setInterval(() => { void verify(); }, 60000);
    window.addEventListener("focus", focus); document.addEventListener("visibilitychange", focus);
    window.addEventListener("pageshow", restore);
    return () => { cancelLoads(); verificationAbort?.abort(); channel?.close(); window.clearInterval(interval); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", focus); window.removeEventListener("pageshow", restore); };
  }, [cancelLoads, expire, reload, user.id]);
  const save = async () => {
    if (pending.current || dead.current) return;
    const valid = parseAccountSettings(draft);
    if (!valid) { setNotice("invalid"); return; }
    pending.current = true; setSaving(true); setNotice("");
    const abort = new AbortController(), timer = window.setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch("/api/account", { method: "PUT", cache: "no-store", signal: abort.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, settings: valid }) });
      if (dead.current) return;
      if (response.status === 401) { expire(); return; }
      const data = await response.json();
      if (dead.current) return;
      if (data.error === "account_changed" || (response.ok && data.userId !== user.id)) { expire(); return; }
      if (response.status === 409) { setNotice("conflict"); return; }
      const parsed = response.ok ? parseAccountSettings(data.settings) : null;
      if (!parsed) { setNotice("unavailable"); return; }
      setSettings(parsed); setDraft(parsed); setNotice("saved"); setLang(parsed.language);
    } catch { if (!dead.current) setNotice("unavailable"); }
    finally { window.clearTimeout(timer); pending.current = false; setSaving(false); }
  };
  const logout = async () => {
    if (pending.current) return; pending.current = true; setSigningOut(true);
    const abort = new AbortController(), timer = window.setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch("/api/auth", { method: "POST", cache: "no-store", signal: abort.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sign-out" }) });
      const result = await response.json();
      if (response.ok && result.ok) { notifyAuthChange(); expire(); router.replace("/"); router.refresh(); } else setNotice("failedLogout");
    } catch { setNotice("failedLogout"); }
    finally { window.clearTimeout(timer); pending.current = false; setSigningOut(false); }
  };
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!draft || !lat.trim() || !lon.trim()) return setNotice("invalid");
    const candidate = { ...draft, locations: [...draft.locations, { id: crypto.randomUUID(), name: name.trim(), lat: Number(lat), lon: Number(lon) }] };
    const parsed = parseAccountSettings(candidate); if (!parsed) return setNotice("invalid");
    setDraft(parsed); setName(""); setLat(""); setLon(""); setNotice("");
  };
  if (expired) return <main className="account-page mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-bold">{t.title}</h1><p role="alert" className="my-5">{t.session}</p><Link href="/login" className="underline">{t.signin}</Link><p className="mt-5"><Link href="/" className="back-link">{t.public}</Link></p></main>;
  const defaultLocation = settings?.locations.find((location) => location.id === settings.defaultLocationId);
  const dirty = JSON.stringify(settings) !== JSON.stringify(draft);
  const TOOLS = [["/exposure", t.exposure, t.exposureHint, "activity", "teal"], ["/travel", t.travel, t.travelHint, "route", "sky"], ["/simulator", t.simulator, t.simulatorHint, "sliders", "leaf"], ["/alerts", t.alerts, t.alertsHint, "bell", "sun"], ["/diary", t.diary, t.diaryHint, "book", "teal"]] as const;
  return <>{checking && <p className="mx-auto max-w-3xl px-4 py-10" role="status">{lang === "en" ? "Verifying your session…" : "সেশন যাচাই হচ্ছে…"}</p>}{verificationError && !checking && <section className="account-page mx-auto max-w-3xl px-4 py-10"><p role="alert">{lang === "en" ? "Account services could not verify your session. Your unsaved draft is kept in page memory and hidden until verification succeeds." : "অ্যাকাউন্ট সেবা আপনার সেশন যাচাই করতে পারেনি। যাচাই না হওয়া পর্যন্ত আপনার লেখা লুকানো থাকবে, হারাবে না।"}</p><button type="button" className={`${BUTTON} mt-4`} onClick={() => retryVerification.current()}>{lang === "en" ? "Verify session again" : "সেশন আবার যাচাই করুন"}</button></section>}<div hidden={checking || verificationError} inert={checking || verificationError}><main className="account-page mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1><p className="mt-1 text-sm text-[var(--muted)]">{t.intro}</p></div><button type="button" className={BUTTON} aria-label={`${t.language}: ${lang === "en" ? "বাংলা" : "English"}`} onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button></header>
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <section className={`${BOX} lg:order-2`} aria-label={t.identity}><div className="flex items-center gap-3"><SlotIcon name="user" tone="teal" size="lg" /><div className="min-w-0"><p className="break-all font-semibold" data-testid="account-email">{user.email}</p><p className="mt-0.5 inline-flex items-center gap-1 text-sm text-[var(--muted)]"><Icon name={user.emailConfirmed ? "check" : "mail"} size={14} />{user.emailConfirmed ? t.confirmed : t.unconfirmed}</p></div></div>
        <button className={`${BUTTON} mt-4 w-full`} type="button" disabled={signingOut || saving} onClick={logout}><Icon name="logout" size={18} />{signingOut ? t.signingOut : t.logout}</button></section>
      <div className="lg:order-1 lg:col-span-2"><AccountAir key={`${defaultLocation?.lat ?? PLACES[0].lat}:${defaultLocation?.lon ?? PLACES[0].lon}`} location={defaultLocation ?? PLACES[0]} label={defaultLocation?.name ?? t.fallback} /></div>
    </div>
    <section className={BOX}><div className="flex items-center gap-3"><SlotIcon name="pin" tone="sky" /><div><h2 className="text-lg font-semibold">{t.preferences}</h2><p className="text-sm text-[var(--muted)]">{t.privacy}</p></div></div>
      {loading && <p role="status" className="mt-4">{t.loading}</p>}
      {notice && <p role={notice === "saved" ? "status" : "alert"} className="warn-note mt-4 p-3 text-sm">{t[notice]}</p>}
      <button type="button" disabled={loading || saving} className={`${BUTTON} my-4`} onClick={() => { if (!dirty || window.confirm(t.discard)) void reload(); }}><Icon name="refresh" size={16} />{t.retry}</button>
      {draft && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">{t.preferred}<select className={INPUT} disabled={saving} value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value as "en" | "bn" })}><option value="bn">বাংলা</option><option value="en">English</option></select></label>
        <label className="grid gap-2 text-sm font-medium">{t.default}<select className={INPUT} disabled={saving} value={draft.defaultLocationId ?? ""} onChange={(e) => setDraft({ ...draft, defaultLocationId: e.target.value || null })}><option value="">{t.none}</option>{draft.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label></div>
        {draft.locations.length === 0 && <p className="rounded-xl bg-[var(--soft)] p-4 text-sm">{t.empty}</p>}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{draft.locations.map((location, index) => <li key={location.id} className="rounded-xl border border-[var(--border)] p-4"><div className="mb-3 flex items-center justify-between gap-2"><SlotIcon name="pin" tone="teal" size="sm" />{draft.defaultLocationId === location.id && <span className="rounded-full bg-[var(--tile-teal)] px-2.5 py-0.5 text-xs font-semibold text-[var(--tile-teal-ink)]">{t.defaultBadge}</span>}</div><label className="grid gap-2 text-sm font-medium">{t.name} {index + 1}<input className={INPUT} value={location.name} maxLength={160} disabled={saving} onChange={(e) => setDraft({ ...draft, locations: draft.locations.map((item) => item.id === location.id ? { ...item, name: e.target.value } : item) })} /></label><p className="my-2 break-words text-xs text-[var(--muted)]">{location.lat}, {location.lon}</p>{removeId === location.id ? <div className="flex flex-wrap gap-2"><p className="w-full text-sm">{t.confirmRemove}</p><button className={BUTTON} disabled={saving} type="button" onClick={() => { setDraft({ ...draft, locations: draft.locations.filter((item) => item.id !== location.id), defaultLocationId: draft.defaultLocationId === location.id ? null : draft.defaultLocationId }); setRemoveId(null); }}>{t.yes}</button><button className={BUTTON} type="button" onClick={() => setRemoveId(null)}>{t.cancel}</button></div> : <button className={BUTTON} disabled={saving} type="button" aria-label={`${t.remove} ${location.name}`} onClick={() => setRemoveId(location.id)}><Icon name="trash" size={16} />{t.remove}</button>}</li>)}</ul>
        <form onSubmit={add} className="space-y-3 rounded-xl bg-[var(--soft)] p-4"><p className="text-xs text-[var(--muted)]">{t.limit}</p><label className="grid gap-2 text-sm font-medium">{t.preset}<select className={INPUT} defaultValue="" disabled={saving} onChange={(e) => { const place = PLACES.find((item) => item.id === e.target.value); if (place) { setName(placeLabel(place, lang)); setLat(String(place.lat)); setLon(String(place.lon)); } }}><option value="">—</option><PlaceOptions /></select></label><label className="grid gap-2 text-sm font-medium">{t.name}<input className={INPUT} name="locationName" value={name} required maxLength={160} disabled={saving} onChange={(e) => setName(e.target.value)} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">{t.latitude}<input className={INPUT} name="latitude" inputMode="decimal" value={lat} required disabled={saving} onChange={(e) => setLat(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">{t.longitude}<input className={INPUT} name="longitude" inputMode="decimal" value={lon} required disabled={saving} onChange={(e) => setLon(e.target.value)} /></label></div><button className={BUTTON} type="submit" disabled={saving || draft.locations.length >= ACCOUNT_LOCATION_LIMIT}><Icon name="plus" size={16} />{t.add}</button></form>
        <button className={`${BUTTON} account-primary`} type="button" disabled={saving || loading || !dirty} onClick={save}>{saving ? t.saving : t.save}</button>
      </div>}
    </section>
    <section aria-labelledby="my-tools"><h2 id="my-tools" className="text-lg font-semibold">{t.tools}</h2><p className="mb-3 mt-1 text-sm text-[var(--muted)]">{t.toolHint}</p><nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={t.tools}>{TOOLS.map(([href, text, hint, icon, tone]) => <Link className="panel flex items-center gap-3 p-4 hover:bg-[var(--soft)]" href={href} key={href}><SlotIcon name={icon} tone={tone} /><span className="min-w-0 flex-1"><span className="block font-semibold">{text}</span><span className="block text-xs text-[var(--muted)]">{hint}</span></span><Icon name="arrow" size={16} className="shrink-0 text-[var(--muted)]" /></Link>)}</nav></section>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={BOX}><div className="flex items-center gap-3"><SlotIcon name="map" tone="leaf" /><h2 className="text-lg font-semibold">{t.community}</h2></div><p className="mt-3 text-sm text-[var(--muted)]">{t.communityHint}</p><nav className="mt-3 flex flex-wrap gap-2"><Link href="/reports" className={BUTTON}><Icon name="flag" size={16} />{t.reports}</Link><Link href="/community" className={BUTTON}>{t.map}</Link><Link href="/moderation" className={BUTTON}>{t.moderation}</Link></nav></section>
      <section className={BOX}><div className="flex items-center gap-3"><SlotIcon name="chat" tone="sky" /><h2 className="text-lg font-semibold">{t.advisorTitle}</h2></div><p className="mt-3 text-sm text-[var(--muted)]">{t.advisorHint}</p><p className="mt-1 text-xs text-[var(--muted)]">{t.consent}</p><Link href="/advisor" className={`${BUTTON} mt-3`}>{t.advisorTitle}<Icon name="arrow" size={16} /></Link></section>
    </div>
    <section className={BOX}><div className="flex items-center gap-3"><SlotIcon name="lock" tone="sun" /><h2 className="text-lg font-semibold">{t.settings}</h2></div><Link className="back-link mt-3" href="/login?mode=reset">{t.reset}</Link><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{t.shared}</p></section>
    <footer className="text-xs text-[var(--muted)]">{t.noRisk}</footer>
  </main></div></>;
}

function AccountAir({ location, label }: { location: { lat: number; lon: number }; label: string }) {
  const { lang, num } = useI18n(), t = TEXT[lang];
  const { lat, lon } = location;
  const [report, setReport] = useState<AirReport | null>(null), [status, setStatus] = useState("loading"), [revision, setRevision] = useState(0), [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const abort = new AbortController(); let active = true;
    setReport(null); setStatus("loading");
    const timeout = window.setTimeout(() => { abort.abort(); if (active) setStatus("error"); }, 15000);
    fetch(`/api/air?lat=${lat}&lon=${lon}`, { cache: "no-store", signal: abort.signal }).then(async (response) => { if (!response.ok) throw Error(); return readAirReport(await response.json(), { lat, lon }, Date.now()); }).then((data) => { if (active && !abort.signal.aborted) { setReport(data); setStatus("ready"); setClock(Date.now()); } }).catch(() => { if (active) setStatus("error"); }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; abort.abort(); window.clearTimeout(timeout); };
  }, [lat, lon, revision]);
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 30000); return () => window.clearInterval(timer); }, []);
  const fresh = report && isFreshModelIssue(report.fetchedAt, clock);
  const current = fresh ? readCurrent(report.now, clock) : null;
  const forecast = fresh && (!report.forecastIssuedAt || isFreshModelIssue(report.forecastIssuedAt, clock)) ? forecastWindow(report.forecast, clock) : [];
  const validForecast = forecast.flatMap((point) => point.pm25 === null ? [] : [point.pm25]);
  const stamp = (value: string) => <time dateTime={value}>{new Date(value).toLocaleString(lang === "en" ? "en-GB" : "bn-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}</time>;
  return <section className={BOX} data-testid="account-air">
    <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><SlotIcon name="wind" tone="teal" /><div className="min-w-0"><h2 className="text-lg font-semibold">{t.overview}</h2><p className="truncate text-sm text-[var(--muted)]">{label}</p></div></div><button className={BUTTON} type="button" disabled={status === "loading"} onClick={() => setRevision((value) => value + 1)}><Icon name="refresh" size={16} />{t.refresh}</button></div>
    {status === "loading" && <p role="status" className="my-4">{t.loadingAir}</p>}
    {status === "error" && <p role="alert" className="my-4">{t.errorAir}</p>}
    {status === "ready" && <div className="mt-4 space-y-2 text-sm">
      <p className="text-4xl font-semibold tabular-nums">{current?.pm25 === null || !current ? t.missing : `${num(current.pm25)} µg/m³`}</p>
      {current?.pm25 !== null && current && <><p>{current.source === "nirmol" ? t.model : t.cams}</p><p className="text-[var(--muted)]">{t.reading}: {stamp(current.time)}</p>{current.issuedAt && <p className="text-[var(--muted)]">{t.issued}: {stamp(current.issuedAt)}</p>}</>}
      <p className="border-t border-[var(--border)] pt-3 font-medium">{validForecast.length ? isCompleteForecast(forecast, clock) ? t.complete : t.partial : t.noForecast}</p>
      {report && <><p>{report.forecastSource === "nirmol" ? t.model : t.cams}</p><p className="text-[var(--muted)]">{t.fetched}: {stamp(report.fetchedAt)}</p>{report.forecastIssuedAt ? <p className="text-[var(--muted)]">{t.issued}: {stamp(report.forecastIssuedAt)}</p> : <p className="text-[var(--muted)]">{t.unknownIssue}</p>}</>}
      {validForecast.length > 0 && <p>{t.range}: {num(Math.min(...validForecast))}–{num(Math.max(...validForecast))} µg/m³ · {num(validForecast.length)} {t.points}</p>}
      {forecast.length > 0 && <p className="text-[var(--muted)]">{t.window}: {stamp(forecast[0].time)} → {stamp(forecast[forecast.length - 1].time)}</p>}
      <p className="text-xs text-[var(--muted)]">{t.clock}</p>
    </div>}
  </section>;
}
