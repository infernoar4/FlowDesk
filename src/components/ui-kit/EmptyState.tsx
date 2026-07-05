import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "This module is part of the FlowDesk foundation and will be wired up soon.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary-soft text-primary flex items-center justify-center">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
