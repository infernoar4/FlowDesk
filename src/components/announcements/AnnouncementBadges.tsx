import type { AnnouncementCategory, AnnouncementPriority } from "@/data/announcements";
import { PRIORITY_LABELS } from "@/data/announcements";
import { Pin } from "lucide-react";

const priorityStyles: Record<AnnouncementPriority, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/15 text-warning-foreground",
  low: "bg-muted text-muted-foreground",
};

export function AnnouncementPriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[priority]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function AnnouncementCategoryBadge({ category }: { category: AnnouncementCategory }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
      {category}
    </span>
  );
}

export function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
      <Pin className="h-3 w-3" />
      Pinned
    </span>
  );
}
