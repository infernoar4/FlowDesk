import { createContext, useContext, useState, type ReactNode } from "react";
import { useRole } from "./RoleContext";

export type LeaveView = "employee" | "manager";

interface LeaveViewContextValue {
  view: LeaveView;
  setView: (v: LeaveView) => void;
}

const LeaveViewContext = createContext<LeaveViewContextValue | undefined>(undefined);

export function LeaveViewProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [customView, setCustomView] = useState<LeaveView | null>(null);

  const view: LeaveView =
    role === "employee"
      ? "employee"
      : (customView ?? (role === "manager" ? "manager" : "employee"));

  return (
    <LeaveViewContext.Provider value={{ view, setView: setCustomView }}>
      {children}
    </LeaveViewContext.Provider>
  );
}

export function useLeaveView(): LeaveViewContextValue {
  const ctx = useContext(LeaveViewContext);
  if (!ctx) throw new Error("useLeaveView must be used within a LeaveViewProvider");
  return ctx;
}
