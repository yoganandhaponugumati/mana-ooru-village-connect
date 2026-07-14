import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  Bookmark,
  Camera,
  CheckCircle2,
  Clock3,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useVillagePreferences } from "@/lib/village-preferences";
import { logContact, useSavedItems } from "@/lib/local-actions";
import { deleteUserFile, uploadUserFile, type StorageBucket } from "@/lib/supabase/storage";
import { useListings, type Listing, timeAgo } from "@/lib/store";
import { StatusBadge } from "./design-system";

type Field = {
  name: keyof Omit<Listing, "id" | "createdAt" | "type">;
  label: string;
  placeholder: string;
  textarea?: boolean;
  required?: boolean;
  options?: string[];
};

const MOBILE_RE = /^[6-9]\d{9}$/;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isMobileField(field: Field) {
  return field.name === "contact";
}

function validateField(field: Field, rawValue: string) {
  const value = rawValue.trim();
  if (!value) return `${field.label} is required`;
  if (field.name === "title" && value.length < 4) return "Please enter at least 4 characters";
  if (field.textarea && value.length < 10) {
    return "Please enter at least 10 characters";
  }
  if (isMobileField(field) && !MOBILE_RE.test(onlyDigits(value))) {
    return "10-digit mobile number required";
  }
  return "";
}

const accentStyles = {
  primary: "bg-primary text-primary-foreground hover:bg-[#256b2b]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-[#4ea75a]",
  accent: "bg-accent text-accent-foreground hover:bg-[#f0a30c]",
};

const bucketByType: Record<Listing["type"], StorageBucket> = {
  worker: "products",
  work: "products",
  land: "products",
  market: "products",
  service: "products",
  announcement: "events",
  complaint: "complaints",
};

export function ListingForm({
  type,
  title,
  fields,
  redirectTo,
  accent = "primary",
  photoLabel = "Add photo",
  photoHint = "Take a photo or choose one from your gallery.",
  photoRequired = false,
}: {
  type: Listing["type"];
  title: string;
  fields: Field[];
  redirectTo: string;
  accent?: "primary" | "secondary" | "accent";
  photoLabel?: string;
  photoHint?: string;
  photoRequired?: boolean;
}) {
  const { add } = useListings();
  const { user, profile: authProfile } = useAuth();
  const { profile: prefProfile } = useVillagePreferences();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const choosePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Photo must be under 3 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ""));
      setPhotoName(file.name);
      setPhotoFile(file);
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field, values[field.name] || "");
      if (error) nextErrors[field.name] = error;
    });

    if (!values.title?.trim()) nextErrors.title = "Please add a clear title";
    if (!values.contact?.trim()) nextErrors.contact = "Please include your contact number";
    if (photoRequired && !photoPreview) nextErrors.imageUrl = "Please add a photo";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please review the highlighted fields");
      return;
    }

    if (!user) {
      toast.error("Please sign in before posting. Posts are saved only to Supabase.");
      return;
    }

    setSubmitting(true);
    const bucket = bucketByType[type];
    let uploadedStoragePath: string | undefined;
    try {
      console.info("[posting] form:submit:start", {
        type,
        title: values.title,
        hasPhoto: Boolean(photoFile),
        bucket,
      });
      let imageUrl = "";
      let storagePath: string | undefined;

      if (photoFile) {
        const uploaded = await uploadUserFile(bucket, user.id, photoFile);
        imageUrl = uploaded.url;
        storagePath = uploaded.path;
        uploadedStoragePath = uploaded.path;
      }

      let villageId = authProfile?.village_id || undefined;
      if (!villageId && prefProfile?.village) {
        const { data: vData } = await supabase
          .from("villages")
          .select("id")
          .eq("name", prefProfile.village)
          .limit(1)
          .maybeSingle();
        if (vData) {
          villageId = vData.id;
        }
      }

      await add({
        type,
        title: values.title?.trim() || "",
        description: values.description?.trim() || "",
        contact: onlyDigits(values.contact || ""),
        location: values.location?.trim() || "",
        price: values.price?.trim(),
        category: values.category?.trim(),
        imageUrl,
        storagePath,
        villageId,
      });
      uploadedStoragePath = undefined;
      console.info("[posting] form:submit:success", { type, title: values.title });
      toast.success("Posted successfully!", { icon: <CheckCircle2 className="size-4" /> });
      setValues({});
      setPhotoPreview("");
      setPhotoName("");
      setPhotoFile(null);
      setTimeout(() => navigate({ to: redirectTo }), 400);
    } catch (error) {
      console.error("[posting] form:submit:error", error);
      if (uploadedStoragePath) {
        try {
          await deleteUserFile(bucket, uploadedStoragePath);
        } catch (rollbackError) {
          console.error("[posting] rollback:error", rollbackError);
        }
      }
      toast.error(error instanceof Error ? error.message : "Could not post. Please try again.");
    } finally {
      console.info("[posting] form:submit:finish", { type });
      setSubmitting(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    const nextValue = name === "contact" ? onlyDigits(value).slice(0, 10) : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            New listing
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-clay sm:text-3xl">
            {title}
          </h2>
        </div>
        <StatusBadge tone="secondary">Village verified</StatusBadge>
      </div>
      {fields.map((field) => {
        const fieldId = `${type}-field-${field.name}`;
        return (
          <div key={field.name} className="space-y-2">
            <label htmlFor={fieldId} className="text-sm font-semibold text-foreground">
              {field.label} <span className="text-primary">*</span>
            </label>
            {field.options ? (
              <select
                id={fieldId}
                required
                value={values[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                onBlur={(e) => {
                  const error = validateField(field, e.target.value);
                  if (error) setErrors((prev) => ({ ...prev, [field.name]: error }));
                }}
                aria-invalid={Boolean(errors[field.name])}
                className={`premium-input w-full rounded-2xl px-4 py-3.5 text-sm text-foreground ${errors[field.name] ? "border-destructive" : "focus:border-primary"}`}
              >
                <option value="">Select…</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.textarea ? (
              <textarea
                id={fieldId}
                required
                placeholder={field.placeholder}
                rows={4}
                value={values[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                onBlur={(e) => {
                  const error = validateField(field, e.target.value);
                  if (error) setErrors((prev) => ({ ...prev, [field.name]: error }));
                }}
                aria-invalid={Boolean(errors[field.name])}
                className={`premium-input min-h-32 w-full rounded-2xl px-4 py-3.5 text-sm text-foreground ${errors[field.name] ? "border-destructive" : "focus:border-primary"}`}
              />
            ) : (
              <input
                id={fieldId}
                required
                placeholder={field.placeholder}
                inputMode={isMobileField(field) ? "numeric" : undefined}
                maxLength={isMobileField(field) ? 10 : undefined}
                value={values[field.name] || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                onBlur={(e) => {
                  const error = validateField(field, e.target.value);
                  if (error) setErrors((prev) => ({ ...prev, [field.name]: error }));
                }}
                aria-invalid={Boolean(errors[field.name])}
                className={`premium-input w-full rounded-2xl px-4 py-3.5 text-sm text-foreground ${errors[field.name] ? "border-destructive" : "focus:border-primary"}`}
              />
            )}
            {errors[field.name] && <p className="text-sm text-destructive">{errors[field.name]}</p>}
          </div>
        );
      })}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          {photoLabel} {photoRequired && <span className="text-primary">*</span>}
        </label>
        {photoPreview ? (
          <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
            <img
              src={photoPreview}
              alt={photoName || "Selected photo"}
              className="aspect-video w-full object-cover"
            />
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="min-w-0 truncate text-xs font-semibold text-muted-foreground">
                {photoName || "Selected photo"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview("");
                  setPhotoName("");
                  setPhotoFile(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Remove photo
              </button>
            </div>
          </div>
        ) : (
          <motion.label
            whileHover={{ y: -2 }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed px-4 py-8 text-center transition ${
              errors.imageUrl
                ? "border-destructive bg-destructive/5"
                : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"
            }`}
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-sm">
              <Camera className="size-6" />
            </div>
            <span className="mt-3 text-sm font-semibold text-clay">{photoLabel}</span>
            <span className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              {photoHint}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              className="sr-only"
              onChange={(event) => choosePhoto(event.target.files?.[0])}
            />
          </motion.label>
        )}
        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting}
        className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-300 disabled:cursor-progress disabled:opacity-70 ${accentStyles[accent]}`}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {submitting ? "Posting…" : "Post now"}
      </motion.button>
    </motion.form>
  );
}

export function ListingCard({
  item,
  onDelete,
}: {
  item: Listing;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedItems();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chat, setChat] = useState([
    { role: "seller", text: `Namaste, this is about ${item.title}. How can I help?` },
  ]);
  const canDelete = !!onDelete && (!!item.localOnly || (!!user && user.id === item.owner_id));
  const cleanContact = onlyDigits(item.contact);
  const hasMobileContact = MOBILE_RE.test(cleanContact);
  const mapQuery = encodeURIComponent(`${item.location || item.title}, India`);
  const initials = item.title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const typeMeta = {
    worker: {
      eyebrow: "Verified worker",
      details: ["Experience shown", "Availability visible", "Village verified"],
      chips: [item.price || "Daily wage", item.category || "Skilled", "4.8 rating"],
    },
    work: {
      eyebrow: "Open work",
      details: ["Urgent hiring", "Village verified", "Direct contact"],
      chips: ["Daily pay", item.category || "Work", "Local"],
    },
    land: {
      eyebrow: "Lease land",
      details: ["Water source: Borewell", "Road access: Yes", "Soil: Black cotton"],
      chips: [item.price || "Season lease", "Google Maps", "Save"],
    },
    market: {
      eyebrow: "Fresh listing",
      details: ["Quantity available", "Seller verified", "Pickup ready"],
      chips: [item.category || "Produce", "Today", "Local seller"],
    },
    service: {
      eyebrow: "Open now",
      details: ["Opening hours in description", "Phone and WhatsApp", "Directions available"],
      chips: [item.category || "Service", item.price || "Call for rate", "Reviews enabled"],
    },
    announcement: {
      eyebrow: "Village notice",
      details: ["Public update", "Shared locally", "Community alert"],
      chips: [item.category || "Notice", "Important", "Verified"],
    },
    complaint: {
      eyebrow: "Citizen problem",
      details: ["Photo evidence", "Needs attention", "Track locally"],
      chips: [item.category || "Issue", "Public", "Needs action"],
    },
  }[item.type];
  const complaintSteps = ["Submitted", "Accepted", "In Progress", "Resolved"];
  const complaintStepIndex =
    item.type === "complaint"
      ? Math.min(
          complaintSteps.length - 1,
          Math.max(0, Math.floor((Date.now() - item.createdAt) / (1000 * 60 * 60 * 24))),
        )
      : -1;

  // Interactive 3D tilt physics using Framer Motion
  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(200);
  const rotateX = useTransform(mouseY, [0, 400], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 400], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const relX = ((event.clientX - rect.left) / width) * 400;
    const relY = ((event.clientY - rect.top) / height) * 400;
    mouseX.set(relX);
    mouseY.set(relY);
  };

  const handleMouseLeave = () => {
    mouseX.set(200);
    mouseY.set(200);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="listing-3d-card group relative overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(23,99,58,0.12)] transition-shadow duration-300"
    >
      {item.imageUrl && (
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="mb-4 block w-full overflow-hidden rounded-[18px] bg-muted text-left transform transition duration-300 group-hover:translate-z-10"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </button>
      )}
      <div className="flex items-start justify-between gap-3 transform transition duration-300 group-hover:translate-z-20">
        <div className="flex flex-1 gap-3">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-semibold text-white shadow-sm">
            {item.imageUrl ? <ImagePlus className="size-6" /> : initials || "MO"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="secondary">{typeMeta.eyebrow}</StatusBadge>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <ShieldCheck className="size-3" /> Verified
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-clay">{item.title}</h3>
            {item.location && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" /> {item.location}
              </p>
            )}
            <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
              <Clock3 className="size-3.5" /> {timeAgo(item.createdAt)}
            </p>
          </div>
        </div>
        {item.price && (
          <span className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
            {item.price}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
      )}
      {item.type === "complaint" && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/50 p-3">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
            Public status
          </p>
          <div className="grid grid-cols-4 gap-2">
            {complaintSteps.map((step, index) => (
              <div key={step} className="min-w-0">
                <div
                  className={`h-1.5 rounded-full ${index <= complaintStepIndex ? "bg-red-600" : "bg-red-100"}`}
                />
                <p
                  className={`mt-2 text-[10px] font-semibold leading-4 ${index <= complaintStepIndex ? "text-red-700" : "text-muted-foreground"}`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 grid gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
        {typeMeta.details.map((detail) => (
          <span key={detail} className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-primary" /> {detail}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {typeMeta.chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
          >
            {chip}
          </span>
        ))}
        {(item.type === "worker" || item.type === "service") && (
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-semibold text-clay">
            <Star className="size-3 fill-accent text-accent" /> 4.8
          </span>
        )}
        {item.type === "land" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Navigation className="size-3" /> Maps
          </span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-clay transition hover:border-primary hover:text-primary"
          >
            <Eye className="size-3.5" /> View
          </button>
          <button
            type="button"
            onClick={() => toggleSaved(item)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${isSaved(item.id) ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-white text-primary hover:bg-primary/5"}`}
          >
            <Bookmark className="size-3.5" /> {isSaved(item.id) ? "Saved" : "Save"}
          </button>
          <a
            href={`tel:${cleanContact}`}
            onClick={() => logContact(item, "call")}
            aria-disabled={!hasMobileContact}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${hasMobileContact ? "bg-primary text-primary-foreground hover:brightness-110" : "pointer-events-none bg-muted text-muted-foreground"}`}
          >
            <Phone className="size-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/91${cleanContact.slice(-10)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => logContact(item, "whatsapp")}
            aria-disabled={!hasMobileContact}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${hasMobileContact ? "border-primary/20 bg-white text-primary hover:border-primary hover:bg-primary/5" : "pointer-events-none border-border bg-muted text-muted-foreground"}`}
          >
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              logContact(item, "chat");
              setChatOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            <MessageCircle className="size-3.5" /> Chat
          </button>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => logContact(item, "map")}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            <Navigation className="size-3.5" /> Map
          </a>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete!(item.id)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        )}
      </div>
      <AnimatePresence>
        {detailsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border p-6">
                <div>
                  <StatusBadge tone="secondary">{typeMeta.eyebrow}</StatusBadge>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-clay">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.location || "Village location"} · {timeAgo(item.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Close details"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid gap-5 p-6 md:grid-cols-[1fr_0.8fr]">
                <div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="mb-4 aspect-video w-full rounded-2xl object-cover"
                    />
                  )}
                  <p className="text-sm leading-7 text-muted-foreground">
                    {item.description || "Verified local listing from your village network."}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {typeMeta.details.concat(typeMeta.chips).map((detail) => (
                      <div
                        key={detail}
                        className="rounded-2xl bg-muted/60 p-3 text-sm font-semibold text-clay"
                      >
                        <CheckCircle2 className="mr-2 inline size-4 text-primary" /> {detail}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-sm font-semibold text-clay">Contact and actions</p>
                  {item.price && (
                    <p className="mt-3 font-display text-2xl font-semibold text-primary">
                      {item.price}
                    </p>
                  )}
                  <div className="mt-4 grid gap-2">
                    <a
                      href={`tel:${cleanContact}`}
                      onClick={() => logContact(item, "call")}
                      className={`rounded-full px-4 py-2 text-center text-sm font-semibold ${hasMobileContact ? "bg-primary text-primary-foreground" : "pointer-events-none bg-muted text-muted-foreground"}`}
                    >
                      Call now
                    </a>
                    <a
                      href={`https://wa.me/91${cleanContact.slice(-10)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => logContact(item, "whatsapp")}
                      className={`rounded-full border px-4 py-2 text-center text-sm font-semibold ${hasMobileContact ? "border-primary/20 bg-white text-primary" : "pointer-events-none border-border bg-muted text-muted-foreground"}`}
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary"
                    >
                      Open chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <p className="font-display text-lg font-semibold text-clay">Chat about listing</p>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="grid size-9 place-items-center rounded-full border border-border"
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
                {chat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <p
                      className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-6 ${msg.role === "me" ? "bg-primary text-primary-foreground" : "bg-white text-foreground"}`}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!chatMessage.trim()) return;
                  setChat((items) => [
                    ...items,
                    { role: "me", text: chatMessage },
                    {
                      role: "seller",
                      text: "Thanks. I will call or reply soon. You can also use the Call or WhatsApp button for urgent needs.",
                    },
                  ]);
                  setChatMessage("");
                }}
                className="flex gap-2 border-t border-border p-3"
              >
                <input
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder="Type your message..."
                  className="min-w-0 flex-1 rounded-full border border-border px-4 text-sm"
                />
                <button
                  className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"
                  aria-label="Send chat"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
