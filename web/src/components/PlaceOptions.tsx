"use client";

import { useI18n } from "@/lib/i18n";
import { PLACES } from "@/lib/places";

/** Grouped <option> list: cities first, then the neighbourhoods of each city. */
export function PlaceOptions() {
  const { lang } = useI18n();
  const cities = PLACES.filter((place) => !place.city);
  return (
    <>
      <optgroup label={lang === "bn" ? "শহর" : "Cities"}>
        {cities.map((place) => <option key={place.id} value={place.id}>{place.name[lang]}</option>)}
      </optgroup>
      {cities.filter((city) => PLACES.some((place) => place.city === city.id)).map((city) => (
        <optgroup key={city.id} label={lang === "bn" ? `${city.name.bn}-এর এলাকা` : `Areas in ${city.name.en}`}>
          {PLACES.filter((place) => place.city === city.id).map((place) => <option key={place.id} value={place.id}>{place.name[lang]}</option>)}
        </optgroup>
      ))}
    </>
  );
}
