import { useState, type FormEvent, type ChangeEvent } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { TICKET_CATEGORIES, type TicketCategory } from "@/data/tickets";
import { useTickets } from "@/context/TicketContext";

interface TicketFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketFormModal({ open, onClose }: TicketFormModalProps) {
  const { createTicket } = useTickets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Hardware");
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);

  if (!open) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInKb = (file.size / 1024).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeInKb} KB`,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createTicket({
      title,
      description,
      category,
      priority: "Medium", // Initial priority default before IT Support triage
      attachment: selectedFile ? `${selectedFile.name} (${selectedFile.size})` : undefined,
    });

    setTitle("");
    setDescription("");
    setCategory("Hardware");
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Create Support Ticket</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Describe your issue. Support Engineers will triage and assign priority.
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
            <label className="text-xs font-medium text-foreground block mb-1">Issue Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Laptop won't connect to Wi-Fi"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, when it started, and any steps you've already tried."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Attachment (Optional)
            </label>
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground truncate">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({selectedFile.size})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-20 rounded-lg border border-dashed border-border text-xs text-muted-foreground bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>Click to select screenshot or logs</span>
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
