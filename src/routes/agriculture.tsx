import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sprout,
  Tractor,
  Search,
  TrendingUp,
  PhoneCall,
  ShieldCheck,
  Wheat,
  TestTube,
  ExternalLink,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/agriculture")({
  head: () => ({ meta: [{ title: "Agriculture & Farming Hub - GramMitra" }] }),
  component: AgriculturePage,
});

const MANDI_RATES = [
  {
    crop: "Paddy (వరి - Grade A)",
    price: "₹2,320 / Quintal",
    trend: "+₹50",
    status: "High Demand",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    crop: "Cotton (ప్రత్తి - Long Staple)",
    price: "₹7,450 / Quintal",
    trend: "+₹120",
    status: "Stable",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    crop: "Chilli (ఎర్ర మిరప - Teja)",
    price: "₹18,500 / Quintal",
    trend: "+₹300",
    status: "Peak Price",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  {
    crop: "Maize (మొక్కజొన్న)",
    price: "₹2,150 / Quintal",
    trend: "-₹20",
    status: "Normal",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
];

const MACHINERY_RENTALS = [
  {
    name: "Srinivas Rao (Mahindra 575 DI)",
    type: "Tractor & Rotavator",
    rate: "₹900 / Hour",
    phone: "9848012345",
    location: "Main Road, Ward 2",
  },
  {
    name: "Venkateswarlu Harvesters",
    type: "Paddy Combine Harvester",
    rate: "₹2,400 / Hour",
    phone: "9848056789",
    location: "Near Railway Gate",
  },
  {
    name: "Kallur Agri Tools",
    type: "Power Tiller & Sprayers",
    rate: "₹350 / Day",
    phone: "9848099887",
    location: "Mandal Center",
  },
];

const AGRI_SHOPS = [
  {
    name: "Sri Lakshmi Fertilisers & Seeds",
    owner: "Rambabu",
    phone: "9848011223",
    items: "Urea, DAP, Pesticides, Certified Seeds",
    location: "Bazar Street",
  },
  {
    name: "Rythu Seva Kendra",
    owner: "Agri Dept Officer",
    phone: "0841-23456",
    items: "Subsidized Seeds & Bio Fertilisers",
    location: "Gram Panchayat Office",
  },
];

function AgriculturePage() {
  return (
    <PageLayout
      title="Agriculture & Farming Hub (వ్యవసాయ కేంద్రం)"
      subtitle="Live crop prices, tractor rentals, government subsidies, and soil testing."
      icon={<Sprout className="size-7 text-emerald-600" />}
    >
      <div className="space-y-8">
        {/* Live Mandi Prices Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-600" /> Live Mandi Crop Rates (మార్కెట్
              ధరలు)
            </h2>
            <span className="text-xs font-semibold text-muted-foreground bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Updated Today 8:00 AM
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MANDI_RATES.map((item, idx) => (
              <SurfaceCard key={idx} className="p-5 relative overflow-hidden border-emerald-500/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    {item.crop.split(" ")[0]}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">{item.crop}</h3>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {item.price}
                </div>
                <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="size-3.5" /> Trend: {item.trend} vs yesterday
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* Machinery & Harvester Rental Directory */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Tractor className="size-5 text-primary" /> Machinery & Harvester Rental (వరి కోత &
              ట్రాక్టర్లు)
            </h2>
            <Link
              to="/services"
              search={{ kind: "services" }}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All Services <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {MACHINERY_RENTALS.map((mach, idx) => (
              <SurfaceCard key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">
                      <Tractor className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{mach.name}</h3>
                      <p className="text-xs text-muted-foreground">{mach.type}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl bg-secondary/30 text-xs space-y-1">
                    <div className="flex justify-between text-foreground font-semibold">
                      <span>Rate:</span>
                      <span className="text-primary font-bold">{mach.rate}</span>
                    </div>
                    <div className="text-muted-foreground">📍 {mach.location}</div>
                  </div>
                </div>

                <a
                  href={`tel:${mach.phone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-bold text-xs py-2.5 hover:bg-emerald-700 active:scale-95 transition shadow-sm"
                >
                  <PhoneCall className="size-3.5" /> Call {mach.phone}
                </a>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* Govt Schemes & Soil Testing Hub */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Rythu Bharosa & Subsidies */}
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center">
                <Wheat className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Rythu Bharosa & Subsidies
                </h3>
                <p className="text-xs text-muted-foreground">
                  Government financial assistance & crop insurance
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-muted-foreground mb-6">
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Rythu Bharosa / PM-Kisan:</strong> ₹13,500 annual investment support
                  directly to farmer bank accounts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Subsidized Seeds:</strong> 50% subsidy on Paddy, Groundnut, and Pulses
                  seeds at Gram Panchayat.
                </span>
              </li>
            </ul>

            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-110"
            >
              <Search className="size-4" /> Check Scheme Eligibility
            </Link>
          </SurfaceCard>

          {/* Soil Testing & Local Agri Shops */}
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
                <TestTube className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Soil Testing & Fertilizer Shops
                </h3>
                <p className="text-xs text-muted-foreground">
                  Free soil health card & certified inputs
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {AGRI_SHOPS.map((shop, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs"
                >
                  <div className="font-bold text-foreground">{shop.name}</div>
                  <div className="text-muted-foreground mt-0.5">{shop.items}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-semibold">📍 {shop.location}</span>
                    <a
                      href={`tel:${shop.phone}`}
                      className="font-bold text-primary hover:underline"
                    >
                      📞 {shop.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageLayout>
  );
}
