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
import { useRole, CURRENT_ENGINEER } from "@/context/RoleContext";
import {
  announcements as seedAnnouncements,
  CATEGORY_OPTIONS,
  PRIORITY_LABELS,
  sortAnnouncements,
  STATUS_LABELS,
  TODAY_ISO,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementPriority,
  type AnnouncementStatus,
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
      { property: "og:title", content: "Announcements — FlowDesk" },
      {
        property: "og:description",
        content: "Company-wide announcements from HR, IT and Leadership inside FlowDesk.",
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
  const isSupport = role === "support";

  const [items, setItems] = useState<Announcement[]>(seedAnnouncements);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AnnouncementCategory>("all");
  const [priority, setPriority] = useState<"all" | AnnouncementPriority>("all");
  const [status, setStatus] = useState<"all" | AnnouncementStatus>("all");
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });

  const selected = useMemo(
    () => ("id" in dialog ? (items.find((a) => a.id === dialog.id) ?? null) : null),
    [dialog, items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortAnnouncements(
      items.filter((a) => {
        if (q) {
          const hay = `${a.title} ${a.category} ${a.author}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (category !== "all" && a.category !== category) return false;
        if (priority !== "all" && a.priority !== priority) return false;
        if (status !== "all" && a.status !== status) return false;
        return true;
      }),
    );
  }, [items, query, category, priority, status]);

  const unreadCount = items.filter((a) => !a.read && a.status === "active").length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const togglePin = (target: Announcement) =>
    setItems((prev) =>
      prev.map((a) => (a.id === target.id ? { ...a, pinned: !a.pinned } : a)),
    );

  const archive = (id: string) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "archived", pinned: false } : a)),
    );
    setDialog({ kind: "none" });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    setDialog({ kind: "none" });
  };

  const createAnnouncement = (draft: AnnouncementDraft) => {
    const next: Announcement = {
      id: `ANN-${1042 + items.length}`,
      ...draft,
      status: "active",
      author: CURRENT_ENGINEER,
      authorRole: "Support Engineer",
      createdOn: TODAY_ISO,
      read: true,
    };
    setItems((prev) => [next, ...prev]);
    setDialog({ kind: "none" });
  };

  const updateAnnouncement = (id: string, draft: AnnouncementDraft) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...draft } : a)));
    setDialog({ kind: "none" });
  };

  const selectClass =
    "h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring";

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Company-wide updates from HR, IT and Leadership."
        actions={
          isSupport ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <SearchBar
            placeholder="Search by title, category or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lg:col-span-2"
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
            {items.length} announcements
          </span>
          {!isSupport && (
            <span>
              <span className="font-medium text-foreground">{unreadCount}</span> unread
            </span>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements found"
          description={
            items.length === 0
              ? "There are no announcements yet. Company-wide updates will appear here once published."
              : "No announcements match your current search and filters. Try clearing them to see more."
          }
          action={
            items.length > 0 ? (
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
        onMarkRead={(id) => {
          markRead(id);
          setDialog({ kind: "none" });
        }}
        onEdit={(a) => setDialog({ kind: "edit", id: a.id })}
        onDelete={(a) => setDialog({ kind: "delete", id: a.id })}
        onArchive={(a) => setDialog({ kind: "archive", id: a.id })}
        onTogglePin={togglePin}
      />

      {dialog.kind === "create" && (
        <AnnouncementFormModal
          open
          onClose={() => setDialog({ kind: "none" })}
          onSubmit={createAnnouncement}
        />
      )}

      {dialog.kind === "edit" && selected && (
        <AnnouncementFormModal
          open
          key={selected.id}
          announcement={selected}
          onClose={() => setDialog({ kind: "none" })}
          onSubmit={(draft) => updateAnnouncement(selected.id, draft)}
        />
      )}

      {dialog.kind === "delete" && selected && (
        <ConfirmActionModal
          open
          destructive
          title="Delete announcement?"
          description={`"${selected.title}" will be permanently removed for all employees. This action cannot be undone.`}
          confirmLabel="Delete Announcement"
          onClose={() => setDialog({ kind: "none" })}
          onConfirm={() => remove(selected.id)}
        />
      )}

      {dialog.kind === "archive" && selected && (
        <ConfirmActionModal
          open
          title="Archive announcement?"
          description={`"${selected.title}" will be moved to Archived, unpinned and hidden from the active feed. You can still find it using the Status filter.`}
          confirmLabel="Archive Announcement"
          onClose={() => setDialog({ kind: "none" })}
          onConfirm={() => archive(selected.id)}
        />
      )}
    </div>
  );
}
