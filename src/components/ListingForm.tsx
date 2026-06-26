import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useListings, type Listing, timeAgo } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { CheckCircle2, LogIn } from "lucide-react";

type Field = {
  name: keyof Omit<Listing, "id" | "createdAt" | "type">;
  label: string;
  placeholder: string;
  textarea?: boolean;
  required?: boolean;
  options?: string[];
};

export function ListingForm({
  type,
  title,
  fields,
  redirectTo,
  accent = "primary",
}: {
  type: Listing["type"];
  title: string;
  fields: Field[];
  redirectTo: string;
  accent?: "primary" | "secondary" | "accent";
}) {
  const { add } = useListings();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.title || !values.contact) {
      toast.error("Please fill in title and contact");
      return;
    }
    setSubmitting(true);
    try {
      await add({
        type,
        title: values.title || "",
        description: values.description || "",
        contact: values.contact || "",
        location: values.location || "",
        price: values.price,
        category: values.category,
      });
      toast.success("Posted successfully!", { icon: <CheckCircle2 className="size-4" /> });
      setTimeout(() => navigate({ to: redirectTo }), 400);
    } catch {
      // toast handled in add
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <LogIn className="mx-auto size-8 text-primary" />
        <h3 className="mt-3 font-display text-xl font-semibold text-clay">Sign in to post</h3>
        <p className="mt-1 text-sm text-muted-foreground">Posts on ManaOoru are tied to your village profile.</p>
        <Link to="/auth" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110">
          Sign in / Create account
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-clay sm:text-3xl">{title}</h2>
      {fields.map((f) => (
        <div key={f.name} className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">
            {f.label} {f.required && <span className="text-primary">*</span>}
          </label>
          {f.options ? (
            <select
              required={f.required}
              value={values[f.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select…</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : f.textarea ? (
            <textarea
              required={f.required}
              placeholder={f.placeholder}
              rows={4}
              value={values[f.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <input
              required={f.required}
              placeholder={f.placeholder}
              value={values[f.name] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-xl bg-${accent} px-6 py-3.5 text-sm font-semibold text-${accent}-foreground transition hover:brightness-110 disabled:opacity-60`}
      >
        {submitting ? "Posting…" : "Post now"}
      </button>
    </form>
  );
}

export function ListingCard({ item, onDelete }: { item: Listing; onDelete?: (id: string) => Promise<void> | void }) {
  const { user } = useAuth();
  const canDelete = !!onDelete && !!user && user.id === item.owner_id;
  return (
    <article className="hover-lift group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {item.category && (
            <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
              {item.category}
            </span>
          )}
          <h3 className="mt-2 font-display text-lg font-semibold text-clay">{item.title}</h3>
          {item.location && <p className="mt-0.5 text-xs text-muted-foreground">📍 {item.location}</p>}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80">{timeAgo(item.createdAt)}</p>
        </div>
        {item.price && (
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            {item.price}
          </span>
        )}
      </div>
      {item.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <a
          href={`tel:${item.contact.replace(/\s|-/g, "")}`}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
        >
          📞 {item.contact}
        </a>
        {canDelete && (
          <button
            onClick={() => onDelete!(item.id)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        )}
      </div>
    </article>
  );
}