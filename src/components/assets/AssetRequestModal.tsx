import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { ASSET_CATEGORIES, type AssetCategory } from "@/data/assets";
import { useAssets } from "@/context/AssetContext";

interface AssetRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export function AssetRequestModal({ open, onClose }: AssetRequestModalProps) {
  const { requestAsset } = useAssets();
  const [category, setCategory] = useState<AssetCategory>("Laptop");
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const result = requestAsset({
      category,
      reason,
    });

    if (result) {
      setReason("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Request Hardware Asset</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit a hardware asset request for IT Support to review.
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
            <label className="text-xs font-medium text-foreground block mb-1">Asset Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Business Reason
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly explain why you need this hardware asset."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
