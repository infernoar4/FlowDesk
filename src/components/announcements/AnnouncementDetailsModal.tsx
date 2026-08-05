import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { AnnouncementModalShell } from "@/components/announcements/AnnouncementModalShell";
import {
  AnnouncementCategoryBadge,
  AnnouncementPriorityBadge,
  PinnedBadge,
} from "@/components/announcements/AnnouncementBadges";
import { formatDate, type Announcement } from "@/data/announcements";

interface Props {
  open: boolean;
  announcement: Announcement | null;
  isSupport: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
  onArchive: (a: Announcement) => void;
  onTogglePin: (a: Announcement) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

export function AnnouncementDetailsModal({
  open,
  announcement: a,
  isSupport,
  onClose,
  onMarkRead,
  onEdit,
  onDelete,
  onArchive,
  onTogglePin,
}: Props) {
  if (!a) return null;

  return (
    <AnnouncementModalShell
      open={open}
      onClose={onClose}
      title={a.title}
      description={`${a.id} · ${a.author} · ${a.authorRole}`}
      maxWidthClass="max-w-2xl"
      footer={
        <>
          {!isSupport && !a.read && (
            <Button onClick={() => onMarkRead(a.id)}>Mark as Read</Button>
          )}
          {!isSupport && a.read && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          {isSupport && (
            <>
              <Button variant="outline" onClick={() => onTogglePin(a)}>
                {a.pinned ? "Unpin" : "Pin"}
              </Button>
              {a.status === "active" && (
                <Button variant="outline" onClick={() => onArchive(a)}>
                  Archive
                </Button>
              )}
              <Button variant="destructive" onClick={() => onDelete(a)}>
                Delete
              </Button>
              <Button onClick={() => onEdit(a)}>Edit</Button>
            </>
          )}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {a.pinned && <PinnedBadge />}
        <AnnouncementPriorityBadge priority={a.priority} />
        <AnnouncementCategoryBadge category={a.category} />
        <StatusBadge status={a.status === "active" ? "active" : "inactive"} />
      </div>

      <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground">
        {a.body.split("\n\n").map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Attachment
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {a.attachment ?? "No attachment for this announcement"}
          </span>
          {a.attachment && (
            <span className="ml-auto text-xs text-muted-foreground">
              Preview available after backend integration
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <Field label="Audience" value={a.audience} />
        <Field label="Author" value={a.author} />
        <Field label="Created" value={formatDate(a.createdOn)} />
        <Field label="Published" value={formatDate(a.publishedOn)} />
        <Field label="Expires" value={formatDate(a.expiresOn)} />
        <Field label="Category" value={a.category} />
      </div>
    </AnnouncementModalShell>
  );
}
