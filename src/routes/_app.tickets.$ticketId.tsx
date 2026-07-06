import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Paperclip, Tag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { TicketTimeline } from "@/components/tickets/TicketTimeline";
import { tickets, type Ticket } from "@/data/tickets";

export const Route = createFileRoute("/_app/tickets/$ticketId")({
  head: ({ params }) => ({ meta: [{ title: `${params.ticketId} — FlowDesk` }] }),
  loader: ({ params }): { ticket: Ticket } => {
    const ticket = tickets.find((t) => t.id === params.ticketId);
    if (!ticket) throw notFound();
    return { ticket };
  },
  notFoundComponent: TicketNotFound,
  component: TicketDetailPage,
});

function TicketNotFound() {
  return (
    <div>
      <BackLink />
      <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-base font-semibold">Ticket not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">The ticket you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Back to tickets
    </Link>
  );
}

function TicketDetailPage() {
  const { ticket } = Route.useLoaderData() as { ticket: Ticket };

  return (
    <div>
      <div className="mb-4"><BackLink /></div>
      <PageHeader
        title={ticket.title}
        description={
          <span className="font-mono text-xs">{ticket.id}</span> as unknown as string
        }
        actions={<StatusBadge status={ticket.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <DashboardCard title="Issue Details">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> {ticket.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Created {ticket.createdAt}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {ticket.description}
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Attachment</div>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {ticket.attachment ?? "No attachment"}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Progress" description="Workflow stages for this ticket">
            <TicketTimeline current={ticket.status} />
          </DashboardCard>

          <DashboardCard title="Conversation" description="Updates between you and the support team">
            <ul className="space-y-4">
              {ticket.comments.map((c, i) => {
                const isSupport = c.role === "Support";
                return (
                  <li key={i} className={`flex gap-3 ${isSupport ? "" : "flex-row-reverse"}`}>
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isSupport ? "bg-primary-soft text-primary" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {isSupport ? "S" : "E"}
                    </div>
                    <div className={`max-w-[80%] ${isSupport ? "" : "text-right"}`}>
                      <div className="text-xs text-muted-foreground mb-1">
                        {c.author} · {c.at}
                      </div>
                      <div
                        className={`inline-block rounded-lg px-3 py-2 text-sm ${
                          isSupport
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {c.message}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </DashboardCard>
        </div>

        <div className="space-y-4">
          <DashboardCard title="Summary">
            <dl className="text-sm space-y-3">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Ticket ID</dt>
                <dd className="font-mono text-xs">{ticket.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{ticket.category}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{ticket.createdAt}</dd>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={ticket.status} /></dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard title="Need help?">
            <p className="text-sm text-muted-foreground">
              The support team will respond within 1 business day. You'll be notified here when the status changes.
            </p>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
