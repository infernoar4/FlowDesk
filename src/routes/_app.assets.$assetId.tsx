import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageSquare,
  Package,
  RotateCcw,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { AssetTimeline } from "@/components/assets/AssetTimeline";
import { SupportReviewModal } from "@/components/assets/SupportReviewModal";
import { AssignAssetModal } from "@/components/assets/AssignAssetModal";
import { useAssetView } from "@/context/AssetViewContext";
import { assets, CURRENT_EMPLOYEE, type AssetRequest } from "@/data/assets";

export const Route = createFileRoute("/_app/assets/$assetId")({
  head: () => ({ meta: [{ title: "Asset Request — FlowDesk" }] }),
  loader: ({ params }): AssetRequest => {
    const req = assets.find((a) => a.id === params.assetId);
    if (!req) throw notFound();
    return req;
  },
  notFoundComponent: AssetNotFound,
  component: AssetDetailPage,
});

function AssetNotFound() {
  return (
    <div>
      <PageHeader title="Asset request not found" description="This request may have been removed." />
      <Link to="/assets" className="text-sm font-medium text-primary hover:underline">
        ← Back to Assets
      </Link>
    </div>
  );
}

function AssetDetailPage() {
  const request = Route.useLoaderData();
  const { view } = useAssetView();
  const isSupport = view === "support";
  const isOwner = request.employee === CURRENT_EMPLOYEE;

  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const timelineEvents = useMemo(() => buildEvents(request), [request]);

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/assets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Assets
        </Link>
      </div>

      <PageHeader
        title={`${request.category} Request`}
        description={`Request ${request.id} submitted by ${request.employee}`}
        actions={<DetailActions
          request={request}
          isSupport={isSupport}
          isOwner={isOwner}
          onApprove={() => setReviewAction("approve")}
          onReject={() => setReviewAction("reject")}
          onAssign={() => setAssignOpen(true)}
        />}
      />

      <div className="mb-6 flex items-center gap-2">
        <StatusBadge status={request.status} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Request Details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Asset Type
                </dt>
                <dd className="mt-1 text-foreground">{request.category}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Requested By
                </dt>
                <dd className="mt-1 text-foreground">{request.employee}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Requested On
                </dt>
                <dd className="mt-1 text-foreground">{request.requestedOn}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1"><StatusBadge status={request.status} /></dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Reason
                </dt>
                <dd className="mt-1 text-foreground">{request.reason}</dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard title="Workflow Progress">
            <AssetTimeline status={request.status} />
          </DashboardCard>

          <DashboardCard
            title="Activity"
            description="Timeline of support decisions and comments"
          >
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity yet. Comments and decisions will appear here.
              </p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-5">
                {timelineEvents.map((ev, i) => (
                  <li key={i} className="pl-5">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{ev.author}</span>
                      <span>·</span>
                      <span>{ev.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{ev.message}</p>
                  </li>
                ))}
              </ol>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          {(request.assetId || request.assetName) && (
            <DashboardCard title="Assigned Asset">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {request.assetName ?? "—"}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    {request.assetId ?? "—"}
                  </div>
                  {request.assignedOn && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Assigned on {request.assignedOn}
                    </div>
                  )}
                </div>
              </div>
            </DashboardCard>
          )}

          {request.status === "rejected" && request.rejectionReason && (
            <DashboardCard title="Rejection Reason">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{request.rejectionReason}</p>
              </div>
            </DashboardCard>
          )}

          <DashboardCard title="Reviewed By">
            {request.reviewedBy ? (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{request.reviewedBy}</div>
                  <div className="text-xs text-muted-foreground">
                    Support Engineer · {request.reviewedOn}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not yet reviewed.</p>
            )}
          </DashboardCard>

          <DashboardCard title="Requester">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-full bg-muted text-foreground flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-foreground">{request.employee}</div>
                <div className="text-xs text-muted-foreground">
                  Submitted {request.requestedOn}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <SupportReviewModal
        open={reviewAction !== null}
        action={reviewAction}
        request={request}
        onClose={() => setReviewAction(null)}
      />
      <AssignAssetModal
        open={assignOpen}
        request={request}
        onClose={() => setAssignOpen(false)}
      />
    </div>
  );
}

function DetailActions({
  request,
  isSupport,
  isOwner,
  onApprove,
  onReject,
  onAssign,
}: {
  request: AssetRequest;
  isSupport: boolean;
  isOwner: boolean;
  onApprove: () => void;
  onReject: () => void;
  onAssign: () => void;
}) {
  if (isSupport) {
    if (request.status === "pending") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReject}>Reject</Button>
          <Button onClick={onApprove}>Approve</Button>
        </div>
      );
    }
    if (request.status === "approved") {
      return (
        <Button leftIcon={<Package className="h-4 w-4" />} onClick={onAssign}>
          Assign Asset
        </Button>
      );
    }
    if (request.status === "return_requested") {
      return (
        <Button leftIcon={<RotateCcw className="h-4 w-4" />}>
          Verify Return
        </Button>
      );
    }
    return null;
  }

  // Employee actions
  if (!isOwner) return null;
  if (request.status === "pending") {
    return <Button variant="outline">Cancel Request</Button>;
  }
  if (request.status === "assigned") {
    return (
      <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />}>
        Request Return
      </Button>
    );
  }
  if (request.status === "rejected") {
    return (
      <Button variant="outline" leftIcon={<MessageSquare className="h-4 w-4" />}>
        Request Again
      </Button>
    );
  }
  return null;
}

type Event = { author: string; date: string; message: string };

function buildEvents(r: AssetRequest): Event[] {
  const events: Event[] = [];
  events.push({
    author: r.employee,
    date: r.requestedOn,
    message: `Submitted a request for a ${r.category}.`,
  });
  if (r.reviewedBy && r.reviewedOn) {
    events.push({
      author: r.reviewedBy,
      date: r.reviewedOn,
      message:
        r.status === "rejected"
          ? `Rejected the request.`
          : `Approved the request.`,
    });
  }
  if (r.assignedOn && r.assetName) {
    events.push({
      author: r.reviewedBy ?? "Support",
      date: r.assignedOn,
      message: `Assigned ${r.assetName}${r.assetId ? ` (${r.assetId})` : ""}.`,
    });
  }
  if (r.returnRequestedOn) {
    events.push({
      author: r.employee,
      date: r.returnRequestedOn,
      message: `Requested return of the asset.`,
    });
  }
  if (r.returnedOn) {
    events.push({
      author: r.reviewedBy ?? "Support",
      date: r.returnedOn,
      message: `Return verified. Asset marked as returned.`,
    });
  }
  for (const c of r.comments ?? []) {
    events.push(c);
  }
  return events;
}
