import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { LeaveFormModal } from "@/components/leaves/LeaveFormModal";
import { ManagerReviewModal } from "@/components/leaves/ManagerReviewModal";
import { useLeaveView } from "@/context/LeaveViewContext";
import {
  CURRENT_EMPLOYEE,
  CURRENT_MANAGER,
  LEAVE_BALANCES,
  leaves,
  type LeaveRequest,
} from "@/data/leaves";

export const Route = createFileRoute("/_app/leave-requests/")({
  head: () => ({ meta: [{ title: "Leave Management — FlowDesk" }] }),
  component: LeaveDashboardRouter,
});

function LeaveDashboardRouter() {
  const { view } = useLeaveView();
  return view === "manager" ? <ManagerDashboard /> : <EmployeeDashboard />;
}

/* -------------------- Employee Dashboard -------------------- */

function EmployeeDashboard() {
  const [applyOpen, setApplyOpen] = useState(false);

  const mine = useMemo(
    () => leaves.filter((l) => l.employee === CURRENT_EMPLOYEE),
    [],
  );
  const pending = mine.filter((l) => l.status === "pending");
  const recent = [...mine].slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Apply for time off and track the status of your requests."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setApplyOpen(true)}>
            Apply Leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {LEAVE_BALANCES.map((b) => (
          <StatCard
            key={b.type}
            label={b.type}
            value={b.remaining === "Unlimited" ? "∞" : `${b.remaining}`}
            delta={
              b.remaining === "Unlimited"
                ? "Unlimited"
                : `${b.remaining} of ${b.total} days remaining`
            }
            icon={<CalendarDays className="h-5 w-5" />}
          />
        ))}
        <StatCard
          label="Pending Requests"
          value={String(pending.length)}
          delta="Awaiting manager review"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <DashboardCard
        title="Recent Leave Requests"
        description="Your latest leave activity"
        action={
          <Link to="/leave-requests/all" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave requests yet.</p>
        ) : (
          <ul className="divide-y divide-border -mx-5">
            {recent.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-muted-foreground">{l.id}</div>
                  <Link
                    to="/leave-requests/$leaveId"
                    params={{ leaveId: l.id }}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {l.type}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {l.startDate} → {l.endDate} · {l.days} day{l.days === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    Applied {l.appliedOn}
                  </span>
                  <StatusBadge status={l.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <LeaveFormModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

/* -------------------- Manager Dashboard -------------------- */

function ManagerDashboard() {
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  const today = "Jul 8, 2026";

  const pending = leaves.filter((l) => l.status === "pending");
  const approvedToday = leaves.filter(
    (l) => l.status === "approved" && l.reviewedOn === today,
  );
  const rejectedToday = leaves.filter(
    (l) => l.status === "rejected" && l.reviewedOn === today,
  );
  const onLeaveToday = leaves.filter(
    (l) => l.status === "approved" && l.startDate <= today && l.endDate >= today,
  );

  return (
    <div>
      <PageHeader
        title="Team Leave Overview"
        description={`Reviewing team leave requests as ${CURRENT_MANAGER}.`}
        actions={
          <Link to="/leave-requests/all">
            <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
              All Team Requests
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending Requests"
          value={String(pending.length)}
          delta="Awaiting your review"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Approved Today"
          value={String(approvedToday.length)}
          delta="Reviewed today"
          trend="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Rejected Today"
          value={String(rejectedToday.length)}
          delta="Reviewed today"
          trend="down"
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          label="Employees On Leave"
          value={String(onLeaveToday.length)}
          delta="Currently out of office"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <DashboardCard
        title="Pending Leave Requests"
        description="Requests awaiting your approval"
        action={
          <Link to="/leave-requests/all" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting — you're all caught up.</p>
        ) : (
          <ul className="divide-y divide-border -mx-5">
            {pending.map((l) => (
              <li key={l.id} className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {l.employee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {l.employee}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {l.type} · {l.startDate} → {l.endDate} · {l.days} day{l.days === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden lg:inline">
                    Applied {l.appliedOn}
                  </span>
                  <Link
                    to="/leave-requests/$leaveId"
                    params={{ leaveId: l.id }}
                    className="text-xs font-medium text-primary hover:underline px-2"
                  >
                    View
                  </Link>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <div className="mt-6">
        <Link
          to="/leave-requests/all"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Go to full request list <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

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
