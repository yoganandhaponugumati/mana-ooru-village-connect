import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support & Help Centre — GramMitra" },
      {
        name: "description",
        content:
          "GramMitra support centre. Get answers to common questions, contact our team, or report an issue.",
      },
    ],
  }),
  component: SupportPage,
});

const faqs = [
  {
    q: "Is GramMitra completely free?",
    a: "Yes. GramMitra is 100% free for all villagers. We charge 0% commission on any transaction. You contact your buyer or seller directly — no middleman, ever.",
  },
  {
    q: "How do I report a civic problem (road damage, drainage etc.)?",
    a: "Tap the red 'Report Problem' card on the home screen, or use the + FAB button at the bottom. You can add a photo, description, and location. The Gram Panchayat admin can update the status to Pending → In Progress → Resolved.",
  },
  {
    q: "How do Village Stories work?",
    a: "Village Stories are 24-hour photo/video updates from your village officials (like WhatsApp Status). Only verified admins and officials can post stories. Citizens can view and react to them.",
  },
  {
    q: "How do I change my village or language?",
    a: "Go to your Profile (tap the Profile tab) and update your Village, Mandal, and District. For language, tap the 🌐 globe icon in the top navigation bar.",
  },
  {
    q: "How do I delete my account and all my data?",
    a: "Go to Profile → scroll to bottom → Delete Account. Or visit our dedicated Account Deletion Portal at /delete-account from any browser. Your data is permanently wiped immediately.",
  },
  {
    q: "How do I post a listing (worker, crop, land)?",
    a: "Tap the + button in the bottom navigation bar to open the Quick Post menu. Select what you want to post — Notice, Worker listing, or Report Problem. Fill in the details and publish.",
  },
  {
    q: "How do push notifications work?",
    a: "When you first open GramMitra, you'll be asked to allow notifications. These alert you to new stories from your village, complaint status changes, new panchayat notices, and poll results.",
  },
  {
    q: "I found a bug or my app is not working. What do I do?",
    a: "Please email us at hello@grammitra.org with a description of the issue and your device model. We respond within 24 hours. You can also use the in-app Feedback option in Settings.",
  },
  {
    q: "Is my personal data safe?",
    a: "Yes. All data is protected by Postgres Row-Level Security (RLS) at the database layer. Your village data is isolated — only your village members see your listings. We never sell your data.",
  },
  {
    q: "How do I become a verified dealer or village official?",
    a: "Go to Profile → Dealer Registration or contact your Gram Panchayat admin. Official roles are assigned by village admins after verification.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-muted/40"
      >
        <span className="text-sm font-bold text-clay dark:text-zinc-100">{q}</span>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-primary" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      )}
    </div>
  );
}

function SupportPage() {
  return (
    <PageLayout
      title="Support & Help Centre"
      subtitle="Find answers to common questions or reach our team directly. We respond within 24 hours."
      icon={<HelpCircle className="size-7 text-primary" />}
    >
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Contact Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SurfaceCard className="p-5 flex flex-col items-center text-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
              <Mail className="size-6" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-clay dark:text-zinc-100">
                Email Support
              </p>
              <p className="mt-1 text-xs text-muted-foreground">hello@grammitra.org</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">Replies within 24h</p>
            </div>
            <a
              href="mailto:hello@grammitra.org"
              className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Send Email <ArrowRight className="size-3" />
            </a>
          </SurfaceCard>

          <SurfaceCard className="p-5 flex flex-col items-center text-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-clay dark:text-zinc-100">
                WhatsApp Support
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Message our team</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">Mon–Sat 9am–6pm IST</p>
            </div>
            <a
              href="https://api.whatsapp.com/send?text=Hello+GramMitra+Support"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Open WhatsApp <ArrowRight className="size-3" />
            </a>
          </SurfaceCard>

          <SurfaceCard className="p-5 flex flex-col items-center text-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-clay dark:text-zinc-100">
                Privacy / Legal
              </p>
              <p className="mt-1 text-xs text-muted-foreground">privacy@grammitra.org</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/70">Data requests & reports</p>
            </div>
            <a
              href="mailto:privacy@grammitra.org"
              className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
            >
              Contact Privacy <ArrowRight className="size-3" />
            </a>
          </SurfaceCard>
        </div>

        {/* Data Deletion Callout */}
        <SurfaceCard className="p-5 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600">
            <Trash2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-red-700 dark:text-red-300">
              Want to delete your account?
            </p>
            <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
              You can permanently delete your account and all data from our dedicated portal. No email required — instant deletion.
            </p>
            <Link
              to="/delete-account"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
            >
              Account Deletion Portal <ArrowRight className="size-3" />
            </Link>
          </div>
        </SurfaceCard>

        {/* FAQ */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="font-display text-xl font-extrabold text-clay dark:text-zinc-100">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <SurfaceCard className="p-6">
          <p className="font-display text-sm font-bold text-clay dark:text-zinc-100 mb-4">
            Useful Links
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
              { label: "About GramMitra", to: "/about" },
              { label: "Delete Account", to: "/delete-account" },
              { label: "Report a Problem", to: "/problems" },
              { label: "Government Schemes", to: "/schemes" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
              >
                <Leaf className="size-3 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
