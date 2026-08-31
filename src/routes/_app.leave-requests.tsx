import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeaveViewProvider } from "@/context/LeaveViewContext";

export const Route = createFileRoute("/_app/leave-requests")({
  head: () => ({ meta: [{ title: "Leave Management — FlowDesk" }] }),
  component: LeaveModuleLayout,
});

function LeaveModuleLayout() {
  return (
    <LeaveViewProvider>
      <Outlet />
    </LeaveViewProvider>
  );
}
