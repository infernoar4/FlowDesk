import { useState, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { TICKET_CATEGORIES, type TicketCategory } from "@/data/tickets";

interface TicketFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketFormModal({ open, onClose }: TicketFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Hardware");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder: no backend wiring in this sprint.
    setTitle("");
    setDescription("");
    setCategory("Hardware");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Create Ticket</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Report a workplace issue to the support team.</p>
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
            <label className="text-xs font-medium text-foreground">Issue Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Laptop won't connect to Wi-Fi"
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, when it started, and any steps you've already tried."
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Attachment</label>
            <div className="mt-1 flex items-center justify-center gap-2 h-24 rounded-lg border border-dashed border-border text-sm text-muted-foreground bg-muted/30">
              <Paperclip className="h-4 w-4" />
              Drop a screenshot or file (placeholder)
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
