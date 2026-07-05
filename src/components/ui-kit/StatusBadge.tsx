type Status = "open" | "in_progress" | "resolved" | "closed" | "pending" | "approved" | "rejected" | "active" | "inactive";

const styles: Record<Status, string> = {
  open: "bg-info/10 text-info",
  in_progress: "bg-warning/15 text-warning-foreground",
  resolved: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning-foreground",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
  active: "bg-success/15 text-success",
  inactive: "bg-muted text-muted-foreground",
};

const labels: Record<Status, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
  inactive: "Inactive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
