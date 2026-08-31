import { Check, X } from "lucide-react";
import type { LeaveStatus } from "@/data/leaves";

interface LeaveTimelineProps {
  status: LeaveStatus;
}

/** Simple three-step workflow: Requested → Pending Review → Decision.
 *  The final step reflects the outcome: Approved, Rejected or Cancelled. */
export function LeaveTimeline({ status }: LeaveTimelineProps) {
  const decided = status !== "pending";

  const finalLabel =
    status === "approved"
      ? "Approved"
      : status === "rejected"
        ? "Rejected"
        : status === "cancelled"
          ? "Cancelled"
          : "Decision Pending";

  const finalClass =
    status === "approved"
      ? "bg-success text-success-foreground"
      : status === "rejected"
        ? "bg-destructive text-destructive-foreground"
        : status === "cancelled"
          ? "bg-muted text-muted-foreground"
          : "bg-muted text-muted-foreground";

  const stages = [
    {
      key: "requested",
      label: "Leave Requested",
      done: true,
      dot: "bg-primary text-primary-foreground",
      icon: <Check className="h-4 w-4" />,
    },
    {
      key: "pending",
      label: "Pending Review",
      done: decided,
      dot: decided
        ? "bg-primary text-primary-foreground"
        : "bg-primary text-primary-foreground ring-4 ring-primary/15",
      icon: decided ? (
        <Check className="h-4 w-4" />
      ) : (
        <span className="text-xs font-semibold">2</span>
      ),
    },
    {
      key: "final",
      label: finalLabel,
      done: decided,
      dot: decided ? finalClass : "bg-muted text-muted-foreground",
      icon: decided ? (
        status === "rejected" || status === "cancelled" ? (
          <X className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )
      ) : (
        <span className="text-xs font-semibold">3</span>
      ),
    },
  ];

  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-0">
      {stages.map((s, i) => {
        const isLast = i === stages.length - 1;
        return (
          <li key={s.key} className="flex sm:flex-col items-center sm:flex-1 gap-3 sm:gap-2">
            <div className="flex sm:flex-col items-center sm:w-full">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${s.dot}`}>
                {s.icon}
              </div>
              {!isLast && (
                <div
                  className={`hidden sm:block h-0.5 w-full ${s.done ? "bg-primary" : "bg-border"}`}
                  style={{ marginTop: "-1rem", marginLeft: "2rem" }}
                />
              )}
            </div>
            <div className="sm:text-center">
              <div
                className={`text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s.label}
              </div>
              {i === 1 && !decided && (
                <div className="text-xs text-primary mt-0.5">Current stage</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
