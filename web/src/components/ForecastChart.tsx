"use client";

import { useState } from "react";
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastPoint, ForecastSource } from "@/lib/air";
import { FORECAST_FEATURE_LABELS } from "@/lib/forecast-explanation";
import { useI18n } from "@/lib/i18n";

const WORDS = {
  en: {
    hour: "Pick an hour", heading: "Why this forecast?", selected: "Forecast", time: "Time (Dhaka)",
    source: "Source", nirmol: "Nirmol model", cams: "CAMS (Copernicus) via Open-Meteo",
    unavailable: "No explanation for this hour.", empty: "No forecast available right now. Tap refresh to try again.",
    meaning: "These are the 3 things that pushed this hour's forecast up or down the most. Up means more pollution expected; down means less.",
    caveat: "This shows what the model paid attention to. It doesn't prove what is causing the pollution.",
    geography: "The model was tested at the US Embassy monitor in Dhaka, not on every street or across the whole country.",
    input: "Factor", effect: "Effect", higher: "Pushes pollution up", lower: "Pushes pollution down", zero: "No effect",
    run: "Forecast run", issued: "Model updated", reference: "Dotted line: 15 µg/m³, the WHO daily guideline (not an hourly safe limit).",
    range: "Shaded area: where the real value will most likely be.",
    rangeName: "Likely range", chart: "Hourly PM2.5 forecast. Pick an hour below to see its value and why.",
  },
  bn: {
    hour: "ঘণ্টা বেছে নিন", heading: "এই পূর্বাভাস কেন?", selected: "পূর্বাভাস", time: "সময় (ঢাকা)",
    source: "সোর্স", nirmol: "নির্মল মডেল", cams: "Open-Meteo থেকে CAMS (Copernicus)",
    unavailable: "এই ঘণ্টার ব্যাখ্যা নেই।", empty: "এখন কোনো পূর্বাভাস নেই। আবার চেষ্টা করতে রিফ্রেশ চাপুন।",
    meaning: "এই ঘণ্টার পূর্বাভাস সবচেয়ে বেশি বাড়িয়েছে বা কমিয়েছে এমন ৩টি কারণ। বাড়ায় মানে দূষণ বেশি হতে পারে, কমায় মানে কম।",
    caveat: "এটি দেখায় মডেল কোন বিষয়গুলো বেশি গুরুত্ব দিয়েছে। দূষণের আসল কারণ এটি প্রমাণ করে না।",
    geography: "মডেলটি ঢাকার মার্কিন দূতাবাসের মনিটরে যাচাই করা, প্রতিটি রাস্তা বা পুরো দেশে নয়।",
    input: "কারণ", effect: "প্রভাব", higher: "দূষণ বাড়ায়", lower: "দূষণ কমায়", zero: "প্রভাব নেই",
    run: "পূর্বাভাস রান", issued: "মডেল আপডেট", reference: "ডট লাইন: ১৫ µg/m³, WHO-এর দৈনিক গাইডলাইন (ঘণ্টার নিরাপদ সীমা নয়)।",
    range: "ছায়া দেওয়া অংশ: আসল মান সম্ভবত এর মধ্যেই থাকবে।",
    rangeName: "সম্ভাব্য রেঞ্জ", chart: "ঘণ্টাভিত্তিক PM2.5 পূর্বাভাস। কোনো ঘণ্টার মান ও কারণ দেখতে নিচে বেছে নিন।",
  },
};

function dateLabel(iso: string, lang: "bn" | "en", hourOnly = false) {
  return new Date(iso).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    ...(hourOnly ? {} : { day: "numeric", month: "short", year: "numeric" } as const),
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dhaka",
  });
}

export function ForecastChart({ points, source }: { points: ForecastPoint[]; source: ForecastSource }) {
  const { lang, t, num } = useI18n();
  const words = WORDS[lang];
  // Select by absolute timestamp, so repeated clock hours across midnight stay
  // distinct. Removed hours cannot retain another hour's explanation.
  const [selectedTime, setSelectedTime] = useState("");
  const selected = points.find((point) => point.time === selectedTime) ?? points[0];
  const explanation = selected?.pm25 !== null && source === "nirmol" ? selected?.explanation : undefined;
  const data = points.flatMap((point, i) => {
    const plotted = { time: point.time, pm25: point.pm25,
      range: point.low != null && point.high != null ? [point.low, point.high] : null };
    // Plot-only separators preserve gaps without inventing API readings.
    return i > 0 && Date.parse(point.time) - Date.parse(points[i - 1].time) !== 3_600_000
      ? [{ time: "", pm25: null, range: null }, plotted] : [plotted];
  });
  const hasRange = data.some((point) => point.range);

  return (
    <>
      {points.length > 0 && <>
        <div className="h-56 min-w-0 w-full" role="img" aria-label={words.chart}>
          <div className="h-full" aria-hidden="true">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <XAxis dataKey="time" tickFormatter={(value) => value ? dateLabel(value, lang, true) : "…"} tick={{ fontSize: 11, fill: "var(--muted)" }} interval={3} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} tickFormatter={(value) => num(value)} />
                <ReferenceLine y={15} stroke="var(--muted)" strokeDasharray="4 4" />
                {hasRange && <Area dataKey="range" stroke="none" fill="var(--accent)" fillOpacity={0.15} name={words.rangeName} connectNulls={false} isAnimationActive={false} />}
                <Line dataKey="pm25" stroke="var(--accent)" strokeWidth={2.5} dot={false} name="PM2.5" connectNulls={false} isAnimationActive={false} />
                <Tooltip
                  labelFormatter={(value) => value ? dateLabel(String(value), lang) : "…"}
                  contentStyle={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number | number[], name: string) => Array.isArray(value)
                    ? [`${num(value[0])}–${num(value[1])} µg/m³`, name] : [`${num(value)} µg/m³`, name]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--muted)]">{words.reference}</p>
        {hasRange && <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{words.range}</p>}
        <label className="mt-4 block text-sm font-medium" htmlFor="dashboard-forecast-hour">{words.hour}</label>
        <select id="dashboard-forecast-hour" value={selected?.time ?? ""} onChange={(event) => setSelectedTime(event.target.value)}
          className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 text-sm">
          {points.map((point) => <option key={point.time} value={point.time}>
            {dateLabel(point.time, lang)} · {point.pm25 === null ? t.unavailable : `${num(point.pm25)} µg/m³`}
          </option>)}
        </select>
      </>}
      <section data-testid="forecast-explanation" aria-labelledby="forecast-explanation-title" className="mt-4 rounded-xl bg-[var(--soft)] p-3 text-sm leading-relaxed">
        <h3 id="forecast-explanation-title" className="font-semibold">{words.heading}</h3>
        <div aria-live="polite" aria-atomic="true">
          {selected ? <>
            <p className="mt-2">{words.time}: <time dateTime={selected.time}>{dateLabel(selected.time, lang)}</time></p>
            <p>{words.selected}: <strong>{selected.pm25 === null ? t.unavailable : `${num(selected.pm25)} µg/m³`}</strong></p>
            {selected.low != null && selected.high != null && <p>{words.rangeName}: {num(selected.low)}–{num(selected.high)} µg/m³</p>}
            <p>{words.source}: {source === "nirmol" ? words.nirmol : words.cams}</p>
          </> : <p className="mt-2">{words.empty}</p>}
          {explanation ? <>
            <p className="mt-2 break-words">{explanation.model} · {words.run} {num(explanation.runId)}</p>
            <p className="text-xs text-[var(--muted)]">{words.issued}: <time dateTime={explanation.issuedAt}>{dateLabel(explanation.issuedAt, lang)}</time></p>
            <ol className="mt-3 space-y-2">
              {explanation.factors.map((factor) => <li key={factor.feature} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <p className="font-semibold">{FORECAST_FEATURE_LABELS[factor.feature][lang]}</p>
                <p className="mt-1 text-xs">{words.input}: {num(factor.value)}</p>
                <p className="mt-1 break-words">{words.effect}: <strong className="tabular-nums">{factor.effect > 0 ? "+" : ""}{num(factor.effect.toFixed(3))}</strong></p>
                <p className="text-xs text-[var(--muted)]">{factor.effect > 0 ? words.higher : factor.effect < 0 ? words.lower : words.zero}</p>
              </li>)}
            </ol>
            <p className="mt-3 text-xs">{words.meaning}</p>
            <p className="mt-2 text-xs">{words.caveat}</p>
          </> : <p className="mt-3">{words.unavailable}</p>}
        </div>
        {source === "nirmol" && <p className="mt-3 text-xs text-[var(--muted)]">{words.geography}</p>}
      </section>
    </>
  );
}
