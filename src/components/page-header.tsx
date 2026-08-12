import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8 md:py-4">
        <SidebarTrigger className="-ml-1" />
        <div className="min-w-0 flex-1">
          {breadcrumb && <div className="mb-1 text-xs text-muted-foreground">{breadcrumb}</div>}
          <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
