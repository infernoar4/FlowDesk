import { createContext, useContext, useState, type ReactNode } from "react";
import { useRole } from "./RoleContext";

export type AssetView = "employee" | "support";

interface AssetViewContextValue {
  view: AssetView;
  setView: (v: AssetView) => void;
}

const AssetViewContext = createContext<AssetViewContextValue | undefined>(undefined);

export function AssetViewProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [customView, setCustomView] = useState<AssetView | null>(null);

  // If top navbar role is explicitly set to "employee", honor Employee view; if "support", honor Support view unless custom override set
  const view: AssetView =
    role === "employee"
      ? "employee"
      : (customView ?? (role === "support" ? "support" : "employee"));

  return (
    <AssetViewContext.Provider value={{ view, setView: setCustomView }}>
      {children}
    </AssetViewContext.Provider>
  );
}

export function useAssetView(): AssetViewContextValue {
  const ctx = useContext(AssetViewContext);
  if (!ctx) throw new Error("useAssetView must be used within an AssetViewProvider");
  return ctx;
}
