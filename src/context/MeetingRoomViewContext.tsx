import { createContext, useContext, useState, type ReactNode } from "react";

export type MeetingRoomView = "employee" | "support";

interface MeetingRoomViewContextValue {
  view: MeetingRoomView;
  setView: (v: MeetingRoomView) => void;
}

const Ctx = createContext<MeetingRoomViewContextValue | undefined>(undefined);

export function MeetingRoomViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<MeetingRoomView>("employee");
  return <Ctx.Provider value={{ view, setView }}>{children}</Ctx.Provider>;
}

export function useMeetingRoomView(): MeetingRoomViewContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMeetingRoomView must be used within a MeetingRoomViewProvider");
  return ctx;
}
