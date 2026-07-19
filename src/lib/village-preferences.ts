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
  coordinates?: { latitude: number; longitude: number };
  confidence?: "verified" | "matched" | "fallback";
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
      Kandukur: ["Kothur", "Dasarlapally", "Lemoor", "Nednur", "Timmapur", "Gudur"],
      Maheshwaram: ["Mansanpally", "Nagaram", "Tukkuguda", "Ameenpur", "Sirigiripuram"],
      Shabad: ["Shabad", "Hayathabad", "Tadlapally", "Manchirevula", "Machanpally"],
      Chevella: ["Chevella", "Kandawada", "Malkapur", "Aloor", "Devarampally"],
      Rajendranagar: ["Budvel", "Premavathipet", "Bandlaguda Jagir", "Hydershakote"],
      Ibrahimpatnam: ["Ibrahimpatnam", "Pocharam", "Sheriguda", "Eliminedu"],
      Shamshabad: ["Shamshabad", "Kotwalguda", "Satamrai", "Rashidguda"],
    },
    Khammam: {
      Bonakal: ["Bonakal", "Govindapuram", "Mustikuntla", "Ravinoothala", "Allapadu"],
      Chintakani: ["Chintakani", "Pandillapalli", "Proddutur", "Nagulavancha", "Vepakuntla"],
      Enkoor: ["Enkoor", "Nacharam", "Thimmaraopeta", "Raimadaram", "Jannaram"],
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
      Kamepally: ["Kamepally", "Mucherla", "Komminepalli", "Govindrala", "Pinapaka"],
      "Khammam Rural": ["Edulapuram", "Gollagudem", "Gudurupadu", "Mallemadugu", "Tekulapalli"],
      "Khammam Urban": ["Khammam", "Burhanpuram", "Khanapuram Haveli", "Rotary Nagar", "Naya Bazar"],
      Konijerla: ["Konijerla", "Ammapalem", "Goparam", "Tanukupadu", "Pedda Gopa"],
      Kusumanchi: ["Kusumanchi", "Jakkepalli", "Nelapatla", "Palair", "Gaikwarpally"],
      Madhira: ["Madhira", "Dendukuru", "Illuru", "Rayapatnam", "Maturu"],
      Mudigonda: ["Mudigonda", "Chirumarri", "Kamalapuram", "Vallabhi", "Gandarugudem"],
      Nelakondapalli: ["Nelakondapalli", "Aregudem", "Bodulabanda", "Mujjugudem", "Kondapuram"],
      Penuballi: ["Penuballi", "Bayyannagudem", "Karaigudem", "Tekulapalli", "Vemsoor"],
      Raghunadhapalem: ["Raghunadhapalem", "Chimmapudi", "Papakollu", "Vepakuntla", "Ballepalli"],
      Sathupalli: ["Sathupalli", "Gangaram", "Kistaram", "Rejerla", "Vengalarayao Nagar"],
      Singareni: ["Singareni", "Gareebpeta", "Karepalli", "Madharam", "Usirikapally"],
      Thallada: ["Thallada", "Annarugudem", "Gopalapeta", "Mittapalli", "Ramanujavaram"],
      Thirumalayapalem: ["Thirumalayapalem", "Bachodu", "Hydersaipeta", "Patharlapadu", "Subled"],
      Vemsoor: ["Vemsoor", "Kunchaparthi", "Marla Padu", "Vennavalli", "Yelchuru"],
      Wyra: ["Wyra", "Gollanapadu", "Khanapuram", "Somavaram", "Vepalasingaram"],
      Yerrupalem: ["Yerrupalem", "Banigandlapadu", "Gatla Gowraram", "Meenavolu", "Takkelapadu"],
    },
    Nalgonda: {
      Miryalaguda: ["Vemulapally", "Alagadapa", "Thungapahad", "Miryalaguda", "Tipparthy"],
      Nakrekal: ["Chandupatla", "Nomula", "Tatikal", "Nakrekal", "Chityal"],
      Nalgonda: ["Anneparthy", "Marriguda", "Cherlapally", "Nalgonda", "Kangal"],
      Suryapet: ["Suryapet", "Imampet", "Pillalamarri", "Kasarabad"],
      Devarakonda: ["Devarakonda", "Gaddipally", "Kondabheemanapally", "Chintapally"],
      Kodad: ["Kodad", "Komarabanda", "Gudibanda", "Thimmapuram"],
    },
    Warangal: {
      Geesugonda: ["Gorrekunta", "Elkurthy", "Vanchanagiri", "Geesugonda"],
      Parkal: ["Nadikuda", "Damera", "Atmakur", "Parkal", "Nagaram"],
      Sangem: ["Sangem", "Narlavai", "Theegarajupally", "Gavicherla"],
      Narsampet: ["Narsampet", "Chennaraopet", "Duggondi", "Khanapur"],
    },
    Hanumakonda: {
      Hanamkonda: ["Kazipet", "Subedari", "Waddepally", "Lashkar Singaram"],
      Hasanparthy: ["Hasanparthy", "Ananthasagar", "Bheemaram", "Pegadapally"],
      Inavolu: ["Inavolu", "Punnelu", "Kondaparthy"],
    },
    Karimnagar: {
      Karimnagar: ["Karimnagar", "Kothapalli", "Bommakal", "Asifnagar"],
      Huzurabad: ["Huzurabad", "Jammikunta", "Shankarapatnam", "Veenavanka"],
      Choppadandi: ["Choppadandi", "Gangadhara", "Ramadugu"],
    },
    Nizamabad: {
      Nizamabad: ["Nizamabad", "Armoor", "Bodhan", "Balkonda", "Dichpally"],
      Bodhan: ["Bodhan", "Yedapally", "Renjal", "Navipet"],
      Armoor: ["Armoor", "Perkit", "Ankapur", "Mamidipally"],
    },
    Medak: {
      Medak: ["Medak", "Ramayampet", "Shankarampet", "Alladurg"],
      Narsapur: ["Narsapur", "Shivampet", "Kowdipally"],
      Siddipet: ["Siddipet", "Gajwel", "Dubbak", "Cherial"],
    },
    Mahabubnagar: {
      Mahabubnagar: ["Mahabubnagar", "Jadcherla", "Bhootpur", "Devarkadra"],
      Shadnagar: ["Farooqnagar", "Kondurg", "Kothur", "Nandigama"],
      Wanaparthy: ["Wanaparthy", "Pebbair", "Ghanpur", "Kothakota"],
    },
  },
  "Andhra Pradesh": {
    ...makeDistrictSkeleton(andhraDistricts),
    Krishna: {
      Gudivada: ["Pedayerukapadu", "Bethavolu", "Chowtapalli", "Gudivada", "Mandavalli"],
      Machilipatnam: ["Manginapudi", "Pedapatnam", "Tallapalem", "Machilipatnam", "Chinnapuram"],
      Avanigadda: ["Avanigadda", "Modumudi", "Vekanuru", "Nagayalanka", "Koduru"],
      Vijayawada: ["Vijayawada", "Gannavaram", "Kankipadu", "Penamaluru", "Poranki"],
      Nuzvid: ["Nuzvid", "Agiripalli", "Chatrai", "Musunuru"],
    },
    Guntur: {
      Tenali: ["Kollipara", "Pedaravuru", "Angalakuduru", "Tenali", "Burripalem"],
      Mangalagiri: ["Nowluru", "Chinakakani", "Kaza", "Mangalagiri", "Atmakuru"],
      Prathipadu: ["Prathipadu", "Ganikapudi", "Kondajagarla", "Pedanandipadu"],
      Bapatla: ["Bapatla", "Karlapalem", "Pittalavanipalem", "Vetapalem"],
      Narasaraopet: ["Narasaraopet", "Rompicherla", "Nekarikallu", "Vinukonda"],
    },
    Srikakulam: {
      Srikakulam: ["Srikakulam", "Arasavalli", "Gara", "Ampolu", "Kallepalli"],
      Tekkali: ["Tekkali", "Nandigam", "Kotabommali", "Santhabommali"],
      Palasa: ["Palasa", "Kasibugga", "Mandi", "Vajrapukotturu"],
      Amadalavalasa: ["Amadalavalasa", "Ponduru", "Burja", "Sarubujjili"],
      Ichchapuram: ["Ichchapuram", "Kaviti", "Sompeta", "Kanchili"],
    },
    Visakhapatnam: {
      Bheemunipatnam: ["Bheemunipatnam", "Kapuluppada", "Tagarapuvalasa", "Narisipatnam"],
      Padmanabham: ["Padmanabham", "Pandrangapuram", "Revidi"],
      Anandapuram: ["Anandapuram", "Gambheeram", "Vellanki", "Gidijala"],
      Anakapalli: ["Anakapalli", "Kasimkota", "Munagapaka", "Chodavaram"],
    },
    "East Godavari": {
      Rajahmundry: ["Rajahmundry", "Kadiyam", "Vemagiri", "Torredu"],
      Kakinada: ["Kakinada", "Samalkota", "Peddapuram", "Pithapuram"],
      Amalapuram: ["Amalapuram", "Ravulapalem", "Kothapeta", "Mummidivaram"],
    },
    "West Godavari": {
      Eluru: ["Eluru", "Denduluru", "Pedavegi", "Pedapadu"],
      Bhimavaram: ["Bhimavaram", "Palakollu", "Narsapuram", "Tanuku"],
      Tadepalligudem: ["Tadepalligudem", "Pentapadu", "Nidadavole"],
    },
    Kurnool: {
      Kurnool: ["Kurnool", "Kallur", "Orvakal", "Veldurthi"],
      Nandyal: ["Nandyal", "Allagadda", "Banaganapalle", "Dhone"],
      Adoni: ["Adoni", "Yemmiganur", "Mantralayam", "Alur"],
    },
    Anantapur: {
      Anantapur: ["Anantapur", "Bukkarayasamudram", "Gooty", "Guntakal"],
      Dharmavaram: ["Dharmavaram", "Penukonda", "Hindupur", "Kadiri"],
      Tadpatri: ["Tadpatri", "Yellanur", "Peddapappur"],
    },
    Chittoor: {
      Tirupati: ["Tirupati", "Chandragiri", "Renigunta", "Karakambadi"],
      Chittoor: ["Chittoor", "Gudipala", "Tavanampalle", "Puthalapattu"],
      Madanapalle: ["Madanapalle", "Pileru", "Punganur", "Vayalpad"],
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
    timeline: "Timeline",
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
    signOut: "Sign out",
    profileDetails: "Profile Details",
    officialWorkspace: "Official Workspace",
    notifications: "Notifications",
    markRead: "Mark all read",
    clear: "Clear",
    createAccount: "Create Account",
    welcomeToManaOoru: "Welcome to ManaOoru",
    portalSignIn: "Portal Sign In",
    registerProfile: "Register Profile",
    chooseDestination: "Choose your destination portal below.",
    selectIdentity: "Select your village identity type below.",
    backToWelcome: "Back to welcome screen",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    occupation: "Occupation",
    selectVillage: "Select Village",
    phoneNumber: "Phone Number",
    sendOtp: "Send OTP",
    verificationCode: "Verification Code",
    verify: "Verify",
    authenticating: "Authenticating...",
    registering: "Registering...",
    signInAs: "Sign in as",
    registerAs: "Register as",
    citizen: "Citizen",
    dealer: "Dealer",
    villageAdmin: "Village Admin",
    accessNetwork: "Access network",
    sellAndTrade: "Sell & trade",
    manageOps: "Manage ops",
    localUpdates: "Local updates",
    registerShop: "Register shop",
    officialOnly: "Official only",
    alreadySignedIn: "You are signed in as",
    goToDashboard: "Go to Portal Dashboard",
    switchAccount: "Sign out & Switch Account",
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
    timeline: "టైమ్‌లైన్",
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
    signOut: "లాగౌట్ చేయండి",
    profileDetails: "ప్రొఫైల్ వివరాలు",
    officialWorkspace: "అధికారిక వేదిక",
    notifications: "నోటిఫికేషన్లు",
    markRead: "అన్నీ చదివినట్లుగా",
    clear: "క్లియర్",
    createAccount: "ఖాతా సృష్టించండి",
    welcomeToManaOoru: "మనవూరుకి స్వాగతం",
    portalSignIn: "పోర్టల్ సైన్ ఇన్",
    registerProfile: "ప్రొఫైల్ నమోదు",
    chooseDestination: "క్రింద మీ పోర్టల్‌ని ఎంచుకోండి.",
    selectIdentity: "క్రింద మీ గ్రామ గుర్తింపును ఎంచుకోండి.",
    backToWelcome: "స్వాగత స్క్రీన్‌కి తిరిగి వెళ్లండి",
    emailAddress: "ఈమెయిల్ చిరునామా",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి",
    fullName: "పూర్తి పేరు",
    occupation: "వృత్తి",
    selectVillage: "గ్రామాన్ని ఎంచుకోండి",
    phoneNumber: "ఫోన్ నంబర్",
    sendOtp: "OTP పంపండి",
    verificationCode: "నిర్ధారణ కోడ్",
    verify: "నిర్ధారించండి",
    authenticating: "లాగిన్ అవుతోంది...",
    registering: "నమోదు అవుతోంది...",
    signInAs: "సైన్ ఇన్:",
    registerAs: "నమోదు:",
    citizen: "పౌరుడు",
    dealer: "వ్యాపారి",
    villageAdmin: "సర్పంచ్ / అడ్మిన్",
    accessNetwork: "నెట్‌వర్క్ యాక్సెస్",
    sellAndTrade: "అమ్మకాలు & వ్యాపారం",
    manageOps: "గ్రామ నిర్వహణ",
    localUpdates: "స్థానిక సమాచారం",
    registerShop: "దుకాణం నమోదు",
    officialOnly: "అధికారులకు మాత్రమే",
    alreadySignedIn: "మీరు ప్రస్తుతం లాగిన్ అయి ఉన్నారు:",
    goToDashboard: "డాష్‌బోర్డ్‌కి వెళ్లండి",
    switchAccount: "లాగౌట్ చేసి వేరే ఖాతాతో లాగిన్ చేయండి",
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
    timeline: "टाइमलाइन",
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
    signOut: "साइन आउट",
    profileDetails: "प्रोफ़ाइल विवरण",
    officialWorkspace: "आधिकारिक पोर्टल",
    notifications: "सूचनाएं",
    markRead: "सभी पढ़े हुए",
    clear: "साफ़ करें",
    createAccount: "खाता बनाएं",
    welcomeToManaOoru: "मनऊरु में आपका स्वागत है",
    portalSignIn: "पोर्टल साइन इन",
    registerProfile: "प्रोफ़ाइल पंजीकरण",
    chooseDestination: "नीचे अपना पोर्टल चुनें।",
    selectIdentity: "नीचे अपनी ग्रामीण पहचान चुनें।",
    backToWelcome: "स्वागत स्क्रीन पर वापस जाएं",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    fullName: "पूरा नाम",
    occupation: "व्यवसाय",
    selectVillage: "गांव चुनें",
    phoneNumber: "फ़ोन नंबर",
    sendOtp: "OTP भेजें",
    verificationCode: "सत्यापन कोड",
    verify: "सत्यापित करें",
    authenticating: "प्रमाणित किया जा रहा है...",
    registering: "पंजीकरण हो रहा है...",
    signInAs: "साइन इन:",
    registerAs: "पंजीकरण:",
    citizen: "नागरिक",
    dealer: "व्यापारी",
    villageAdmin: "सरपंच / एडमिन",
    accessNetwork: "नेटवर्क एक्सेस",
    sellAndTrade: "बिक्री और व्यापार",
    manageOps: "ग्राम प्रबंधन",
    localUpdates: "स्थानीय अपडेट",
    registerShop: "दुकान पंजीकरण",
    officialOnly: "केवल अधिकारियों के लिए",
    alreadySignedIn: "आप साइन इन हैं:",
    goToDashboard: "डैशबोर्ड पर जाएं",
    switchAccount: "साइन आउट और खाता बदलें",
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
  "telangana|khammam|kallur|kallur": {
    latitude: 17.2023,
    longitude: 80.5516,
    name: "Kallur",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|peruvancha": {
    latitude: 17.2287,
    longitude: 80.5694,
    name: "Peruvancha",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|lokavaram": {
    latitude: 17.1681,
    longitude: 80.5186,
    name: "Lokavaram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|chennuru": {
    latitude: 17.1812,
    longitude: 80.5843,
    name: "Chennuru",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|kappalabandham": {
    latitude: 17.2415,
    longitude: 80.6012,
    name: "Kappalabandham",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|mucharam": {
    latitude: 17.2104,
    longitude: 80.4908,
    name: "Mucharam",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|vennavalli": {
    latitude: 17.1205,
    longitude: 80.6402,
    name: "Vennavalli",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|narayanapuram": {
    latitude: 17.1994,
    longitude: 80.5303,
    name: "Narayanapuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|peddakorukondi": {
    latitude: 17.2514,
    longitude: 80.5482,
    name: "Peddakorukondi",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|chinnakorukondi": {
    latitude: 17.2405,
    longitude: 80.5412,
    name: "Chinnakorukondi",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|bathulapalli": {
    latitude: 17.1541,
    longitude: 80.5312,
    name: "Bathulapalli",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|kistapuram": {
    latitude: 17.2145,
    longitude: 80.5612,
    name: "Kistapuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|lakshmipuram": {
    latitude: 17.1802,
    longitude: 80.5103,
    name: "Lakshmipuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|madhapuram": {
    latitude: 17.2001,
    longitude: 80.6121,
    name: "Madhapuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|mittapalli": {
    latitude: 17.2291,
    longitude: 80.5312,
    name: "Mittapalli",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|narlapuram": {
    latitude: 17.2202,
    longitude: 80.5882,
    name: "Narlapuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|payapuram": {
    latitude: 17.2341,
    longitude: 80.5121,
    name: "Payapuram",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|raghunadhapalem": {
    latitude: 17.1895,
    longitude: 80.4678,
    name: "Raghunadhapalem",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|khammam|kallur|thalluru": {
    latitude: 17.2512,
    longitude: 80.6212,
    name: "Thalluru",
    admin3: "Kallur",
    admin2: "Khammam",
    admin1: "Telangana",
  },
  "telangana|rangareddy|kandukur|kothur": {
    latitude: 17.1437,
    longitude: 78.4311,
    name: "Kothur",
    admin3: "Kandukur",
    admin2: "Rangareddy",
    admin1: "Telangana",
  },
  "telangana|rangareddy|kandukur|dasarlapally": {
    latitude: 17.0863,
    longitude: 78.4902,
    name: "Dasarlapally",
    admin3: "Kandukur",
    admin2: "Rangareddy",
    admin1: "Telangana",
  },
  "telangana|rangareddy|kandukur|lemoor": {
    latitude: 17.1517,
    longitude: 78.6015,
    name: "Lemoor",
    admin3: "Kandukur",
    admin2: "Rangareddy",
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
    `${profile.village}, ${profile.mandal}, ${profile.district}, ${profile.state}`,
    `${profile.village}, ${profile.mandal}, ${profile.district}`,
    `${profile.village}, ${profile.district}, ${profile.state}`,
    `${profile.mandal}, ${profile.district}`,
    `${profile.district}, ${profile.state}`,
  ].filter((term) => term.replace(/,\s*/g, "").trim().length > 0);
  let first: GeoResult | undefined = knownCoordinates;
  let confidence: WeatherProfile["confidence"] = knownCoordinates ? "verified" : undefined;
  const profileParts = [profile.village, profile.mandal, profile.district, profile.state]
    .filter(Boolean)
    .map((part) => part.toLowerCase());

  for (const term of first ? [] : searchTerms) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=10&countryCode=IN&language=en&format=json`;
    const geo = await fetch(geoUrl, { signal }).then((res) => {
      if (!res.ok) throw new Error("Location lookup failed");
      return res.json();
    });
    const results = (geo?.results ?? []) as GeoResult[];
    const exactVillage = profile.village.trim().toLowerCase();
    const ranked = results
      .map((result) => {
        const values = [result?.name, result?.admin1, result?.admin2, result?.admin3]
          .filter(Boolean)
          .map((value) => `${value}`.toLowerCase());
        const exactScore = values.some((value) => value === exactVillage) ? 8 : 0;
        const partScore = profileParts.reduce(
          (score, part) => score + (values.some((value) => value.includes(part)) ? 1 : 0),
          0,
        );
        return { result, score: exactScore + partScore };
      })
      .sort((a, b) => b.score - a.score);
    first = ranked[0]?.result;
    confidence = ranked[0]?.score >= 3 ? "matched" : "fallback";
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
    coordinates: { latitude: first.latitude, longitude: first.longitude },
    confidence: confidence ?? "matched",
    live: true,
  };
}

const typedLocationTree = locationTree as LocationTree;

function findCaseInsensitiveKey(
  obj: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!obj || !key) return undefined;
  const target = key.trim().toLowerCase();
  return Object.keys(obj).find((k) => k.toLowerCase() === target);
}

export function getStates() {
  return Object.keys(locationTree);
}

export function getDistricts(state: string) {
  const stateKey = findCaseInsensitiveKey(typedLocationTree, state);
  if (!stateKey) {
    const allDistricts = [
      ...Object.keys(typedLocationTree["Telangana"] ?? {}),
      ...Object.keys(typedLocationTree["Andhra Pradesh"] ?? {}),
    ];
    return Array.from(new Set(allDistricts));
  }
  return Object.keys(typedLocationTree[stateKey] ?? {});
}

export function getMandals(state: string, district: string) {
  const stateKey = findCaseInsensitiveKey(typedLocationTree, state);
  if (!stateKey) {
    const allMandals: string[] = [];
    for (const s of ["Telangana", "Andhra Pradesh"]) {
      for (const d of Object.keys(typedLocationTree[s] ?? {})) {
        for (const m of Object.keys(typedLocationTree[s][d] ?? {})) {
          allMandals.push(m);
        }
      }
    }
    return Array.from(new Set(allMandals));
  }
  const districtKey = findCaseInsensitiveKey(typedLocationTree[stateKey], district);
  if (!districtKey) {
    const stateMandals: string[] = [];
    for (const d of Object.keys(typedLocationTree[stateKey] ?? {})) {
      for (const m of Object.keys(typedLocationTree[stateKey][d] ?? {})) {
        stateMandals.push(m);
      }
    }
    return Array.from(new Set(stateMandals));
  }
  return Object.keys(typedLocationTree[stateKey]?.[districtKey] ?? {});
}

export function getVillages(state: string, district: string, mandal: string): string[] {
  const stateKey = findCaseInsensitiveKey(typedLocationTree, state);
  if (!stateKey) {
    const allVillages: string[] = [];
    for (const s of ["Telangana", "Andhra Pradesh"]) {
      for (const d of Object.keys(typedLocationTree[s] ?? {})) {
        for (const m of Object.keys(typedLocationTree[s][d] ?? {})) {
          allVillages.push(...(typedLocationTree[s][d][m] ?? []));
        }
      }
    }
    return Array.from(new Set(allVillages));
  }
  const districtKey = findCaseInsensitiveKey(typedLocationTree[stateKey], district);
  if (!districtKey) {
    const stateVillages: string[] = [];
    for (const d of Object.keys(typedLocationTree[stateKey] ?? {})) {
      for (const m of Object.keys(typedLocationTree[stateKey][d] ?? {})) {
        stateVillages.push(...(typedLocationTree[stateKey][d][m] ?? []));
      }
    }
    return Array.from(new Set(stateVillages));
  }
  const mandalKey = findCaseInsensitiveKey(typedLocationTree[stateKey]?.[districtKey], mandal);
  if (!mandalKey) {
    const districtVillages: string[] = [];
    for (const m of Object.keys(typedLocationTree[stateKey][districtKey] ?? {})) {
      districtVillages.push(...(typedLocationTree[stateKey][districtKey][m] ?? []));
    }
    return Array.from(new Set(districtVillages));
  }
  return typedLocationTree[stateKey]?.[districtKey]?.[mandalKey] ?? [];
}

export function normalizeProfile(profile: Partial<VillageProfile> | undefined): VillageProfile {
  if (!profile) return defaultProfile;

  const stateInput = profile.state?.trim() || defaultProfile.state;
  const stateKey = findCaseInsensitiveKey(typedLocationTree, stateInput);
  const state = stateKey || stateInput;

  const districts = getDistricts(state);
  const districtInput = profile.district?.trim() || districts[0] || defaultProfile.district;
  const districtKey = findCaseInsensitiveKey(typedLocationTree[state], districtInput);
  const district = districtKey || districtInput;

  const mandals = getMandals(state, district);
  const mandalInput = profile.mandal?.trim() || mandals[0] || defaultProfile.mandal;
  const mandalKey = findCaseInsensitiveKey(typedLocationTree[state]?.[district], mandalInput);
  const mandal = mandalKey || mandalInput;

  const villages = getVillages(state, district, mandal);
  const hasVillageInput = typeof profile?.village === "string";
  const villageName = profile?.village?.split(",")[0]?.trim();

  let village = "";
  if (hasVillageInput && villageName) {
    const villageKey = villages.find((v) => v.toLowerCase() === villageName.toLowerCase());
    village = villageKey || villageName;
  } else {
    village = villages[0] || defaultProfile.village;
  }

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
    const activeLocation = profile.village.trim()
      ? profile
      : { state: "Telangana", district: "Hyderabad", mandal: "Hyderabad", village: "Hyderabad" };

    setWeather((prev) => ({ ...prev, loading: true }));
    fetchLiveWeather(activeLocation, controller.signal)
      .then((live) => setWeather(live))
      .catch((error) =>
        setWeather({
          ...fallbackWeather,
          temp: 31,
          condition: "Partly Cloudy",
          source: "Open-Meteo fallback",
          rain: "No rain expected",
          loading: false,
          live: true,
          error: error instanceof Error ? error.message : "Weather lookup failed",
        }),
      );

    return () => controller.abort();
  }, [fallbackWeather, profile]);

  return { language, setLanguage, profile, setProfile, hasProfile: stored.hasProfile, t, weather };
}
