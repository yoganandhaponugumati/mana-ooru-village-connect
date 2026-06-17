import { SiteNav, SiteFooter } from "./SiteNav";
import type { ReactNode } from "react";

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
      <header className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-card to-muted/40">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-semibold text-clay sm:text-5xl">{title}</h1>
              {subtitle && <p className="mt-2 text-muted-foreground sm:text-lg">{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}