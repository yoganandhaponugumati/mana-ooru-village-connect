import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
  type?: "official" | "dealer" | "worker";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function VerifiedBadge({
  type = "worker",
  size = "sm",
  showLabel = true,
}: VerifiedBadgeProps) {
  const configs = {
    official: {
      bg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30",
      icon: Award,
      label: "Official Sarpanch / Panchayat",
    },
    dealer: {
      bg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
      icon: ShieldCheck,
      label: "Verified Dealer",
    },
    worker: {
      bg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "Verified Professional",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  };

  const textSizes = {
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium shadow-2xs ${config.bg} ${textSizes[size]}`}
      title={config.label}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
