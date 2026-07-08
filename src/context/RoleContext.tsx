import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "employee" | "support";

/** Placeholder identity of the currently signed-in Support Engineer.
 *  Replaced later by Spring Security / JWT. */
export const CURRENT_ENGINEER = "Rahul";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("employee");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
