import {
  getDistricts,
  getMandals,
  getStates,
  getVillages,
  type VillageProfile,
} from "@/lib/village-preferences";

/**
 * State / District / Mandal / Village picker.
 *
 * These are free-text inputs with <datalist> suggestions, not rigid <select>
 * dropdowns. We only have hand-curated mandal/village data for a couple of
 * Telangana and Andhra Pradesh districts — everywhere else in India, a rigid
 * dropdown would make the app unusable (no matching option = can't sign up).
 * Free text + suggestions means every user can always enter their real
 * location, and gets autocomplete help wherever we do have data.
 */
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
  const fields = [
    {
      label: "State",
      list: `${idPrefix}-states`,
      value: value.state,
      placeholder: "Type your state",
      options: states,
      onChange: (next: string) => onChange({ state: next, district: "", mandal: "", village: "" }),
    },
    {
      label: "District",
      list: `${idPrefix}-districts`,
      value: value.district,
      placeholder: "Type your district",
      options: districts,
      onChange: (next: string) => onChange({ ...value, district: next, mandal: "", village: "" }),
    },
    {
      label: "Mandal / Tehsil",
      list: `${idPrefix}-mandals`,
      value: value.mandal,
      placeholder: "Type your mandal / tehsil",
      options: mandals,
      onChange: (next: string) => onChange({ ...value, mandal: next, village: "" }),
    },
    {
      label: "Village",
      list: `${idPrefix}-villages`,
      value: value.village,
      placeholder: "Type your exact village name",
      options: villages,
      onChange: (next: string) => onChange({ ...value, village: next }),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.label} className="block">
          <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.18em] text-primary/75">
            {field.label}
          </span>
          <input
            aria-label={field.label}
            list={field.list}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="premium-input w-full rounded-2xl px-4 py-3 text-sm font-semibold text-foreground"
          />
          <datalist id={field.list}>
            {field.options.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
      ))}
    </div>
  );
}
