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

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <input
          aria-label="State"
          list={`${idPrefix}-states`}
          value={value.state}
          onChange={(e) =>
            onChange({ state: e.target.value, district: "", mandal: "", village: "" })
          }
          placeholder="Type your state"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <datalist id={`${idPrefix}-states`}>
          {states.map((state) => (
            <option key={state} value={state} />
          ))}
        </datalist>
      </div>
      <div>
        <input
          aria-label="District"
          list={`${idPrefix}-districts`}
          value={value.district}
          onChange={(e) =>
            onChange({ ...value, district: e.target.value, mandal: "", village: "" })
          }
          placeholder="Type your district"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <datalist id={`${idPrefix}-districts`}>
          {districts.map((district) => (
            <option key={district} value={district} />
          ))}
        </datalist>
      </div>
      <div>
        <input
          aria-label="Mandal"
          list={`${idPrefix}-mandals`}
          value={value.mandal}
          onChange={(e) => onChange({ ...value, mandal: e.target.value, village: "" })}
          placeholder="Type your mandal / tehsil"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <datalist id={`${idPrefix}-mandals`}>
          {mandals.map((mandal) => (
            <option key={mandal} value={mandal} />
          ))}
        </datalist>
      </div>
      <div>
        <input
          aria-label="Village"
          list={`${idPrefix}-villages`}
          value={value.village}
          onChange={(e) => onChange({ ...value, village: e.target.value })}
          placeholder="Type your exact village name"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <datalist id={`${idPrefix}-villages`}>
          {villages.map((village) => (
            <option key={village} value={village} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
