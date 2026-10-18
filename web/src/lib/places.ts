import { BANGLADESH_POLYGONS } from "./data/bangladesh";

export type Place = {
  id: string; lat: number; lon: number; name: { bn: string; en: string };
  /** Id of the parent city for neighbourhoods; absent for cities. */
  city?: string;
  /** Other spellings people type, used only for search. */
  alt?: string[];
};

export const PLACES: Place[] = [
  { id: "dhaka", lat: 23.7808, lon: 90.4067, name: { bn: "ঢাকা", en: "Dhaka" } },
  { id: "dhaka-reference", lat: 23.796374, lon: 90.424614, name: { bn: "ঢাকা – বারিধারা (নির্মল মডেল)", en: "Dhaka – Baridhara (Nirmol model)" } },
  { id: "chattogram", lat: 22.3569, lon: 91.7832, name: { bn: "চট্টগ্রাম", en: "Chattogram" } },
  { id: "gazipur", lat: 23.9999, lon: 90.4203, name: { bn: "গাজীপুর", en: "Gazipur" } },
  { id: "narayanganj", lat: 23.6238, lon: 90.5, name: { bn: "নারায়ণগঞ্জ", en: "Narayanganj" } },
  { id: "khulna", lat: 22.8456, lon: 89.5403, name: { bn: "খুলনা", en: "Khulna" } },
  { id: "rajshahi", lat: 24.3745, lon: 88.6042, name: { bn: "রাজশাহী", en: "Rajshahi" } },
  { id: "sylhet", lat: 24.8949, lon: 91.8687, name: { bn: "সিলেট", en: "Sylhet" } },
  { id: "barishal", lat: 22.701, lon: 90.3535, name: { bn: "বরিশাল", en: "Barishal" } },
  { id: "rangpur", lat: 25.7439, lon: 89.2752, name: { bn: "রংপুর", en: "Rangpur" } },
  { id: "mymensingh", lat: 24.7471, lon: 90.4203, name: { bn: "ময়মনসিংহ", en: "Mymensingh" } },
  { id: "cumilla", lat: 23.4607, lon: 91.1809, name: { bn: "কুমিল্লা", en: "Cumilla" } },
  // More district cities.
  { id: "bogura", lat: 24.8465, lon: 89.3777, name: { bn: "বগুড়া", en: "Bogura" }, alt: ["Bogra"] },
  { id: "jashore", lat: 23.1667, lon: 89.2167, name: { bn: "যশোর", en: "Jashore" }, alt: ["Jessore"] },
  { id: "dinajpur", lat: 25.6279, lon: 88.6332, name: { bn: "দিনাজপুর", en: "Dinajpur" } },
  { id: "coxsbazar", lat: 21.4272, lon: 92.0058, name: { bn: "কক্সবাজার", en: "Cox's Bazar" }, alt: ["Coxs Bazar"] },
  { id: "narsingdi", lat: 23.9193, lon: 90.7176, name: { bn: "নরসিংদী", en: "Narsingdi" } },
  { id: "tangail", lat: 24.2513, lon: 89.9167, name: { bn: "টাঙ্গাইল", en: "Tangail" } },
  { id: "faridpur", lat: 23.607, lon: 89.8429, name: { bn: "ফরিদপুর", en: "Faridpur" } },
  { id: "kishoreganj", lat: 24.426, lon: 90.7766, name: { bn: "কিশোরগঞ্জ", en: "Kishoreganj" } },
  { id: "pabna", lat: 24.0064, lon: 89.2372, name: { bn: "পাবনা", en: "Pabna" } },
  { id: "noakhali", lat: 22.8696, lon: 91.0995, name: { bn: "নোয়াখালী", en: "Noakhali" } },
  { id: "feni", lat: 23.0159, lon: 91.3976, name: { bn: "ফেনী", en: "Feni" } },
  { id: "brahmanbaria", lat: 23.9571, lon: 91.1119, name: { bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" } },
  { id: "habiganj", lat: 24.3745, lon: 91.4156, name: { bn: "হবিগঞ্জ", en: "Habiganj" } },
  { id: "satkhira", lat: 22.7185, lon: 89.0705, name: { bn: "সাতক্ষীরা", en: "Satkhira" } },
  { id: "kushtia", lat: 23.9013, lon: 89.1205, name: { bn: "কুষ্টিয়া", en: "Kushtia" } },
  { id: "patuakhali", lat: 22.3596, lon: 90.3299, name: { bn: "পটুয়াখালী", en: "Patuakhali" } },
  { id: "jamalpur", lat: 24.9375, lon: 89.9372, name: { bn: "জামালপুর", en: "Jamalpur" } },
  { id: "munshiganj", lat: 23.5422, lon: 90.5305, name: { bn: "মুন্সীগঞ্জ", en: "Munshiganj" } },
  // Neighbourhoods. Coordinates are approximate area centres.
  { id: "dhaka-uttara", city: "dhaka", lat: 23.8759, lon: 90.3795, name: { bn: "উত্তরা", en: "Uttara" }, alt: ["Uttora"] },
  { id: "dhaka-gulshan", city: "dhaka", lat: 23.7925, lon: 90.4078, name: { bn: "গুলশান", en: "Gulshan" } },
  { id: "dhaka-banani", city: "dhaka", lat: 23.7937, lon: 90.4043, name: { bn: "বনানী", en: "Banani" } },
  { id: "dhaka-baridhara", city: "dhaka", lat: 23.8007, lon: 90.4219, name: { bn: "বারিধারা", en: "Baridhara" } },
  { id: "dhaka-bashundhara", city: "dhaka", lat: 23.8193, lon: 90.4526, name: { bn: "বসুন্ধরা আ/এ", en: "Bashundhara R/A" }, alt: ["Bashundhara"] },
  { id: "dhaka-mirpur", city: "dhaka", lat: 23.8069, lon: 90.3687, name: { bn: "মিরপুর", en: "Mirpur" } },
  { id: "dhaka-pallabi", city: "dhaka", lat: 23.825, lon: 90.365, name: { bn: "পল্লবী", en: "Pallabi" } },
  { id: "dhaka-mohammadpur", city: "dhaka", lat: 23.7662, lon: 90.3589, name: { bn: "মোহাম্মদপুর", en: "Mohammadpur" }, alt: ["Mohammadpur"] },
  { id: "dhaka-dhanmondi", city: "dhaka", lat: 23.7461, lon: 90.3742, name: { bn: "ধানমন্ডি", en: "Dhanmondi" } },
  { id: "dhaka-shyamoli", city: "dhaka", lat: 23.7742, lon: 90.3655, name: { bn: "শ্যামলী", en: "Shyamoli" }, alt: ["Shamoli"] },
  { id: "dhaka-agargaon", city: "dhaka", lat: 23.7776, lon: 90.38, name: { bn: "আগারগাঁও", en: "Agargaon" } },
  { id: "dhaka-farmgate", city: "dhaka", lat: 23.7561, lon: 90.3872, name: { bn: "ফার্মগেট", en: "Farmgate" } },
  { id: "dhaka-tejgaon", city: "dhaka", lat: 23.7639, lon: 90.392, name: { bn: "তেজগাঁও", en: "Tejgaon" } },
  { id: "dhaka-mohakhali", city: "dhaka", lat: 23.7781, lon: 90.4056, name: { bn: "মহাখালী", en: "Mohakhali" } },
  { id: "dhaka-badda", city: "dhaka", lat: 23.7806, lon: 90.4259, name: { bn: "বাড্ডা", en: "Badda" } },
  { id: "dhaka-rampura", city: "dhaka", lat: 23.7612, lon: 90.4231, name: { bn: "রামপুরা", en: "Rampura" } },
  { id: "dhaka-banasree", city: "dhaka", lat: 23.7637, lon: 90.4325, name: { bn: "বনশ্রী", en: "Banasree" } },
  { id: "dhaka-khilgaon", city: "dhaka", lat: 23.7506, lon: 90.4277, name: { bn: "খিলগাঁও", en: "Khilgaon" } },
  { id: "dhaka-motijheel", city: "dhaka", lat: 23.733, lon: 90.4172, name: { bn: "মতিঝিল", en: "Motijheel" } },
  { id: "dhaka-old-dhaka", city: "dhaka", lat: 23.7104, lon: 90.4074, name: { bn: "পুরান ঢাকা", en: "Old Dhaka" }, alt: ["Puran Dhaka"] },
  { id: "dhaka-lalbagh", city: "dhaka", lat: 23.7191, lon: 90.388, name: { bn: "লালবাগ", en: "Lalbagh" } },
  { id: "dhaka-hazaribagh", city: "dhaka", lat: 23.7334, lon: 90.3607, name: { bn: "হাজারীবাগ", en: "Hazaribagh" } },
  { id: "dhaka-jatrabari", city: "dhaka", lat: 23.7101, lon: 90.4351, name: { bn: "যাত্রাবাড়ী", en: "Jatrabari" } },
  { id: "dhaka-demra", city: "dhaka", lat: 23.7243, lon: 90.4833, name: { bn: "ডেমরা", en: "Demra" } },
  { id: "dhaka-gabtoli", city: "dhaka", lat: 23.7786, lon: 90.3446, name: { bn: "গাবতলী", en: "Gabtoli" } },
  { id: "dhaka-savar", city: "dhaka", lat: 23.8583, lon: 90.2667, name: { bn: "সাভার", en: "Savar" } },
  { id: "dhaka-keraniganj", city: "dhaka", lat: 23.695, lon: 90.35, name: { bn: "কেরানীগঞ্জ", en: "Keraniganj" } },
  { id: "gazipur-tongi", city: "gazipur", lat: 23.8917, lon: 90.4053, name: { bn: "টঙ্গী", en: "Tongi" } },
  { id: "chattogram-agrabad", city: "chattogram", lat: 22.327, lon: 91.81, name: { bn: "আগ্রাবাদ", en: "Agrabad" } },
  { id: "chattogram-gec", city: "chattogram", lat: 22.359, lon: 91.821, name: { bn: "জিইসি মোড়", en: "GEC Circle" }, alt: ["GEC More"] },
  { id: "chattogram-halishahar", city: "chattogram", lat: 22.3392, lon: 91.7849, name: { bn: "হালিশহর", en: "Halishahar" } },
  { id: "chattogram-pahartali", city: "chattogram", lat: 22.37, lon: 91.805, name: { bn: "পাহাড়তলী", en: "Pahartali" } },
  { id: "chattogram-kotwali", city: "chattogram", lat: 22.3375, lon: 91.835, name: { bn: "কোতোয়ালী", en: "Kotwali" } },
  { id: "chattogram-patenga", city: "chattogram", lat: 22.2495, lon: 91.8065, name: { bn: "পতেঙ্গা", en: "Patenga" } },
  { id: "sylhet-zindabazar", city: "sylhet", lat: 24.8995, lon: 91.8697, name: { bn: "জিন্দাবাজার", en: "Zindabazar" } },
  { id: "sylhet-ambarkhana", city: "sylhet", lat: 24.904, lon: 91.872, name: { bn: "আম্বরখানা", en: "Ambarkhana" }, alt: ["Amberkhana"] },
];

const fold = (value: string) => value.toLocaleLowerCase().replace(/[\s.'\u2019\-/]+/g, "");

/** Neighbourhoods show their city, e.g. "Uttara, Dhaka". Cities show their own name. */
export function placeLabel(place: Place, lang: "bn" | "en"): string {
  const city = place.city ? PLACES.find((item) => item.id === place.city) : undefined;
  return city ? `${place.name[lang]}, ${city.name[lang]}` : place.name[lang];
}

/** Offline search over city and neighbourhood names: both languages plus common spellings. */
export function searchPlaces(query: string, limit = 8): Place[] {
  const q = fold(query.trim());
  if (!q) return [];
  const scored: [number, Place][] = [];
  for (const place of PLACES) {
    const names = [place.name.en, place.name.bn, ...(place.alt ?? [])].map(fold);
    const parent = place.city ? PLACES.find((item) => item.id === place.city) : undefined;
    const parentNames = parent ? [parent.name.en, parent.name.bn].map(fold) : [];
    let score = 0;
    if (names.some((name) => name === q)) score = 4;
    else if (names.some((name) => name.startsWith(q))) score = 3;
    else if (names.some((name) => name.includes(q))) score = 2;
    else if (parentNames.some((name) => name.startsWith(q))) score = 1;
    if (score) scored.push([score, place]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map(([, place]) => place);
}

/** Pinned ADM0 polygon, including holes/islands. Not a cadastral or legal border service. */
export function inBangladesh(lat: number, lon: number): boolean {
  if (!validCoordinates(lat, lon) || lat < 20.5 || lat > 26.7 || lon < 88 || lon > 92.7) return false;
  return BANGLADESH_POLYGONS.some(([outer, ...holes]) => inRing(lat, lon, outer) &&
    !holes.some((hole) => inRing(lat, lon, hole)));
}

export function validCoordinates(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function inRing(lat: number, lon: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x, y] = ring[i], [px, py] = ring[j];
    const cross = (lon - px) * (y - py) - (lat - py) * (x - px);
    if (Math.abs(cross) < 1e-12 && lon >= Math.min(x, px) && lon <= Math.max(x, px) &&
        lat >= Math.min(y, py) && lat <= Math.max(y, py)) return true;
    if ((y > lat) !== (py > lat) && lon < (px - x) * (lat - y) / (py - y) + x) inside = !inside;
  }
  return inside;
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Evaluated at one reference site only. Numeric tolerance is not a coverage radius. */
export function inDhakaModelArea(lat: number, lon: number): boolean {
  return validCoordinates(lat, lon) && Math.abs(lat - 23.796374) <= 1e-6 && Math.abs(lon - 90.424614) <= 1e-6;
}

export function nearestPlace(lat: number, lon: number): Place {
  return PLACES.reduce((best, p) =>
    distanceKm(lat, lon, p.lat, p.lon) < distanceKm(lat, lon, best.lat, best.lon) ? p : best,
  );
}
