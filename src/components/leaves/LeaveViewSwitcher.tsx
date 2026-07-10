import { UserCog } from "lucide-react";
import { useLeaveView, type LeaveView } from "@/context/LeaveViewContext";

/**
 * Temporary "View As" switcher scoped to the Leave module only.
 * Replaced later by Spring Security / JWT authentication.
 */
export function LeaveViewSwitcher() {
  const { view, setView } = useLeaveView();

  return (
    <div className="flex items-center gap-2 h-10 pl-3 pr-1 rounded-lg border border-border bg-card shadow-soft">
      <UserCog className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">View as</span>
      <div className="flex items-center rounded-md bg-muted p-0.5">
        {(
          [
            { value: "employee", label: "Employee" },
            { value: "manager", label: "Manager" },
          ] as { value: LeaveView; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={[
              "px-2.5 h-7 rounded-md text-xs font-medium transition-colors",
              view === opt.value
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
