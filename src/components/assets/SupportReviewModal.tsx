import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import type { AssetRequest } from "@/data/assets";

interface SupportReviewModalProps {
  open: boolean;
  action: "approve" | "reject" | null;
  request: AssetRequest | null;
  onClose: () => void;
}

export function SupportReviewModal({ open, action, request, onClose }: SupportReviewModalProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open || !action || !request) return null;

  const isReject = action === "reject";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReject && !comment.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    // Placeholder: no backend wiring in this sprint.
    setComment("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-xl border border-border shadow-elevated">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isReject ? "Reject Asset Request" : "Approve Asset Request"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {request.id} · {request.employee} · {request.category}
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
              <span className="font-medium text-foreground">Requested On:</span> {request.requestedOn}
            </div>
            <div className="mt-1">
              <span className="font-medium text-foreground">Reason:</span> {request.reason}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">
              {isReject ? "Rejection Reason" : "Support Comment"}
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
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          {!isReject && (
            <p className="text-xs text-muted-foreground">
              Approving marks this request approved. You will assign a specific asset in a separate step.
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant={isReject ? "destructive" : "primary"}>
              {isReject ? "Confirm Rejection" : "Confirm Approval"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
