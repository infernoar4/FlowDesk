type Status = "open" | "assigned" | "in_progress" | "resolved" | "closed" | "pending" | "approved" | "rejected" | "cancelled" | "active" | "inactive" | "return_requested" | "returned";

const styles: Record<Status, string> = {
  open: "bg-info/10 text-info",
  assigned: "bg-accent text-accent-foreground",
  in_progress: "bg-warning/15 text-warning-foreground",
  resolved: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning-foreground",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  active: "bg-success/15 text-success",
  inactive: "bg-muted text-muted-foreground",
  return_requested: "bg-warning/15 text-warning-foreground",
  returned: "bg-muted text-muted-foreground",
};

const labels: Record<Status, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  active: "Active",
  inactive: "Inactive",
  return_requested: "Return Requested",
  returned: "Returned",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
