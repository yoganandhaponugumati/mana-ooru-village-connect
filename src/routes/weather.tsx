import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, CloudSun, Droplets, Leaf, MapPin, Sprout, Sun, Wind } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import {
  defaultProfile,
  getDistricts,
  getMandals,
  getStates,
  getVillages,
  useVillagePreferences,
} from "@/lib/village-preferences";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [{ title: "Weather - ManaOoru" }] }),
  component: WeatherPage,
});

function WeatherPage() {
  const { profile, setProfile, weather } = useVillagePreferences();
  const districts = getDistricts(profile.state);
  const mandals = getMandals(profile.state, profile.district);
  const villages = getVillages(profile.state, profile.district, profile.mandal);
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
      <SurfaceCard className="mb-6 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={profile.state}
            onChange={(e) => {
              const state = e.target.value;
              const district = getDistricts(state)[0] ?? defaultProfile.district;
              const mandal = getMandals(state, district)[0] ?? defaultProfile.mandal;
              setProfile({ state, district, mandal, village: "" });
            }}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold"
          >
            {getStates().map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
          <select
            value={profile.district}
            onChange={(e) => {
              const district = e.target.value;
              const mandal = getMandals(profile.state, district)[0] ?? "";
              setProfile({ ...profile, district, mandal, village: "" });
            }}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold"
          >
            {districts.map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
          <select
            value={profile.mandal}
            onChange={(e) => {
              const mandal = e.target.value;
              setProfile({ ...profile, mandal, village: "" });
            }}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold"
          >
            {mandals.map((mandal) => (
              <option key={mandal}>{mandal}</option>
            ))}
          </select>
          <input
            list="weather-village-options"
            value={profile.village}
            onChange={(e) => setProfile({ ...profile, village: e.target.value })}
            placeholder="Select or type exact village"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold"
          />
          <datalist id="weather-village-options">
            {villages.map((village) => (
              <option key={village} value={village} />
            ))}
          </datalist>
        </div>
      </SurfaceCard>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-primary to-secondary p-8 text-white">
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
                {weather.error && (
                  <p className="mt-2 max-w-md text-xs leading-5 text-white/70">
                    {weather.error}. No fallback temperature is shown because it would be
                    inaccurate.
                  </p>
                )}
              </div>
              <Sun className="size-20 text-accent" />
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {[
              { label: "Humidity", value: humidityText, icon: Droplets },
              { label: "Wind", value: windText, icon: Wind },
              { label: "Rain Alert", value: weather.rain, icon: CloudRain },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted/60 p-4">
                <FeatureIcon icon={<item.icon className="size-5" />} />
                <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
                <p className="font-display text-xl font-semibold text-clay">{item.value}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <FeatureIcon icon={<Leaf className="size-5" />} />
          <h3 className="mt-4 font-display text-2xl font-semibold text-clay">Crop suggestions</h3>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p className="rounded-2xl bg-muted/60 p-4">
              {!hasLiveWeather
                ? "Live weather could not be loaded for this village yet. Please check the selected state, district, mandal, and village spelling."
                : isRaining
                  ? "Rain is being reported now. Pause spraying, fertilizer application, and harvest movement."
                  : "No rain is being reported in the current update. Morning field work is generally safer than afternoon heat."}
            </p>
            <p className="rounded-2xl bg-muted/60 p-4">
              Humidity is {humidityText}.{" "}
              {weather.humidity !== null && weather.humidity > 70
                ? "Watch fungal issues in paddy, cotton, and vegetables."
                : hasLiveWeather
                  ? "Disease pressure is lower right now, but keep monitoring."
                  : "Live humidity is unavailable."}
            </p>
            <p className="rounded-2xl bg-muted/60 p-4">
              Wind is {windText}.{" "}
              {weather.wind !== null && weather.wind > 15
                ? "Avoid spraying until wind reduces."
                : hasLiveWeather
                  ? "Spraying may be manageable if there is no rain."
                  : "Live wind data is unavailable."}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4">
              <Sprout className="size-5 text-primary" />
              <p className="mt-2 font-semibold text-clay">Best work window</p>
              <p className="text-sm text-muted-foreground">{workWindow}</p>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/15 p-4">
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
