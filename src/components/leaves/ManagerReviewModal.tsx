import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import type { LeaveRequest } from "@/data/leaves";
import { useLeaves } from "@/context/LeaveContext";

interface ManagerReviewModalProps {
  open: boolean;
  action: "approve" | "reject" | null;
  leave: LeaveRequest | null;
  onClose: () => void;
}

export function ManagerReviewModal({ open, action, leave, onClose }: ManagerReviewModalProps) {
  const { approveLeave, rejectLeave } = useLeaves();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open || !action || !leave) return null;

  const isReject = action === "reject";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReject && !comment.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    if (isReject) {
      rejectLeave(leave.id, comment);
    } else {
      approveLeave(leave.id, comment);
    }

    setComment("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isReject ? "Reject Leave Request" : "Approve Leave Request"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {leave.id} · {leave.employee} · {leave.type}
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
          <div className="rounded-lg bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Duration:</span> {leave.startDate} →{" "}
              {leave.endDate} ({leave.days} day{leave.days === 1 ? "" : "s"})
            </div>
            <div className="mt-1">
              <span className="font-medium text-foreground">Reason:</span> {leave.reason}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {isReject ? "Rejection Reason" : "Manager Comment"}
              {isReject && <span className="text-destructive"> *</span>}
              {!isReject && <span className="text-muted-foreground font-normal"> (optional)</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={
                isReject
                  ? "Explain why this request is being rejected."
                  : "Add a note for the employee (optional)."
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant={isReject ? "destructive" : "primary"}>
              {isReject ? "Confirm Rejection" : "Confirm Approval"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
