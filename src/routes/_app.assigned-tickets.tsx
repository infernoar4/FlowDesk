import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { tickets, type Ticket } from "@/data/tickets";
import { CURRENT_ENGINEER, useRole } from "@/context/RoleContext";

export const Route = createFileRoute("/_app/assigned-tickets")({
  head: () => ({ meta: [{ title: "Assigned Tickets — FlowDesk" }] }),
  component: AssignedTicketsPage,
});

function AssignedTicketsPage() {
  const { role } = useRole();

  if (role !== "support") {
    return (
      <div>
        <PageHeader title="Assigned Tickets" description="Support Engineer view" />
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="Support Engineer view"
          description="Switch to the Support role from the top navigation to see tickets assigned to you."
        />
      </div>
    );
  }

  const mine = tickets.filter((t) => t.assignee === CURRENT_ENGINEER);

  const columns: Column<Ticket>[] = [
    { key: "id", header: "Ticket ID", className: "font-mono text-xs text-muted-foreground w-28" },
    {
      key: "title",
      header: "Issue",
      render: (t) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{t.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Reported by {t.reporter}</div>
        </div>
      ),
    },
    { key: "category", header: "Category", className: "text-sm w-32" },
    {
      key: "priority",
      header: "Priority",
      className: "w-28",
      render: (t) => <PriorityBadge priority={t.priority} />,
    },
    {
      key: "updatedAt",
      header: "Last update",
      className: "text-sm text-muted-foreground w-40",
    },
    {
      key: "status",
      header: "Status",
      className: "w-32",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-28 text-right",
      render: (t) => (
        <Link
          to="/tickets/$ticketId"
          params={{ ticketId: t.id }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assigned Tickets"
        description={`Tickets currently owned by ${CURRENT_ENGINEER}.`}
      />
      <DataTable
        columns={columns}
        data={mine}
        empty={
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No tickets assigned to you."
            description="New assignments will appear here once tickets are routed to you."
          />
        }
      />
    </div>
  );
}
