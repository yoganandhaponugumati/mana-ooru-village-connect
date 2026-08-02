import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LucideIcon, PackageOpen, Plus, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onActionClick?: () => void;
  actionIcon?: LucideIcon;
  secondaryActionLabel?: string;
  onSecondaryActionClick?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionTo,
  onActionClick,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryActionClick,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border/80 bg-card/50 backdrop-blur-sm my-4">
      {/* Decorative Gradient Glow behind Icon */}
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-blue-500/20 blur-xl" />
        <div className="relative grid size-16 place-items-center rounded-2xl border border-primary/20 bg-background shadow-md text-primary">
          <Icon className="size-8 stroke-[1.5]" />
        </div>
      </div>

      <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {children}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95 sm:text-sm"
          >
            <ActionIcon className="size-4" />
            <span>{actionLabel}</span>
          </Link>
        )}

        {actionLabel && !actionTo && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95 sm:text-sm"
          >
            <ActionIcon className="size-4" />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryActionClick && (
          <button
            type="button"
            onClick={onSecondaryActionClick}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-accent active:scale-95 sm:text-sm"
          >
            <RefreshCw className="size-3.5 text-muted-foreground" />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
