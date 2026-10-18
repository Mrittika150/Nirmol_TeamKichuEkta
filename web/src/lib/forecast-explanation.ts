// Reviewed feature schema from ml/artifacts/nirmol_xgb_v1_meta.json and
// ml/train_forecast.py:add_features. A new model/schema needs explicit review.
export const FORECAST_FEATURE_LABELS = {
  hour: { en: "Time of day", bn: "দিনের সময়" },
  month_sin: { en: "Time of year", bn: "বছরের সময়" },
  month_cos: { en: "Season", bn: "ঋতু" },
  weekend: { en: "Weekend (Fri/Sat)", bn: "ছুটির দিন (শুক্র/শনি)" },
  is_winter: { en: "Winter season", bn: "শীতকাল" },
  cams_pm2_5: { en: "CAMS PM2.5 forecast", bn: "CAMS-এর PM2.5 পূর্বাভাস" },
  cams_pm10: { en: "CAMS dust & PM10", bn: "CAMS-এর PM10" },
  cams_carbon_monoxide: { en: "Smoke & traffic gas (CO)", bn: "ধোঁয়া ও গাড়ির গ্যাস (CO)" },
  cams_dust: { en: "Dust in the air", bn: "বাতাসে ধুলা" },
  cams_pm2_5_log: { en: "CAMS PM2.5 level", bn: "CAMS-এর PM2.5 মাত্রা" },
  cams_pm2_5_mean24: { en: "Pollution over the last 24 h", bn: "গত ২৪ ঘণ্টার দূষণ" },
  temperature_2m: { en: "Temperature", bn: "তাপমাত্রা" },
  relative_humidity_2m: { en: "Humidity", bn: "আর্দ্রতা" },
  dew_point_2m: { en: "Fog & dew", bn: "কুয়াশা ও শিশির" },
  precipitation: { en: "Rain", bn: "বৃষ্টি" },
  surface_pressure: { en: "Air pressure", bn: "বায়ুচাপ" },
  cloud_cover: { en: "Clouds", bn: "মেঘ" },
  wind_speed_10m: { en: "Wind speed", bn: "বাতাসের গতি" },
  shortwave_radiation: { en: "Sunshine", bn: "রোদ" },
  wind_u: { en: "East–west wind", bn: "পূর্ব–পশ্চিম বাতাস" },
  wind_v: { en: "North–south wind", bn: "উত্তর–দক্ষিণ বাতাস" },
  rain_24h: { en: "Rain in the last 24 h", bn: "গত ২৪ ঘণ্টার বৃষ্টি" },
  pressure_change_24h: { en: "Change in air pressure (24 h)", bn: "বায়ুচাপের পরিবর্তন (২৪ ঘণ্টা)" },
  wind_mean_12h: { en: "Average wind (12 h)", bn: "গড় বাতাস (১২ ঘণ্টা)" },
} as const;

export type ForecastFeature = keyof typeof FORECAST_FEATURE_LABELS;
export type ForecastFactor = { feature: ForecastFeature; value: number; effect: number };
export type ForecastExplanation = {
  runId: number;
  model: "nirmol-xgb-v1";
  validAt: string;
  issuedAt: string;
  // The median model is trained on log1p(PM2.5). Effects are not µg/m³ deltas.
  scale: "log1p_pm25";
  factors: ForecastFactor[];
};

/** The publisher stores three ranked factors; never sort, coerce or invent them. */
export function readForecastFactors(value: unknown): ForecastFactor[] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const factors: ForecastFactor[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return null;
    const factor = entry as Record<string, unknown>;
    if (typeof factor.feature !== "string" ||
        !Object.prototype.hasOwnProperty.call(FORECAST_FEATURE_LABELS, factor.feature) ||
        typeof factor.value !== "number" || !Number.isFinite(factor.value) ||
        typeof factor.effect !== "number" || !Number.isFinite(factor.effect)) return null;
    factors.push({ feature: factor.feature as ForecastFeature, value: factor.value, effect: factor.effect });
  }
  return new Set(factors.map((factor) => factor.feature)).size === 3 ? factors : null;
}
