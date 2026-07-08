import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TicketCheck,
  CalendarDays,
  Boxes,
  DoorOpen,
  Plus,
  ArrowRight,
  Activity,
  Megaphone,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { useRole, CURRENT_ENGINEER } from "@/context/RoleContext";
import { tickets } from "@/data/tickets";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FlowDesk" },
      { name: "description", content: "Overview of tickets, leave, assets, announcements and rooms." },
    ],
  }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const { role } = useRole();
  return role === "support" ? <SupportDashboard /> : <EmployeeDashboard />;
}

/* -------------------- Employee dashboard (unchanged) -------------------- */

const activity = [
  { who: "Priya S.", what: "opened ticket #4821", when: "5m ago", status: "open" as const },
  { who: "Jamal T.", what: "requested 3 days leave", when: "1h ago", status: "pending" as const },
  { who: "Nora K.", what: "returned laptop LT-207", when: "3h ago", status: "resolved" as const },
  { who: "Ivan R.", what: "booked Room Aurora", when: "Yesterday", status: "approved" as const },
];

const announcements = [
  { title: "Office closed on July 14", date: "Jul 6, 2026", tag: "Company" },
  { title: "New IT support process", date: "Jul 3, 2026", tag: "IT" },
  { title: "Q3 town hall next Friday", date: "Jul 1, 2026", tag: "HR" },
];

function EmployeeDashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Alex"
        description="Here's what's happening across your workplace today."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>New request</Button>}
      />

      <div className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground p-6 mb-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">Sunday, July 5</div>
            <h2 className="mt-1 text-xl font-semibold">You have 3 items needing attention.</h2>
            <p className="text-sm opacity-90 mt-1">2 tickets assigned to you and 1 leave request awaiting approval.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/tickets" className="inline-flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 px-4 h-10 text-sm font-medium backdrop-blur">
              View tickets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open Tickets" value="24" delta="+3 this week" trend="up" icon={<TicketCheck className="h-5 w-5" />} />
        <StatCard label="Pending Leaves" value="7" delta="-2 vs last week" trend="down" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Assets in Use" value="182" delta="+5 this month" trend="up" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Room Bookings" value="12" delta="Today" trend="neutral" icon={<DoorOpen className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardCard
          title="Recent Activity"
          description="Latest events from your team"
          action={<Activity className="h-4 w-4 text-muted-foreground" />}
          className="lg:col-span-2"
        >
          <ul className="divide-y divide-border -mx-5">
            {activity.map((a, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold">
                    {a.who.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.when}</div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Announcements"
          description="Latest from HR & Ops"
          action={<Megaphone className="h-4 w-4 text-muted-foreground" />}
        >
          <ul className="space-y-4">
            {announcements.map((a, i) => (
              <li key={i} className="border-l-2 border-primary pl-3">
                <div className="text-sm font-medium text-foreground">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {a.tag} · {a.date}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/announcements" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </DashboardCard>
      </div>

      <DashboardCard title="Quick Actions" description="Jump straight into a task">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: "/tickets", label: "New Ticket", icon: TicketCheck },
            { to: "/leave-requests", label: "Request Leave", icon: CalendarDays },
            { to: "/assets", label: "Assign Asset", icon: Boxes },
            { to: "/meeting-rooms", label: "Book Room", icon: DoorOpen },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary-soft/40 transition-colors px-4 py-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
}

/* -------------------- Support Engineer dashboard -------------------- */

function SupportDashboard() {
  const openUnassigned = tickets.filter((t) => t.status === "open" && !t.assignee);
  const assignedToMe = tickets.filter(
    (t) => t.assignee === CURRENT_ENGINEER && t.status !== "closed" && t.status !== "resolved",
  );
  const highPriority = tickets.filter(
    (t) => (t.priority === "High" || t.priority === "Critical") && t.status !== "closed",
  );
  const resolvedToday = tickets.filter(
    (t) => t.status === "resolved" && t.updatedAt.startsWith("Jul 8, 2026"),
  );

  const recentlyUpdated = [...tickets]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${CURRENT_ENGINEER}`}
        description="Here's the current state of the support queue."
        actions={
          <Link to="/tickets">
            <Button leftIcon={<ClipboardList className="h-4 w-4" />}>View Ticket Queue</Button>
          </Link>
        }
      />

      <div className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground p-6 mb-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">Wednesday, July 8</div>
            <h2 className="mt-1 text-xl font-semibold">
              {openUnassigned.length} tickets waiting for assignment.
            </h2>
            <p className="text-sm opacity-90 mt-1">
              You have {assignedToMe.length} active tickets on your plate.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/assigned-tickets"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 px-4 h-10 text-sm font-medium backdrop-blur"
            >
              My assigned tickets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Open Tickets"
          value={String(tickets.filter((t) => t.status === "open").length)}
          delta="Awaiting review"
          icon={<Inbox className="h-5 w-5" />}
        />
        <StatCard
          label="Assigned To Me"
          value={String(assignedToMe.length)}
          delta="Active workload"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="High Priority"
          value={String(highPriority.length)}
          delta="High & Critical"
          trend="down"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Resolved Today"
          value={String(resolvedToday.length)}
          delta="Pending verification"
          trend="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardCard
          title="Tickets Waiting For Assignment"
          description="Unassigned open tickets in the queue"
          action={
            <Link to="/tickets" className="text-xs font-medium text-primary hover:underline">
              View queue
            </Link>
          }
          className="lg:col-span-2"
        >
          {openUnassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting — you're all caught up.</p>
          ) : (
            <ul className="divide-y divide-border -mx-5">
              {openUnassigned.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                    <Link
                      to="/tickets/$ticketId"
                      params={{ ticketId: t.id }}
                      className="text-sm font-medium text-foreground hover:text-primary truncate block"
                    >
                      {t.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t.category} · {t.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          title="My Assigned Tickets"
          description={`Tickets currently owned by ${CURRENT_ENGINEER}`}
          action={
            <Link to="/assigned-tickets" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          }
        >
          {assignedToMe.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tickets assigned to you.</p>
          ) : (
            <ul className="space-y-3">
              {assignedToMe.map((t) => (
                <li key={t.id} className="border-l-2 border-primary pl-3">
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: t.id }}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {t.title}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.id} · {t.priority} priority
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Recently Updated Tickets"
          description="Latest activity across the support queue"
          className="lg:col-span-2"
        >
          <ul className="divide-y divide-border -mx-5">
            {recentlyUpdated.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                  <Link
                    to="/tickets/$ticketId"
                    params={{ ticketId: t.id }}
                    className="text-sm font-medium text-foreground hover:text-primary truncate block"
                  >
                    {t.title}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Updated {t.updatedAt} · {t.assignee ?? "Unassigned"}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Quick Actions" description="Jump straight into your work">
          <div className="grid grid-cols-1 gap-3">
            {[
              { to: "/tickets" as const, label: "View Ticket Queue", icon: ClipboardList },
              { to: "/assigned-tickets" as const, label: "View Assigned Tickets", icon: TicketCheck },
              { to: "/leave-requests" as const, label: "My Leave Requests", icon: CalendarDays },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary-soft/40 transition-colors px-4 py-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
