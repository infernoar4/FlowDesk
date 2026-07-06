import { Check } from "lucide-react";
import { TICKET_STAGES, type TicketStatus } from "@/data/tickets";

export function TicketTimeline({ current }: { current: TicketStatus }) {
  const currentIndex = TICKET_STAGES.findIndex((s) => s.key === current);

  return (
    <ol className="relative flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-0">
      {TICKET_STAGES.map((stage, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const dotClass = isCurrent
          ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
          : isDone
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground";
        const lineClass = i < currentIndex ? "bg-primary" : "bg-border";

        return (
          <li key={stage.key} className="flex sm:flex-col items-center sm:flex-1 gap-3 sm:gap-2">
            <div className="flex sm:flex-col items-center sm:w-full">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${dotClass}`}>
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < TICKET_STAGES.length - 1 && (
                <div className={`hidden sm:block h-0.5 w-full ${lineClass} mt-0`} style={{ marginTop: "-1rem", marginLeft: "2rem" }} />
              )}
            </div>
            <div className="sm:text-center">
              <div className={`text-sm font-medium ${isCurrent ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                {stage.label}
              </div>
              {isCurrent && <div className="text-xs text-primary mt-0.5">Current stage</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
