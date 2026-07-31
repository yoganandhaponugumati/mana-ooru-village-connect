import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getDistricts,
  getMandals,
  getStates,
  getVillages,
  type VillageProfile,
} from "@/lib/village-preferences";

function SearchableSelectField({
  label,
  value,
  placeholder,
  options,
  searchContext,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  searchContext?: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [apiOptions, setApiOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Synchronize local search state when value changes outside while dropdown is closed
  useEffect(() => {
    if (!open) {
      setSearch(value);
    }
  }, [value, open]);

  // Dynamic Geocoding Suggestions
  useEffect(() => {
    // Only search online if user has typed something new, it doesn't match the selected value,
    // and we don't have too many predefined local options.
    if (!search.trim() || search === value || options.length > 10) {
      setApiOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const queryTerm = searchContext ? `${search}, ${searchContext}` : search;
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryTerm)}&count=10&countryCode=IN&language=en&format=json`
        );
        const data = await res.json();
        const results = (data?.results ?? []) as any[];

        const suggestions = results
          .map((r) => {
            if (label === "District") return r.admin2 || r.name;
            if (label === "Mandal / Tehsil") return r.admin3 || r.name;
            return r.name; // Village
          })
          .filter(Boolean);

        setApiOptions(Array.from(new Set(suggestions)));
      } catch (e) {
        console.error("Geocoding fetch failed:", e);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [search, options.length, label, value, searchContext]);

  const selectOption = (opt: string) => {
    onChange(opt);
    setSearch(opt);
    setOpen(false);
  };

  const handleBlur = () => {
    // Save typed custom value if they click outside
    if (search !== value) {
      onChange(search);
    }
  };

  // Predefined + Dynamic options merged
  const allOptions = Array.from(new Set([...options, ...apiOptions]));
  const isSearching = search.trim() !== "" && search !== value;
  const filtered = isSearching
    ? allOptions.filter((opt) => opt.toLowerCase().includes(search.toLowerCase().trim()))
    : allOptions;

  return (
    <div ref={containerRef} className={`relative block ${open ? "z-[100]" : "z-10"}`}>
      <span className="mb-1 block text-xs font-black uppercase tracking-wider text-primary/80 flex items-center justify-between">
        <span>{label}</span>
        {loading && <span className="text-[10px] lowercase text-muted-foreground italic font-normal">searching...</span>}
      </span>
      <div className="relative">
        <input
          aria-label={label}
          value={open ? search : value}
          onFocus={() => {
            setSearch(value);
            setOpen(true);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="premium-input w-full rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-foreground bg-background"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 grid size-7 place-items-center text-muted-foreground hover:text-primary transition"
        >
          <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-56 overflow-y-auto rounded-2xl border border-border bg-card p-1 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const isSelected = opt.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-bold text-left transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="size-4 shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center">
              <p className="text-muted-foreground text-[11px] font-medium">No matching predefined option.</p>
              {search.trim() && (
                <button
                  key="custom-btn"
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(search.trim());
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-xl bg-primary/15 px-3 py-1.5 font-bold text-primary text-xs hover:bg-primary/25 transition"
                >
                  ➕ Use custom "{search.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VillageLocationPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: VillageProfile;
  onChange: (next: VillageProfile) => void;
  idPrefix?: string;
}) {
  void idPrefix;
  const states = getStates();
  const districts = getDistricts(value.state);
  const mandals = getMandals(value.state, value.district);
  const villages = getVillages(value.state, value.district, value.mandal);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { "User-Agent": "ManaOoru-Village-App/1.0" } }
          );
          if (!res.ok) throw new Error("Failed to fetch location data");
          const data = await res.json();
          const address = data.address || {};
          
          const state = address.state || "";
          const district = address.state_district || address.county || "";
          const mandal = address.county || address.suburb || "";
          const village = address.village || address.town || "";

          // We try to match with our predefined dropdowns if possible, or just set it as text
          onChange({
            state: state.replace(" State", ""),
            district: district.replace(" District", ""),
            mandal: mandal,
            village: village
          });
          toast.success("Location detected!");
        } catch (error) {
          console.error(error);
          toast.error("Could not determine your location. Please enter manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow it in browser settings.");
        } else {
          toast.error("Could not fetch location.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative z-50">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:opacity-50"
        >
          {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          {isLocating ? "Detecting location..." : "Use my location"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
      <SearchableSelectField
        label="State"
        value={value.state}
        placeholder="Select or type State"
        options={states}
        onChange={(next) => onChange({ state: next, district: "", mandal: "", village: "" })}
      />
      <SearchableSelectField
        label="District"
        value={value.district}
        placeholder="Select or type District"
        options={districts}
        searchContext={value.state}
        onChange={(next) => onChange({ ...value, district: next, mandal: "", village: "" })}
      />
      <SearchableSelectField
        label="Mandal / Tehsil"
        value={value.mandal}
        placeholder="Select or type Mandal"
        options={mandals}
        searchContext={[value.district, value.state].filter(Boolean).join(", ")}
        onChange={(next) => onChange({ ...value, mandal: next, village: "" })}
      />
      <SearchableSelectField
        label="Village"
        value={value.village}
        placeholder="Select or type Village"
        options={villages}
        searchContext={[value.mandal, value.district, value.state].filter(Boolean).join(", ")}
        onChange={(next) => onChange({ ...value, village: next })}
      />
      </div>
    </div>
  );
}
