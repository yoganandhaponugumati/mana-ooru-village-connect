import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const buttonStyles: Record<Variant, string> = {
  primary:
    "border border-transparent bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(46,125,50,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#256b2b]",
  secondary:
    "border border-primary/20 bg-white text-primary transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5",
  ghost:
    "border border-transparent bg-transparent text-primary transition-colors duration-300 hover:bg-primary/5",
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
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
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
    <Link
      to={to}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
        buttonStyles[variant],
        buttonSizes[size],
        className,
      )}
    >
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </Link>
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={clsx(
        "rounded-[20px] border border-border/70 bg-card/95 shadow-[var(--shadow-soft)] backdrop-blur-sm",
        hover &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
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
        "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
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
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-clay sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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
        "rounded-[2rem] border border-dashed border-border/80 bg-gradient-to-br from-background via-card to-muted/40 p-10 text-center shadow-sm",
        className,
      )}
    >
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-clay">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-sm"
        >
          <div className="h-3 w-20 rounded-full bg-muted" />
          <div className="mt-4 h-5 w-3/4 rounded-full bg-muted" />
          <div className="mt-3 h-3 w-full rounded-full bg-muted/80" />
          <div className="mt-2 h-3 w-5/6 rounded-full bg-muted/70" />
          <div className="mt-6 h-10 rounded-2xl bg-muted/70" />
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
        "grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm",
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
