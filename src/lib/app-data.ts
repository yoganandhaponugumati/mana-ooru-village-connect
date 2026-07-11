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
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
];

export const schemes: SchemeInfo[] = [
  {
    id: "scheme-pm-kisan",
    title: "PM-KISAN",
    category: "Farmer Income",
    benefit: "Income support for eligible farmer families through direct bank transfer.",
    documents: ["Aadhaar", "Bank account", "Land details"],
    eligibility: "Eligible farmer families as per government norms.",
    apply: "https://pmkisan.gov.in/",
  },
  {
    id: "scheme-pm-fasal",
    title: "PM Fasal Bima Yojana",
    category: "Crop Insurance",
    benefit: "Insurance protection for crop loss due to notified risks.",
    documents: ["Aadhaar", "Land record", "Crop details", "Bank account"],
    eligibility: "Farmers growing notified crops in notified areas.",
    apply: "https://pmfby.gov.in/",
  },
  {
    id: "scheme-myscheme",
    title: "myScheme Eligibility Finder",
    category: "All Schemes",
    benefit: "Find central and state government schemes based on family, income, caste, occupation, and location.",
    documents: ["Aadhaar", "Income details", "Caste certificate if applicable", "Bank account"],
    eligibility: "Any citizen can check schemes and eligibility.",
    apply: "https://www.myscheme.gov.in/",
  },
  {
    id: "scheme-pm-kusum",
    title: "PM-KUSUM Solar Pump Scheme",
    category: "Farm Energy",
    benefit: "Support for solar pumps and renewable energy systems for farmers.",
    documents: ["Aadhaar", "Land record", "Bank account", "Pump or electricity details"],
    eligibility: "Eligible farmers and farmer groups as per scheme component and state rules.",
    apply: "https://pmkusum.mnre.gov.in/",
  },
  {
    id: "scheme-soil-health-card",
    title: "Soil Health Card",
    category: "Crop Planning",
    benefit: "Soil nutrient testing and fertilizer recommendations for better crop planning.",
    documents: ["Farmer details", "Land details", "Mobile number"],
    eligibility: "Farmers seeking soil testing and crop nutrient guidance.",
    apply: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "scheme-enam",
    title: "e-NAM Agriculture Market",
    category: "Market Access",
    benefit: "Online agricultural market access for better price discovery and trade.",
    documents: ["Farmer ID or registration details", "Bank account", "Produce details"],
    eligibility: "Farmers and traders linked with participating APMC markets.",
    apply: "https://www.enam.gov.in/",
  },
  {
    id: "scheme-agri-infra",
    title: "Agriculture Infrastructure Fund",
    category: "Farm Business",
    benefit: "Financing support for post-harvest management and community farming assets.",
    documents: ["Aadhaar", "Project details", "Bank documents", "Land or business records"],
    eligibility: "Farmers, FPOs, cooperatives, agri entrepreneurs, and eligible institutions.",
    apply: "https://agriinfra.dac.gov.in/",
  },
  {
    id: "scheme-pmksy",
    title: "PM Krishi Sinchai Yojana",
    category: "Irrigation",
    benefit: "Irrigation and water-use efficiency support under government guidelines.",
    documents: ["Aadhaar", "Land record", "Bank account", "Irrigation details"],
    eligibility: "Farmers and farmer groups covered by state implementation rules.",
    apply: "https://pmksy.gov.in/",
  },
  {
    id: "scheme-mgnrega",
    title: "MGNREGA Job Card & Work",
    category: "Rural Work",
    benefit: "Rural wage employment and job card services for eligible households.",
    documents: ["Aadhaar", "Address proof", "Bank account", "Job card if already issued"],
    eligibility: "Adult members of rural households seeking unskilled wage work.",
    apply: "https://nrega.nic.in/",
  },
  {
    id: "scheme-pmayg",
    title: "PMAY-Gramin Housing",
    category: "Housing",
    benefit: "Rural housing assistance for eligible households.",
    documents: ["Aadhaar", "Bank account", "Income or SECC details", "Land or house details"],
    eligibility: "Eligible rural households as per government housing priority lists.",
    apply: "https://pmayg.nic.in/",
  },
  {
    id: "scheme-ayushman",
    title: "Ayushman Bharat PM-JAY",
    category: "Health",
    benefit: "Health coverage for eligible families at empanelled hospitals.",
    documents: ["Aadhaar", "Ration card or family ID", "Mobile number"],
    eligibility: "Eligible families as per PM-JAY/state health scheme rules.",
    apply: "https://beneficiary.nha.gov.in/",
  },
  {
    id: "scheme-national-scholarship",
    title: "National Scholarship Portal",
    category: "Education",
    benefit: "Scholarships for eligible students from central and state departments.",
    documents: ["Aadhaar", "Student ID", "Income certificate", "Caste certificate if applicable", "Bank account"],
    eligibility: "Students meeting scholarship-specific income, category, and academic rules.",
    apply: "https://scholarships.gov.in/",
  },
];

export const citizenServices: CitizenService[] = [
  {
    id: "service-aadhaar-update",
    title: "Aadhaar Update / Download",
    category: "Identity",
    description: "Update Aadhaar details, download e-Aadhaar, check update status, and book Aadhaar services.",
    documents: ["Aadhaar number", "Mobile linked to Aadhaar", "Proof document for update"],
    apply: "https://myaadhaar.uidai.gov.in/",
  },
  {
    id: "service-digilocker",
    title: "DigiLocker Documents",
    category: "Documents",
    description: "Access Aadhaar, driving licence, certificates, marksheets, and other digital documents.",
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
