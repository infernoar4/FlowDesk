import { createFileRoute } from "@tanstack/react-router";
import { Plus, TicketCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";

export const Route = createFileRoute("/_app/tickets")({
  head: () => ({ meta: [{ title: "Tickets — FlowDesk" }] }),
  component: TicketsPage,
});

type Ticket = {
  id: string;
  subject: string;
  requester: string;
  priority: "Low" | "Medium" | "High";
  status: "open" | "in_progress" | "resolved" | "closed";
  updated: string;
};

const tickets: Ticket[] = [
  { id: "TKT-4821", subject: "VPN connection dropping", requester: "Priya S.", priority: "High", status: "open", updated: "5m ago" },
  { id: "TKT-4820", subject: "Request new monitor", requester: "Jamal T.", priority: "Low", status: "in_progress", updated: "1h ago" },
  { id: "TKT-4818", subject: "Access to Finance drive", requester: "Nora K.", priority: "Medium", status: "resolved", updated: "3h ago" },
  { id: "TKT-4815", subject: "Broken chair — Desk 42", requester: "Ivan R.", priority: "Low", status: "closed", updated: "Yesterday" },
];

const columns: Column<Ticket>[] = [
  { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
  { key: "subject", header: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
  { key: "requester", header: "Requester" },
  { key: "priority", header: "Priority" },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  { key: "updated", header: "Updated", className: "text-muted-foreground" },
];

function TicketsPage() {
  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Track and resolve internal support requests."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>New Ticket</Button>}
      />
      <div className="mb-4 max-w-sm">
        <SearchBar placeholder="Search tickets…" />
      </div>
      <DataTable
        columns={columns}
        data={tickets}
        empty={<div className="p-10 text-center text-muted-foreground"><TicketCheck className="mx-auto h-6 w-6 mb-2" />No tickets yet.</div>}
      />
    </div>
  );
}
