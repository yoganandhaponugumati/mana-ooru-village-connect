import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
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
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const query = (open ? search : value || "").trim().toLowerCase();
  const filtered = options.filter((opt) => opt.toLowerCase().includes(query));

  const selectOption = (opt: string) => {
    onChange(opt);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wider text-primary/80">
        {label}
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
            onChange(e.target.value);
            setOpen(true);
          }}
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
  idPrefix: string;
}) {
  const states = getStates();
  const districts = getDistricts(value.state);
  const mandals = getMandals(value.state, value.district);
  const villages = getVillages(value.state, value.district, value.mandal);

  return (
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
        onChange={(next) => onChange({ ...value, district: next, mandal: "", village: "" })}
      />
      <SearchableSelectField
        label="Mandal / Tehsil"
        value={value.mandal}
        placeholder="Select or type Mandal"
        options={mandals}
        onChange={(next) => onChange({ ...value, mandal: next, village: "" })}
      />
      <SearchableSelectField
        label="Village"
        value={value.village}
        placeholder="Select or type Village"
        options={villages}
        onChange={(next) => onChange({ ...value, village: next })}
      />
    </div>
  );
}
