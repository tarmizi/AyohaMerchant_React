import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

const variants: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  default: "bg-muted text-muted-foreground border-border",
};

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant = "default", children, className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
