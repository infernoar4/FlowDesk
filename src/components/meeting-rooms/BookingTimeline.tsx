import { Check, X } from "lucide-react";
import type { BookingStatus } from "@/data/rooms";

interface Props {
  status: BookingStatus;
}

/** Booked → Completed. Cancelled shows a dedicated failed final stage. */
export function BookingTimeline({ status }: Props) {
  const cancelled = status === "cancelled";
  const completed = status === "completed";

  const stages = [
    { key: "booked", label: "Booked", done: true, current: status === "booked" },
    {
      key: "completed",
      label: cancelled ? "Cancelled" : "Completed",
      done: completed || cancelled,
      current: completed || cancelled,
      failed: cancelled,
    },
  ];

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
              <div className="flex items-center w-full">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${dotClass}`}
                >
                  {s.failed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </div>
                {!isLast && (
                  <div
                    className={`hidden sm:block h-0.5 flex-1 mx-2 ${
                      s.done && !s.failed ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            </div>
            <div className="sm:text-center">
              <div className="text-sm font-medium text-foreground">{s.label}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
