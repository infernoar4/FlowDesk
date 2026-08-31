import { CalendarDays, CalendarX, Paperclip, Users } from "lucide-react";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import {
  AnnouncementCategoryBadge,
  AnnouncementPriorityBadge,
  PinnedBadge,
} from "@/components/announcements/AnnouncementBadges";
import { formatDate, type Announcement } from "@/data/announcements";

interface Props {
  announcement: Announcement;
  onOpen: (a: Announcement) => void;
}

export function AnnouncementCard({ announcement: a, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(a)}
      className="w-full text-left bg-card rounded-xl border border-border shadow-card p-5 transition-colors hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex flex-wrap items-center gap-2">
        {a.pinned && <PinnedBadge />}
        <AnnouncementPriorityBadge priority={a.priority} />
        <AnnouncementCategoryBadge category={a.category} />
        {a.status === "archived" && <StatusBadge status="inactive" />}
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium">
          {a.read ? (
            <span className="text-muted-foreground">Read</span>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-primary">Unread</span>
            </>
          )}
        </span>
      </div>

      <h3
        className={[
          "mt-3 text-base text-foreground",
          a.read ? "font-medium" : "font-semibold",
        ].join(" ")}
      >
        {a.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{a.author}</span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Published {formatDate(a.publishedOn)}
        </span>
        {a.expiresOn && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarX className="h-3.5 w-3.5" />
            Expires {formatDate(a.expiresOn)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {a.audience}
        </span>
        {a.attachment && (
          <span className="inline-flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />1 attachment
          </span>
        )}
      </div>
    </button>
  );
}
