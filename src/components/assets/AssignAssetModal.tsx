import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import type { AssetRequest } from "@/data/assets";
import { useAssets } from "@/context/AssetContext";

interface AssignAssetModalProps {
  open: boolean;
  request: AssetRequest | null;
  onClose: () => void;
}

const SUGGESTIONS: Record<string, { assetId: string; assetName: string }[]> = {
  Laptop: [
    { assetId: "LAP-MBP16-061", assetName: 'Apple MacBook Pro 16" M3 Pro' },
    { assetId: "LAP-XPS15-044", assetName: "Dell XPS 15 9530" },
  ],
  Monitor: [
    { assetId: "MON-DL2723-021", assetName: 'Dell UltraSharp 27" U2723QE' },
    { assetId: "MON-LG27-017", assetName: 'LG UltraFine 27" 4K' },
  ],
  Keyboard: [{ assetId: "KBD-MX-024", assetName: "Logitech MX Keys" }],
  Mouse: [{ assetId: "MSE-MXV-018", assetName: "Logitech MX Vertical" }],
  Headset: [{ assetId: "HST-JAB65-041", assetName: "Jabra Evolve2 65" }],
  "Docking Station": [{ assetId: "DCK-CAL-029", assetName: "CalDigit TS4 Thunderbolt Dock" }],
  Charger: [{ assetId: "CHR-USBC96-052", assetName: "96W USB-C Charger" }],
};

export function AssignAssetModal({ open, request, onClose }: AssignAssetModalProps) {
  const { assignPhysicalAsset } = useAssets();
  const [assetId, setAssetId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open || !request) return null;

  const suggestions = SUGGESTIONS[request.category] ?? [];

  const applySuggestion = (id: string, name: string) => {
    setAssetId(id);
    setAssetName(name);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!assetId.trim() || !assetName.trim()) {
      setError("Asset Serial ID and Model Name are required.");
      return;
    }

    assignPhysicalAsset(request.id, assetId, assetName);

    setAssetId("");
    setAssetName("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Assign Hardware Asset</h2>
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
          {suggestions.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Available In Inventory
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.assetId}
                    onClick={() => applySuggestion(s.assetId, s.assetName)}
                    className="text-xs px-3 py-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted transition-colors text-left"
                  >
                    <span className="font-mono text-muted-foreground mr-1.5">{s.assetId}</span>
                    <span className="font-medium text-foreground">{s.assetName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Asset Serial ID
              </label>
              <input
                type="text"
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="e.g. LAP-MBP16-061"
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Asset Name / Model
              </label>
              <input
                type="text"
                required
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder='e.g. MacBook Pro 16"'
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
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
            <Button type="submit">Assign Hardware</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
