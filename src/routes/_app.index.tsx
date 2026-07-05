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
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FlowDesk" },
      { name: "description", content: "Overview of tickets, leave, assets, announcements and rooms." },
    ],
  }),
  component: Dashboard,
});

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

function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back, Alex"
        description="Here's what's happening across your workplace today."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />}>New request</Button>
        }
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
