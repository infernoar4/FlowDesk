import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AssetViewProvider } from "@/context/AssetViewContext";
import { AssetViewSwitcher } from "@/components/assets/AssetViewSwitcher";

export const Route = createFileRoute("/_app/assets")({
  head: () => ({ meta: [{ title: "Asset Management — FlowDesk" }] }),
  component: AssetModuleLayout,
});

function AssetModuleLayout() {
  return (
    <AssetViewProvider>
      <div className="flex justify-end mb-4">
        <AssetViewSwitcher />
      </div>
      <Outlet />
    </AssetViewProvider>
  );
}
