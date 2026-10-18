"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { safeRedirect, validPassword } from "@/lib/auth";
import { notifyAuthChange } from "@/lib/auth-events";
import { Icon } from "./Icon";
import styles from "./AuthPanel.module.css";

const COPY = {
  en: {
    guest: "Explore as guest", tabs: "Account options", tabSignin: "Log in", tabSignup: "Sign up", newHere: "New to Nirmol?", hint: "At least 12 characters.", google: "Continue with Google", or: "or",
    brandTitle: "Breathe easier across Bangladesh.", brandLead: "Save your places and preferences to plan around PM2.5 forecasts every day.", brandFoot: "Public air-quality tools stay free and open to everyone.",
    f1: "Hourly PM2.5 forecasts", f1Body: "24-hour outlook for cities across Bangladesh.", f2: "Personal exposure", f2Body: "Plan travel and outdoor time around cleaner air.", f3: "Community reports", f3Body: "See and share local pollution sources.", language: "Language / ভাষা", signin: "Sign in to Nirmol", signup: "Create your account", reset: "Reset your password", recovery: "Choose a new password",
    intro: "Your places, your preferences. All public air-quality tools remain open to everyone.",
    email: "Email address", password: "Password", confirm: "Confirm password", show: "Show", hide: "Hide", submit: "Sign in", create: "Create account", forgot: "Forgot password?", send: "Send recovery email", update: "Update password", back: "Back to sign in", working: "Please wait…",
    config: "Account services are not configured on this installation. You can continue using all public tools as a guest.",
    privacy: "Your diary notes, symptoms and alert preferences stay in their existing browser storage. Signing in does not upload or synchronize them. Account sessions use cookies on this browser; sign out on shared devices.",
    image: "Nirmol: Cleaner air, brighter lives. A green information panel describes air-quality data, forecasts, personalized tools and community participation beside a Bangladesh-inspired cityscape.",
    confirmation: "Check your email to confirm your account before signing in. If this address already has an account, use sign in or password recovery. Finish verification in this same browser and device.",
    sent: "Recovery requested. If this address is eligible, check its inbox for a password reset link. Open it in this same browser and device.", updated: "Your password was updated. Sign in with your new password.",
    mismatch: "The passwords do not match.", weak: "Use at least 12 characters for your new password.",
    errors: { "config-unavailable": "Account services are not configured. Guest tools remain available.", "invalid-request": "Check your details and try again.", "invalid-email": "Enter a valid email address.", "weak-password": "Choose a stronger password with at least 12 characters.", "invalid-credentials": "Unable to sign in. Check your email and password.", "email-not-confirmed": "Confirm your email before signing in.", "rate-limited": "Too many attempts. Wait before trying again.", "auth-unavailable": "Unable to connect to account services. Try again.", "invalid-recovery": "This recovery link is missing, expired or already used. Request a new link.", "origin-rejected": "This request could not be verified. Reload this page and try again.", "invalid-callback": "This email link is invalid, expired or belongs to another browser. Request a new link in this browser.", "not-authenticated": "Your session has expired. Sign in again." },
  },
  bn: {
    guest: "অতিথি হিসেবে দেখুন", tabs: "অ্যাকাউন্টের বিকল্প", tabSignin: "লগ ইন", tabSignup: "সাইন আপ", newHere: "নির্মলে নতুন?", hint: "অন্তত ১২টি অক্ষর।", google: "Google দিয়ে চালিয়ে যান", or: "অথবা",
    brandTitle: "বাংলাদেশজুড়ে আরও স্বস্তিতে শ্বাস নিন।", brandLead: "আপনার জায়গা আর পছন্দ সেভ করে রাখুন, প্রতিদিন PM2.5 পূর্বাভাস দেখে প্ল্যান করুন।", brandFoot: "বায়ুমানের পাবলিক টুল সবার জন্য বিনামূল্যে উন্মুক্ত।",
    f1: "ঘণ্টাভিত্তিক PM2.5 পূর্বাভাস", f1Body: "বাংলাদেশের শহরগুলোর ২৪ ঘণ্টার পূর্বাভাস।", f2: "ব্যক্তিগত এক্সপোজার", f2Body: "পরিষ্কার বাতাসের সময় বুঝে যাত্রা ও বাইরের সময় ঠিক করুন।", f3: "কমিউনিটি রিপোর্ট", f3Body: "স্থানীয় দূষণের উৎস দেখুন ও জানান।", language: "ভাষা / Language", signin: "নির্মলে সাইন ইন করুন", signup: "অ্যাকাউন্ট তৈরি করুন", reset: "পাসওয়ার্ড পুনরুদ্ধার", recovery: "নতুন পাসওয়ার্ড দিন",
    intro: "আপনার জায়গা, আপনার পছন্দ, এক জায়গায়। বাতাসের সব পাবলিক টুল সবার জন্য ফ্রি।",
    email: "ইমেইল ঠিকানা", password: "পাসওয়ার্ড", confirm: "পাসওয়ার্ড নিশ্চিত করুন", show: "দেখুন", hide: "লুকান", submit: "সাইন ইন", create: "অ্যাকাউন্ট তৈরি", forgot: "পাসওয়ার্ড ভুলে গেছেন?", send: "পুনরুদ্ধারের ইমেইল পাঠান", update: "পাসওয়ার্ড বদলান", back: "সাইন ইন-এ ফিরুন", working: "অপেক্ষা করুন…",
    config: "অ্যাকাউন্ট সার্ভিস এখন চালু নেই। গেস্ট হিসেবে সব পাবলিক টুল ব্যবহার করতে পারবেন।",
    privacy: "ডায়েরির নোট, উপসর্গ আর অ্যালার্টের সেটিংস এই ব্রাউজারেই থাকে, সাইন ইন করলেও আপলোড হয় না। শেয়ার করা ডিভাইসে কাজ শেষে সাইন আউট করুন।",
    image: "নির্মল: আরও নির্মল বাতাস, উজ্জ্বল জীবন। সবুজ প্যানেলে বায়ুর তথ্য, পূর্বাভাস, ব্যক্তিগত টুল ও কমিউনিটির বিবরণ; পাশে বাংলাদেশ-অনুপ্রাণিত শহরের দৃশ্য।",
    confirmation: "সাইন ইন করার আগে ইমেইলে পাঠানো লিংক দিয়ে অ্যাকাউন্ট কনফার্ম করুন। এই ইমেইলে আগে অ্যাকাউন্ট থাকলে সাইন ইন বা পাসওয়ার্ড রিসেট করুন। লিংকটি এই ব্রাউজারেই খুলুন।",
    sent: "পাসওয়ার্ড রিসেটের লিংক পাঠানো হয়েছে (অ্যাকাউন্ট থাকলে)। ইনবক্স দেখুন এবং লিংকটি এই ব্রাউজারেই খুলুন।", updated: "পাসওয়ার্ড বদলেছে। নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
    mismatch: "দুটি পাসওয়ার্ড মেলেনি।", weak: "নতুন পাসওয়ার্ডে অন্তত ১২টি অক্ষর ব্যবহার করুন।",
    errors: { "config-unavailable": "অ্যাকাউন্ট সেবা কনফিগার করা নেই। অতিথির টুলগুলো ব্যবহার করতে পারবেন।", "invalid-request": "তথ্য যাচাই করে আবার চেষ্টা করুন।", "invalid-email": "সঠিক ইমেইল ঠিকানা লিখুন।", "weak-password": "অন্তত ১২ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।", "invalid-credentials": "সাইন ইন হয়নি। ইমেইল ও পাসওয়ার্ড যাচাই করুন।", "email-not-confirmed": "সাইন ইন করার আগে ইমেইল নিশ্চিত করুন।", "rate-limited": "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।", "auth-unavailable": "অ্যাকাউন্ট সেবায় সংযোগ হয়নি। আবার চেষ্টা করুন।", "invalid-recovery": "পুনরুদ্ধারের লিংক নেই, মেয়াদ শেষ বা ব্যবহৃত হয়েছে। নতুন লিংক চান।", "origin-rejected": "অনুরোধ যাচাই করা যায়নি। পেজ রিলোড করে আবার চেষ্টা করুন।", "invalid-callback": "ইমেইলের লিংকটি ভুল, মেয়াদ শেষ বা অন্য ব্রাউজারের। এই ব্রাউজারে নতুন লিংক চান।", "not-authenticated": "সেশনের মেয়াদ শেষ। আবার সাইন ইন করুন।" },
  },
};
type Mode = "sign-in" | "sign-up" | "reset-password" | "update-password";

export function AuthPanel({ configured, recovery = false, reset = false, next = "/my-nirmol", initialError = "", notice = "" }: { configured: boolean; recovery?: boolean; reset?: boolean; next?: string; initialError?: string; notice?: string }) {
  const { lang, setLang } = useI18n(), t = COPY[lang];
  const [mode, setMode] = useState<Mode>(recovery ? "update-password" : reset ? "reset-password" : "sign-in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError), [message, setMessage] = useState(notice === "password-updated" ? notice : "");
  const pending = useRef(false), controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const changeMode = (value: Mode) => { if (pending.current) return; setMode(value); setError(""); setMessage(""); setPassword(""); setConfirm(""); setVisible(false); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current || !configured) return;
    setError(""); setMessage("");
    if ((mode === "sign-up" || mode === "update-password") && !validPassword(password)) return setError("weak");
    if ((mode === "sign-up" || mode === "update-password") && password !== confirm) return setError("mismatch");
    pending.current = true; setBusy(true);
    const abort = new AbortController(); controller.current = abort;
    const timer = window.setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch("/api/auth", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, signal: abort.signal,
        body: JSON.stringify({ action: mode, ...(mode !== "update-password" ? { email } : {}), ...(mode !== "reset-password" ? { password } : {}), next: safeRedirect(next) }) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) { setError(typeof result.error === "string" ? result.error : "auth-unavailable"); return; }
      setPassword(""); setConfirm("");
      if (result.redirectTo) { notifyAuthChange(); window.location.assign(result.redirectTo === "/login?notice=password-updated" ? result.redirectTo : safeRedirect(result.redirectTo)); return; }
      setMessage(typeof result.message === "string" ? result.message : "");
      if (mode === "update-password") setMode("sign-in");
    } catch { if (!abort.signal.aborted || controller.current === abort) setError("auth-unavailable"); }
    finally { window.clearTimeout(timer); pending.current = false; setBusy(false); }
  };
  const errorText = error === "mismatch" ? t.mismatch : error === "weak" ? t.weak : t.errors[error as keyof typeof t.errors] ?? (error ? t.errors["auth-unavailable"] : "");
  const messageText = message === "confirmation-sent" ? t.confirmation : message === "reset-sent" ? t.sent : message === "password-updated" ? t.updated : "";
  const title = mode === "sign-in" ? t.signin : mode === "sign-up" ? t.signup : mode === "reset-password" ? t.reset : t.recovery;
  return <main className={styles.scene}>
    <p className="sr-only">{t.image}</p>
    <aside className={styles.brand} aria-hidden="true">
      <div className={styles.brandTop}><span className={styles.brandMark}><Icon name="wind" size={24} /></span>{lang === "bn" ? "নির্মল" : "Nirmol"}</div>
      <div>
        <h2>{t.brandTitle}</h2>
        <p className={styles.brandLead}>{t.brandLead}</p>
        <ul className={styles.features}>
          {([[t.f1, t.f1Body, "trend"], [t.f2, t.f2Body, "activity"], [t.f3, t.f3Body, "map"]] as const).map(([title, body, icon]) => <li key={icon}><span className={styles.featureIcon}><Icon name={icon} /></span><div><strong>{title}</strong><span>{body}</span></div></li>)}
        </ul>
      </div>
      <p className={styles.brandFoot}>{t.brandFoot}</p>
    </aside>
    <div className={styles.formSide}>
    <section className={styles.card} aria-labelledby="auth-heading">
      <div className={styles.top}><Link href="/">← {t.guest}</Link><button type="button" className={styles.language} aria-label={`${t.language}: ${lang === "en" ? "বাংলা" : "English"}`} onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button></div>
      <span className={styles.logo}><Icon name="wind" size={28} /></span>
      <h1 id="auth-heading">{title}</h1><p className={styles.intro}>{t.intro}</p>
      {(mode === "sign-in" || mode === "sign-up") && <div role="tablist" aria-label={t.tabs} className={styles.tabs}>
        <span aria-hidden="true" className={`${styles.thumb} ${mode === "sign-up" ? styles.thumbRight : ""}`} />
        {(["sign-in", "sign-up"] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={mode === value} disabled={busy} onClick={() => changeMode(value)}>{value === "sign-in" ? t.tabSignin : t.tabSignup}</button>)}
      </div>}
      {!configured && <p role="status" className={styles.notice}><Icon name="info" size={18} />{t.config}</p>}
      {errorText && <p role="alert" className={`${styles.notice} ${styles.error}`}><Icon name="info" size={18} />{errorText}</p>}
      {messageText && <p role="status" className={styles.notice}><Icon name="leaf" size={18} />{messageText}</p>}
      {configured && (mode === "sign-in" || mode === "sign-up") && <>
        <a className={styles.google} href={`/auth/google?next=${encodeURIComponent(next)}`} aria-disabled={busy}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          {t.google}
        </a>
        <p className={styles.divider}><span>{t.or}</span></p>
      </>}
      <form className={styles.form} onSubmit={submit} aria-busy={busy}>
        {mode !== "update-password" && <label className={styles.field}>{t.email}<input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} disabled={busy} /></label>}
        {mode !== "reset-password" && <div className={styles.field}><label htmlFor="auth-password">{t.password}</label><span className={styles.password}><input id="auth-password" name="password" type={visible ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={128} disabled={busy} /><button type="button" aria-label={`${visible ? t.hide : t.show} ${t.password}`} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name={visible ? "revealOff" : "reveal"} size={22} /></button></span>{(mode === "sign-up" || mode === "update-password") && <span className={styles.hint}>{t.hint}</span>}</div>}
        {(mode === "sign-up" || mode === "update-password") && <label className={styles.field}>{t.confirm}<input name="confirmPassword" type={visible ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required maxLength={128} disabled={busy} /></label>}
        {mode === "sign-in" && <button type="button" className={styles.forgot} disabled={busy} onClick={() => changeMode("reset-password")}>{t.forgot}</button>}
        <button className={styles.primary} type="submit" disabled={busy || !configured}>{busy ? <><span className={styles.spinner} aria-hidden="true" />{t.working}</> : mode === "sign-in" ? t.submit : mode === "sign-up" ? t.create : mode === "reset-password" ? t.send : t.update}</button>
      </form>
      <div className={styles.actions}>{mode === "sign-in" ? <><span>{t.newHere}</span><button type="button" className={styles.secondary} disabled={busy} onClick={() => changeMode("sign-up")}>{t.create}</button></> : <button type="button" className={styles.secondary} disabled={busy} onClick={() => changeMode("sign-in")}>{t.back}</button>}</div>
      <p className={styles.privacy}><Icon name="shield" size={16} />{t.privacy}</p>
    </section>
    </div>
  </main>;
}
