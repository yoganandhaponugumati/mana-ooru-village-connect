import { createFileRoute } from "@tanstack/react-router";
import {
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  Sun,
  Wind,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { Card3D, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [{ title: "Weather - ManaOoru" }] }),
  component: WeatherPage,
});

function WeatherPage() {
  const { profile, setProfile, weather } = useVillagePreferences();
  const isRaining = weather.rain.toLowerCase().includes("rain now");
  const hasLiveWeather = weather.live && weather.temp !== null;
  const workWindow = !hasLiveWeather
    ? "Waiting for live weather"
    : isRaining
      ? "Wait until rain stops"
      : "6:00 AM - 10:30 AM";
  const rainWatch = isRaining
    ? "Active rain near selected village"
    : hasLiveWeather
      ? "No rain reported in current update"
      : "Live rain data unavailable";
  const tempText = weather.temp === null ? "--" : `${weather.temp}°C`;
  const humidityText = weather.humidity === null ? "--" : `${weather.humidity}%`;
  const windText = weather.wind === null ? "--" : `${weather.wind} km/h`;
  const confidenceLabel =
    weather.confidence === "verified"
      ? "Verified village coordinate"
      : weather.confidence === "matched"
        ? "Matched live location"
        : weather.confidence === "fallback"
          ? "Nearest available location"
          : "Waiting for location";
  const fieldReadiness = !hasLiveWeather
    ? 0
    : isRaining
      ? 38
      : weather.wind !== null && weather.wind > 18
        ? 58
        : weather.humidity !== null && weather.humidity > 80
          ? 70
          : 88;

  return (
    <PageLayout
      title="Village Weather"
      subtitle="Live current weather, rain status, and crop suggestions for the selected village."
      icon={<CloudSun className="size-7" />}
    >
      <SectionHeader
        eyebrow="Field intelligence"
        title="Plan farming work with confidence"
        description="A premium weather dashboard for farmers and village operations."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-clay shadow-sm">
            <MapPin className="size-4 text-primary" /> {profile.village}
          </div>
        }
      />
      <SurfaceCard className="mb-6 p-5" hover={false}>
        <VillageLocationPicker value={profile} onChange={setProfile} idPrefix="weather" />
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Suggestions appear where verified data exists; every Indian state, district, mandal, and
          village can still be typed manually for live lookup.
        </p>
      </SurfaceCard>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card3D intensity={6} className="overflow-hidden rounded-[22px]">
          <SurfaceCard className="overflow-hidden p-0 h-full" hover={false}>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#123820] via-primary to-secondary p-8 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.16),transparent_34%),linear-gradient(246deg,rgba(242,184,75,0.24),transparent_38%)]" />
              <div className="relative" style={{ transform: "translateZ(10px)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                    Live Weather
                  </p>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                    {weather.loading
                      ? "Updating live weather..."
                      : weather.updatedAt
                        ? `Updated ${weather.updatedAt}`
                        : "Live weather unavailable"}
                  </span>
                </div>
                <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-display text-7xl font-semibold">{tempText}</p>
                    <p className="mt-2 text-white/80">
                      {weather.condition} in {profile.village}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                      {weather.source ?? "Open-Meteo live"}
                    </p>
                    {weather.placeName && (
                      <p className="mt-2 text-xs text-white/70">
                        Weather station lookup: {weather.placeName}
                      </p>
                    )}
                    {weather.coordinates && (
                      <p className="mt-2 text-xs text-white/70">
                        Coordinates: {weather.coordinates.latitude.toFixed(4)},{" "}
                        {weather.coordinates.longitude.toFixed(4)}
                      </p>
                    )}
                    {weather.error && (
                      <p className="mt-2 max-w-md text-xs leading-5 text-white/70">
                        {weather.error}. No fallback temperature is shown because it would be
                        inaccurate.
                      </p>
                    )}
                  </div>
                  <div
                    style={{ transform: "translateZ(30px)" }}
                    className="relative grid size-28 place-items-center rounded-[28px] border border-white/20 bg-white/12 shadow-[0_30px_80px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl transition hover:scale-105"
                  >
                    {isRaining ? (
                      <CloudRain className="size-16 text-sky-200 animate-bounce" />
                    ) : weather.condition?.toLowerCase()?.includes("cloud") ? (
                      <CloudSun className="size-16 text-amber-200 animate-pulse" />
                    ) : (
                      <Sun
                        className="size-16 text-accent animate-pulse"
                        style={{ animationDuration: "6s" }}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Data confidence", value: confidenceLabel, icon: ShieldCheck },
                    { label: "Source", value: weather.source ?? "Open-Meteo live", icon: CloudSun },
                    {
                      label: "Field readiness",
                      value: hasLiveWeather ? `${fieldReadiness}%` : "Waiting",
                      icon: Sprout,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[18px] border border-white/16 bg-white/12 p-4 backdrop-blur-xl"
                    >
                      <item.icon className="size-4 text-accent" />
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/56">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              {[
                { label: "Humidity", value: humidityText, icon: Droplets },
                { label: "Wind", value: windText, icon: Wind },
                { label: "Rain Alert", value: weather.rain, icon: CloudRain },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl"
                >
                  <FeatureIcon icon={<item.icon className="size-5" />} />
                  <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-display text-xl font-semibold text-clay">{item.value}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </Card3D>
        <SurfaceCard className="p-6">
          <FeatureIcon icon={<Leaf className="size-5" />} />
          <h3 className="mt-4 font-display text-2xl font-semibold text-clay">Crop suggestions</h3>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p className="rounded-[18px] border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
              {!hasLiveWeather
                ? "Live weather could not be loaded for this village yet. Please check the selected state, district, mandal, and village spelling."
                : isRaining
                  ? "Rain is being reported now. Pause spraying, fertilizer application, and harvest movement."
                  : "No rain is being reported in the current update. Morning field work is generally safer than afternoon heat."}
            </p>
            <p className="rounded-[18px] border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
              Humidity is {humidityText}.{" "}
              {weather.humidity !== null && weather.humidity > 70
                ? "Watch fungal issues in paddy, cotton, and vegetables."
                : hasLiveWeather
                  ? "Disease pressure is lower right now, but keep monitoring."
                  : "Live humidity is unavailable."}
            </p>
            <p className="rounded-[18px] border border-white/70 bg-white/62 p-4 shadow-sm backdrop-blur-xl">
              Wind is {windText}.{" "}
              {weather.wind !== null && weather.wind > 15
                ? "Avoid spraying until wind reduces."
                : hasLiveWeather
                  ? "Spraying may be manageable if there is no rain."
                  : "Live wind data is unavailable."}
            </p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--accent))] transition-all duration-700"
              style={{ width: `${fieldReadiness}%` }}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-primary/15 bg-primary/10 p-4">
              <Sprout className="size-5 text-primary" />
              <p className="mt-2 font-semibold text-clay">Best work window</p>
              <p className="text-sm text-muted-foreground">{workWindow}</p>
            </div>
            <div className="rounded-[18px] border border-accent/30 bg-accent/15 p-4">
              <CloudRain className="size-5 text-primary" />
              <p className="mt-2 font-semibold text-clay">Rain watch</p>
              <p className="text-sm text-muted-foreground">{rainWatch}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
