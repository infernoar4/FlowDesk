import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, TicketCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { TicketCard } from "@/components/tickets/TicketCard";
import { TicketFormModal } from "@/components/tickets/TicketFormModal";
import {
  tickets as allTickets,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketStatus,
} from "@/data/tickets";
import { useRole } from "@/context/RoleContext";

export const Route = createFileRoute("/_app/tickets/")({
  head: () => ({ meta: [{ title: "Tickets — FlowDesk" }] }),
  component: TicketsListPage,
});

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function TicketsListPage() {
  const { role } = useRole();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [category, setCategory] = useState<TicketCategory | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return allTickets.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (category !== "all" && t.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, status, category]);

  const isSupport = role === "support";

  return (
    <div>
      <PageHeader
        title={isSupport ? "Ticket Queue" : "Ticket Management"}
        description={
          isSupport
            ? "Review incoming tickets, set priority and assign to an engineer."
            : "Raise workplace issues and follow their progress until resolved."
        }
        actions={
          isSupport ? undefined : (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
              Create Ticket
            </Button>
          )
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-card p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar
            placeholder="Search by title or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All statuses</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All categories</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<TicketCheck className="h-6 w-6" />}
          title={isSupport ? "No tickets match your filters." : "No support tickets yet."}
          description={
            isSupport
              ? "Try clearing the filters to see the full queue."
              : "Click Create Ticket to report your first workplace issue."
          }
          action={
            isSupport ? undefined : (
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                Create Ticket
              </Button>
            )
          }
        />
      ) : isSupport ? (
        <SupportQueueTable tickets={filtered} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      <TicketFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function SupportQueueTable({ tickets }: { tickets: Ticket[] }) {
  const columns: Column<Ticket>[] = [
    {
      key: "id",
      header: "Ticket ID",
      className: "font-mono text-xs text-muted-foreground w-28",
    },
    {
      key: "title",
      header: "Issue",
      render: (t) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{t.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Reported by {t.reporter}
          </div>
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
    { key: "createdAt", header: "Created", className: "text-sm text-muted-foreground w-32" },
    {
      key: "status",
      header: "Status",
      className: "w-32",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-32 text-right",
      render: (t) => (
        <Link
          to="/tickets/$ticketId"
          params={{ ticketId: t.id }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];
  return <DataTable columns={columns} data={tickets} />;
}
