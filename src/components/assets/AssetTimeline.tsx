import { Check, X } from "lucide-react";
import type { AssetStatus } from "@/data/assets";

interface AssetTimelineProps {
  status: AssetStatus;
}

type Stage = {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  failed?: boolean;
};

/** Full asset workflow:
 *  Submitted → Under Review → Approved/Rejected → Assigned → Return Requested → Returned */
export function AssetTimeline({ status }: AssetTimelineProps) {
  const rejected = status === "rejected";
  const cancelled = status === "cancelled";
  const decided =
    status === "approved" ||
    status === "assigned" ||
    status === "return_requested" ||
    status === "returned" ||
    rejected;
  const assigned = status === "assigned" || status === "return_requested" || status === "returned";
  const returnRequested = status === "return_requested" || status === "returned";
  const returned = status === "returned";

  const decisionLabel = rejected ? "Rejected" : "Approved";

  const stages: Stage[] = [
    {
      key: "submitted",
      label: "Request Submitted",
      done: true,
      current: status === "pending",
    },
    {
      key: "review",
      label: "Under Review",
      done: decided || status === "pending",
      current: status === "pending",
    },
    {
      key: "decision",
      label: decisionLabel,
      done: decided,
      current: status === "approved",
      failed: rejected,
    },
    {
      key: "assigned",
      label: "Assigned",
      done: assigned,
      current: status === "assigned",
    },
    {
      key: "return_requested",
      label: "Return Requested",
      done: returnRequested,
      current: status === "return_requested",
    },
    {
      key: "returned",
      label: "Returned",
      done: returned,
      current: returned,
    },
  ];

  if (cancelled) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        This request was cancelled before it entered the workflow.
      </div>
    );
  }

  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-0">
      {stages.map((s, i) => {
        const isLast = i === stages.length - 1;
        const dotClass = s.failed
          ? "bg-destructive text-destructive-foreground"
          : s.done
            ? s.current
              ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
              : "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground";
        return (
          <li key={s.key} className="flex sm:flex-col items-center sm:flex-1 gap-3 sm:gap-2">
            <div className="flex sm:flex-col items-center sm:w-full">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${dotClass}`}
              >
                {s.failed ? (
                  <X className="h-4 w-4" />
                ) : s.done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`hidden sm:block h-0.5 w-full ${
                    s.done && !s.failed ? "bg-primary" : "bg-border"
                  }`}
                  style={{ marginTop: "-1rem", marginLeft: "2rem" }}
                />
              )}
            </div>
            <div className="sm:text-center">
              <div
                className={`text-sm font-medium ${
                  s.done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </div>
              {s.current && !s.failed && (
                <div className="text-xs text-primary mt-0.5">Current stage</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
