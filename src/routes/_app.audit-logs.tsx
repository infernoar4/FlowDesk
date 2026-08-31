import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Search,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui-kit/DashboardCard";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { useAuditLogs, type AuditLogItem, type AuditLogModule } from "@/context/AuditContext";

export const Route = createFileRoute("/_app/audit-logs")({
  head: () => ({ meta: [{ title: "System Audit Logs — FlowDesk" }] }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const { logs } = useAuditLogs();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<AuditLogModule | "all">("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (moduleFilter !== "all" && item.module !== moduleFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.user.toLowerCase().includes(q) ||
          item.action.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, query, moduleFilter]);

  const ticketEvents = logs.filter((l) => l.module === "Tickets").length;
  const adminEvents = logs.filter(
    (l) => l.role === "Manager / HR" || l.role === "Support Engineer",
  ).length;
  const autoAssignEvents = logs.filter((l) => l.role === "System Auto-Assign").length;

  const columns: Column<AuditLogItem>[] = [
    {
      key: "id",
      header: "Log ID",
      className: "font-mono text-xs text-muted-foreground w-28",
    },
    {
      key: "timestamp",
      header: "Timestamp",
      className: "text-xs text-muted-foreground w-36 font-medium",
    },
    {
      key: "user",
      header: "Performed By",
      className: "w-44",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {item.user
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">{item.user}</div>
            <div className="text-[10px] text-muted-foreground">{item.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action & Event Details",
      render: (item) => (
        <div className="text-xs font-medium text-foreground py-0.5">{item.action}</div>
      ),
    },
    {
      key: "module",
      header: "Module",
      className: "w-28",
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground border border-border">
          {item.module}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-32 text-right",
      render: (item) => {
        if (item.status === "approved" || item.status === "success") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" /> Logged
            </span>
          );
        }
        if (item.status === "system") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <Sparkles className="h-3 w-3" /> Auto-Engine
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Activity className="h-3 w-3" /> Recorded
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit & Activity Trail"
        description="Immutable real-time audit log tracking system events, status changes, and administrative actions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Audit Events"
          value={String(logs.length)}
          delta="Real-time log trail"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Ticket Events"
          value={String(ticketEvents)}
          delta="Lifecycle actions"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="Admin Actions"
          value={String(adminEvents)}
          delta="Support & HR actions"
          icon={<FileSpreadsheet className="h-5 w-5" />}
        />
        <StatCard
          label="Auto-Assignments"
          value={String(autoAssignEvents)}
          delta="Workload engine logs"
          icon={<Layers className="h-5 w-5" />}
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audit trail by user, action, or log ID…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:bg-background transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as AuditLogModule | "all")}
              className="h-10 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:outline-none focus:border-ring"
            >
              <option value="all">All Modules</option>
              <option value="Tickets">Tickets</option>
              <option value="Leaves">Leave Requests</option>
              <option value="Assets">Assets</option>
              <option value="Rooms">Meeting Rooms</option>
            </select>
          </div>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title="No audit log entries match your search."
          description="Try clearing your search query or module filter."
        />
      ) : (
        <DataTable columns={columns} data={filteredLogs} />
      )}
    </div>
  );
}
