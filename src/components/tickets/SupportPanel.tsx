import { useState } from "react";
import { Lock, StickyNote } from "lucide-react";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import {
  SUPPORT_ENGINEERS,
  TICKET_PRIORITIES,
  type InternalNote,
  type SupportEngineer,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/data/tickets";
import { CURRENT_ENGINEER } from "@/context/RoleContext";

/** Statuses a Support Engineer may set. "Closed" is intentionally excluded —
 *  ticket closure happens after Employee verification in a later sprint. */
const SUPPORT_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function SupportPanel({ ticket }: { ticket: Ticket }) {
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignee, setAssignee] = useState<SupportEngineer | "">(ticket.assignee ?? "");
  const [status, setStatus] = useState<TicketStatus>(
    ticket.status === "closed" ? "resolved" : ticket.status,
  );
  const [notes, setNotes] = useState<InternalNote[]>(ticket.internalNotes);
  const [draft, setDraft] = useState("");

  const addNote = () => {
    const message = draft.trim();
    if (!message) return;
    setNotes([
      ...notes,
      { author: CURRENT_ENGINEER as SupportEngineer, message, at: "Just now" },
    ]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <DashboardCard
        title="Support Panel"
        description="Visible to Support Engineers only"
        action={
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Internal
          </span>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Assign Engineer</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value as SupportEngineer | "")}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              <option value="">Unassigned</option>
              {SUPPORT_ENGINEERS.map((eng) => (
                <option key={eng} value={eng}>{eng}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {SUPPORT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Tickets are closed only after Employee verification.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm">Save changes</Button>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Internal Notes"
        description="Private to the support team"
        action={<StickyNote className="h-4 w-4 text-muted-foreground" />}
      >
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No internal notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n, i) => (
              <li key={i} className="rounded-lg bg-warning/10 border border-warning/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {n.author} · {n.at}
                </div>
                <div className="text-sm text-foreground">{n.message}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add an internal note visible only to the support team…"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote}>Add note</Button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
