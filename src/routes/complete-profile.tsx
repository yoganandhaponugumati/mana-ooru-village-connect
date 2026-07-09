import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, CheckCircle2, Loader2, UserRound, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SurfaceCard } from "@/components/design-system";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  getRoleDashboardPath,
  getUsernameError,
  isUsernameAvailable,
  occupations,
  type Occupation,
} from "@/lib/supabase/auth";
import { uploadUserFile } from "@/lib/supabase/storage";
import {
  languageOptions,
  normalizeProfile,
  saveVillageProfilePreference,
  saveLanguagePreference,
  useVillagePreferences,
  type Language,
  type VillageProfile,
} from "@/lib/village-preferences";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({ meta: [{ title: "Complete your profile — ManaOoru" }] }),
  component: () => (
    <ProtectedRoute requireCompleteProfile={false}>
      <CompleteProfilePage />
    </ProtectedRoute>
  ),
});

type UsernameCheckState = "idle" | "checking" | "available" | "taken" | "invalid";

function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { profile: localProfile, language: localLanguage, hasProfile } = useVillagePreferences();

  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || "",
  );
  const [username, setUsername] = useState(profile?.username || "");
  const [usernameState, setUsernameState] = useState<UsernameCheckState>("idle");
  const [occupation, setOccupation] = useState<Occupation>(profile?.occupation || "Other");
  const [language, setLanguage] = useState<Language>(profile?.preferred_language || localLanguage);
  const [villageProfile, setVillageProfile] = useState<VillageProfile>({
    ...localProfile,
    village: hasProfile ? localProfile.village : "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photo_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced live username availability check.
  useEffect(() => {
    const formatError = getUsernameError(username);
    if (formatError) {
      setUsernameState(username.trim() ? "invalid" : "idle");
      return;
    }
    setUsernameState("checking");
    const timer = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(username, user?.id);
        setUsernameState(available ? "available" : "taken");
      } catch {
        setUsernameState("idle");
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [username, user?.id]);

  const choosePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2 MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError(null);
    const usernameError = getUsernameError(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    if (usernameState === "taken") {
      setError("That username is already taken. Please choose another.");
      return;
    }
    if (!fullName.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!villageProfile.village.trim()) {
      setError("Please select or type your village name.");
      return;
    }
    if (!user) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      // Re-check availability right before writing, in case someone else took it
      // in the gap between the debounced check and submit.
      const stillAvailable = await isUsernameAvailable(username, user.id);
      if (!stillAvailable) {
        setUsernameState("taken");
        setError("That username was just taken. Please choose another.");
        setSubmitting(false);
        return;
      }

      let photoUrl = profile?.photo_url || undefined;
      if (photoFile) {
        const uploaded = await uploadUserFile("profile-images", user.id, photoFile);
        photoUrl = uploaded.url;
      }

      const selectedProfile = normalizeProfile(villageProfile);
      const { error: dbError } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        display_name: fullName.trim(),
        occupation,
        photo_url: photoUrl,
        preferred_language: language,
        state: selectedProfile.state,
        district: selectedProfile.district,
        mandal: selectedProfile.mandal,
        village: selectedProfile.village,
        profile_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;

      saveVillageProfilePreference(selectedProfile);
      saveLanguagePreference(language);
      await refreshProfile();
      toast.success("Profile complete. Welcome to ManaOoru!");
      navigate({ to: getRoleDashboardPath(profile?.role) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save your profile.";
      setError(
        message.toLowerCase().includes("duplicate") ? "That username is already taken." : message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(46,125,50,0.16),_transparent_42%),linear-gradient(135deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-10">
      <SurfaceCard className="w-full max-w-2xl p-8 shadow-[var(--shadow-lift)]">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
            <UserRound className="size-5" />
          </div>
          <span className="font-display text-xl font-semibold text-clay">
            Complete your profile
          </span>
        </div>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          One last step — this builds trust across workers, land, marketplace, and notices in your
          village.
        </p>

        <div className="mb-6 flex justify-center">
          <div className="relative grid size-24 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-2xl font-semibold text-white">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile preview"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              fullName.trim()[0]?.toUpperCase() || "M"
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border border-white bg-white text-primary shadow-sm"
              aria-label="Add profile photo"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => choosePhoto(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="cp-fullname" className="text-sm font-semibold text-foreground">
              Your name
            </label>
            <input
              id="cp-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              required
              className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="cp-username" className="text-sm font-semibold text-foreground">
              Username
            </label>
            <div className="relative mt-1">
              <input
                id="cp-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. ravi_kumar"
                required
                aria-invalid={usernameState === "taken" || usernameState === "invalid"}
                className={`w-full rounded-2xl border bg-background px-4 py-3 pr-10 text-sm text-foreground outline-none ${
                  usernameState === "taken" || usernameState === "invalid"
                    ? "border-destructive"
                    : usernameState === "available"
                      ? "border-[#15803d]"
                      : "border-border focus:border-primary"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameState === "checking" && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
                {usernameState === "available" && (
                  <CheckCircle2 className="size-4 text-[#15803d]" />
                )}
                {(usernameState === "taken" || usernameState === "invalid") && (
                  <XCircle className="size-4 text-destructive" />
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {usernameState === "taken"
                ? "That username is already taken."
                : usernameState === "invalid"
                  ? "3-20 characters: lowercase letters, numbers, underscore."
                  : "Lowercase letters, numbers, and underscore only."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Occupation</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {occupations.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOccupation(item)}
                  className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                    occupation === item
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Language</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setLanguage(option.code)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                    language === option.code
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Village</p>
            <div className="mt-2">
              <VillageLocationPicker
                value={villageProfile}
                onChange={setVillageProfile}
                idPrefix="complete-profile"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Saving..." : "Finish setup"}
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}
