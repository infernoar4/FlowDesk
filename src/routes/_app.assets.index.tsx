import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  Plus,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { AssetRequestModal } from "@/components/assets/AssetRequestModal";
import { SupportReviewModal } from "@/components/assets/SupportReviewModal";
import { AssignAssetModal } from "@/components/assets/AssignAssetModal";
import { useAssetView } from "@/context/AssetViewContext";
import { useAssets } from "@/context/AssetContext";
import { useAuth } from "@/context/AuthContext";
import { CURRENT_SUPPORT, type AssetRequest } from "@/data/assets";

export const Route = createFileRoute("/_app/assets/")({
  head: () => ({ meta: [{ title: "Asset Management — FlowDesk" }] }),
  component: AssetDashboardRouter,
});

function AssetDashboardRouter() {
  const { view } = useAssetView();
  return view === "support" ? <SupportDashboard /> : <EmployeeDashboard />;
}

/* -------------------- Employee Dashboard -------------------- */

function EmployeeDashboard() {
  const { user } = useAuth();
  const { assets } = useAssets();
  const [requestOpen, setRequestOpen] = useState(false);

  const userName = user?.fullName || "Alex Morgan";

  const mine = useMemo(
    () => assets.filter((a) => a.employee === userName || a.employee === "Alex Morgan"),
    [assets, userName],
  );
  const assigned = mine.filter((a) => a.status === "assigned" || a.status === "return_requested");
  const pending = mine.filter((a) => a.status === "pending");
  const recent = [...mine].slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Asset Management"
        description="Request workplace assets and track the status of your requests."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setRequestOpen(true)}>
            Request Asset
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Assigned Assets"
          value={String(assigned.length)}
          delta="Currently in your possession"
          icon={<PackageCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Requests"
          value={String(pending.length)}
          delta="Awaiting support review"
          icon={<Clock className="h-5 w-5" />}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => setRequestOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setRequestOpen(true);
          }}
          className="bg-card rounded-xl border border-dashed border-primary/40 shadow-card p-5 text-left hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick Action
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">Request a new asset</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Laptop, monitor, headset and more.
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <DashboardCard
        title="Recent Asset Requests"
        description="Your latest asset activity"
        action={
          <Link to="/assets/all" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No asset requests yet.</p>
        ) : (
          <ul className="divide-y divide-border -mx-5">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-muted-foreground">{a.id}</div>
                  <Link
                    to="/assets/$assetId"
                    params={{ assetId: a.id }}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {a.category}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {a.assetName ?? "Awaiting assignment"} · Requested {a.requestedOn}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <AssetRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}

/* -------------------- Support Dashboard -------------------- */

function SupportDashboard() {
  const { assets, confirmReturn } = useAssets();
  const [reviewRequest, setReviewRequest] = useState<AssetRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [assignRequest, setAssignRequest] = useState<AssetRequest | null>(null);

  const pending = assets.filter((a) => a.status === "pending");
  const returnRequests = assets.filter((a) => a.status === "return_requested");
  const assignedActive = assets.filter(
    (a) => a.status === "assigned" || a.status === "return_requested" || a.status === "approved",
  );
  const returnedTotal = assets.filter((a) => a.status === "returned");

  return (
    <div>
      <PageHeader
        title="Asset Operations"
        description={`Reviewing incoming asset requests as ${CURRENT_SUPPORT}.`}
        actions={
          <Link to="/assets/all">
            <Button variant="outline" leftIcon={<Boxes className="h-4 w-4" />}>
              All Requests
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
          label="Active Assigned"
          value={String(assignedActive.length)}
          delta="Assigned in organization"
          trend="up"
          icon={<PackageCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Catalog Items"
          value="18"
          delta="Hardware models in stock"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Returned Assets"
          value={String(returnedTotal.length)}
          delta="Verified in inventory"
          icon={<RotateCcw className="h-5 w-5" />}
        />
      </div>

      <DashboardCard
        title="Pending Asset Requests"
        description="Requests waiting for your review"
        action={
          <Link to="/assets/all" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        }
      >
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting — you're all caught up.</p>
        ) : (
          <ul className="divide-y divide-border -mx-5">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {a.employee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{a.employee}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.category} · Requested {a.requestedOn}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/assets/$assetId"
                    params={{ assetId: a.id }}
                    className="text-xs font-medium text-primary hover:underline px-2"
                  >
                    View
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReviewRequest(a);
                      setReviewAction("reject");
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setReviewRequest(a);
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

      {returnRequests.length > 0 && (
        <div className="mt-6">
          <DashboardCard
            title="Pending Asset Returns"
            description="Asset returns waiting for physical verification"
          >
            <ul className="divide-y divide-border -mx-5">
              {returnRequests.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-semibold shrink-0">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {a.employee}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.assetName ?? a.category} ({a.assetId ?? a.id}) · Return Requested
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/assets/$assetId"
                      params={{ assetId: a.id }}
                      className="text-xs font-medium text-primary hover:underline px-2"
                    >
                      View
                    </Link>
                    <Button size="sm" onClick={() => confirmReturn(a.id)}>
                      Verify Return
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Link
          to="/assets/all"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Go to full request list <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approval and assignment are separate steps.
        </span>
      </div>

      <SupportReviewModal
        open={reviewAction !== null}
        action={reviewAction}
        request={reviewRequest}
        onClose={() => {
          setReviewAction(null);
          setReviewRequest(null);
        }}
      />
      <AssignAssetModal
        open={assignRequest !== null}
        request={assignRequest}
        onClose={() => setAssignRequest(null)}
      />
    </div>
  );
}
