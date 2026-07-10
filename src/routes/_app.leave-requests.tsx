import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LeaveViewProvider } from "@/context/LeaveViewContext";
import { LeaveViewSwitcher } from "@/components/leaves/LeaveViewSwitcher";

export const Route = createFileRoute("/_app/leave-requests")({
  head: () => ({ meta: [{ title: "Leave Management — FlowDesk" }] }),
  component: LeaveModuleLayout,
});

function LeaveModuleLayout() {
  return (
    <LeaveViewProvider>
      <div className="flex justify-end mb-4">
        <LeaveViewSwitcher />
      </div>
      <Outlet />
    </LeaveViewProvider>
  );
}
