import {
  Ambulance,
  Bike,
  Building2,
  Bus,
  CalendarDays,
  Car,
  FileText,
  Flame,
  HeartPulse,
  Landmark,
  Lightbulb,
  MapPin,
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

export const fallbackListings: Listing[] = [
  {
    id: "seed-worker-tractor",
    type: "worker",
    title: "Ramesh Tractor Driver",
    description: "Experienced tractor and rotavator driver available for ploughing, puddling, and transport work.",
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
];

export const schemes = [
  {
    id: "scheme-rythu-bandhu",
    title: "Rythu Bandhu",
    category: "Farmer Support",
    benefit: "Seasonal investment support for eligible farmers.",
    documents: ["Aadhaar", "Land passbook", "Bank account"],
    eligibility: "Telangana farmers with verified land records.",
    apply: "https://rythubandhu.telangana.gov.in/",
  },
  {
    id: "scheme-pm-kisan",
    title: "PM-KISAN",
    category: "Central Scheme",
    benefit: "Income support for eligible farmer families.",
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
];

export const transportOptions = [
  { id: "tractor-booking", title: "Tractor Booking", price: "₹900/hr", icon: Tractor, contact: "9876543210" },
  { id: "auto-booking", title: "Auto Booking", price: "Local fare", icon: Bike, contact: "9876501111" },
  { id: "mini-truck", title: "Mini Truck", price: "₹18/km", icon: Truck, contact: "9848123000" },
  { id: "pickup", title: "Pickup Vehicle", price: "₹15/km", icon: Car, contact: "9848123001" },
  { id: "harvester", title: "Harvest Machine", price: "Season rate", icon: Tractor, contact: "9848123002" },
  { id: "jcb", title: "JCB", price: "₹1,600/hr", icon: Wrench, contact: "9848123003" },
];

export const emergencyContacts = [
  { id: "ambulance", title: "Ambulance", contact: "108", role: "Emergency medical help", icon: Ambulance, urgent: true },
  { id: "police", title: "Police", contact: "100", role: "Law and order support", icon: Shield, urgent: true },
  { id: "fire", title: "Fire", contact: "101", role: "Fire and rescue", icon: Flame, urgent: true },
  { id: "hospital", title: "Hospital", contact: "104", role: "Health advice and referral", icon: HeartPulse },
  { id: "electricity", title: "Electricity", contact: "1912", role: "Power cut and line issues", icon: Lightbulb },
  { id: "veterinary", title: "Veterinary", contact: "1962", role: "Animal health support", icon: Phone },
  { id: "panchayat", title: "Village Officer", contact: "0841-23456", role: "Panchayat support desk", icon: Building2 },
];

export function listingRoute(type: ListingType) {
  if (type === "worker" || type === "work") return "/workers";
  if (type === "land") return "/land";
  if (type === "market") return "/marketplace";
  if (type === "service") return "/services";
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
