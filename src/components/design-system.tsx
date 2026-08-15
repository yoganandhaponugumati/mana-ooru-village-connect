import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const buttonStyles: Record<Variant, string> = {
  primary:
    "border border-white/10 bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105",
  secondary:
    "border border-primary/20 bg-card/85 text-primary shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8",
  ghost:
    "border border-transparent bg-transparent text-primary transition-all duration-300 hover:bg-primary/8",
};

const buttonSizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export function AppButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "right",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-95 disabled:pointer-events-none transition-transform duration-150",
        buttonStyles[variant],
        buttonSizes[size],
        loading && "cursor-progress opacity-80",
        className,
      )}
      {...props}
    >
      {icon && iconPosition === "left" && !loading && <span>{icon}</span>}
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
      {icon && iconPosition === "right" && !loading && <span>{icon}</span>}
    </button>
  );
}

export function AppLinkButton({
  children,
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  to,
}: {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  to: string;
}) {
  return (
    <div className="inline-flex active:scale-95 transition-transform duration-150">
      <Link
        to={to}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
          buttonStyles[variant],
          buttonSizes[size],
          className,
        )}
      >
        {icon && iconPosition === "left" && <span>{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span>{icon}</span>}
      </Link>
    </div>
  );
}

type SurfaceCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> & { hover?: boolean };

export function SurfaceCard({ children, className, hover = true, ...props }: SurfaceCardProps) {
  return (
    <div
      className={clsx(
        "premium-surface rounded-[22px]",
        hover &&
          "transition-all duration-300 hover:border-primary/20 hover:shadow-[var(--shadow-lift)] hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        compact && "mb-6",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-balance font-display text-2xl font-bold text-clay sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[28px] border border-dashed border-primary/25 bg-gradient-to-br from-card/95 via-background to-muted/60 p-10 text-center shadow-[var(--shadow-soft)] animate-fade-up",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 size-56 rounded-full bg-secondary/15 blur-3xl" />
      <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        {icon}
      </div>
      <h3 className="relative mt-5 font-display text-2xl font-semibold text-clay">{title}</h3>
      {description && (
        <p className="relative mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="premium-surface rounded-[1.75rem] p-5">
          <div className="h-3 w-20 animate-pulse rounded-full bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%] [animation:shimmer_1.8s_linear_infinite]" />
          <div className="mt-4 h-5 w-3/4 animate-pulse rounded-full bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%] [animation:shimmer_1.8s_linear_infinite]" />
          <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%] [animation:shimmer_1.8s_linear_infinite]" />
          <div className="mt-2 h-5/6 animate-pulse rounded-full bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%] [animation:shimmer_1.8s_linear_infinite]" />
          <div className="mt-6 h-10 animate-pulse rounded-2xl bg-gradient-to-r from-muted via-card to-muted bg-[length:200%_100%] [animation:shimmer_1.8s_linear_infinite]" />
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "accent" | "success" | "danger";
}) {
  const classes = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/20 text-[#8a6800]",
    success: "bg-[#dcfce7] text-[#15803d]",
    danger: "bg-[#fee2e2] text-[#b91c1c]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        classes[tone],
      )}
    >
      {children}
    </span>
  );
}

export function SectionPill({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
      {icon}
      <span>{label}</span>
    </div>
  );
}

export function FeatureIcon({ icon, className }: { icon: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/12 to-secondary/12 text-primary shadow-sm ring-1 ring-primary/10 transition-transform duration-200 hover:scale-105",
        className,
      )}
    >
      {icon}
    </div>
  );
}

export function InlineAction({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
    >
      {icon}
      <span>{label}</span>
      <ArrowRight className="size-4" />
    </Link>
  );
}

export function Card3D({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  return (
    <div
      className={clsx(
        "relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button3D({
  children,
  to,
  onClick,
  className,
  variant = "primary",
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "warning";
}) {
  const classes = {
    primary: {
      top: "bg-gradient-to-r from-primary via-emerald-500 to-emerald-600 text-white shadow-[0_8px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] border border-emerald-500/20",
      base: "bg-gradient-to-r from-emerald-800 to-emerald-900 border-b-[6px] border-emerald-950",
    },
    secondary: {
      top: "bg-gradient-to-r from-slate-700 via-slate-650 to-slate-800 text-white shadow-[0_8px_30px_rgba(51,65,85,0.35)] hover:shadow-[0_12px_40px_rgba(51,65,85,0.5)] border border-slate-600/20",
      base: "bg-gradient-to-r from-slate-800 to-slate-900 border-b-[6px] border-slate-950",
    },
    success: {
      top: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-[0_8px_32px_rgba(16,185,129,0.42)] hover:shadow-[0_12px_44px_rgba(16,185,129,0.58)] border border-emerald-400/20",
      base: "bg-gradient-to-r from-emerald-700 to-teal-800 border-b-[6px] border-emerald-900",
    },
    warning: {
      top: "bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-[0_8px_32px_rgba(244,63,94,0.42)] hover:shadow-[0_12px_44px_rgba(244,63,94,0.58)] border border-rose-400/20",
      base: "bg-gradient-to-r from-rose-700 to-orange-800 border-b-[6px] border-rose-900",
    },
  };

  const c = classes[variant];

  const content = (
    <span className="relative block h-full w-full select-none">
      {/* 3D Base layer (depth/shadow) */}
      <span
        className={clsx(
          "absolute inset-0 rounded-2xl transform translate-y-2 transition-transform duration-200",
          c.base,
        )}
      />
      {/* 3D Top layer (floating action) */}
      <span
        className={clsx(
          "relative block overflow-hidden rounded-2xl px-8 py-4 text-center font-display text-lg font-bold tracking-wide transition-all duration-200 active:translate-y-2 active:shadow-inner hover:-translate-y-0.5",
          c.top,
        )}
      >
        {/* Glossy glass reflection overlay */}
        <span className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-white/22 to-transparent pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </span>
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={clsx(
          "relative inline-block cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative inline-block cursor-pointer select-none outline-none border-none bg-transparent p-0 focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl",
        className,
      )}
    >
      {content}
    </button>
  );
}

/**
 * Skeleton Header Shimmer Loader
 */
export function SkeletonHeader() {
  return (
    <div className="w-full h-48 rounded-3xl bg-slate-200 dark:bg-zinc-800 animate-pulse mb-6 p-6 flex flex-col justify-end">
      <div className="h-4 w-32 bg-slate-300 dark:bg-zinc-700 rounded-full mb-3" />
      <div className="h-8 w-64 bg-slate-300 dark:bg-zinc-700 rounded-2xl mb-2" />
      <div className="h-4 w-48 bg-slate-300 dark:bg-zinc-700 rounded-full" />
    </div>
  );
}

/**
 * Skeleton Stories Bar Shimmer Loader
 */
export function SkeletonStories() {
  return (
    <div className="flex items-center gap-4 overflow-x-auto py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
          <div className="size-16 rounded-full bg-slate-200 dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-700" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Listing Cards Skeleton Grid Loader
 */
export function ListingSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-border bg-card p-5 shadow-2xs animate-pulse space-y-4"
        >
          <div className="h-44 w-full rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded-lg bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted/60" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-8 w-24 rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
