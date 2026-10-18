"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { parseAccountSettings, type SavedLocation } from "@/lib/account";
import { confirmedLocationContext, readGpsPosition } from "@/lib/location";
import { PlaceOptions } from "./PlaceOptions";
import { PLACES, inBangladesh } from "@/lib/places";
import { ADVISOR_PERIODS, ADVISOR_QUESTION_LIMIT, parseAdvisorRequest, readAdvisorQuota, readAdvisorStatus, urgentQuestion,
  type AdvisorActivity, type AdvisorAnswer, type AdvisorPeriod, type AdvisorRequest, type AdvisorStatus } from "@/lib/advisor";
import { GUIDANCE, LIMITATIONS } from "@/lib/advisor-guidance";
import { readAdvisorAnswer } from "@/lib/advisor-validation";

const TEXT = {
  en: { title:"Nirmol AI Advisor", tagline:"Clean air, healthy life.", intro:"Ask anything about the air in Bangla, English or Banglish: is it safe to go out, when to travel, how to stay protected.", checking:"Getting the advisor ready…", unavailable:"We couldn't connect to the advisor. Your chat stays hidden until we can.", disabled:"The AI advisor is off right now. You can still use the other tools.", verify:"Try again", context:"About your question", general:"General advice", now:"Right now", next24h:"Next few hours", tomorrow:"Tomorrow", period:"When is this for?", reference:"Start from a city", lat:"Latitude", lon:"Longitude", gps:"Use my current location", gpsError:"Couldn't get a good location. Pick a city or enter it by hand.", gpsHelp:"GPS accuracy (m)", unknown:"Not available", pointHelp:"Choose the place you're asking about. A city uses its centre point.", confirm:"Use this place for my question. The exact point is only used to fetch air data; Gemini never sees it.", confirmed:"Place set for 5 minutes. Changing it clears the chat.", saved:"Use my saved places", savedLabel:"Choose a saved place", removeSaved:"Don't use saved place", savedError:"Couldn't load your saved places. You can still pick a place or ask in general.", activityShare:"Add what I'm doing and for how long", activity:"Activity", minutes:"How long (minutes)", rest:"Sitting / resting", walking:"Walking", heavy:"Cycling / hard work", privacy:"Your chat is only kept on this page and disappears when you reload. Each question is sent on its own. Please don't share names, addresses or health details.", provider:"Send my question, the air data and my activity (if added) to Google Gemini to get an answer.", providerLink:"Gemini data terms", question:"Your question", placeholder:"e.g. kalke shokale hata ki bhalo hobe?", send:"Ask Nirmol", sending:"Checking the air data…", retry:"Ask again", retryHelp:"Every try counts toward today's limit, even if it fails.", clear:"Clear chat", cancel:"Stop", empty:"Ask your first question, or tap one of the examples below.", remaining:"Questions left today", reset:"Resets at (Dhaka time)", quotaHelp:"You can ask up to 20 questions a day.", error:"We couldn't get an answer. Check your question and try again. This may have used one try.", invalid:"Write a question (2–600 characters), tick the Gemini box, and confirm your place if you're asking about local air. Confirm again after 5 minutes.", changed:"Your account changed. Please check again before continuing.", quota:"You've used today's questions. Check when it resets, or use the other tools.", busy:"The advisor is busy. Please wait a moment and try again.", timeout:"The AI took too long to answer. This used one try. You can ask again later.", invalidProvider:"The AI gave an answer we couldn't use, so we didn't show it. You can ask again later.", providerQuota:"The AI service has reached its limit for now. The other tools still work.", expired:"The air data got old while answering. Refresh and ask again.", chat:"Chat", you:"You", answer:"Nirmol", safety:"Safety advice from Nirmol", facts:"Air data used", currentFact:"Now", forecastFact:"Forecast", exposureFact:"Your exposure", issued:"Model updated", retrieved:"Data fetched", generated:"Answered at", coverage:"Forecast hours available", valid:"Time (Dhaka)", source:"Source", noFacts:"No local air numbers were used.", method:"Answers use checked advice and real air data. The AI doesn't make up numbers.", suggestions:["Is it safe to go for a walk today?", "When should I leave for work tomorrow?", "kalke shokale hata ki bhalo hobe?", "How can I protect my child from pollution?"], tools:"More tools", back:"Dashboard", exposure:"My exposure", travel:"Best time to travel", alerts:"Alerts", reports:"Report pollution", community:"Community map" },
  bn: { title:"নির্মল AI পরামর্শক", tagline:"নির্মল বাতাস, সুস্থ জীবন।", intro:"বাতাস নিয়ে যেকোনো প্রশ্ন বাংলা, English বা Banglish-এ করুন: বাইরে যাওয়া ঠিক কিনা, কখন বের হবেন, কীভাবে সুরক্ষিত থাকবেন।", checking:"পরামর্শক রেডি করা হচ্ছে…", unavailable:"পরামর্শকের সাথে কানেক্ট করা যায়নি। কানেক্ট না হওয়া পর্যন্ত চ্যাট লুকানো থাকবে।", disabled:"AI পরামর্শক এখন বন্ধ আছে। অন্য টুলগুলো ব্যবহার করতে পারবেন।", verify:"আবার চেষ্টা করুন", context:"আপনার প্রশ্ন সম্পর্কে", general:"সাধারণ পরামর্শ", now:"এখন", next24h:"পরের কয়েক ঘণ্টা", tomorrow:"আগামীকাল", period:"কোন সময়ের জন্য?", reference:"একটি শহর থেকে শুরু করুন", lat:"ল্যাটিচিউড", lon:"লংগিচিউড", gps:"আমার এখনকার লোকেশন ব্যবহার করুন", gpsError:"ঠিকমতো লোকেশন পাওয়া যায়নি। একটি শহর বেছে নিন বা হাতে লিখুন।", gpsHelp:"GPS কতটা সঠিক (মিটার)", unknown:"জানা নেই", pointHelp:"যে জায়গা নিয়ে প্রশ্ন করছেন সেটি বেছে নিন। শহর বাছলে তার মাঝখানের পয়েন্ট ধরা হয়।", confirm:"আমার প্রশ্নের জন্য এই জায়গা ব্যবহার করুন। ঠিক পয়েন্টটি শুধু বাতাসের তথ্য আনতে ব্যবহার হয়, Gemini এটি দেখে না।", confirmed:"জায়গা ৫ মিনিটের জন্য সেট হয়েছে। বদলালে চ্যাট মুছে যাবে।", saved:"আমার সেভ করা জায়গা ব্যবহার করুন", savedLabel:"একটি সেভ করা জায়গা বেছে নিন", removeSaved:"সেভ করা জায়গা ব্যবহার করবেন না", savedError:"সেভ করা জায়গা লোড হয়নি। জায়গা বেছে নিতে বা সাধারণ প্রশ্ন করতে পারবেন।", activityShare:"আমি কী করছি আর কতক্ষণ, তা যোগ করুন", activity:"কাজ", minutes:"কতক্ষণ (মিনিট)", rest:"বসে থাকা / বিশ্রাম", walking:"হাঁটা", heavy:"সাইকেল চালানো / ভারী কাজ", privacy:"চ্যাট শুধু এই পেজে থাকে, রিলোড করলে মুছে যায়। প্রতিটি প্রশ্ন আলাদাভাবে পাঠানো হয়। নাম, ঠিকানা বা স্বাস্থ্যের তথ্য দেবেন না।", provider:"উত্তর পেতে আমার প্রশ্ন, বাতাসের তথ্য আর আমার কাজ (যোগ করলে) Google Gemini-তে পাঠান।", providerLink:"Gemini ডেটা শর্তাবলি", question:"আপনার প্রশ্ন", placeholder:"যেমন: কালকে সকালে হাঁটা কি ভালো হবে?", send:"নির্মলকে জিজ্ঞেস করুন", sending:"বাতাসের তথ্য দেখা হচ্ছে…", retry:"আবার জিজ্ঞেস করুন", retryHelp:"প্রতিবার চেষ্টা আজকের লিমিট থেকে কাটা যায়, ফেল হলেও।", clear:"চ্যাট মুছুন", cancel:"থামান", empty:"প্রথম প্রশ্নটি করুন, অথবা নিচের উদাহরণ থেকে একটি বেছে নিন।", remaining:"আজ আর যতগুলো প্রশ্ন করা যাবে", reset:"আবার চালু হবে (ঢাকার সময়)", quotaHelp:"দিনে সর্বোচ্চ ২০টি প্রশ্ন করা যায়।", error:"উত্তর পাওয়া যায়নি। প্রশ্নটি চেক করে আবার চেষ্টা করুন। এতে একটি চেষ্টা খরচ হতে পারে।", invalid:"একটি প্রশ্ন লিখুন (২–৬০০ অক্ষর), Gemini-এর বক্সে টিক দিন, আর এলাকার বাতাস নিয়ে প্রশ্ন করলে জায়গা কনফার্ম করুন। ৫ মিনিট পার হলে আবার কনফার্ম করুন।", changed:"আপনার অ্যাকাউন্ট বদলে গেছে। চালিয়ে যাওয়ার আগে আবার চেক করুন।", quota:"আজকের প্রশ্ন শেষ। কখন আবার চালু হবে দেখুন, অথবা অন্য টুল ব্যবহার করুন।", busy:"পরামর্শক এখন ব্যস্ত। একটু পরে আবার চেষ্টা করুন।", timeout:"AI উত্তর দিতে বেশি সময় নিয়েছে। এতে একটি চেষ্টা খরচ হয়েছে। পরে আবার জিজ্ঞেস করতে পারবেন।", invalidProvider:"AI-এর উত্তরটি ব্যবহার করা যায়নি, তাই দেখানো হয়নি। পরে আবার জিজ্ঞেস করতে পারবেন।", providerQuota:"AI সার্ভিসের লিমিট এখন শেষ। অন্য টুলগুলো কাজ করছে।", expired:"উত্তর তৈরির সময় বাতাসের তথ্য পুরনো হয়ে গেছে। রিফ্রেশ করে আবার জিজ্ঞেস করুন।", chat:"চ্যাট", you:"আপনি", answer:"নির্মল", safety:"নির্মলের নিরাপত্তা পরামর্শ", facts:"যে বাতাসের তথ্য ব্যবহার হয়েছে", currentFact:"এখন", forecastFact:"পূর্বাভাস", exposureFact:"আপনার এক্সপোজার", issued:"মডেল আপডেট", retrieved:"তথ্য আনার সময়", generated:"উত্তরের সময়", coverage:"পূর্বাভাসের ঘণ্টা", valid:"সময় (ঢাকা)", source:"সোর্স", noFacts:"এলাকার কোনো বাতাসের সংখ্যা ব্যবহার হয়নি।", method:"উত্তরে যাচাই করা পরামর্শ আর আসল বাতাসের তথ্য ব্যবহার হয়। AI নিজে থেকে কোনো সংখ্যা বানায় না।", suggestions:["আজ কি বাইরে হাঁটতে যাওয়া ঠিক হবে?", "কাল অফিসে কখন বের হলে ভালো?", "kalke shokale hata ki bhalo hobe?", "দূষণ থেকে বাচ্চাকে কীভাবে বাঁচাব?"], tools:"আরও টুল", back:"ড্যাশবোর্ড", exposure:"আমার এক্সপোজার", travel:"কখন বের হবেন", alerts:"অ্যালার্ট", reports:"দূষণ রিপোর্ট", community:"কমিউনিটি ম্যাপ" },
};
type Access = { value: AdvisorStatus | null; phase: "checking" | "ready" | "unavailable" };
export function AIAdvisor() {
  const { lang, setLang } = useI18n(), t = TEXT[lang];
  const [access, setAccess] = useState<Access>({ value: null, phase: "checking" });
  const version = useRef(0), controller = useRef<AbortController | null>(null);
  const cancel = useCallback(() => { ++version.current; controller.current?.abort(); }, []);
  const verify = useCallback(async (reset = false) => {
    cancel(); const v = version.current, abort = new AbortController(); controller.current = abort;
    setAccess(old => ({ value: reset ? null : old.value, phase: "checking" })); const timer = setTimeout(() => abort.abort(), 12000);
    try {
      const r = await fetch("/api/advisor", { cache: "no-store", signal: abort.signal }), body = r.ok ? readAdvisorStatus(await r.json()) : null;
      if (v === version.current) setAccess(old => body ? { value: body, phase: "ready" } : { ...old, phase: "unavailable" });
    } catch { if (v === version.current) setAccess(old => ({ ...old, phase: "unavailable" })); }
    finally { clearTimeout(timer); }
  }, [cancel]);
  useEffect(() => {
    void verify();
    const focus = () => { if (!document.hidden) void verify(); else { cancel(); setAccess(old => ({ ...old, phase: "checking" })); } };
    const restore = (e: PageTransitionEvent) => { if (e.persisted) focus(); };
    let channel: BroadcastChannel | undefined;
    try { channel = new BroadcastChannel("nirmol.auth.v1"); channel.onmessage = e => { void verify(e.data === "session-changed"); }; } catch { /* focus and server checks remain */ }
    const timer = setInterval(focus, 60000); window.addEventListener("focus", focus); document.addEventListener("visibilitychange", focus); window.addEventListener("pageshow", restore);
    return () => { cancel(); channel?.close(); clearInterval(timer); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", focus); window.removeEventListener("pageshow", restore); };
  }, [verify, cancel]);
  const changed = useCallback(() => { void verify(true); }, [verify]);
  return <main className="dashboard community-page advisor-page shell-width flex flex-col gap-5 pb-16 pt-6 lg:pt-8">
    <header className="flex flex-wrap items-center justify-end gap-3"><div><Link href="/" className="sr-only">{lang === "en" ? "Nirmol" : "নির্মল"}</Link></div><button className="community-button" aria-label={`Switch language: ${lang === "en" ? "বাংলা" : "English"}`} onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button></header>
    <section className="community-card advisor-intro"><p className="text-sm font-semibold tracking-wide">SENSE → EXPLAIN → ACT → REPORT</p><h1 className="text-3xl font-semibold">{t.title}</h1><p>{t.intro}</p><p className="text-sm text-[var(--muted)]">{t.method}</p></section>
    {access.phase === "checking" && <p role="status" className={access.value ? undefined : "community-card min-h-[14rem] sm:min-h-[10rem]"}>{t.checking}</p>}
    {access.phase === "unavailable" && <section className={`community-card${access.value ? "" : " min-h-[14rem] sm:min-h-[10rem]"}`} role="alert"><p>{t.unavailable}</p><button className="community-button" onClick={() => void verify()}>{t.verify}</button></section>}
    {access.value && <AdvisorChat key={access.value.sessionId} status={access.value} active={access.phase === "ready"} changed={changed} refresh={() => void verify()} />}
    <footer className="community-card text-sm"><p>{GUIDANCE[lang].urgent}</p><p>{t.privacy}</p><p>{lang === "en" ? "Environmental estimates:" : "পরিবেশের হিসাব:"} <a className="underline" href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Open-Meteo / CAMS (CC BY 4.0)</a>. {lang === "en" ? "General precautions:" : "সাধারণ সতর্কতা:"} <a className="underline" href="https://www.who.int/news-room/questions-and-answers/item/air-pollution-personal-interventions-and-risk-communication" target="_blank" rel="noreferrer">WHO</a>.</p></footer>
  </main>;
}

type Exchange = { request: AdvisorRequest; answer: AdvisorAnswer | null };
function AdvisorChat({ status, active, changed, refresh }: { status: AdvisorStatus; active: boolean; changed: () => void; refresh: () => void }) {
  const { lang, num } = useI18n(), t = TEXT[lang];
  const [period, setPeriod] = useState<AdvisorPeriod>("general"), [lat, setLat] = useState(""), [lon, setLon] = useState(""), [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [question, setQuestion] = useState(""), [consent, setConsent] = useState(false), [shareActivity, setShareActivity] = useState(false), [activity, setActivity] = useState<AdvisorActivity>({ activity: "walking", minutes: 30 });
  const [saved, setSaved] = useState<SavedLocation[]>([]), [savedError, setSavedError] = useState(false), [gps, setGps] = useState<number | null | undefined>(undefined), [gpsError, setGpsError] = useState(false);
  const [messages, setMessages] = useState<Exchange[]>([]), [busy, setBusy] = useState(false), [notice, setNotice] = useState<keyof typeof TEXT.en | "">(""), [last, setLast] = useState<AdvisorRequest | null>(null), [quota, setQuota] = useState(status.quota);
  const alive = useRef(true), enabled = useRef(active), version = useRef(0), pending = useRef(false), controllers = useRef(new Set<AbortController>()), geo = useRef(0), geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  enabled.current = active;
  const cancel = useCallback(() => { ++version.current; controllers.current.forEach(c => c.abort()); pending.current = false; setBusy(false); ++geo.current; if (geoTimer.current) clearTimeout(geoTimer.current); }, []);
  useEffect(() => { alive.current = true; return () => { alive.current = false; cancel(); }; }, [cancel]);
  useEffect(() => { if (!active) cancel(); setQuota(status.quota); }, [active, cancel, status.quota]);
  function resetContext() { cancel(); setMessages([]); setLast(null); setNotice(""); setConfirmedAt(null); }
  function point(a: string, b: string) { resetContext(); setLat(a); setLon(b); setGps(undefined); setGpsError(false); }
  async function savedPlaces() {
    const v = version.current, abort = new AbortController(); controllers.current.add(abort); const timer = setTimeout(() => abort.abort(), 12000); setSavedError(false);
    try {
      const r = await fetch("/api/account", { cache: "no-store", signal: abort.signal }), body = await r.json();
      if (!alive.current || !enabled.current || version.current !== v) return;
      if (r.status === 401 || (r.ok && body.userId !== status.userId)) { changed(); return; }
      const settings = r.ok ? parseAccountSettings(body.settings) : null; if (!settings) throw Error("unavailable"); setSaved(settings.locations);
    } catch { if (alive.current && enabled.current && version.current === v) setSavedError(true); }
    finally { clearTimeout(timer); controllers.current.delete(abort); }
  }
  function deviceLocation() {
    resetContext(); setGpsError(false); setGps(undefined); const g = ++geo.current;
    const fail = () => { if (g === geo.current && alive.current && enabled.current) { ++geo.current; if (geoTimer.current) clearTimeout(geoTimer.current); setGpsError(true); } };
    if (!navigator.geolocation) { fail(); return; }
    geoTimer.current = setTimeout(fail, 11000);
    try { navigator.geolocation.getCurrentPosition(position => {
      if (g !== geo.current || !alive.current || !enabled.current) return;
      if (geoTimer.current) clearTimeout(geoTimer.current);
      const p = readGpsPosition(position, Date.now()); if (!p.ok) { fail(); return; }
      ++geo.current; setLat(String(p.lat)); setLon(String(p.lon)); setGps(p.evidence.accuracyM ?? null);
    }, fail, { maximumAge: 0, timeout: 10000, enableHighAccuracy: true }); } catch { fail(); }
  }
  const failure = (code: string) => setNotice(code === "quota_exceeded" ? "quota" : ["advisor_busy", "request_in_progress"].includes(code) ? "busy" : code === "provider_timeout" ? "timeout" : code === "provider_invalid" ? "invalidProvider" : code === "provider_quota" ? "providerQuota" : code === "context_expired" ? "expired" : code === "invalid_request" ? "invalid" : "error");
  async function send(retry?: AdvisorRequest) {
    if (pending.current || !active) return;
    let location = null;
    try { if (period !== "general" && confirmedAt && lat.trim() && lon.trim()) location = confirmedLocationContext({ lat: Number(lat), lon: Number(lon) }, confirmedAt); } catch { /* validated below */ }
    const input = parseAdvisorRequest(retry ? { ...retry, requestId: crypto.randomUUID() } : { requestId: crypto.randomUUID(), question: question.trim(), language: lang, period, location,
      activity: shareActivity ? activity : null, providerConsent: consent }, Date.now());
    if (!input) { setNotice("invalid"); return; }
    pending.current = true; setBusy(true); setNotice(""); setLast(input); setQuota(null); const v = version.current;
    setMessages(old => [...old.slice(-19), { request: input, answer: null }]); setQuestion("");
    const abort = new AbortController(); controllers.current.add(abort); const timer = setTimeout(() => abort.abort(), 45000);
    try {
      const r = await fetch("/api/advisor", { method: "POST", cache: "no-store", signal: abort.signal, headers: { "Content-Type": "application/json", "x-expected-user": status.userId ?? "guest", "x-advisor-session": status.sessionId }, body: JSON.stringify(input) }), body = await r.json();
      if (!alive.current || !enabled.current || version.current !== v) return;
      if (body.error === "session_changed" || (body.userId !== undefined && body.userId !== status.userId) || (body.sessionId !== undefined && body.sessionId !== status.sessionId)) { changed(); return; }
      const q = readAdvisorQuota(body.quota ?? body.answer?.quota); if (q) setQuota(q);
      if (!r.ok) { failure(body.error ?? "advisor_unavailable"); return; }
      const answer = readAdvisorAnswer(body.answer, input, status.userId, Date.now()); if (!answer) { setNotice("invalidProvider"); return; }
      setMessages(old => old.map(m => m.request.requestId === input.requestId ? { ...m, answer } : m)); setLast(null); setConsent(false); setShareActivity(false);
    } catch { if (alive.current && enabled.current && version.current === v) setNotice("error"); }
    finally { clearTimeout(timer); controllers.current.delete(abort); if (alive.current && version.current === v) { pending.current = false; setBusy(false); } }
  }
  const validPoint = lat.trim() !== "" && lon.trim() !== "" && inBangladesh(Number(lat), Number(lon));
  const stamp = (v: string) => new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "bn-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(v));
  return <div hidden={!active} data-testid="advisor-session" className="space-y-5">
    {!status.available && <p role="status" className="community-card">{t.disabled}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
      <aside className="community-card min-w-0" aria-label={t.context}><h2 className="text-xl font-semibold">{t.context}</h2><label><span id="advisor-period-label">{t.period}</span><select className="community-input" aria-labelledby="advisor-period-label" value={period} onChange={e => { resetContext(); setPeriod(e.target.value as AdvisorPeriod); }}>{ADVISOR_PERIODS.map(p => <option key={p} value={p}>{t[p]}</option>)}</select></label>
        {period !== "general" && <><p className="text-sm text-[var(--muted)]">{t.pointHelp}</p><label><span id="advisor-reference-label">{t.reference}</span><select aria-labelledby="advisor-reference-label" className="community-input" value="" onChange={e => { const p = PLACES.find(p => p.id === e.target.value); if (p) point(String(p.lat), String(p.lon)); }}><option value="">—</option><PlaceOptions /></select></label><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><label>{t.lat}<input className="community-input" value={lat} inputMode="decimal" onChange={e => point(e.target.value, lon)} /></label><label>{t.lon}<input className="community-input" value={lon} inputMode="decimal" onChange={e => point(lat, e.target.value)} /></label></div><button className="community-button" type="button" onClick={deviceLocation}>{t.gps}</button>{gps !== undefined && <p>{t.gpsHelp}: {gps === null ? t.unknown : num(gps)}</p>}{gpsError && <p role="alert">{t.gpsError}</p>}
          {status.userId && <><button className="community-button" onClick={() => void savedPlaces()}>{t.saved}</button>{savedError && <p role="alert">{t.savedError}</p>}{saved.length > 0 && <><label><span id="advisor-saved-label">{t.savedLabel}</span><select className="community-input" aria-labelledby="advisor-saved-label" value="" onChange={e => { const p = saved.find(p => p.id === e.target.value); if (p) point(String(p.lat), String(p.lon)); }}><option value="">—</option>{saved.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label><button className="community-button" onClick={() => { setSaved([]); point("", ""); }}>{t.removeSaved}</button></>}</>}
          <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" disabled={!validPoint} checked={!!confirmedAt} onChange={e => { cancel(); setConfirmedAt(e.target.checked ? new Date().toISOString() : null); setMessages([]); setLast(null); }} /><span>{t.confirm}</span></label>{confirmedAt && <p className="text-xs text-[var(--muted)]">{t.confirmed}</p>}</>}
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" checked={shareActivity} onChange={e => { resetContext(); setShareActivity(e.target.checked); }} /><span>{t.activityShare}</span></label>{shareActivity && <><label><span id="advisor-activity-label">{t.activity}</span><select className="community-input" aria-labelledby="advisor-activity-label" value={activity.activity} onChange={e => { cancel(); setMessages([]); setLast(null); setActivity({ ...activity, activity: e.target.value as AdvisorActivity["activity"] }); }}>{["rest", "walking", "heavy"].map(a => <option key={a} value={a}>{t[a as AdvisorActivity["activity"]]}</option>)}</select></label><label>{t.minutes}<input className="community-input" type="number" min={1} max={1440} value={activity.minutes} onChange={e => { cancel(); setMessages([]); setLast(null); setActivity({ ...activity, minutes: Number(e.target.value) }); }} /></label></>}
        <div className="rounded-xl bg-[var(--soft)] p-3 text-sm">{quota ? <><p>{t.remaining}: <strong>{num(quota.remaining)}</strong></p><p>{t.reset}: {stamp(quota.resetAt)}</p></> : <p>{t.remaining}: {t.unknown}</p>}<p className="mt-2 text-xs text-[var(--muted)]">{t.quotaHelp}</p><button className="community-button mt-3" type="button" disabled={busy} onClick={refresh}>{lang === "en" ? "Refresh allowance" : "বাকি সীমা আবার আনুন"}</button></div>
      </aside>
      <section className="community-card min-w-0" aria-label={t.chat}><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">{t.chat}</h2><button className="community-button" onClick={() => { cancel(); setMessages([]); setLast(null); setQuestion(""); setNotice(""); setConsent(false); }}>{t.clear}</button></div>
        <div role="log" aria-live="polite" aria-label={t.chat} className="space-y-4">{!messages.length && <p className="text-[var(--muted)]">{t.empty}</p>}{messages.map(m => <article key={m.request.requestId} className="space-y-3"><div className="rounded-xl bg-[var(--soft)] p-3"><p className="text-xs font-semibold">{t.you}</p><p className="whitespace-pre-wrap break-words">{m.request.question}</p></div>{m.answer && <AdvisorResponse answer={m.answer} activity={m.request.activity} />}</article>)}</div>
        <div className="flex flex-wrap gap-2">{t.suggestions.map(q => <button type="button" className="community-button text-left" key={q} onClick={() => setQuestion(q)}>{q}</button>)}</div>
        <form className="grid gap-3" onSubmit={e => { e.preventDefault(); void send(); }}><label>{t.question}<textarea className="community-input" rows={4} maxLength={1800} placeholder={t.placeholder} value={question} onChange={e => setQuestion(e.target.value)} /></label><p className="text-xs text-[var(--muted)]">{num(Array.from(question).length)} / {num(ADVISOR_QUESTION_LIMIT)}</p>{urgentQuestion(question) && <p role="alert">{GUIDANCE[lang].urgent}</p>}
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={consent} onChange={e => { cancel(); setConsent(e.target.checked); setLast(null); }} /><span>{t.provider} <a className="underline" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">{t.providerLink}</a></span></label>
          <div className="flex flex-wrap gap-3"><button className="community-button dashboard-primary" disabled={busy || !status.available} type="submit">{t.send}</button>{busy && <button type="button" className="community-button" onClick={cancel}>{t.cancel}</button>}</div></form>
        {busy && <p role="status">{t.sending}</p>}{notice && <p role="alert">{t[notice] as string}</p>}{last && !busy && notice && <button className="community-button" disabled={!status.available} onClick={() => void send(last)}>{t.retry}</button>}<p className="text-xs text-[var(--muted)]">{t.retryHelp}</p>
      </section>
    </div>
    <nav aria-label={t.tools} className="community-card"><h2 className="text-lg font-semibold">{t.tools}</h2><div className="flex flex-wrap gap-2">{[["/exposure", t.exposure], ["/travel", t.travel], ["/alerts", t.alerts], ["/reports", t.reports], ["/community", t.community]].map(([href, label]) => <Link key={href} href={href} className="community-link">{label}</Link>)}</div></nav>
  </div>;
}

function AdvisorResponse({ answer, activity }: { answer: AdvisorAnswer; activity: AdvisorActivity | null }) {
  const { lang, num } = useI18n(), t = TEXT[lang], c = answer.context;
  const stamp = (s: string) => new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "bn-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(s));
  return <div data-testid="advisor-answer" className="advisor-answer grid gap-3 rounded-xl border border-[var(--border)] p-4"><p className="text-sm font-semibold">{answer.origin === "nirmol-safety" ? t.safety : t.answer}</p>{answer.plan.guidance.map(code => <p key={code}>{GUIDANCE[lang][code]}</p>)}
    {activity && c.facts.some(f => f.kind === "exposure") && <p className="text-sm">{t.activity}: {t[activity.activity]} · {t.minutes}: {num(activity.minutes)}</p>}
    <div className="space-y-2 text-sm"><h3 className="font-semibold">{t.facts}</h3>{!answer.plan.factIds.length && <p>{t.noFacts}</p>}{c.facts.filter(f => answer.plan.factIds.includes(f.id)).map(f => <p key={f.id}>{f.kind === "current" ? t.currentFact : f.kind === "forecast" ? t.forecastFact : t.exposureFact}: <strong>{num(Math.round(f.value * 10) / 10)}</strong> {f.kind === "exposure" ? "µg·h/m³" : "µg/m³"} · {t.source}: {f.source === "cams" ? "CAMS" : "Nirmol / CAMS"} · {t.valid}: {stamp(f.time)}{f.issuedAt && <> · {t.issued}: {stamp(f.issuedAt)}</>}</p>)}</div>
    <div className="rounded-lg bg-[var(--soft)] p-3 text-xs text-[var(--muted)]"><p>{t.period}: {t[c.period]}</p>{answer.location && <p>{answer.location.lat}, {answer.location.lon}</p>}{c.fetchedAt && <p>{t.retrieved}: {stamp(c.fetchedAt)}</p>}{c.coverage.expected > 0 && <p>{t.coverage}: {num(c.coverage.available)} / {num(c.coverage.expected)}{c.coverage.from && c.coverage.to && <> · {stamp(c.coverage.from)} → {stamp(c.coverage.to)}</>}</p>}{c.limitations.map(l => <p key={l}>{LIMITATIONS[lang][l]}</p>)}<p>{t.generated}: {stamp(answer.generatedAt)}</p></div>
  </div>;
}
