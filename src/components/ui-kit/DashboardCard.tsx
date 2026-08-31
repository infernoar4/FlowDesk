import type { ReactNode } from "react";

interface DashboardCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  action,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <section
      className={[
        "bg-card text-card-foreground rounded-xl border border-border shadow-card",
        className,
      ].join(" ")}
    >
      {(title || action) && (
        <header className="flex items-start justify-between px-5 pt-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
}

export function StatCard({ label, value, delta, trend = "neutral", icon }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold text-foreground">{value}</div>
          {delta && <div className={`mt-1 text-xs font-medium ${trendColor}`}>{delta}</div>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
