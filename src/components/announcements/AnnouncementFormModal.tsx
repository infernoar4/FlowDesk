import { useState, type FormEvent } from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { AnnouncementModalShell } from "@/components/announcements/AnnouncementModalShell";
import {
  AUDIENCE_OPTIONS,
  CATEGORY_OPTIONS,
  PRIORITY_LABELS,
  TODAY_ISO,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementPriority,
  type Audience,
} from "@/data/announcements";

export type AnnouncementDraft = {
  title: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  audience: Audience;
  summary: string;
  body: string;
  publishedOn: string;
  expiresOn?: string;
  pinned: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** When provided the modal acts as "Edit Announcement" with pre-populated values. */
  announcement?: Announcement | null;
  onSubmit: (draft: AnnouncementDraft) => void;
}

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring";

export function AnnouncementFormModal({ open, onClose, announcement, onSubmit }: Props) {
  const isEdit = Boolean(announcement);
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [category, setCategory] = useState<AnnouncementCategory>(
    announcement?.category ?? "General",
  );
  const [priority, setPriority] = useState<AnnouncementPriority>(
    announcement?.priority ?? "medium",
  );
  const [audience, setAudience] = useState<Audience>(announcement?.audience ?? "All Employees");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [publishedOn, setPublishedOn] = useState(announcement?.publishedOn ?? TODAY_ISO);
  const [expiresOn, setExpiresOn] = useState(announcement?.expiresOn ?? "");
  const [pinned, setPinned] = useState(announcement?.pinned ?? false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!title.trim()) return setError("Title is required.");
    if (!body.trim()) return setError("Description is required.");
    if (!publishedOn) return setError("Publish date is required.");
    if (expiresOn && expiresOn < publishedOn)
      return setError("Expiry date cannot be earlier than the publish date.");
    setError(null);
    onSubmit({
      title: title.trim(),
      category,
      priority,
      audience,
      summary: body.trim().split("\n")[0]!.slice(0, 160),
      body: body.trim(),
      publishedOn,
      expiresOn: expiresOn || undefined,
      pinned,
    });
  };

  return (
    <AnnouncementModalShell
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      description={
        isEdit
          ? "Update the announcement content, audience and scheduling."
          : "Publish a company-wide update to a targeted audience."
      }
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Office network maintenance this weekend"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
              className={inputClass}
            >
              {(Object.keys(PRIORITY_LABELS) as AnnouncementPriority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className={inputClass}
            >
              {AUDIENCE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Description</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write the full announcement. The first line is used as the summary on cards."
            className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Publish Date</label>
            <input
              type="date"
              value={publishedOn}
              onChange={(e) => setPublishedOn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">
              Expiry Date <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Pin announcement</span>
            <span className="block text-xs text-muted-foreground">
              Pinned announcements always appear at the top of the list.
            </span>
          </span>
        </label>

        <div>
          <label className="text-xs font-medium text-foreground">Attachment</label>
          <div className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              File uploads become available after backend integration.
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save Changes" : "Publish"}</Button>
        </div>
      </form>
    </AnnouncementModalShell>
  );
}
