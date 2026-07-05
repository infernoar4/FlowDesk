import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";

export const Route = createFileRoute("/_app/leave-requests")({
  head: () => ({ meta: [{ title: "Leave Requests — FlowDesk" }] }),
  component: LeavePage,
});

function LeavePage() {
  return (
    <div>
      <PageHeader
        title="Leave Requests"
        description="Submit and review time-off requests across the team."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Request Leave</Button>}
      />
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="Leave Requests module coming soon"
        description="This screen is a placeholder in the FlowDesk foundation. Requests, approvals and balances will live here."
      />
    </div>
  );
}
