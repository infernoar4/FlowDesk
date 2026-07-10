import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import {
  LEAVE_TYPES,
  overlapsExisting,
  CURRENT_EMPLOYEE,
  type LeaveRequest,
  type LeaveType,
} from "@/data/leaves";

interface LeaveFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided, opens the form in edit mode for a pending request. */
  initial?: LeaveRequest;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function LeaveFormModal({ open, onClose, initial }: LeaveFormModalProps) {
  const [type, setType] = useState<LeaveType>(initial?.type ?? "Casual Leave");
  const [startDate, setStartDate] = useState<string>(todayISO());
  const [endDate, setEndDate] = useState<string>(todayISO());
  const [reason, setReason] = useState<string>(initial?.reason ?? "");
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial);

  const errors = useMemo(() => {
    const today = todayISO();
    if (!startDate || !endDate) return "Please select a start and end date.";
    if (startDate < today) return "Start date cannot be in the past.";
    if (endDate < startDate) return "End date must be on or after the start date.";
    if (!reason.trim()) return "Please provide a reason.";
    if (overlapsExisting(CURRENT_EMPLOYEE, startDate, endDate)) {
      return "This overlaps an existing leave request.";
    }
    return null;
  }, [startDate, endDate, reason]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (errors) {
      setError(errors);
      return;
    }
    // Placeholder: no backend wiring in this sprint.
    setError(null);
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? "Edit Leave Request" : "Apply for Leave"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? "Update the details of your pending leave request."
                : "Submit a new leave request for manager review."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Leave Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground">Start Date</label>
              <input
                type="date"
                min={todayISO()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">End Date</label>
              <input
                type="date"
                min={startDate || todayISO()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Reason</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly explain the reason for your leave."
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Submit Request"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
