import { createContext, useContext, useState, type ReactNode } from "react";

export type AssetView = "employee" | "support";

interface AssetViewContextValue {
  view: AssetView;
  setView: (v: AssetView) => void;
}

const AssetViewContext = createContext<AssetViewContextValue | undefined>(undefined);

export function AssetViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AssetView>("employee");
  return (
    <AssetViewContext.Provider value={{ view, setView }}>
      {children}
    </AssetViewContext.Provider>
  );
}

export function useAssetView(): AssetViewContextValue {
  const ctx = useContext(AssetViewContext);
  if (!ctx) throw new Error("useAssetView must be used within an AssetViewProvider");
  return ctx;
}
