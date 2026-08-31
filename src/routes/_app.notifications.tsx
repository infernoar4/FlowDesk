import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { useNotifications } from "@/context/NotificationsContext";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  type NotificationType,
} from "@/data/notifications";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — FlowDesk" },
      {
        name: "description",
        content:
          "All FlowDesk activity in one place — ticket updates, leave decisions, asset assignments, meeting reminders and announcements.",
      },
    ],
  }),
  component: NotificationsPage,
});

type StatusFilter = "all" | "unread" | "read";

function NotificationsPage() {
  const { items, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [type, setType] = useState<"all" | NotificationType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      if (q) {
        const desc = typeof n.description === "string" ? n.description : "";
        const hay = `${n.title} ${desc} ${n.event || ""} ${n.refId ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status === "unread" && n.read) return false;
      if (status === "read" && !n.read) return false;
      if (type !== "all" && n.type !== type) return false;
      return true;
    });
  }, [items, query, status, type]);

  const selectClass =
    "h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium";

  return (
    <div>
      <PageHeader
        title="Notifications Center"
        description={
          unreadCount > 0
            ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} across your FlowDesk workspace.`
            : "You're all caught up on workspace notifications."
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
            <Button
              variant="outline"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={clearAll}
              disabled={items.length === 0}
            >
              Clear All
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          className="flex-1"
          placeholder="Search notifications by keyword or ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <select
          className={selectClass}
          value={type}
          onChange={(e) => setType(e.target.value as "all" | NotificationType)}
          aria-label="Filter by type"
        >
          <option value="all">All Module Types</option>
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {NOTIFICATION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellRing className="h-6 w-6" />}
          title="No notifications found"
          description="Nothing matches your current search or filters. Real system events like ticket updates, leave approvals and meeting reminders will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}
