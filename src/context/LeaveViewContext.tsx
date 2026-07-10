import { createContext, useContext, useState, type ReactNode } from "react";

export type LeaveView = "employee" | "manager";

interface LeaveViewContextValue {
  view: LeaveView;
  setView: (v: LeaveView) => void;
}

const LeaveViewContext = createContext<LeaveViewContextValue | undefined>(undefined);

export function LeaveViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<LeaveView>("employee");
  return (
    <LeaveViewContext.Provider value={{ view, setView }}>
      {children}
    </LeaveViewContext.Provider>
  );
}

export function useLeaveView(): LeaveViewContextValue {
  const ctx = useContext(LeaveViewContext);
  if (!ctx) throw new Error("useLeaveView must be used within a LeaveViewProvider");
  return ctx;
}
