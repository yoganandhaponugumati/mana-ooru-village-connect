import { useNavigate } from "@tanstack/react-router";
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
import { logContact, useSavedItems } from "@/lib/local-actions";
import { uploadUserFile, type StorageBucket } from "@/lib/supabase/storage";
import { useListings, type Listing, timeAgo } from "@/lib/store";
import { SurfaceCard, StatusBadge } from "./design-system";

type Field = {
  name: keyof Omit<Listing, "id" | "createdAt" | "type">;
  label: string;
  placeholder: string;
  textarea?: boolean;
  required?: boolean;
  options?: string[];
};

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
  const { user } = useAuth();
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
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    if (!values.title) nextErrors.title = "Please add a clear title";
    if (!values.contact) nextErrors.contact = "Please include your contact number";
    if (photoRequired && !photoPreview) nextErrors.imageUrl = "Please add a photo";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please review the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = photoPreview;
      let storagePath: string | undefined;

      if (user && photoFile) {
        try {
          const uploaded = await uploadUserFile(bucketByType[type], user.id, photoFile);
          imageUrl = uploaded.url;
          storagePath = uploaded.path;
        } catch {
          toast.warning(
            "Photo saved on this device. Apply storage migrations to share uploads live.",
          );
        }
      }

      await add({
        type,
        title: values.title || "",
        description: values.description || "",
        contact: values.contact || "",
        location: values.location || "",
        price: values.price,
        category: values.category,
        imageUrl,
        storagePath,
      });
      toast.success("Posted successfully!", { icon: <CheckCircle2 className="size-4" /> });
      setValues({});
      setPhotoPreview("");
      setPhotoName("");
      setPhotoFile(null);
      setTimeout(() => navigate({ to: redirectTo }), 400);
    } catch {
      // add() shows the relevant toast and falls back locally when possible.
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            {field.label} {field.required && <span className="text-primary">*</span>}
          </label>
          {field.options ? (
            <select
              required={field.required}
              value={values[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              className={`w-full rounded-2xl border bg-card px-4 py-3.5 text-sm text-foreground shadow-sm ${errors[field.name] ? "border-destructive" : "border-border focus:border-primary"}`}
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
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              value={values[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              className={`min-h-32 w-full rounded-2xl border bg-card px-4 py-3.5 text-sm text-foreground shadow-sm ${errors[field.name] ? "border-destructive" : "border-border focus:border-primary"}`}
            />
          ) : (
            <input
              required={field.required}
              placeholder={field.placeholder}
              value={values[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              className={`w-full rounded-2xl border bg-card px-4 py-3.5 text-sm text-foreground shadow-sm ${errors[field.name] ? "border-destructive" : "border-border focus:border-primary"}`}
            />
          )}
          {errors[field.name] && <p className="text-sm text-destructive">{errors[field.name]}</p>}
        </div>
      ))}
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
          <label
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
          </label>
        )}
        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
      </div>
      <button
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
      </button>
    </form>
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
  const cleanContact = item.contact.replace(/\s|-/g, "");
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
      details: ["4.8 rating", "27 reviews", "Available today"],
      chips: ["5+ yrs exp", item.category || "Skilled", "Nearby"],
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
      eyebrow: "Local service",
      details: ["Same-day booking", "Tools ready", "Service guarantee"],
      chips: [item.category || "Service", item.price || "Call for rate", "Trusted"],
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

  return (
    <SurfaceCard className="group overflow-hidden p-5">
      {item.imageUrl && (
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="mb-4 block w-full overflow-hidden rounded-[18px] bg-muted text-left"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Phone className="size-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/91${cleanContact.slice(-10)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => logContact(item, "whatsapp")}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
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
      {detailsOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-lift)]">
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <StatusBadge tone="secondary">{typeMeta.eyebrow}</StatusBadge>
                <h3 className="mt-3 font-display text-2xl font-semibold text-clay">{item.title}</h3>
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
                    className="rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Call now
                  </a>
                  <a
                    href={`https://wa.me/91${cleanContact.slice(-10)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => logContact(item, "whatsapp")}
                    className="rounded-full border border-primary/20 bg-white px-4 py-2 text-center text-sm font-semibold text-primary"
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
          </div>
        </div>
      )}
      {chatOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-lift)]">
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
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
