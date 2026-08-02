import {
  Ambulance,
  Bike,
  Building2,
  Car,
  Flame,
  HeartPulse,
  Lightbulb,
  Phone,
  Shield,
  Tractor,
  Truck,
  Wrench,
} from "lucide-react";
import type { Listing, ListingType } from "./store";

export type SearchableItem = {
  id: string;
  type: ListingType | "scheme" | "transport" | "emergency";
  title: string;
  description: string;
  category: string;
  location: string;
  contact?: string;
  price?: string;
  to: string;
};

export type SchemeInfo = {
  id: string;
  title: string;
  category: string;
  benefit: string;
  documents: string[];
  eligibility: string;
  apply: string;
};

export type CitizenService = {
  id: string;
  title: string;
  category: string;
  description: string;
  documents: string[];
  apply: string;
};

const villageDirectoryItems: SearchableItem[] = [
  {
    id: "dir-kirana",
    type: "service",
    title: "Kirana Shops",
    description: "Daily goods, rice, oil, snacks, household items, and grocery stores.",
    category: "Shops",
    location: "Your village",
    to: "/services",
  },
  {
    id: "dir-medical",
    type: "service",
    title: "Medical Shops",
    description: "Pharmacy, medicines, first aid, health supplies, and nearby medical support.",
    category: "Health",
    location: "Your village",
    to: "/services",
  },
  {
    id: "dir-chicken",
    type: "service",
    title: "Chicken and Meat Shops",
    description: "Chicken shop, mutton shop, fish seller, and local non-veg stores.",
    category: "Shops",
    location: "Your village",
    to: "/services",
  },
  {
    id: "dir-tent-house",
    type: "service",
    title: "Tent House and Event Services",
    description:
      "Tent house, chairs, shamiyana, catering, DJ, photographer, videographer, flowers.",
    category: "Event Services",
    location: "Your village",
    to: "/services",
  },
  {
    id: "dir-tractor",
    type: "transport",
    title: "Tractor Owners",
    description: "Tractor rental, ploughing, rotavator, trolley, water tanker, and farm transport.",
    category: "Machinery",
    location: "Your village",
    to: "/transport",
  },
  {
    id: "dir-panchayat",
    type: "service",
    title: "Panchayat Office",
    description:
      "Village secretary, gram sabha, certificates, public works, notices, and complaints.",
    category: "Panchayat",
    location: "Your village",
    to: "/services",
  },
];

const searchSynonyms: Record<string, string[]> = {
  tent: ["tent house", "event services", "shamiyana", "catering", "chairs"],
  tractor: ["tractor owner", "tractor rental", "ploughing", "rotavator", "machinery"],
  chicken: ["chicken shop", "meat", "non veg", "mutton", "fish"],
  medical: ["medical shop", "pharmacy", "health", "medicine"],
  kirana: ["grocery", "daily goods", "shop", "store"],
  electrician: ["current", "wiring", "streetlight", "power"],
  plumber: ["water", "pipe", "tap", "borewell"],
};

export function expandSearchQuery(query: string) {
  const normalized = query.toLowerCase().replace(/\b(need|want|find|nearby|local)\b/g, " ");
  const terms = new Set(normalized.split(/\s+/).filter(Boolean));
  Object.entries(searchSynonyms).forEach(([key, values]) => {
    if (normalized.includes(key)) values.forEach((value) => terms.add(value));
  });
  return Array.from(terms).join(" ");
}

export const fallbackListings: Listing[] = [
  {
    id: "seed-worker-tractor",
    type: "worker",
    title: "Ramesh Tractor Driver",
    description:
      "Experienced tractor and rotavator driver available for ploughing, puddling, and transport work.",
    contact: "9876543210",
    location: "Kothur",
    price: "₹900/day",
    category: "Tractor Driver",
    imageUrl:
      "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: "seed-worker-electrician",
    type: "worker",
    title: "Sridhar Electrician",
    description: "Motor starters, farm pump repair, home wiring, and emergency power support.",
    contact: "9876500123",
    location: "Kandukur",
    price: "₹500 visit",
    category: "Electrician",
    imageUrl:
      "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: "seed-land-canal",
    type: "land",
    title: "3 acres black soil farmland",
    description: "Borewell water, road access, suitable for paddy, cotton, and vegetables.",
    contact: "9848012443",
    location: "Dasarlapally",
    price: "₹18,000/season",
    category: "Lease",
    imageUrl:
      "https://images.pexels.com/photos/158827/field-corn-air-frisch-158827.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 28,
  },
  {
    id: "seed-market-paddy",
    type: "market",
    title: "Fresh paddy 400 kg",
    description: "Clean harvest, direct farmer sale, pickup from village godown.",
    contact: "9848123456",
    location: "Kothur",
    price: "₹2,250/quintal",
    category: "Rice",
    imageUrl:
      "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 34,
  },
  {
    id: "seed-service-borewell",
    type: "service",
    title: "Borewell motor repair team",
    description: "Same-day diagnosis, cable replacement, starter repair, and pump lifting support.",
    contact: "9848999999",
    location: "Maheshwaram",
    price: "Call for rate",
    category: "Borewell",
    imageUrl:
      "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 44,
  },
  {
    id: "seed-notice-health",
    type: "announcement",
    title: "Health camp at Panchayat office",
    description: "Free checkup and medicines from 9 AM to 1 PM this Sunday.",
    contact: "Village Secretary",
    location: "Kothur Panchayat",
    category: "Medical Camp",
    imageUrl:
      "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 52,
  },
  {
    id: "seed-problem-drainage",
    type: "complaint",
    title: "Drainage overflow near main road",
    description:
      "Water is overflowing near the bus stop after rain. Children and elders are finding it difficult to cross.",
    contact: "9876543210",
    location: "Kothur bus stop",
    category: "Drainage",
    imageUrl:
      "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
];

export const schemes: SchemeInfo[] = [
  {
    id: "scheme-pm-kisan",
    title: "PM-KISAN Samman Nidhi",
    category: "agriculture",
    benefit:
      "Guaranteed ₹6,000 per year income support for farmers, transferred directly to bank accounts in 3 equal installments of ₹2,000.",
    documents: ["Aadhaar Card", "Bank Account Passbook", "Pattadar Passbook / Land Records"],
    eligibility: "Small and marginal farmers who own cultivable land in their name.",
    apply: "https://pmkisan.gov.in/",
  },
  {
    id: "scheme-pm-fasal",
    title: "PM Fasal Bima Yojana",
    category: "agriculture",
    benefit:
      "Low premium crop insurance (1.5% for Rabi, 2% for Kharif, 5% for commercial/horticulture crops) protecting against drought, flood, and unseasonal rains.",
    documents: ["Aadhaar", "Land Record / Pahani", "Crop Sowing Certificate", "Bank Account"],
    eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops.",
    apply: "https://pmfby.gov.in/",
  },
  {
    id: "scheme-pmayg",
    title: "PMAY-Gramin (Housing Loan & Subsidy)",
    category: "housing",
    benefit:
      "₹1.2 Lakh direct subsidy for rural housing construction. Includes additional ₹12,000 for toilet construction and access to up to ₹70,000 bank loan at 3% interest subvention.",
    documents: ["Aadhaar", "Job Card / SECC 2011 Data", "Bank Account", "Land Ownership Proof"],
    eligibility:
      "Houseless families or families living in zero, one or two room houses with kutcha walls and kutcha roof.",
    apply: "https://pmayg.nic.in/",
  },
  {
    id: "scheme-ayushman",
    title: "Ayushman Bharat PM-JAY",
    category: "health",
    benefit:
      "Free health insurance coverage up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.",
    documents: ["Aadhaar", "Ration Card", "Active Mobile Number"],
    eligibility: "Families identified via the SECC 2011 database (deprivation criteria).",
    apply: "https://beneficiary.nha.gov.in/",
  },
  {
    id: "scheme-mudra",
    title: "PM MUDRA Yojana (Business Loans)",
    category: "women",
    benefit:
      "Collateral-free micro-credit loans for non-farm enterprises. Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L) with competitive interest rates starting at ~8.5%.",
    documents: ["Aadhaar", "Business Proof / Idea", "Bank Statement", "Category Proof"],
    eligibility:
      "Any Indian citizen with a business plan for a non-farm sector income generating activity.",
    apply: "https://www.mudra.org.in/",
  },
  {
    id: "scheme-sukanya",
    title: "Sukanya Samriddhi Yojana (Girl Child)",
    category: "women",
    benefit:
      "High-interest savings account (currently 8.2% p.a., tax-free) for the future education and marriage of a girl child. Minimum deposit ₹250/year.",
    documents: ["Girl's Birth Certificate", "Parent's Aadhaar", "Parent's PAN/Address Proof"],
    eligibility: "Parents or legal guardians of a girl child below 10 years of age.",
    apply: "https://www.indiapost.gov.in/",
  },
  {
    id: "scheme-pm-kusum",
    title: "PM-KUSUM Solar Pump Subsidy",
    category: "agriculture",
    benefit:
      "Up to 60% subsidy on standalone solar agriculture pumps to reduce diesel costs and provide reliable daytime power.",
    documents: ["Aadhaar", "Land Document", "Bank Account", "Current Electricity Bill (if any)"],
    eligibility: "Individual farmers, water user associations, and farmer producer organizations.",
    apply: "https://pmkusum.mnre.gov.in/",
  },
  {
    id: "scheme-mgnrega",
    title: "MGNREGA 100-Days Employment",
    category: "pension",
    benefit:
      "Legal guarantee of 100 days of wage employment in a financial year at minimum statutory wages (approx ₹250-₹300/day depending on state).",
    documents: ["Aadhaar", "Address Proof", "Bank/Post Office Account", "Passport Photo"],
    eligibility: "Any adult member of a rural household willing to do unskilled manual work.",
    apply: "https://nrega.nic.in/",
  },
  {
    id: "scheme-national-scholarship",
    title: "National Scholarship Portal",
    category: "education",
    benefit:
      "Pre-matric and Post-matric financial scholarships for minority, SC/ST/OBC, and economically weaker students covering tuition and maintenance fees.",
    documents: ["Aadhaar", "Student ID", "Income Certificate", "Caste Certificate", "Bank Account"],
    eligibility:
      "Students meeting scholarship-specific income (usually < ₹2.5L-₹8L/yr) and academic rules.",
    apply: "https://scholarships.gov.in/",
  },
];

export const citizenServices: CitizenService[] = [
  {
    id: "service-aadhaar-update",
    title: "Aadhaar Update / Download",
    category: "Identity",
    description:
      "Update Aadhaar details, download e-Aadhaar, check update status, and book Aadhaar services.",
    documents: ["Aadhaar number", "Mobile linked to Aadhaar", "Proof document for update"],
    apply: "https://myaadhaar.uidai.gov.in/",
  },
  {
    id: "service-digilocker",
    title: "DigiLocker Documents",
    category: "Documents",
    description:
      "Access Aadhaar, driving licence, certificates, marksheets, and other digital documents.",
    documents: ["Aadhaar or mobile number", "OTP access"],
    apply: "https://www.digilocker.gov.in/",
  },
  {
    id: "service-umang",
    title: "UMANG Government Services",
    category: "One App Services",
    description: "Use many central and state government services from one official portal.",
    documents: ["Mobile number", "Aadhaar or service-specific ID if required"],
    apply: "https://web.umang.gov.in/",
  },
  {
    id: "service-ration",
    title: "Ration Card / NFSA",
    category: "Food Security",
    description: "Check ration card and food security services through the national NFSA portal.",
    documents: ["Ration card number", "Aadhaar", "Family details"],
    apply: "https://nfsa.gov.in/",
  },
  {
    id: "service-eshram",
    title: "e-Shram Card",
    category: "Worker Support",
    description: "Register unorganised workers for e-Shram and social security access.",
    documents: ["Aadhaar", "Bank account", "Mobile number", "Occupation details"],
    apply: "https://eshram.gov.in/",
  },
  {
    id: "service-pan",
    title: "PAN Services",
    category: "Tax ID",
    description: "Apply for PAN, update PAN, or check PAN application status.",
    documents: ["Aadhaar", "Address proof", "Photo if required"],
    apply: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
  },
];

export const transportOptions = [
  {
    id: "tractor-booking",
    title: "Tractor Booking",
    price: "₹900/hr",
    icon: Tractor,
    contact: "9876543210",
  },
  {
    id: "auto-booking",
    title: "Auto Booking",
    price: "Local fare",
    icon: Bike,
    contact: "9876501111",
  },
  { id: "mini-truck", title: "Mini Truck", price: "₹18/km", icon: Truck, contact: "9848123000" },
  { id: "pickup", title: "Pickup Vehicle", price: "₹15/km", icon: Car, contact: "9848123001" },
  {
    id: "harvester",
    title: "Harvest Machine",
    price: "Season rate",
    icon: Tractor,
    contact: "9848123002",
  },
  { id: "jcb", title: "JCB", price: "₹1,600/hr", icon: Wrench, contact: "9848123003" },
];

export const emergencyContacts = [
  {
    id: "ambulance",
    title: "Ambulance",
    contact: "108",
    role: "Emergency medical help",
    icon: Ambulance,
    urgent: true,
  },
  {
    id: "police",
    title: "Police",
    contact: "100",
    role: "Law and order support",
    icon: Shield,
    urgent: true,
  },
  { id: "fire", title: "Fire", contact: "101", role: "Fire and rescue", icon: Flame, urgent: true },
  {
    id: "hospital",
    title: "Hospital",
    contact: "104",
    role: "Health advice and referral",
    icon: HeartPulse,
  },
  {
    id: "electricity",
    title: "Electricity",
    contact: "1912",
    role: "Power cut and line issues",
    icon: Lightbulb,
  },
  {
    id: "veterinary",
    title: "Veterinary",
    contact: "1962",
    role: "Animal health support",
    icon: Phone,
  },
  {
    id: "panchayat",
    title: "Village Officer",
    contact: "0841-23456",
    role: "Panchayat support desk",
    icon: Building2,
  },
];

export function listingRoute(type: ListingType) {
  if (type === "worker" || type === "work") return "/workers";
  if (type === "land") return "/land";
  if (type === "market") return "/marketplace";
  if (type === "service") return "/services";
  if (type === "complaint") return "/problems";
  return "/announcements";
}

export function getSearchableItems(listings: Listing[]): SearchableItem[] {
  const listingItems = listings.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    category: item.category ?? item.type,
    location: item.location,
    contact: item.contact,
    price: item.price,
    to: listingRoute(item.type),
  }));

  return [
    ...listingItems,
    ...villageDirectoryItems,
    ...schemes.map((scheme) => ({
      id: scheme.id,
      type: "scheme" as const,
      title: scheme.title,
      description: `${scheme.benefit} Documents: ${scheme.documents.join(", ")}`,
      category: scheme.category,
      location: "Government",
      to: "/schemes",
    })),
    ...citizenServices.map((service) => ({
      id: service.id,
      type: "scheme" as const,
      title: service.title,
      description: `${service.description} Documents: ${service.documents.join(", ")}`,
      category: service.category,
      location: "Citizen service",
      to: "/schemes",
    })),
    ...transportOptions.map((item) => ({
      id: item.id,
      type: "transport" as const,
      title: item.title,
      description: `Book locally. Price: ${item.price}`,
      category: "Transport",
      location: "Your village",
      contact: item.contact,
      price: item.price,
      to: "/transport",
    })),
    ...emergencyContacts.map((item) => ({
      id: item.id,
      type: "emergency" as const,
      title: item.title,
      description: item.role,
      category: "Emergency",
      location: "Village support",
      contact: item.contact,
      to: "/emergency",
    })),
  ];
}
