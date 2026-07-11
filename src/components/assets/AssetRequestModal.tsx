import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import {
  ASSET_CATEGORIES,
  CURRENT_EMPLOYEE,
  hasActiveAssignment,
  type AssetCategory,
} from "@/data/assets";

interface AssetRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function AssetRequestModal({ open, onClose }: AssetRequestModalProps) {
  const [category, setCategory] = useState<AssetCategory>("Laptop");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validationError = useMemo(() => {
    if (!reason.trim()) return "Please provide a reason for this request.";
    if (hasActiveAssignment(CURRENT_EMPLOYEE, category)) {
      return `You already have a ${category.toLowerCase()} assigned. Return it before requesting another.`;
    }
    return null;
  }, [reason, category]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    // Placeholder: no backend wiring in this sprint.
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Request Asset</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit a new asset request for the support team to review.
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
            <label className="text-xs font-medium text-foreground">Asset Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Reason</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly explain why you need this asset."
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
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
