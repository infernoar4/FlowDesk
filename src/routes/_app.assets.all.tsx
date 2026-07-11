import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { AssetRequestModal } from "@/components/assets/AssetRequestModal";
import { SupportReviewModal } from "@/components/assets/SupportReviewModal";
import { AssignAssetModal } from "@/components/assets/AssignAssetModal";
import { useAssetView } from "@/context/AssetViewContext";
import {
  ASSET_CATEGORIES,
  ASSET_STATUS_LABELS,
  assets,
  CURRENT_EMPLOYEE,
  type AssetCategory,
  type AssetRequest,
  type AssetStatus,
} from "@/data/assets";

export const Route = createFileRoute("/_app/assets/all")({
  head: () => ({ meta: [{ title: "Asset Requests — FlowDesk" }] }),
  component: AssetRequestsPage,
});

const STATUSES: AssetStatus[] = [
  "pending",
  "approved",
  "rejected",
  "assigned",
  "return_requested",
  "returned",
  "cancelled",
];

function AssetRequestsPage() {
  const { view } = useAssetView();
  const isSupport = view === "support";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AssetStatus | "all">(
    isSupport ? "pending" : "all",
  );
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<AssetRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [assignRequest, setAssignRequest] = useState<AssetRequest | null>(null);

  const source = useMemo(
    () =>
      isSupport ? assets : assets.filter((a) => a.employee === CURRENT_EMPLOYEE),
    [isSupport],
  );

  const filtered = useMemo(() => {
    return source.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (category !== "all" && a.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const hit =
          a.id.toLowerCase().includes(q) ||
          a.employee.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.assetName?.toLowerCase().includes(q) ?? false) ||
          (a.assetId?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [source, status, category, query]);

  const columns: Column<AssetRequest>[] = [
    { key: "id", header: "ID", className: "font-mono text-xs text-muted-foreground w-24" },
    ...(isSupport
      ? [
          {
            key: "employee",
            header: "Employee",
            className: "w-40",
            render: (a: AssetRequest) => (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {a.employee.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className="text-sm text-foreground truncate">{a.employee}</span>
              </div>
            ),
          } as Column<AssetRequest>,
        ]
      : []),
    { key: "category", header: "Asset Type", className: "text-sm w-36" },
    {
      key: "asset",
      header: "Assigned Asset",
      render: (a) =>
        a.assetId ? (
          <div className="text-sm">
            <div className="text-foreground">{a.assetName}</div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5">
              {a.assetId}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "requestedOn",
      header: "Requested On",
      className: "text-sm text-muted-foreground w-32",
    },
    {
      key: "status",
      header: "Status",
      className: "w-36",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-64",
      render: (a) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to="/assets/$assetId"
            params={{ assetId: a.id }}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {!isSupport && a.status === "pending" && (
            <button
              onClick={() => {
                /* Placeholder — no backend wiring in this sprint. */
              }}
              className="text-sm font-medium text-destructive hover:underline"
            >
              Cancel
            </button>
          )}
          {isSupport && a.status === "pending" && (
            <>
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
            </>
          )}
          {isSupport && a.status === "approved" && (
            <Button size="sm" onClick={() => setAssignRequest(a)}>
              Assign
            </Button>
          )}
          {isSupport && a.status === "return_requested" && (
            <Button
              size="sm"
              onClick={() => {
                /* Placeholder — no backend wiring in this sprint. */
              }}
            >
              Verify Return
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={isSupport ? "All Asset Requests" : "My Asset Requests"}
        description={
          isSupport
            ? "Review, approve, assign and verify returns across every asset request."
            : "Every asset request you've submitted."
        }
        actions={
          isSupport ? undefined : (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setRequestOpen(true)}>
              Request Asset
            </Button>
          )
        }
      />

      <div className="bg-card border border-border rounded-xl shadow-card p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <SearchBar
            placeholder={
              isSupport
                ? "Search by employee, asset type, ID or serial…"
                : "Search by asset type or ID…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AssetCategory | "all")}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All types</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        empty={
          <EmptyState
            icon={<Boxes className="h-6 w-6" />}
            title={
              isSupport ? "No requests match your filters." : "No asset requests yet."
            }
            description={
              isSupport
                ? "Try clearing the filters to see every asset request."
                : "Click Request Asset to submit your first request."
            }
            action={
              isSupport ? undefined : (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setRequestOpen(true)}>
                  Request Asset
                </Button>
              )
            }
          />
        }
      />

      <AssetRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
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
