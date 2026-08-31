import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Plus,
  TicketCheck,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { TicketCard } from "@/components/tickets/TicketCard";
import { TicketFormModal } from "@/components/tickets/TicketFormModal";
import {
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketStatus,
} from "@/data/tickets";
import { useRole } from "@/context/RoleContext";
import { useTickets } from "@/context/TicketContext";
import { useAuth } from "@/context/AuthContext";

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

const PRIORITY_ORDER: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const ITEMS_PER_PAGE = 6;

function TicketsListPage() {
  const { role } = useRole();
  const { user } = useAuth();
  const { tickets: allTickets } = useTickets();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [category, setCategory] = useState<TicketCategory | "all">("all");
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "updated">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const isSupport = role === "support";
  const userName = user?.fullName || "Alex Lee";

  const openTickets = allTickets.filter((t) => t.status === "open");
  const unassignedTickets = allTickets.filter((t) => t.status === "open" && !t.assignee);
  const criticalTickets = allTickets.filter(
    (t) => (t.priority === "Critical" || t.priority === "High") && t.status !== "closed",
  );
  const resolvedTickets = allTickets.filter((t) => t.status === "resolved");

  const filtered = useMemo(() => {
    const result = allTickets.filter((t) => {
      if (!isSupport && t.reporter !== userName && t.reporter !== "Alex Lee") {
        return false;
      }
      if (status !== "all" && t.status !== status) return false;
      if (category !== "all" && t.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !t.reporter.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "priority") {
        return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
      }
      if (sortBy === "updated") {
        return b.updatedAt.localeCompare(a.updatedAt);
      }
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [allTickets, isSupport, status, category, query, sortBy, userName]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <PageHeader
        title={isSupport ? "IT Support Queue" : "Ticket Management"}
        description={
          isSupport
            ? "Analyze incoming tickets, set priority triage, and assign engineers."
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

      {/* Top Queue Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Open Queue"
          value={String(openTickets.length)}
          delta="Awaiting triage"
          icon={<Inbox className="h-5 w-5" />}
        />
        <StatCard
          label="Unassigned Queue"
          value={String(unassignedTickets.length)}
          delta="Needs engineer assignment"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Critical & High"
          value={String(criticalTickets.length)}
          delta="Priority attention"
          trend="down"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Resolved Queue"
          value={String(resolvedTickets.length)}
          delta="Pending verification"
          trend="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Filter Bar & Scope Switcher */}
      <div className="bg-card border border-border rounded-xl shadow-card p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <SearchBar
              placeholder="Search by title, ticket ID, or reporter…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TicketStatus | "all");
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-lg bg-background border border-border text-xs focus:outline-none focus:border-ring"
          >
            <option value="all">All statuses</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as TicketCategory | "all");
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-lg bg-background border border-border text-xs focus:outline-none focus:border-ring"
          >
            <option value="all">All categories</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "newest" | "priority" | "updated");
              setCurrentPage(1);
            }}
            className="h-9 px-3 rounded-lg bg-background border border-border text-xs focus:outline-none focus:border-ring ml-auto"
          >
            <option value="newest">Sort by Newest</option>
            <option value="priority">Sort by Highest Priority</option>
            <option value="updated">Sort by Recently Updated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<TicketCheck className="h-6 w-6" />}
          title={isSupport ? "No tickets match your filters." : "No support tickets found."}
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
      ) : (
        <div className="space-y-4">
          {isSupport ? (
            <SupportQueueTable tickets={paginatedTickets} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedTickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}

          {/* Queue Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl shadow-card text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-foreground">{filtered.length}</span> tickets
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
          <div className="text-xs text-muted-foreground mt-0.5">Reported by {t.reporter}</div>
        </div>
      ),
    },
    { key: "category", header: "Category", className: "text-sm w-32" },
    {
      key: "priority",
      header: "Priority Triage",
      className: "w-32",
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
          Triage & Review <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];
  return <DataTable columns={columns} data={tickets} />;
}
