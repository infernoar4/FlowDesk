import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import type { Ticket } from "@/data/tickets";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-xs text-muted-foreground">{ticket.id}</div>
          <h3 className="mt-1 text-sm font-semibold text-foreground truncate">{ticket.title}</h3>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          {ticket.category}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {ticket.createdAt}
        </span>
      </div>
      <div className="pt-2 border-t border-border">
        <Link
          to="/tickets/$ticketId"
          params={{ ticketId: ticket.id }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
