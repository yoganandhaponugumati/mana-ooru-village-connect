import { useEffect, useState, useCallback } from "react";

export type Listing = {
  id: string;
  type: "worker" | "work" | "land" | "market" | "service" | "announcement";
  title: string;
  description: string;
  contact: string;
  location: string;
  price?: string;
  category?: string;
  createdAt: number;
};

const KEY = "manaooru:listings:v1";

const seedData: Listing[] = [
  { id: "s1", type: "worker", title: "Babu Rao — Master Electrician", description: "15 years of experience. Wiring, motor repair, solar installation.", contact: "98481 22334", location: "Kothur", category: "Electrician", price: "₹500/day", createdAt: Date.now() - 86400000 },
  { id: "s2", type: "worker", title: "Lakshmi & team — Paddy harvesters", description: "Team of 6 available for harvest season. Own sickles.", contact: "90004 11223", location: "Pedda Kallepalli", category: "Farm Labour", price: "₹450/day", createdAt: Date.now() - 172800000 },
  { id: "s3", type: "work", title: "5 workers needed — paddy harvest", description: "Need 5 workers for 3 days starting next Monday. Lunch provided.", contact: "98765 43210", location: "Kothur East", price: "₹500/day", createdAt: Date.now() - 3600000 },
  { id: "s4", type: "land", title: "2 Acres fertile land — East Canal", description: "Black soil, canal irrigation, suitable for paddy & vegetables.", contact: "94400 55667", location: "East Canal Road", price: "₹12,000/season", createdAt: Date.now() - 200000000 },
  { id: "s5", type: "land", title: "5 Acres dry land for groundnut", description: "Bore well available. 1 km from main road.", contact: "94400 88990", location: "North Fields", price: "₹8,000/acre/season", createdAt: Date.now() - 500000000 },
  { id: "s6", type: "market", title: "Fresh Tomatoes — 30 kg", description: "Harvested this morning. Organic, no pesticides.", contact: "99887 66554", location: "Padma's Farm", price: "₹25/kg", category: "Vegetables", createdAt: Date.now() - 7200000 },
  { id: "s7", type: "market", title: "Paddy 400 kg — premium grade", description: "Sona Masoori. Cleaned and ready.", contact: "98765 11223", location: "Kothur", price: "₹2,200/quintal", category: "Grain", createdAt: Date.now() - 10000000 },
  { id: "s8", type: "market", title: "Buffalo milk — 10 L daily", description: "Fresh cow & buffalo milk available for regular delivery.", contact: "98480 33445", location: "Dairy Lane", price: "₹60/L", category: "Dairy", createdAt: Date.now() - 60000000 },
  { id: "s9", type: "service", title: "Tractor for ploughing", description: "Mahindra 575. Available with driver. Same-day booking.", contact: "98481 99887", location: "Kothur", price: "₹800/hr", category: "Tractor", createdAt: Date.now() - 4000000 },
  { id: "s10", type: "service", title: "Plumber — pipe & motor repair", description: "Submersible motor experts. 24x7 emergency available.", contact: "90008 77665", location: "Main Road", price: "₹300 visit", category: "Plumber", createdAt: Date.now() - 30000000 },
  { id: "s11", type: "announcement", title: "Livestock vaccination drive — Saturday", description: "Free vaccination for cows, buffaloes & goats at the panchayat office, 9 AM onwards.", contact: "Panchayat Office", location: "Kothur Village", category: "Panchayat", createdAt: Date.now() - 7200000 },
  { id: "s12", type: "announcement", title: "New micro-irrigation subsidy", description: "70% subsidy on drip & sprinkler systems for small farmers. Apply at the Agri office.", contact: "Agri Officer — 98481 12443", location: "Mandal Office", category: "Agriculture", createdAt: Date.now() - 86400000 },
  { id: "s13", type: "announcement", title: "Scheduled power maintenance", description: "Power supply will be off from 10 AM to 4 PM on Thursday for line maintenance.", contact: "TSSPDCL", location: "All sectors", category: "Notice", createdAt: Date.now() - 172800000 },
];

function read(): Listing[] {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(seedData));
      return seedData;
    }
    return JSON.parse(raw) as Listing[];
  } catch {
    return seedData;
  }
}

function write(items: Listing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("manaooru:update"));
}

export function useListings(type?: Listing["type"]) {
  const [items, setItems] = useState<Listing[]>([]);
  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("manaooru:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("manaooru:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: Omit<Listing, "id" | "createdAt">) => {
    const next: Listing = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
    const all = read();
    write([next, ...all]);
    return next;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const filtered = type ? items.filter((i) => i.type === type) : items;
  return { items: filtered.sort((a, b) => b.createdAt - a.createdAt), add, remove, total: items.length };
}

export function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
}