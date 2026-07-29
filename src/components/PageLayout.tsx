import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "./SiteNav";

export function PageLayout({
  children,
  title,
  subtitle,
  icon,
  heroAction,
  hideFooter = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  heroAction?: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F9FAFB] dark:bg-zinc-950">
      {/* Top Navigation guarantees back arrow is present everywhere */}
      <SiteNav />

      {/* Main Content Area with perfect spacing to clear the fixed 56px Top Nav */}
      <main className="flex-1 pb-24 pt-20 sm:pt-24 px-4 max-w-2xl mx-auto w-full">
        {/* Clean, Simple Header */}
        <div className="mb-6 sm:mb-8 mt-2">
          <h1 className="font-display text-[22px] sm:text-2xl font-extrabold text-clay dark:text-zinc-100 flex items-center gap-2.5 leading-tight">
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{title}</span>
          </h1>
          {subtitle && (
            <p className="mt-2 text-[13px] sm:text-sm leading-relaxed text-muted-foreground font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Any action buttons for the page */}
        {heroAction && <div className="mb-8">{heroAction}</div>}

        {/* Page Content */}
        {children}
      </main>

      {/* Footer is guaranteed to show unless explicitly hidden */}
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
