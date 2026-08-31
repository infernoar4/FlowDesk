import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementDetailsModal } from "@/components/announcements/AnnouncementDetailsModal";
import {
  AnnouncementFormModal,
  type AnnouncementDraft,
} from "@/components/announcements/AnnouncementFormModal";
import { ConfirmActionModal } from "@/components/announcements/ConfirmActionModal";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { useAnnouncements } from "@/context/AnnouncementContext";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type AnnouncementCategory,
  type AnnouncementPriority,
  type AnnouncementStatus,
  type Audience,
} from "@/data/announcements";

export const Route = createFileRoute("/_app/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — FlowDesk" },
      {
        name: "description",
        content:
          "Company-wide announcements from HR, IT and Leadership. Search, filter and track updates in FlowDesk.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

type Dialog =
  | { kind: "none" }
  | { kind: "details"; id: string }
  | { kind: "create" }
  | { kind: "edit"; id: string }
  | { kind: "delete"; id: string }
  | { kind: "archive"; id: string };

function AnnouncementsPage() {
  const { role } = useRole();
  const { user } = useAuth();
  const { announcements, createAnnouncement, togglePin, deleteAnnouncement } = useAnnouncements();
  const isSupport = role === "support" || role === "manager";
  const canCreate = role === "manager" || user?.role === "manager";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AnnouncementCategory>("all");
  const [priority, setPriority] = useState<"all" | AnnouncementPriority>("all");
  const [status, setStatus] = useState<"all" | AnnouncementStatus>("all");
  const [audience, setAudience] = useState<"all" | Audience>("all");
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });

  const selected = useMemo(
    () => ("id" in dialog ? (announcements.find((a) => a.id === dialog.id) ?? null) : null),
    [dialog, announcements],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = announcements.filter((a) => {
      if (q) {
        const authorName = typeof a.author === "string" ? a.author : "";
        const hay = `${a.title} ${a.category} ${authorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== "all" && a.category !== category) return false;
      if (priority !== "all" && a.priority !== priority) return false;
      if (status !== "all" && a.status && a.status !== status) return false;
      if (audience !== "all" && a.audience !== audience && a.audience !== "All Employees")
        return false;
      return true;
    });

    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.id.localeCompare(a.id);
    });
  }, [announcements, query, category, priority, status, audience]);

  const handleCreateDraft = (draft: AnnouncementDraft) => {
    createAnnouncement({
      title: draft.title,
      category: draft.category,
      body: draft.body,
      summary: draft.summary,
      priority: draft.priority,
      pinned: draft.pinned,
      audience: draft.audience,
    });
    setDialog({ kind: "none" });
  };

  const selectClass =
    "h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium";

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Company-wide updates from HR, IT and Leadership."
        actions={
          canCreate ? (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setDialog({ kind: "create" })}
            >
              New Announcement
            </Button>
          ) : undefined
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <SearchBar
            placeholder="Search by title, category or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lg:col-span-1"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={selectClass}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className={selectClass}
            aria-label="Filter by audience"
          >
            <option value="all">All Audiences</option>
            {AUDIENCE_OPTIONS.map((aud) => (
              <option key={aud} value={aud}>
                {aud}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className={selectClass}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            {(Object.keys(PRIORITY_LABELS) as AnnouncementPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as AnnouncementStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
            {announcements.length} announcements
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements found"
          description={
            announcements.length === 0
              ? "There are no announcements yet. Company-wide updates will appear here once published."
              : "No announcements match your current search and filters. Try clearing them to see more."
          }
          action={
            announcements.length > 0 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setPriority("all");
                  setStatus("all");
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              onOpen={(item) => setDialog({ kind: "details", id: item.id })}
            />
          ))}
        </div>
      )}

      <AnnouncementDetailsModal
        open={dialog.kind === "details"}
        announcement={dialog.kind === "details" ? selected : null}
        isSupport={isSupport}
        onClose={() => setDialog({ kind: "none" })}
        onMarkRead={() => setDialog({ kind: "none" })}
        onEdit={(a) => setDialog({ kind: "edit", id: a.id })}
        onDelete={(a) => setDialog({ kind: "delete", id: a.id })}
        onArchive={() => setDialog({ kind: "none" })}
        onTogglePin={(item) => togglePin(item.id)}
      />

      {dialog.kind === "create" && (
        <AnnouncementFormModal
          open
          onClose={() => setDialog({ kind: "none" })}
          onSubmit={handleCreateDraft}
        />
      )}

      {dialog.kind === "delete" && selected && (
        <ConfirmActionModal
          open
          destructive
          title="Delete announcement?"
          description={`"${selected.title}" will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete Announcement"
          onClose={() => setDialog({ kind: "none" })}
          onConfirm={() => deleteAnnouncement(selected.id)}
        />
      )}
    </div>
  );
}
