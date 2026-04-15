import React from "react";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, actions }) => {
  return (
    <div className="border-b border-border bg-card px-6 py-5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
