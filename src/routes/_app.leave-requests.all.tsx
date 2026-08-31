import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { LeaveFormModal } from "@/components/leaves/LeaveFormModal";
import { ManagerReviewModal } from "@/components/leaves/ManagerReviewModal";
import { useLeaveView } from "@/context/LeaveViewContext";
import { useLeaves } from "@/context/LeaveContext";
import { useAuth } from "@/context/AuthContext";
import { LEAVE_TYPES, type LeaveRequest, type LeaveStatus, type LeaveType } from "@/data/leaves";

export const Route = createFileRoute("/_app/leave-requests/all")({
  head: () => ({ meta: [{ title: "Leave Requests — FlowDesk" }] }),
  component: LeaveRequestsPage,
});

const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUSES: LeaveStatus[] = ["pending", "approved", "rejected", "cancelled"];

function LeaveRequestsPage() {
  const { user } = useAuth();
  const { leaves, cancelLeave } = useLeaves();
  const { view } = useLeaveView();
  const isManager = view === "manager";

  const userName = user?.fullName || "Alex Morgan";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeaveStatus | "all">(isManager ? "pending" : "all");
  const [type, setType] = useState<LeaveType | "all">("all");
  const [applyOpen, setApplyOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  const source = useMemo(
    () =>
      isManager
        ? leaves
        : leaves.filter((l) => l.employee === userName || l.employee === "Alex Morgan"),
    [isManager, leaves, userName],
  );

  const filtered = useMemo(() => {
    return source.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (type !== "all" && l.type !== type) return false;
      if (query) {
        const q = query.toLowerCase();
        const hit =
          l.id.toLowerCase().includes(q) ||
          l.employee.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [source, status, type, query]);

  const cancelable = (l: LeaveRequest) => {
    return l.status === "pending";
  };

  const columns: Column<LeaveRequest>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs text-muted-foreground w-24" },
    ...(isManager
      ? [
          {
            key: "employee",
            header: "Employee",
            className: "w-40",
            render: (l: LeaveRequest) => (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {l.employee
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <span className="text-sm text-foreground truncate">{l.employee}</span>
              </div>
            ),
          } as Column<LeaveRequest>,
        ]
      : []),
    { key: "type", header: "Leave Type", className: "text-sm w-36" },
    {
      key: "duration",
      header: "Duration",
      render: (l) => (
        <div className="text-sm">
          <div className="text-foreground">
            {l.startDate} → {l.endDate}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {l.days} day{l.days === 1 ? "" : "s"}
          </div>
        </div>
      ),
    },
    { key: "appliedOn", header: "Applied On", className: "text-sm text-muted-foreground w-32" },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-56",
      render: (l) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to="/leave-requests/$leaveId"
            params={{ leaveId: l.id }}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {!isManager && cancelable(l) && (
            <button
              onClick={() => cancelLeave(l.id)}
              className="text-xs font-medium text-destructive hover:underline px-1"
            >
              Cancel
            </button>
          )}
          {isManager && l.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReviewLeave(l);
                  setReviewAction("reject");
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setReviewLeave(l);
                  setReviewAction("approve");
                }}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isManager ? "Team Leave Requests" : "My Leave Requests"}
        description={
          isManager
            ? "Review and act on leave requests from your team."
            : "Every leave request you've submitted."
        }
        actions={
          isManager ? undefined : (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setApplyOpen(true)}>
              Apply Leave
            </Button>
          )
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-card p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar
            placeholder={isManager ? "Search by employee, type or ID…" : "Search by type or ID…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaveStatus | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LeaveType | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All types</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        empty={
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title={isManager ? "No requests match your filters." : "No leave requests yet."}
            description={
              isManager
                ? "Try clearing the filters to see all team requests."
                : "Click Apply Leave to submit your first request."
            }
            action={
              isManager ? undefined : (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setApplyOpen(true)}>
                  Apply Leave
                </Button>
              )
            }
          />
        }
      />

      <LeaveFormModal open={applyOpen} onClose={() => setApplyOpen(false)} />
      <LeaveFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
      <ManagerReviewModal
        open={reviewAction !== null}
        action={reviewAction}
        leave={reviewLeave}
        onClose={() => {
          setReviewAction(null);
          setReviewLeave(null);
        }}
      />
    </div>
  );
}
