import type { TicketPriority } from "@/data/tickets";

const styles: Record<TicketPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-info/10 text-info",
  High: "bg-warning/15 text-warning-foreground",
  Critical: "bg-destructive/10 text-destructive",
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
