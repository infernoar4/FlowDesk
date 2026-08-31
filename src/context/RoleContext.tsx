import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "employee" | "support" | "manager";

/** Placeholder identity of the currently signed-in Support Engineer. */
export const CURRENT_ENGINEER = "Rahul Verma";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ACTIVE_MODE_KEY = "flowdesk_active_mode";
const AUTH_STORAGE_KEY = "flowdesk_auth_user";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const activeMode = localStorage.getItem(ACTIVE_MODE_KEY);
      if (activeMode === "employee" || activeMode === "support" || activeMode === "manager") {
        return activeMode as Role;
      }
      const saved =
        localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch {
      // Fallback
    }
    return "employee";
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ACTIVE_MODE_KEY, newRole);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const syncRoleFromAuth = () => {
      try {
        const activeMode = localStorage.getItem(ACTIVE_MODE_KEY);
        if (activeMode === "employee" || activeMode === "support" || activeMode === "manager") {
          setRoleState(activeMode as Role);
          return;
        }
        const saved =
          localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role) setRoleState(parsed.role);
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener("storage", syncRoleFromAuth);
    return () => window.removeEventListener("storage", syncRoleFromAuth);
  }, []);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
