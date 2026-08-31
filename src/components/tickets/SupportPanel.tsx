import { useState, useEffect } from "react";
import { Lock, StickyNote } from "lucide-react";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import {
  SUPPORT_ENGINEERS,
  TICKET_PRIORITIES,
  type SupportEngineer,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/data/tickets";
import { useTickets } from "@/context/TicketContext";

import { useAuth } from "@/context/AuthContext";

const SUPPORT_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const normalizeAssignee = (raw: string | null | undefined): SupportEngineer | "" => {
  if (!raw) return "";
  if (raw === "Rahul") return "Rahul Verma";
  if (raw === "Priya") return "Priya Nair";
  if (raw === "Arjun") return "Arjun Mehta";
  return raw;
};

export function SupportPanel({ ticket }: { ticket: Ticket }) {
  const { user } = useAuth();
  const { updateTicketStatus, updateTicketPriority, assignTicket, addInternalNote } = useTickets();
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignee, setAssignee] = useState<SupportEngineer | "">(
    normalizeAssignee(ticket.assignee),
  );
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [draft, setDraft] = useState("");

  const assignedEngineerName = normalizeAssignee(ticket.assignee);
  const isAssignedToCurrentUser = Boolean(
    user &&
    assignedEngineerName &&
    (user.fullName.toLowerCase().includes(assignedEngineerName.toLowerCase()) ||
      assignedEngineerName.toLowerCase().includes(user.fullName.toLowerCase())),
  );

  useEffect(() => {
    setPriority(ticket.priority);
    setAssignee(normalizeAssignee(ticket.assignee));
    setStatus(ticket.status);
  }, [ticket]);

  const handleSaveChanges = () => {
    if (!isAssignedToCurrentUser) return;
    if (priority !== ticket.priority) {
      updateTicketPriority(ticket.id, priority);
    }
    if (status !== ticket.status) {
      updateTicketStatus(ticket.id, status);
    }
    const newAssignee = assignee === "" ? null : (assignee as SupportEngineer);
    if (newAssignee !== ticket.assignee) {
      assignTicket(ticket.id, newAssignee);
    }
  };

  const handleAddNote = () => {
    if (!draft.trim()) return;
    addInternalNote(ticket.id, draft);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <DashboardCard
        title="Support Control Panel"
        description="Visible to Support Engineers only"
        action={
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Internal
          </span>
        }
      >
        <div className="space-y-4">
          {!isAssignedToCurrentUser && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Read-Only Mode</p>
                <p>
                  Only the assigned Support Engineer (
                  <strong>{assignedEngineerName || "Unassigned"}</strong>) is authorized to modify
                  or resolve this ticket.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Set Priority Triage
            </label>
            <select
              value={priority}
              disabled={!isAssignedToCurrentUser}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Assign Support Engineer
            </label>
            <select
              value={assignee}
              disabled={!isAssignedToCurrentUser}
              onChange={(e) => setAssignee(e.target.value as SupportEngineer | "")}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Unassigned</option>
              {SUPPORT_ENGINEERS.map((eng) => (
                <option key={eng} value={eng}>
                  {eng}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Update Ticket Stage
            </label>
            <select
              value={status}
              disabled={!isAssignedToCurrentUser}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {SUPPORT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Updating status notifies the employee and updates the ticket stage.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" onClick={handleSaveChanges} disabled={!isAssignedToCurrentUser}>
              Save Changes
            </Button>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Internal Notes"
        description="Private to the support team"
        action={<StickyNote className="h-4 w-4 text-muted-foreground" />}
      >
        {ticket.internalNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No internal notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {ticket.internalNotes.map((n, i) => (
              <li key={i} className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
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
            <Button size="sm" onClick={handleAddNote}>
              Add Note
            </Button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
