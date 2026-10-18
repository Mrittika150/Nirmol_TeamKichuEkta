"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { readGpsPosition } from "@/lib/location";
import { PlaceOptions } from "./PlaceOptions";
import { inBangladesh, PLACES } from "@/lib/places";
import { dhakaInput, parseDhakaInput } from "@/lib/travel";
import { isUuid, parseCreateReport, RAW_PHOTO_LIMIT, readOwnReport, readSourceSuggestion, REPORT_CATEGORIES, type CreateReport,
  type IncidentLocation, type OwnReport, type ReportCategory, type SourceSuggestion } from "@/lib/reports";

const TEXT = {
  en: { title:"Report pollution", intro:"Seen rubbish burning, construction dust or black smoke? Tell us. Your report helps map pollution sources. A report is what you saw, not proof of who caused it.", tagline:"Clean air, healthy life.", back:"Dashboard", account:"My Nirmol", guest:"Sign in to send a report and track it. You can still check air quality without an account.", login:"Sign in / Create account", checking:"Checking your account…", authError:"We couldn't confirm you're signed in. Your reports stay hidden until we can.", verify:"Try again", form:"What did you see?", photo:"Photo (optional)", photoHelp:"JPEG, PNG or WebP, up to 4 MB. We remove hidden photo data and resize it. Please avoid faces, number plates and house numbers. Photos stay private.", photoSelected:"Selected photo (not uploaded yet)", upload:"Upload photo", remove:"Remove photo", photoReady:"Photo ready", noPhoto:"No photo? No problem. You can still send a report.", category:"Type of pollution", choose:"Choose a type", categoryConfirm:"I've checked the type. I know this is what I saw, not proof.", description:"Short note (optional)", descriptionHelp:"Describe what you saw. Don't add names, phone numbers, home addresses or health details.", observed:"When did you see it? (Dhaka time)", observationHelp:"Within the last 7 days.", incident:"Where did you see it?", incidentHelp:"Mark the place where you saw it. It can be different from where you are now. Pick a city to start, then adjust the point.", preset:"Start from a city", lat:"Latitude", lon:"Longitude", gps:"Use my current location", coordinates:"Selected point", gpsInfo:"GPS accuracy", unknownAccuracy:"GPS accuracy not available.", captured:"GPS taken at", manual:"Point chosen by hand.", confirm:"This is the right place. I'm OK with Nirmol saving this exact point privately.", publicConsent:"After a moderator approves it, the type, date and a rough area (about 5 km) can be shown on the public map. My note and photo stay private.", precision:"The public map only shows a rough area of about 5 km, never the exact point. Very few reports in an area can still make it easier to guess.", ai:"AI suggestion (optional)", aiHelp:"Nirmol can ask Google Gemini to suggest the pollution type from your photo and note. It can't measure pollution or approve reports. You can always choose the type yourself.", aiConsent:"Send this photo and note to Gemini for a suggestion. Your location and account details are not sent.", classify:"Get AI suggestion", aiDisabled:"AI suggestions are off right now. Please choose the type yourself.", suggestion:"AI suggestion", useSuggestion:"Use this", dismiss:"No thanks", suggestionHint:"Use it, change it or ignore it. Then confirm the type yourself.", submit:"Send report", retry:"Try sending again", frozen:"We're not sure your report went through. Tap retry: it won't create a duplicate. You can also check My reports.", busy:"Please wait…", success:"Report sent! Waiting for review.", successHelp:"Only you can see it until a moderator approves it.", another:"Send another report", reports:"My reports", refresh:"Refresh", empty:"You haven't sent any reports yet.", loadMore:"Show older reports", withdraw:"Delete report", withdrawn:"Report deleted. It won't appear on the public map.", reviewReason:"Reviewer's note", loading:"Loading…", footer:"Photo and AI are optional. Please don't share personal or health information in reports.", denied:"Location access was blocked. Pick a city or type the coordinates instead.", unavailable:"Can't get your location right now. You can still pick the place by hand.", timeout:"Finding your location took too long. Try again or pick the place by hand.", poor:"GPS isn't accurate enough (more than 1 km off). Try outside or pick the place by hand.", outside:"That point looks outside Bangladesh. Please choose a place inside the country.", expired:"That location is too old. Get a new one or pick the place by hand.", invalid:"Your device sent a location we can't use.", locating:"Finding your location…", invalidForm:"Please check the type, time and place. If more than 5 minutes have passed, confirm the place again.", invalidPhoto:"We can't use this photo. Use a JPEG, PNG or WebP under 4 MB, or send without a photo.", unavailableService:"Reporting isn't working right now, so your report wasn't saved. Please try again.", rate:"You've reached the limit for now. Try again later, or send without a photo or AI.", aiError:"AI couldn't give a suggestion. You can still choose the type and send.", uploadProgress:"Your photo is still processing. Try again in a moment.", conflict:"This looks like a repeat of an earlier report. Check My reports.", photoCleanup:"The photo is being deleted. It stays private until then." },
  bn: { title:"দূষণ রিপোর্ট করুন", intro:"ময়লা পোড়ানো, নির্মাণের ধুলা বা কালো ধোঁয়া দেখেছেন? আমাদের জানান। আপনার রিপোর্ট দূষণের উৎস খুঁজে পেতে সাহায্য করে। রিপোর্ট মানে আপনি যা দেখেছেন, কে দায়ী তার প্রমাণ নয়।", tagline:"নির্মল বাতাস, সুস্থ জীবন।", back:"ড্যাশবোর্ড", account:"আমার নির্মল", guest:"রিপোর্ট পাঠাতে ও ট্র্যাক করতে সাইন ইন করুন। অ্যাকাউন্ট ছাড়াও বাতাসের অবস্থা দেখতে পারবেন।", login:"সাইন ইন / অ্যাকাউন্ট খুলুন", checking:"আপনার অ্যাকাউন্ট চেক করা হচ্ছে…", authError:"আপনি সাইন ইন আছেন কিনা নিশ্চিত হওয়া যায়নি। নিশ্চিত না হওয়া পর্যন্ত আপনার রিপোর্ট লুকানো থাকবে।", verify:"আবার চেষ্টা করুন", form:"আপনি কী দেখেছেন?", photo:"ছবি (ঐচ্ছিক)", photoHelp:"JPEG, PNG বা WebP, সর্বোচ্চ ৪ MB। ছবির লুকানো তথ্য মুছে সাইজ ছোট করা হয়। মানুষের মুখ, গাড়ির নম্বর প্লেট বা বাসার নম্বর এড়িয়ে চলুন। ছবি প্রাইভেট থাকে।", photoSelected:"বাছাই করা ছবি (এখনো আপলোড হয়নি)", upload:"ছবি আপলোড করুন", remove:"ছবি সরান", photoReady:"ছবি রেডি", noPhoto:"ছবি নেই? সমস্যা নেই, ছবি ছাড়াও রিপোর্ট পাঠাতে পারবেন।", category:"দূষণের ধরন", choose:"ধরন বেছে নিন", categoryConfirm:"আমি ধরন চেক করেছি। এটা আমি যা দেখেছি, প্রমাণ নয়।", description:"ছোট নোট (ঐচ্ছিক)", descriptionHelp:"যা দেখেছেন তা লিখুন। কারো নাম, ফোন নম্বর, বাসার ঠিকানা বা স্বাস্থ্যের তথ্য দেবেন না।", observed:"কখন দেখেছেন? (ঢাকার সময়)", observationHelp:"গত ৭ দিনের মধ্যে।", incident:"কোথায় দেখেছেন?", incidentHelp:"যেখানে দেখেছেন সেই জায়গা দিন। এটা আপনার এখনকার লোকেশন থেকে আলাদা হতে পারে। একটি শহর বেছে শুরু করুন, তারপর পয়েন্ট ঠিক করুন।", preset:"একটি শহর থেকে শুরু করুন", lat:"ল্যাটিচিউড", lon:"লংগিচিউড", gps:"আমার এখনকার লোকেশন ব্যবহার করুন", coordinates:"বাছাই করা পয়েন্ট", gpsInfo:"GPS কতটা সঠিক", unknownAccuracy:"GPS কতটা সঠিক তা জানা নেই।", captured:"GPS নেওয়ার সময়", manual:"হাতে বাছাই করা পয়েন্ট।", confirm:"জায়গাটি ঠিক আছে। নির্মল এই পয়েন্টটি প্রাইভেটভাবে সেভ করতে পারে।", publicConsent:"মডারেটর অনুমোদন দিলে ধরন, তারিখ আর আনুমানিক এলাকা (প্রায় ৫ কিমি) পাবলিক ম্যাপে দেখানো যাবে। আমার নোট আর ছবি প্রাইভেট থাকবে।", precision:"পাবলিক ম্যাপে শুধু প্রায় ৫ কিমির আনুমানিক এলাকা দেখায়, ঠিক পয়েন্ট কখনো নয়। কোনো এলাকায় খুব কম রিপোর্ট থাকলে অনুমান করা সহজ হতে পারে।", ai:"AI সাজেশন (ঐচ্ছিক)", aiHelp:"আপনার ছবি আর নোট দেখে Google Gemini দূষণের ধরন সাজেস্ট করতে পারে। এটি দূষণ মাপতে বা রিপোর্ট অনুমোদন করতে পারে না। আপনি সবসময় নিজেই ধরন বেছে নিতে পারবেন।", aiConsent:"সাজেশনের জন্য এই ছবি আর নোট Gemini-তে পাঠান। আপনার লোকেশন বা অ্যাকাউন্টের তথ্য পাঠানো হয় না।", classify:"AI সাজেশন নিন", aiDisabled:"AI সাজেশন এখন বন্ধ আছে। নিজেই ধরন বেছে নিন।", suggestion:"AI সাজেশন", useSuggestion:"এটি নিন", dismiss:"দরকার নেই", suggestionHint:"সাজেশনটি নিন, বদলান বা বাদ দিন। তারপর নিজে ধরন কনফার্ম করুন।", submit:"রিপোর্ট পাঠান", retry:"আবার পাঠান", frozen:"রিপোর্টটি পৌঁছেছে কিনা নিশ্চিত না। আবার পাঠান চাপুন, এতে ডুপ্লিকেট হবে না। চাইলে ‘আমার রিপোর্ট’ চেক করুন।", busy:"একটু অপেক্ষা করুন…", success:"রিপোর্ট পাঠানো হয়েছে! রিভিউয়ের অপেক্ষায়।", successHelp:"মডারেটর অনুমোদন না দেওয়া পর্যন্ত শুধু আপনি এটি দেখতে পাবেন।", another:"আরেকটি রিপোর্ট পাঠান", reports:"আমার রিপোর্ট", refresh:"রিফ্রেশ", empty:"আপনি এখনো কোনো রিপোর্ট পাঠাননি।", loadMore:"আগের রিপোর্ট দেখুন", withdraw:"রিপোর্ট মুছুন", withdrawn:"রিপোর্ট মুছে ফেলা হয়েছে। এটি পাবলিক ম্যাপে দেখাবে না।", reviewReason:"রিভিউয়ারের নোট", loading:"লোড হচ্ছে…", footer:"ছবি ও AI ঐচ্ছিক। রিপোর্টে ব্যক্তিগত বা স্বাস্থ্যের তথ্য দেবেন না।", denied:"লোকেশনের অনুমতি বন্ধ। একটি শহর বেছে নিন বা কোঅর্ডিনেট লিখুন।", unavailable:"এখন লোকেশন পাওয়া যাচ্ছে না। হাতে জায়গা বেছে নিতে পারবেন।", timeout:"লোকেশন পেতে বেশি সময় লাগছে। আবার চেষ্টা করুন বা হাতে জায়গা বেছে নিন।", poor:"GPS যথেষ্ট সঠিক না (১ কিমির বেশি ভুল)। বাইরে গিয়ে চেষ্টা করুন বা হাতে জায়গা বেছে নিন।", outside:"পয়েন্টটি বাংলাদেশের বাইরে মনে হচ্ছে। দেশের ভেতরের একটি জায়গা বেছে নিন।", expired:"লোকেশনটি অনেক পুরনো। নতুন লোকেশন নিন বা হাতে জায়গা বেছে নিন।", invalid:"আপনার ডিভাইস থেকে আসা লোকেশন ব্যবহার করা যাচ্ছে না।", locating:"লোকেশন খোঁজা হচ্ছে…", invalidForm:"ধরন, সময় আর জায়গা আবার চেক করুন। ৫ মিনিটের বেশি হয়ে গেলে জায়গা আবার কনফার্ম করুন।", invalidPhoto:"এই ছবি ব্যবহার করা যাচ্ছে না। ৪ MB-এর কম JPEG, PNG বা WebP দিন, অথবা ছবি ছাড়া পাঠান।", unavailableService:"রিপোর্টিং এখন কাজ করছে না, তাই রিপোর্ট সেভ হয়নি। আবার চেষ্টা করুন।", rate:"এখনকার লিমিট শেষ। পরে চেষ্টা করুন, অথবা ছবি বা AI ছাড়া পাঠান।", aiError:"AI সাজেশন দিতে পারেনি। নিজে ধরন বেছে রিপোর্ট পাঠাতে পারবেন।", uploadProgress:"ছবিটি এখনো প্রসেস হচ্ছে। একটু পরে আবার চেষ্টা করুন।", conflict:"এটি আগের একটি রিপোর্টের মতো মনে হচ্ছে। ‘আমার রিপোর্ট’ চেক করুন।", photoCleanup:"ছবিটি মুছে ফেলা হচ্ছে। ততক্ষণ এটি প্রাইভেট থাকবে।" },
};
const CATEGORY = {
  en:{waste_burning:"Waste burning",construction_dust:"Construction dust",vehicle_smoke:"Vehicle smoke / exhaust",industrial_smoke:"Industrial smoke",brick_kiln:"Brick kiln",other:"Other",uncertain:"Uncertain / cannot determine"},
  bn:{waste_burning:"বর্জ্য পোড়ানো",construction_dust:"নির্মাণের ধুলা",vehicle_smoke:"যানবাহনের ধোঁয়া",industrial_smoke:"শিল্পকারখানার ধোঁয়া",brick_kiln:"ইটভাটা",other:"অন্যান্য",uncertain:"অনিশ্চিত / নির্ধারণ করা যাচ্ছে না"},
};
const STATUS={en:{submitted:"Pending review",approved:"Approved observation",rejected:"Rejected",forwarded:"Forwarded",resolved:"Resolved"},bn:{submitted:"পর্যালোচনার অপেক্ষায়",approved:"অনুমোদিত পর্যবেক্ষণ",rejected:"প্রত্যাখ্যাত",forwarded:"পাঠানো হয়েছে",resolved:"সমাধান হয়েছে"}};
const CARD="min-w-0 space-y-4 panel p-4 sm:p-5";
const FIELD="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-base";
const BUTTON="dashboard-primary min-h-11 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60";
const SECONDARY="min-h-11 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-60";
type Identity={id:string|null;phase:"checking"|"ready"|"guest"|"unavailable"};
type Suggestion=SourceSuggestion&{id:string;explanation:string};

export function PollutionReporting(){
  const {lang,setLang}=useI18n(),t=TEXT[lang];
  const [identity,setIdentity]=useState<Identity>({id:null,phase:"checking"});
  const sequence=useRef(0),verification=useRef<AbortController|null>(null),mounted=useRef(false);
  const verify=useCallback(async(reset=false)=>{
    const revision=++sequence.current;verification.current?.abort();const abort=new AbortController();verification.current=abort;
    setIdentity(old=>({id:reset?null:old.id,phase:"checking"}));
    const timer=setTimeout(()=>abort.abort(),12000);
    try{const response=await fetch("/api/auth",{cache:"no-store",signal:abort.signal});const body=await response.json();
      if(!mounted.current||revision!==sequence.current)return;
      if(response.status===401)setIdentity({id:null,phase:"guest"});
      else if(response.ok&&typeof body.user?.id==="string")setIdentity({id:body.user.id,phase:"ready"});
      else setIdentity(old=>({...old,phase:"unavailable"}));
    }catch{if(mounted.current&&revision===sequence.current)setIdentity(old=>({...old,phase:"unavailable"}));}
    finally{clearTimeout(timer);}
  },[]);
  const cancelVerification=useCallback(()=>{mounted.current=false;sequence.current++;verification.current?.abort();},[]);
  const accountChanged=useCallback(()=>{void verify(true);},[verify]);
  useEffect(()=>{
    mounted.current=true;void verify();
    const focus=()=>{if(!document.hidden)void verify();};
    const restore=(e:PageTransitionEvent)=>{if(e.persisted)focus();};
    let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel("nirmol.auth.v1");channel.onmessage=e=>{if(e.data==="session-changed")void verify(true);else if(e.data==="verify-session")void verify();};}catch{}
    window.addEventListener("focus",focus);document.addEventListener("visibilitychange",focus);window.addEventListener("pageshow",restore);
    const timer=setInterval(focus,60000);
    return()=>{cancelVerification();channel?.close();clearInterval(timer);window.removeEventListener("focus",focus);document.removeEventListener("visibilitychange",focus);window.removeEventListener("pageshow",restore);};
  },[verify,cancelVerification]);
  return <main className="dashboard mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
    <header className="flex items-start justify-end gap-3"><div><Link href="/" className="sr-only">{lang==="bn"?"নির্মল":"Nirmol"}</Link></div><button className={SECONDARY} onClick={()=>setLang(lang==="en"?"bn":"en")} aria-label={`Switch language: ${lang==="en"?"বাংলা":"English"}`}>{lang==="en"?"বাংলা":"English"}</button></header>
    <section className={CARD}><h1 className="text-2xl font-semibold">{t.title}</h1><p className="leading-relaxed">{t.intro}</p><Link className="back-link" href="/community">{lang === "en" ? "Explore approved observations on Community Map" : "কমিউনিটি ম্যাপে অনুমোদিত পর্যবেক্ষণ দেখুন"}</Link></section>
    {identity.phase==="checking"&&<p role="status">{t.checking}</p>}
    {identity.phase==="guest"&&<section className={CARD}><p>{t.guest}</p><Link className="dashboard-primary inline-flex min-h-11 w-fit items-center rounded-xl px-5 text-sm font-semibold" href="/login?next=/reports">{t.login}</Link></section>}
    {identity.phase==="unavailable"&&<section role="alert" className={CARD}><p>{t.authError}</p><button className={BUTTON} onClick={()=>void verify()}>{t.verify}</button></section>}
    {identity.id&&<ReportForm key={identity.id} userId={identity.id} active={identity.phase==="ready"} accountChanged={accountChanged}/>}
    <footer className="panel p-4 text-xs leading-relaxed text-[var(--muted)]">{t.footer} {lang==="en"?"AI provider:":"AI তথ্যদাতা:"} <a className="underline" href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noreferrer">Google Gemini</a>.</footer>
  </main>;
}

function ReportForm({userId,active,accountChanged}:{userId:string;active:boolean;accountChanged:()=>void}){
  const {lang,num}=useI18n(),t=TEXT[lang];
  const [category,setCategory]=useState<ReportCategory|"">(""),[categoryConfirmed,setCategoryConfirmed]=useState(false),[description,setDescription]=useState(""),[observed,setObserved]=useState("");
  const [lat,setLat]=useState(""),[lon,setLon]=useState(""),[gps,setGps]=useState<{capturedAt:string;accuracyM:number|null}|null>(null),[confirmedAt,setConfirmedAt]=useState<string|null>(null),[publicConsent,setPublicConsent]=useState(false);
  const [file,setFile]=useState<File|null>(null),[imageId,setImageId]=useState<string|null>(null),[imageSize,setImageSize]=useState({width:1,height:1}),[aiConsent,setAiConsent]=useState(false),[suggestion,setSuggestion]=useState<Suggestion|null>(null),[aiEnabled,setAiEnabled]=useState(false);
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState<keyof typeof TEXT.en|null>(null),[geoNotice,setGeoNotice]=useState<keyof typeof TEXT.en|null>(null),[receipt,setReceipt]=useState<OwnReport|null>(null),[frozen,setFrozen]=useState(false);
  const [reports,setReports]=useState<OwnReport[]>([]),[loading,setLoading]=useState(false),[next,setNext]=useState<string|null>(null);
  const alive=useRef(true),generation=useRef(0),historySequence=useRef(0),controllers=useRef(new Set<AbortController>()),pending=useRef(false),snapshot=useRef<CreateReport|null>(null),uploadId=useRef<string|null>(null),imageRef=useRef<string|null>(null),geoSequence=useRef(0),geoTimer=useRef<ReturnType<typeof setTimeout>|null>(null),fileInput=useRef<HTMLInputElement>(null);
  const activeRef=useRef(active);activeRef.current=active;
  const receiptRef=useRef<HTMLElement>(null),categoryRef=useRef<HTMLSelectElement>(null),focusedReceipt=useRef<string|null>(null),restartFocus=useRef(false);
  useEffect(()=>{
    if(!active)return;
    if(receipt&&focusedReceipt.current!==receipt.id){receiptRef.current?.focus();focusedReceipt.current=receipt.id;}
    else if(!receipt&&restartFocus.current){categoryRef.current?.focus();restartFocus.current=false;}
  },[active,receipt]);
  const current=useCallback((g:number)=>alive.current&&activeRef.current&&generation.current===g,[]);
  const cancelOperations=useCallback(()=>{generation.current++;historySequence.current++;controllers.current.forEach(c=>c.abort());geoSequence.current++;if(geoTimer.current)clearTimeout(geoTimer.current);},[]);
  useEffect(()=>{alive.current=true;setObserved(dhakaInput(Date.now()));return()=>{alive.current=false;cancelOperations();};},[cancelOperations]);
  useEffect(()=>{if(!active){generation.current++;controllers.current.forEach(c=>c.abort());pending.current=false;setBusy(false);geoSequence.current++;if(geoTimer.current)clearTimeout(geoTimer.current);}},[active]);
  const call=useCallback(async(url:string,init:RequestInit={})=>{
    const abort=new AbortController();controllers.current.add(abort);const timer=setTimeout(()=>abort.abort(),30000);
    try{
      const response=await fetch(url,{...init,cache:"no-store",signal:abort.signal,headers:{...init.headers,...(init.method&&init.method!=="GET"?{"x-expected-user":userId}:{})}});
      const data=await response.json();
      if(response.status===401||data.error==="account_changed"||(response.ok&&data.userId!==userId)){accountChanged();throw Error("account_changed");}
      if(!response.ok)throw Error(typeof data.error==="string"?data.error:"reporting_unavailable");
      return data;
    }finally{clearTimeout(timer);controllers.current.delete(abort);}
  },[accountChanged,userId]);
  const failure=useCallback((error:unknown,ai=false)=>{
    const code=error instanceof Error?error.message:"";
    if(code==="account_changed")return;
    if(["rate_limited","storage_capacity","classification_quota"].includes(code))setNotice("rate");
    else if(["invalid_photo","photo_too_large","request_too_large"].includes(code))setNotice("invalidPhoto");
    else if(code==="upload_in_progress")setNotice("uploadProgress");
    else if(code==="request_conflict")setNotice("conflict");
    else setNotice(ai?"aiError":"unavailableService");
  },[]);
  const load=useCallback(async(after:string|null=null)=>{
    const g=generation.current,revision=++historySequence.current;setLoading(true);
    try{const body=await call(`/api/reports${after?`?after=${after}`:""}`);const rows=Array.isArray(body.reports)?body.reports.map(readOwnReport):null;
      if(!rows||rows.some((r:OwnReport|null)=>!r)||!(body.next===null||isUuid(body.next)))throw Error("reporting_unavailable");
      if(current(g)&&revision===historySequence.current){setReports(old=>after?[...old,...rows].filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i):rows);setNext(body.next);setAiEnabled(body.aiEnabled===true);
        const known=rows.find((r:OwnReport)=>r.requestId===snapshot.current?.requestId);if(known){snapshot.current=null;setFrozen(false);setReceipt(known);}
      }
    }catch(e){if(current(g)&&revision===historySequence.current)failure(e);}finally{if(current(g)&&revision===historySequence.current)setLoading(false);}
  },[call,current,failure]);
  useEffect(()=>{if(active)void load();},[active,load]);
  async function operation(work:(g:number)=>Promise<void>){
    if(pending.current||!activeRef.current)return;pending.current=true;setBusy(true);setNotice(null);const g=generation.current;
    try{await work(g);}catch(e){if(current(g))failure(e);}finally{if(current(g)){pending.current=false;setBusy(false);}}
  }
  function changePoint(latitude:string,longitude:string){geoSequence.current++;if(geoTimer.current)clearTimeout(geoTimer.current);setGeoNotice(null);setLat(latitude);setLon(longitude);setGps(null);setConfirmedAt(null);}
  function locate(){
    const attempt=++geoSequence.current;if(geoTimer.current)clearTimeout(geoTimer.current);
    if(!navigator.geolocation){setGeoNotice("unavailable");return;}setGeoNotice("locating");
    geoTimer.current=setTimeout(()=>{if(alive.current&&attempt===geoSequence.current){geoSequence.current++;setGeoNotice("timeout");}},11000);
    try{navigator.geolocation.getCurrentPosition(position=>{
      if(!alive.current||!activeRef.current||attempt!==geoSequence.current)return;
      if(geoTimer.current)clearTimeout(geoTimer.current);geoSequence.current++;
      const result=readGpsPosition(position,Date.now());if(!result.ok){setGeoNotice(result.reason);return;}
      setLat(String(result.lat));setLon(String(result.lon));setGps({capturedAt:result.evidence.capturedAt!,accuracyM:result.evidence.accuracyM??null});setConfirmedAt(null);setGeoNotice(null);
    },error=>{if(alive.current&&attempt===geoSequence.current){if(geoTimer.current)clearTimeout(geoTimer.current);geoSequence.current++;setGeoNotice(error.code===1?"denied":error.code===3?"timeout":"unavailable");}},{maximumAge:0,timeout:10000,enableHighAccuracy:true});}
    catch{if(geoTimer.current)clearTimeout(geoTimer.current);geoSequence.current++;setGeoNotice("unavailable");}
  }
  async function ensureImage(g:number){
    if(!file)return null;if(imageRef.current)return imageRef.current;
    uploadId.current??=crypto.randomUUID();
    const body=await call("/api/reports/images",{method:"POST",headers:{"Content-Type":file.type,"x-file-name":encodeURIComponent(file.name),"x-report-request-id":uploadId.current},body:file});
    if(!isUuid(body.image?.id)||typeof body.image.width!=="number"||typeof body.image.height!=="number")throw Error("invalid_photo");
    if(!current(g))throw Error("account_changed");
    imageRef.current=body.image.id;setImageId(body.image.id);setImageSize({width:body.image.width,height:body.image.height});return body.image.id as string;
  }
  function pickPhoto(selected:File|null){
    if(!selected)return;
    if(selected.size>RAW_PHOTO_LIMIT||!["image/jpeg","image/png","image/webp"].includes(selected.type)){setNotice("invalidPhoto");return;}
    setFile(selected);uploadId.current=null;imageRef.current=null;setImageId(null);setSuggestion(null);setAiConsent(false);setNotice(null);
  }
  async function removePhoto(g:number){
    const id=imageRef.current;setFile(null);setImageId(null);imageRef.current=null;uploadId.current=null;setSuggestion(null);setAiConsent(false);if(fileInput.current)fileInput.current.value="";
    if(id)try{await call(`/api/reports/images/${id}`,{method:"DELETE"});}catch{if(current(g))setNotice("photoCleanup");}
  }
  async function classify(g:number){
    if(!aiConsent)return;const id=await ensureImage(g);if(!id)return;
    try{const body=await call("/api/reports/classify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId:crypto.randomUUID(),imageId:id,description:description.trim(),language:lang,consent:true})});
      const parsed=readSourceSuggestion(body.suggestion&&{category:body.suggestion.category,evidence:body.suggestion.evidence,uncertainty:body.suggestion.uncertainty});
      if(!parsed||!isUuid(body.suggestion.id)||typeof body.suggestion.explanation!=="string")throw Error("classification_invalid");
      if(current(g))setSuggestion({...parsed,id:body.suggestion.id,explanation:body.suggestion.explanation});
    }catch(e){if(current(g))failure(e,true);}
  }
  function candidate():CreateReport|null{
    const observedMs=parseDhakaInput(observed);if(!Number.isFinite(observedMs)||!confirmedAt)return null;
    const incident:IncidentLocation={lat:Number(lat),lon:Number(lon),source:gps?"gps":"manual",confirmedAt,capturedAt:gps?.capturedAt??null,accuracyM:gps?.accuracyM??null,consent:true};
    return parseCreateReport({requestId:crypto.randomUUID(),category,description:description.trim(),observedAt:new Date(observedMs).toISOString(),incident,imageId:null,suggestionId:null,categoryConfirmed,publicConsent},Date.now());
  }
  async function submit(g:number){
    if(!snapshot.current){const value=candidate();if(!value){setNotice("invalidForm");return;}
      const id=await ensureImage(g);snapshot.current={...value,imageId:id,suggestionId:id?suggestion?.id??null:null};setFrozen(true);
    }
    try{const body=await call("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(snapshot.current)});const saved=readOwnReport(body.report);if(!saved)throw Error("reporting_unavailable");
      if(current(g)){setReceipt(saved);setFrozen(false);snapshot.current=null;void load();}
    }catch(e){if(current(g)){
      const code=e instanceof Error?e.message:"";
      if(["invalid_report","confirmation_expired","unsupported_location","invalid_suggestion","image_unavailable","rate_limited"].includes(code)){
        snapshot.current=null;setFrozen(false);setConfirmedAt(null);
        if(code==="image_unavailable"){imageRef.current=null;setImageId(null);uploadId.current=null;}
        if(code==="rate_limited")failure(e);else setNotice("invalidForm");
      }else failure(e);
    }}
  }
  function reset(){restartFocus.current=true;focusedReceipt.current=null;snapshot.current=null;uploadId.current=null;imageRef.current=null;setReceipt(null);setFrozen(false);setFile(null);setImageId(null);setSuggestion(null);setCategory("");setCategoryConfirmed(false);setDescription("");setObserved(dhakaInput(Date.now()));changePoint("","");setPublicConsent(false);setAiConsent(false);setNotice(null);}
  const pointValid=lat.trim()!==""&&lon.trim()!==""&&inBangladesh(Number(lat),Number(lon));
  return <div hidden={!active} data-testid="report-private" className="space-y-5">
    {notice&&<p role="alert" className="rounded-xl border border-[var(--border)] p-3 text-sm">{t[notice]}</p>}
    {busy&&<p role="status">{t.busy}</p>}
    {receipt?<section ref={receiptRef} tabIndex={-1} aria-labelledby="report-receipt-title" className={`${CARD} focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]`} data-testid="report-receipt"><h2 id="report-receipt-title" className="text-xl font-semibold">{t.success}</h2><p>{t.successHelp}</p><p className="break-all text-sm">{receipt.id}</p><p>{CATEGORY[lang][receipt.category]} · {STATUS[lang][receipt.status]}</p><button type="button" className={BUTTON} onClick={reset}>{t.another}</button></section>:
    <form onSubmit={e=>{e.preventDefault();void operation(submit);}} className="space-y-5">
      {frozen&&<p role="status" className={CARD}>{t.frozen}</p>}
      <fieldset disabled={busy||frozen||!active} className={CARD}><legend className="text-lg font-semibold">{t.form}</legend>
        <label className="block text-sm font-medium">{t.category}<select ref={categoryRef} className={FIELD} value={category} required onChange={e=>{setCategory(e.target.value as ReportCategory);setCategoryConfirmed(false);}}><option value="">{t.choose}</option>{REPORT_CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY[lang][c]}</option>)}</select></label>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" checked={categoryConfirmed} onChange={e=>setCategoryConfirmed(e.target.checked)}/>{t.categoryConfirm}</label>
        <div><label htmlFor="report-description" className="block text-sm font-medium">{t.description}</label><textarea id="report-description" className={FIELD} rows={3} maxLength={1000} value={description} onChange={e=>{setDescription(e.target.value);setSuggestion(null);}} aria-describedby="report-description-help"/></div><p id="report-description-help" className="text-xs text-[var(--muted)]">{t.descriptionHelp}</p>
        <label className="block text-sm font-medium">{t.observed}<input className={FIELD} type="datetime-local" value={observed} required onChange={e=>setObserved(e.target.value)}/></label><p className="text-xs text-[var(--muted)]">{t.observationHelp}</p>
      </fieldset>
      <fieldset disabled={busy||frozen||!active} className={CARD}><legend className="text-lg font-semibold">{t.incident}</legend><p className="text-sm">{t.incidentHelp}</p>
        <label className="block text-sm font-medium">{t.preset}<select className={FIELD} value="" onChange={e=>{const p=PLACES.find(x=>x.id===e.target.value);if(p)changePoint(String(p.lat),String(p.lon));}}><option value="">{lang==="bn"?"শহর/রেফারেন্স বাছুন":"Choose a city/reference"}</option><PlaceOptions /></select></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">{t.lat}<input className={FIELD} type="number" step="any" min={-90} max={90} value={lat} required onChange={e=>changePoint(e.target.value,lon)}/></label><label className="text-sm font-medium">{t.lon}<input className={FIELD} type="number" step="any" min={-180} max={180} value={lon} required onChange={e=>changePoint(lat,e.target.value)}/></label></div>
        <button type="button" className={SECONDARY} onClick={locate}>{t.gps}</button>{geoNotice&&<p role="status" className="text-sm">{t[geoNotice]}</p>}
        {lat&&lon&&<p className="break-words text-sm">{t.coordinates}: {num(Number(lat))}, {num(Number(lon))}</p>}
        <p className="text-xs text-[var(--muted)]">{gps?<>{gps.accuracyM===null?t.unknownAccuracy:`${t.gpsInfo}: ${num(gps.accuracyM)} m.`} {t.captured}: <time dateTime={gps.capturedAt}>{new Date(gps.capturedAt).toLocaleString(lang==="bn"?"bn-BD":"en-GB",{timeZone:"Asia/Dhaka"})}</time></>:t.manual}</p>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" disabled={!pointValid} checked={confirmedAt!==null} onChange={e=>setConfirmedAt(e.target.checked?new Date().toISOString():null)}/>{t.confirm}</label>
        <p className="text-xs text-[var(--muted)]">{t.precision}</p><label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" checked={publicConsent} onChange={e=>setPublicConsent(e.target.checked)}/>{t.publicConsent}</label>
      </fieldset>
      <fieldset disabled={busy||frozen||!active} className={CARD}><legend className="text-lg font-semibold">{t.photo}</legend><p className="text-sm">{t.photoHelp}</p><p className="text-xs text-[var(--muted)]">{t.noPhoto}</p>
        <label className="block text-sm font-medium">{t.photo}<input ref={fileInput} className={`${FIELD} file:mr-3 file:rounded-lg file:border-0 file:p-2`} type="file" accept="image/jpeg,image/png,image/webp" disabled={!!file} onChange={e=>pickPhoto(e.target.files?.[0]??null)}/></label>
        {file&&<><p className="break-all text-sm">{imageId?t.photoReady:t.photoSelected}: {file.name}</p><div className="flex flex-wrap gap-2">{!imageId&&<button type="button" className={SECONDARY} onClick={()=>void operation(async g=>{await ensureImage(g);})}>{t.upload}</button>}<button type="button" className={SECONDARY} onClick={()=>void operation(removePhoto)}>{t.remove}</button></div></>}
        {imageId&&<Image unoptimized src={`/api/reports/images/${imageId}`} alt={t.photoReady} width={imageSize.width} height={imageSize.height} className="max-h-72 w-auto max-w-full rounded-xl object-contain"/>}
      </fieldset>
      <fieldset disabled={busy||frozen||!active} className={CARD}><legend className="text-lg font-semibold">{t.ai}</legend><p className="text-sm">{t.aiHelp}</p>{!aiEnabled&&<p className="text-sm">{t.aiDisabled}</p>}
        <label className="flex items-start gap-3 text-sm"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" checked={aiConsent} onChange={e=>setAiConsent(e.target.checked)}/>{t.aiConsent}</label>
        <button type="button" className={SECONDARY} disabled={!file||!aiConsent||!aiEnabled} onClick={()=>void operation(classify)}>{t.classify}</button>
        {suggestion&&<aside className="space-y-3 rounded-xl bg-[var(--soft)] p-3"><h3 className="font-medium">{t.suggestion}: {CATEGORY[lang][suggestion.category]}</h3><p className="text-sm">{suggestion.explanation}</p><p className="text-xs">{t.suggestionHint}</p><div className="flex flex-wrap gap-2"><button type="button" className={SECONDARY} onClick={()=>{setCategory(suggestion.category);setCategoryConfirmed(false);}}>{t.useSuggestion}</button><button type="button" className={SECONDARY} onClick={()=>setSuggestion(null)}>{t.dismiss}</button></div></aside>}
      </fieldset>
      <button type="submit" className={`${BUTTON} w-full`} disabled={busy||!active}>{busy?t.busy:frozen?t.retry:t.submit}</button>
    </form>}
    <section className={CARD} data-testid="own-reports"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t.reports}</h2><button type="button" className={SECONDARY} disabled={loading||busy} onClick={()=>void load()}>{t.refresh}</button></div>
      {loading&&<p role="status">{t.loading}</p>}{!loading&&!reports.length&&<p>{t.empty}</p>}
      <ul className="space-y-3">{reports.map(r=><li key={r.id} className="space-y-2 rounded-xl border border-[var(--border)] p-3"><p className="font-medium">{CATEGORY[lang][r.category]} · {STATUS[lang][r.status]}</p><p className="break-words text-sm">{r.description}</p><time className="block text-xs" dateTime={r.observedAt}>{new Date(r.observedAt).toLocaleString(lang==="bn"?"bn-BD":"en-GB",{timeZone:"Asia/Dhaka"})}</time>{r.reviewReason&&<p className="break-words text-sm">{t.reviewReason}: {r.reviewReason}</p>}<button type="button" className={SECONDARY} disabled={busy} onClick={()=>void operation(async g=>{await call(`/api/reports/${r.id}`,{method:"DELETE"});if(current(g)){setReports(old=>old.filter(x=>x.id!==r.id));setNotice("withdrawn");}})}>{t.withdraw}</button></li>)}</ul>
      {next&&<button type="button" className={SECONDARY} disabled={loading||busy} onClick={()=>void load(next)}>{t.loadMore}</button>}
    </section>
  </div>;
}
