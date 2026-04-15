import React from "react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  actions,
  children,
  className,
  noPadding,
}) => {
  return (
    <div className={cn("bg-card border border-border rounded-xl shadow-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>{children}</div>
    </div>
  );
};

export default ContentCard;
