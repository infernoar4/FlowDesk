import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AssetViewProvider } from "@/context/AssetViewContext";

export const Route = createFileRoute("/_app/assets")({
  head: () => ({ meta: [{ title: "Asset Management — FlowDesk" }] }),
  component: AssetModuleLayout,
});

function AssetModuleLayout() {
  return (
    <AssetViewProvider>
      <Outlet />
    </AssetViewProvider>
  );
}
