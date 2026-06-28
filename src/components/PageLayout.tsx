import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "./SiteNav";

export function PageLayout({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <header className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top_left,_rgba(46,125,50,0.16),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(241,245,249,0.95))] pt-16">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-5 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4">
              {icon && (
                <div className="grid size-14 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                  {icon}
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary shadow-sm">
                  <Sparkles className="size-3.5" />
                  ManaOoru Platform
                </div>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-clay sm:text-5xl">{title}</h1>
                {subtitle && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg">{subtitle}</p>}
              </div>
            </div>
          </motion.div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
