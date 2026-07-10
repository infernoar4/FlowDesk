import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { Button } from "@/components/ui-kit/Button";
import { LeaveTimeline } from "@/components/leaves/LeaveTimeline";
import { LeaveFormModal } from "@/components/leaves/LeaveFormModal";
import { ManagerReviewModal } from "@/components/leaves/ManagerReviewModal";
import { useLeaveView } from "@/context/LeaveViewContext";
import { leaves, type LeaveRequest } from "@/data/leaves";

export const Route = createFileRoute("/_app/leave-requests/$leaveId")({
  head: ({ params }) => ({ meta: [{ title: `${params.leaveId} — FlowDesk` }] }),
  loader: ({ params }): { leave: LeaveRequest } => {
    const leave = leaves.find((l) => l.id === params.leaveId);
    if (!leave) throw notFound();
    return { leave };
  },
  notFoundComponent: LeaveNotFound,
  component: LeaveDetailPage,
});

function BackLink() {
  return (
    <Link
      to="/leave-requests"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Back to leave management
    </Link>
  );
}

function LeaveNotFound() {
  return (
    <div>
      <BackLink />
      <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-base font-semibold">Leave request not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The leave request you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}

function LeaveDetailPage() {
  const { leave } = Route.useLoaderData() as { leave: LeaveRequest };
  const { view } = useLeaveView();
  const isManager = view === "manager";

  const [editOpen, setEditOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  const cancelable =
    leave.status === "pending" ||
    (leave.status === "approved" &&
      !Number.isNaN(new Date(leave.startDate).getTime()) &&
      new Date(leave.startDate).getTime() > Date.now());

  return (
    <div>
      <div className="mb-4"><BackLink /></div>
      <PageHeader
        title={`${leave.type} · ${leave.days} day${leave.days === 1 ? "" : "s"}`}
        description={`Request ${leave.id}`}
        actions={<StatusBadge status={leave.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <DashboardCard title="Leave Information">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> {leave.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {leave.startDate} → {leave.endDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {leave.employee}
              </span>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Reason
              </div>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {leave.reason}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              Applied on {leave.appliedOn}
            </div>
          </DashboardCard>

          <DashboardCard title="Status Timeline" description="Workflow stages for this request">
            <LeaveTimeline status={leave.status} />
          </DashboardCard>

          {(leave.managerComment || leave.rejectionReason) && (
            <DashboardCard
              title="Manager Comments"
              action={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            >
              {leave.rejectionReason && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 mb-3">
                  <div className="text-xs font-medium text-destructive uppercase tracking-wide mb-1">
                    Rejection Reason
                  </div>
                  <p className="text-sm text-foreground">{leave.rejectionReason}</p>
                </div>
              )}
              {leave.managerComment && (
                <div className="rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-sm text-foreground">{leave.managerComment}</p>
                  {leave.reviewedBy && (
                    <div className="text-xs text-muted-foreground mt-1.5">
                      — {leave.reviewedBy}
                      {leave.reviewedOn ? ` · ${leave.reviewedOn}` : ""}
                    </div>
                  )}
                </div>
              )}
            </DashboardCard>
          )}
        </div>

        <div className="space-y-4">
          <DashboardCard title="Summary">
            <dl className="text-sm space-y-3">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Request ID</dt>
                <dd className="font-mono text-xs">{leave.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Employee</dt>
                <dd className="font-medium">{leave.employee}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{leave.type}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{leave.days} day{leave.days === 1 ? "" : "s"}</dd>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={leave.status} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Applied On</dt>
                <dd>{leave.appliedOn}</dd>
              </div>
            </dl>
          </DashboardCard>

          {leave.status === "approved" && leave.reviewedBy && (
            <DashboardCard
              title="Approval"
              action={<CheckCircle2 className="h-4 w-4 text-success" />}
            >
              <dl className="text-sm space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Approved By</dt>
                  <dd className="font-medium">{leave.reviewedBy}</dd>
                </div>
                {leave.reviewedOn && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Approved On</dt>
                    <dd>{leave.reviewedOn}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>
          )}

          {leave.status === "rejected" && leave.reviewedBy && (
            <DashboardCard
              title="Rejection"
              action={<XCircle className="h-4 w-4 text-destructive" />}
            >
              <dl className="text-sm space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Rejected By</dt>
                  <dd className="font-medium">{leave.reviewedBy}</dd>
                </div>
                {leave.reviewedOn && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Rejected On</dt>
                    <dd>{leave.reviewedOn}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>
          )}

          {isManager && leave.status === "pending" ? (
            <DashboardCard title="Manager Actions" description="Review this request">
              <div className="flex flex-col gap-2">
                <Button onClick={() => setReviewAction("approve")}>Approve</Button>
                <Button variant="outline" onClick={() => setReviewAction("reject")}>
                  Reject
                </Button>
              </div>
            </DashboardCard>
          ) : !isManager ? (
            <DashboardCard title="Actions" description="Manage this request">
              {leave.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    Edit Request
                  </Button>
                  <Button variant="destructive">Cancel Request</Button>
                </div>
              )}
              {leave.status === "approved" && cancelable && (
                <div className="flex flex-col gap-2">
                  <Button variant="destructive">Cancel Request</Button>
                  <p className="text-xs text-muted-foreground">
                    Approved requests can only be cancelled before the start date.
                  </p>
                </div>
              )}
              {(leave.status === "rejected" ||
                leave.status === "cancelled" ||
                (leave.status === "approved" && !cancelable)) && (
                <p className="text-sm text-muted-foreground">
                  No actions are available for this request.
                </p>
              )}
            </DashboardCard>
          ) : null}
        </div>
      </div>

      <LeaveFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={leave}
      />
      <ManagerReviewModal
        open={reviewAction !== null}
        action={reviewAction}
        leave={leave}
        onClose={() => setReviewAction(null)}
      />
    </div>
  );
}
