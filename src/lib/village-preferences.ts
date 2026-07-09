import { useEffect, useMemo, useState } from "react";

export type Language = "te" | "en" | "hi";

export type VillageProfile = {
  state: string;
  district: string;
  mandal: string;
  village: string;
};

type LocationTree = Record<string, Record<string, Record<string, string[]>>>;
type WeatherProfile = {
  temp: number | null;
  humidity: number | null;
  wind: number | null;
  rain: string;
  condition: string;
  source?: string;
  updatedAt?: string;
  loading?: boolean;
  placeName?: string;
  live: boolean;
  error?: string;
};
type GeoResult = {
  latitude: number;
  longitude: number;
  name?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
};

export const defaultProfile: VillageProfile = {
  state: "Telangana",
  district: "Rangareddy",
  mandal: "Kandukur",
  village: "",
};

const telanganaDistricts = [
  "Adilabad",
  "Bhadradri Kothagudem",
  "Hanumakonda",
  "Hyderabad",
  "Jagtial",
  "Jangaon",
  "Jayashankar Bhupalpally",
  "Jogulamba Gadwal",
  "Kamareddy",
  "Karimnagar",
  "Khammam",
  "Kumuram Bheem Asifabad",
  "Mahabubabad",
  "Mahabubnagar",
  "Mancherial",
  "Medak",
  "Medchal-Malkajgiri",
  "Mulugu",
  "Nagarkurnool",
  "Nalgonda",
  "Narayanpet",
  "Nirmal",
  "Nizamabad",
  "Peddapalli",
  "Rajanna Sircilla",
  "Rangareddy",
  "Sangareddy",
  "Siddipet",
  "Suryapet",
  "Vikarabad",
  "Wanaparthy",
  "Warangal",
  "Yadadri Bhuvanagiri",
];

const andhraDistricts = [
  "Alluri Sitharama Raju",
  "Anakapalli",
  "Anantapur",
  "Annamayya",
  "Bapatla",
  "Chittoor",
  "East Godavari",
  "Eluru",
  "Guntur",
  "Kakinada",
  "Konaseema",
  "Krishna",
  "Kurnool",
  "Nandyal",
  "NTR",
  "Palnadu",
  "Parvathipuram Manyam",
  "Prakasam",
  "Sri Potti Sriramulu Nellore",
  "Sri Sathya Sai",
  "Srikakulam",
  "Tirupati",
  "Visakhapatnam",
  "Vizianagaram",
  "West Godavari",
  "YSR Kadapa",
];

// All 28 states + 8 union territories of India. Telangana and Andhra Pradesh
// have hand-curated district/mandal/village data below; every other state is
// listed here so it's selectable, with district/mandal/village entered as
// free text (see VillageLocationPicker) since we don't have a verified
// village-level dataset for the rest of the country.
const otherStatesAndUTs = [
  "Andaman and Nicobar Islands",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function makeStateSkeleton(): LocationTree[string] {
  // No fabricated placeholder districts/mandals/villages — this state is
  // selectable, and district/mandal/village are entered as free text with
  // no suggestions until real data is curated for it.
  return {};
}

function makeDistrictSkeleton(districts: string[]): LocationTree[string] {
  // Real district names, so they show up as suggestions — but no fabricated
  // mandal/village placeholders. Mandal and village are free text for any
  // district we haven't hand-curated real mandal/village data for below.
  return Object.fromEntries(districts.map((district) => [district, {}]));
}

export const locationTree = {
  Telangana: {
    ...makeDistrictSkeleton(telanganaDistricts),
    Rangareddy: {
      Kandukur: ["Kothur", "Dasarlapally", "Lemoor"],
      Maheshwaram: ["Mansanpally", "Nagaram", "Tukkuguda"],
      Shabad: ["Shabad", "Hayathabad", "Tadlapally"],
      Chevella: ["Chevella", "Kandawada", "Malkapur"],
    },
    Khammam: {
      Bonakal: ["Bonakal", "Govindapuram", "Mustikuntla", "Ravinoothala"],
      Chintakani: ["Chintakani", "Pandillapalli", "Proddutur", "Nagulavancha"],
      Enkoor: ["Enkoor", "Nacharam", "Thimmaraopeta", "Raimadaram"],
      Kallur: [
        "Kallur",
        "Peruvancha",
        "Yerraboinapalli",
        "Lokavaram",
        "Chennuru",
        "Kappalabandham",
        "Mucharam",
        "Vennavalli",
        "Narayanapuram",
        "Peddakorukondi",
        "Chinnakorukondi",
        "Bathulapalli",
        "Kistapuram",
        "Lakshmipuram",
        "Madhapuram",
        "Mittapalli",
        "Narlapuram",
        "Payapuram",
        "Raghunadhapalem",
        "Thalluru",
      ],
      Kamepally: ["Kamepally", "Mucherla", "Komminepalli", "Govindrala"],
      "Khammam Rural": ["Edulapuram", "Gollagudem", "Gudurupadu", "Mallemadugu"],
      "Khammam Urban": ["Khammam", "Burhanpuram", "Khanapuram Haveli", "Rotary Nagar"],
      Konijerla: ["Konijerla", "Ammapalem", "Goparam", "Tanukupadu"],
      Kusumanchi: ["Kusumanchi", "Jakkepalli", "Nelapatla", "Palair"],
      Madhira: ["Madhira", "Dendukuru", "Illuru", "Rayapatnam"],
      Mudigonda: ["Mudigonda", "Chirumarri", "Kamalapuram", "Vallabhi"],
      Nelakondapalli: ["Nelakondapalli", "Aregudem", "Bodulabanda", "Mujjugudem"],
      Penuballi: ["Penuballi", "Bayyannagudem", "Karaigudem", "Tekulapalli"],
      Raghunadhapalem: ["Raghunadhapalem", "Chimmapudi", "Papakollu", "Vepakuntla"],
      Sathupalli: ["Sathupalli", "Gangaram", "Kistaram", "Rejerla"],
      Singareni: ["Singareni", "Gareebpeta", "Karepalli", "Madharam"],
      Thallada: ["Thallada", "Annarugudem", "Gopalapeta", "Mittapalli"],
      Thirumalayapalem: ["Thirumalayapalem", "Bachodu", "Hydersaipeta", "Patharlapadu"],
      Vemsoor: ["Vemsoor", "Kunchaparthi", "Marla Padu", "Vennavalli"],
      Wyra: ["Wyra", "Gollanapadu", "Khanapuram", "Somavaram"],
      Yerrupalem: ["Yerrupalem", "Banigandlapadu", "Gatla Gowraram", "Meenavolu"],
    },
    Nalgonda: {
      Miryalaguda: ["Vemulapally", "Alagadapa", "Thungapahad"],
      Nakrekal: ["Chandupatla", "Nomula", "Tatikal"],
      Nalgonda: ["Anneparthy", "Marriguda", "Cherlapally"],
    },
    Warangal: {
      Geesugonda: ["Gorrekunta", "Elkurthy", "Vanchanagiri"],
      Parkal: ["Nadikuda", "Damera", "Atmakur"],
      Sangem: ["Sangem", "Narlavai", "Theegarajupally"],
    },
    Hyderabad: {
      Amberpet: ["Amberpet", "Bagh Amberpet", "DD Colony"],
      Charminar: ["Charminar", "Moghalpura", "Pathergatti"],
      Secunderabad: ["Secunderabad", "Monda Market", "Marredpally"],
    },
  },
  "Andhra Pradesh": {
    ...makeDistrictSkeleton(andhraDistricts),
    Krishna: {
      Gudivada: ["Pedayerukapadu", "Bethavolu", "Chowtapalli"],
      Machilipatnam: ["Manginapudi", "Pedapatnam", "Tallapalem"],
      Avanigadda: ["Avanigadda", "Modumudi", "Vekanuru"],
    },
    Guntur: {
      Tenali: ["Kollipara", "Pedaravuru", "Angalakuduru"],
      Mangalagiri: ["Nowluru", "Chinakakani", "Kaza"],
      Prathipadu: ["Prathipadu", "Ganikapudi", "Kondajagarla"],
    },
    Visakhapatnam: {
      Bheemunipatnam: ["Bheemunipatnam", "Kapuluppada", "Tagarapuvalasa"],
      Padmanabham: ["Padmanabham", "Pandrangapuram", "Revidi"],
      Anandapuram: ["Anandapuram", "Gambheeram", "Vellanki"],
    },
  },
  ...Object.fromEntries(otherStatesAndUTs.map((state) => [state, makeStateSkeleton()])),
} satisfies LocationTree;

export const languageOptions: { code: Language; label: string }[] = [
  { code: "te", label: "తెలుగు" },
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

const dictionary = {
  en: {
    home: "Home",
    workers: "Workers",
    land: "Land",
    marketplace: "Marketplace",
    services: "Services",
    problems: "Problems",
    notices: "Notices",
    weather: "Weather",
    ai: "AI Assistant",
    dashboard: "Dashboard",
    signIn: "Sign in",
    heroA: "Everything your",
    heroVillage: "village",
    heroB: "needs.",
    heroC: "All in one place.",
    subtitle1: "Find workers. Lease farmland. Sell products. Hire services.",
    subtitle2: "Receive village announcements. Powered by AI.",
    search: "Search everything...",
    popular: "Popular:",
    explore: "Explore Village",
    post: "Post Requirement",
    findWorkers: "Find Workers",
    postWork: "Post Work",
    leaseLand: "Lease Land",
    localServices: "Local Services",
    announcements: "Announcements",
    emergency: "Emergency Contacts",
    transport: "Transport",
    schemes: "Schemes",
  },
  te: {
    home: "హోమ్",
    workers: "పనివారు",
    land: "భూమి",
    marketplace: "సంత",
    services: "సేవలు",
    problems: "సమస్యలు",
    notices: "నోటీసులు",
    weather: "వాతావరణం",
    ai: "AI సహాయకుడు",
    dashboard: "డాష్‌బోర్డ్",
    signIn: "సైన్ ఇన్",
    heroA: "మీ",
    heroVillage: "గ్రామానికి",
    heroB: "కావాల్సిన ప్రతిదీ.",
    heroC: "ఒకే చోట.",
    subtitle1: "పనివారిని కనుగొనండి. భూమిని కౌలుకు తీసుకోండి. ఉత్పత్తులు అమ్మండి. సేవలు పొందండి.",
    subtitle2: "గ్రామ ప్రకటనలు పొందండి. AI సహాయంతో.",
    search: "అన్నీ వెతకండి...",
    popular: "ప్రసిద్ధం:",
    explore: "గ్రామాన్ని చూడండి",
    post: "అవసరం పోస్ట్ చేయండి",
    findWorkers: "పనివారు",
    postWork: "పని ఇవ్వండి",
    leaseLand: "భూమి కౌలు",
    localServices: "స్థానిక సేవలు",
    announcements: "ప్రకటనలు",
    emergency: "అత్యవసర నంబర్లు",
    transport: "రవాణా",
    schemes: "పథకాలు",
  },
  hi: {
    home: "होम",
    workers: "कामगार",
    land: "ज़मीन",
    marketplace: "बाज़ार",
    services: "सेवाएं",
    problems: "समस्याएं",
    notices: "सूचनाएं",
    weather: "मौसम",
    ai: "AI सहायक",
    dashboard: "डैशबोर्ड",
    signIn: "साइन इन",
    heroA: "आपके",
    heroVillage: "गांव",
    heroB: "की हर जरूरत.",
    heroC: "एक ही जगह.",
    subtitle1: "कामगार खोजें. खेत किराए पर लें. उत्पाद बेचें. सेवाएं लें.",
    subtitle2: "गांव की सूचनाएं पाएं. AI से सहायता.",
    search: "सब कुछ खोजें...",
    popular: "लोकप्रिय:",
    explore: "गांव देखें",
    post: "जरूरत पोस्ट करें",
    findWorkers: "कामगार खोजें",
    postWork: "काम पोस्ट करें",
    leaseLand: "ज़मीन किराया",
    localServices: "स्थानीय सेवाएं",
    announcements: "सूचनाएं",
    emergency: "आपात संपर्क",
    transport: "यातायात",
    schemes: "योजनाएं",
  },
} as const;

const weatherProfiles: Record<string, WeatherProfile> = {
  Kothur: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
  Dasarlapally: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
  Lemoor: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
  Mansanpally: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
  Chandupatla: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
  Vemulapally: {
    temp: null,
    humidity: null,
    wind: null,
    rain: "Live weather loading",
    condition: "Live weather loading",
    live: false,
  },
};

const knownVillageCoordinates: Record<string, GeoResult> = {
  "telangana|khammam|kallur|yerraboinapalli": {
    latitude: 17.1360944,
    longitude: 80.5257056,
    name: "Yerraboinapalli",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
};

const prefKey = "manaooru-preferences";
const prefEvent = "manaooru-preferences-change";

type StoredPreferences = {
  language: Language;
  profile: VillageProfile;
  hasProfile: boolean;
};

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredPreferences(): StoredPreferences {
  if (!canUseBrowserStorage()) {
    return { language: "te", profile: defaultProfile, hasProfile: false };
  }

  const saved = window.localStorage.getItem(prefKey);
  if (!saved) return { language: "te", profile: defaultProfile, hasProfile: false };

  try {
    const parsed = JSON.parse(saved) as Partial<StoredPreferences>;
    return {
      language: parsed.language ?? "te",
      profile: normalizeProfile(parsed.profile),
      hasProfile: Boolean(parsed.hasProfile ?? parsed.profile?.village),
    };
  } catch {
    return { language: "te", profile: defaultProfile, hasProfile: false };
  }
}

function writeStoredPreferences(next: StoredPreferences) {
  if (!canUseBrowserStorage()) return;

  const normalized = {
    language: next.language,
    profile: normalizeProfile(next.profile),
    hasProfile: next.hasProfile,
  };
  window.localStorage.setItem(prefKey, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(prefEvent, { detail: normalized }));
}

export function saveVillageProfilePreference(nextProfile: Partial<VillageProfile>) {
  const current = readStoredPreferences();
  writeStoredPreferences({
    language: current.language,
    profile: normalizeProfile(nextProfile),
    hasProfile: true,
  });
}

export function saveLanguagePreference(nextLanguage: Language) {
  const current = readStoredPreferences();
  writeStoredPreferences({
    language: nextLanguage,
    profile: current.profile,
    hasProfile: current.hasProfile,
  });
}

function weatherCodeToCondition(code: number | undefined) {
  if (code === undefined) return "Current weather";
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}

function rainLabel(precipitation: number | undefined, rain: number | undefined) {
  const amount = Math.max(precipitation ?? 0, rain ?? 0);
  if (amount >= 7.5) return `${amount.toFixed(1)} mm heavy rain now`;
  if (amount >= 2.5) return `${amount.toFixed(1)} mm moderate rain now`;
  if (amount > 0) return `${amount.toFixed(1)} mm light rain now`;
  return "No rain reported now";
}

async function fetchLiveWeather(
  profile: VillageProfile,
  signal: AbortSignal,
): Promise<WeatherProfile> {
  const coordinateKey =
    `${profile.state}|${profile.district}|${profile.mandal}|${profile.village}`.toLowerCase();
  const knownCoordinates = knownVillageCoordinates[coordinateKey];
  const searchTerms = [
    `${profile.village}, ${profile.mandal}, ${profile.district}`,
    `${profile.village}, ${profile.district}`,
    `${profile.mandal}, ${profile.district}`,
    `${profile.district}, ${profile.state}`,
  ];
  let first: GeoResult | undefined = knownCoordinates;

  for (const term of first ? [] : searchTerms) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=10&countryCode=IN&language=en&format=json`;
    const geo = await fetch(geoUrl, { signal }).then((res) => {
      if (!res.ok) throw new Error("Location lookup failed");
      return res.json();
    });
    const results = (geo?.results ?? []) as GeoResult[];
    first =
      results.find((result) =>
        [result?.name, result?.admin1, result?.admin2, result?.admin3]
          .filter(Boolean)
          .some((value) => `${value}`.toLowerCase().includes(profile.district.toLowerCase())),
      ) ?? results[0];
    if (first) break;
  }

  if (!first) throw new Error("Location not found");

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=auto`;
  const current = await fetch(weatherUrl, { signal })
    .then((res) => {
      if (!res.ok) throw new Error("Weather lookup failed");
      return res.json();
    })
    .then((data) => data.current);

  return {
    temp: Math.round(current.temperature_2m),
    humidity: Math.round(current.relative_humidity_2m),
    wind: Math.round(current.wind_speed_10m),
    rain: rainLabel(current.precipitation, current.rain),
    condition: weatherCodeToCondition(current.weather_code),
    source: "Open-Meteo live",
    updatedAt: current.time,
    placeName: [first.name, first.admin3, first.admin2, first.admin1].filter(Boolean).join(", "),
    live: true,
  };
}

const typedLocationTree = locationTree as LocationTree;

export function getStates() {
  return Object.keys(locationTree);
}

export function getDistricts(state: string) {
  return Object.keys(typedLocationTree[state] ?? {});
}

export function getMandals(state: string, district: string) {
  return Object.keys(typedLocationTree[state]?.[district] ?? {});
}

export function getVillages(state: string, district: string, mandal: string): string[] {
  return typedLocationTree[state]?.[district]?.[mandal] ?? [];
}

export function normalizeProfile(profile: Partial<VillageProfile> | undefined): VillageProfile {
  if (!profile) return defaultProfile;

  const hasVillageInput = typeof profile?.village === "string";
  const villageName = profile?.village?.split(",")[0]?.trim();
  const state =
    profile?.state && typedLocationTree[profile.state] ? profile.state : defaultProfile.state;
  const districts = getDistricts(state);
  const district =
    profile?.district && districts.includes(profile.district)
      ? profile.district
      : (districts[0] ?? defaultProfile.district);
  const mandals = getMandals(state, district);
  const mandal =
    profile?.mandal && mandals.includes(profile.mandal)
      ? profile.mandal
      : (mandals[0] ?? defaultProfile.mandal);
  const villages = getVillages(state, district, mandal);
  const village = hasVillageInput ? (villageName ?? "") : (villages[0] ?? defaultProfile.village);

  return { state, district, mandal, village };
}

export function formatVillageProfile(profile: VillageProfile) {
  return `${profile.village || "Choose village"}, ${profile.mandal}, ${profile.district}, ${profile.state}`;
}

export function useVillagePreferences() {
  const [stored, setStored] = useState<StoredPreferences>(() => readStoredPreferences());
  const { language, profile } = stored;

  useEffect(() => {
    if (!canUseBrowserStorage()) return;

    const sync = () => setStored(readStoredPreferences());
    const syncCustom = (event: Event) => {
      const detail = (event as CustomEvent<StoredPreferences>).detail;
      setStored(detail ?? readStoredPreferences());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(prefEvent, syncCustom);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(prefEvent, syncCustom);
    };
  }, []);

  const persist = (
    nextLanguage: Language,
    nextProfile: VillageProfile,
    hasProfile = stored.hasProfile,
  ) => {
    const next = {
      language: nextLanguage,
      profile: normalizeProfile(nextProfile),
      hasProfile,
    };
    setStored(next);
    writeStoredPreferences(next);
  };

  const setLanguage = (next: Language) => {
    persist(next, profile);
  };

  const setProfile = (next: VillageProfile) => {
    persist(language, next, Boolean(next.village.trim()));
  };

  const t = useMemo(() => dictionary[language], [language]);
  const fallbackWeather = useMemo(
    () =>
      weatherProfiles[profile.village] ?? {
        temp: null,
        humidity: null,
        wind: null,
        rain: "Live weather loading",
        condition: "Live weather loading",
        source: "Waiting for live weather",
        live: false,
      },
    [profile.village],
  );
  const [weather, setWeather] = useState<WeatherProfile>(fallbackWeather);

  useEffect(() => {
    if (!stored.hasProfile || !profile.village) {
      setWeather({
        temp: null,
        humidity: null,
        wind: null,
        rain: "Select village for live rain data",
        condition: "Village not selected",
        source: "Waiting for village selection",
        live: false,
      });
      return;
    }

    if (typeof fetch === "undefined") {
      setWeather({
        ...fallbackWeather,
        source: "Live weather unavailable",
        rain: "Open this page in the browser for live weather",
        condition: "Live weather unavailable",
        live: false,
      });
      return;
    }

    const controller = new AbortController();
    setWeather({ ...fallbackWeather, loading: true });
    fetchLiveWeather(profile, controller.signal)
      .then((live) => setWeather(live))
      .catch((error) =>
        setWeather({
          ...fallbackWeather,
          source: "Live weather unavailable",
          rain: "Unable to load live rain data",
          condition: "Live weather unavailable",
          loading: false,
          live: false,
          error: error instanceof Error ? error.message : "Weather lookup failed",
        }),
      );

    return () => controller.abort();
  }, [fallbackWeather, profile, stored.hasProfile]);

  return { language, setLanguage, profile, setProfile, hasProfile: stored.hasProfile, t, weather };
}
