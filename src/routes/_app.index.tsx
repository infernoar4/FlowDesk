import { useState } from "react";
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
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { TicketFormModal } from "@/components/tickets/TicketFormModal";
import { useRole, CURRENT_ENGINEER } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { useTickets } from "@/context/TicketContext";
import { useAssets } from "@/context/AssetContext";
import { useLeaves } from "@/context/LeaveContext";
import { useRooms } from "@/context/RoomContext";
import type { Ticket, TicketStatus } from "@/data/tickets";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FlowDesk" },
      {
        name: "description",
        content: "Overview of tickets, leave, assets, announcements and rooms.",
      },
    ],
  }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const { role } = useRole();
  return role === "support" ? <SupportDashboard /> : <EmployeeDashboard />;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getDynamicActivity(tickets: Ticket[]) {
  const list: {
    who: string;
    action: string;
    time: string;
    status: TicketStatus;
    ticketId: string;
  }[] = [];

  tickets.forEach((t) => {
    list.push({
      who: t.reporter,
      action: `opened ticket ${t.id} ("${t.title.length > 22 ? t.title.substring(0, 22) + "…" : t.title}")`,
      time: t.createdAt,
      status: t.status,
      ticketId: t.id,
    });

    if (t.comments && t.comments.length > 1) {
      const lastComment = t.comments[t.comments.length - 1];
      list.push({
        who: lastComment.author,
        action: `replied on ticket ${t.id}`,
        time: lastComment.at,
        status: t.status,
        ticketId: t.id,
      });
    }

    if (t.assignee) {
      list.push({
        who: t.assignee,
        action: `assigned ticket ${t.id}`,
        time: t.updatedAt,
        status: t.status,
        ticketId: t.id,
      });
    }
  });

  // Sort events in ascending order by date & time
  list.sort((a, b) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0));

  return list.slice(0, 5);
}

const announcements = [
  { title: "Office closed on July 14", date: "Jul 6, 2026", tag: "Company" },
  { title: "New IT support process", date: "Jul 3, 2026", tag: "IT" },
  { title: "Q3 town hall next Friday", date: "Jul 1, 2026", tag: "HR" },
];

function EmployeeDashboard() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const { assets } = useAssets();
  const { leaves } = useLeaves();
  const { bookings } = useRooms();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const userName = user?.fullName || "Employee";
  const greeting = getTimeGreeting();
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const myTickets = tickets.filter(
    (t) =>
      Boolean(t.reporter) &&
      (t.reporter.toLowerCase() === userName.toLowerCase() ||
        userName.toLowerCase().includes(t.reporter.toLowerCase()) ||
        t.reporter.toLowerCase().includes(userName.toLowerCase())),
  );
  const openCount = myTickets.filter(
    (t) => t.status !== "closed" && t.status !== "resolved",
  ).length;
  const myPendingLeaves = leaves.filter(
    (l) =>
      Boolean(l.employee) &&
      (l.employee.toLowerCase() === userName.toLowerCase() ||
        userName.toLowerCase().includes(l.employee.toLowerCase()) ||
        l.employee.toLowerCase().includes(userName.toLowerCase())) &&
      l.status === "pending",
  ).length;
  const myAssignedAssets = assets.filter(
    (a) =>
      Boolean(a.employee) &&
      (a.employee.toLowerCase() === userName.toLowerCase() ||
        userName.toLowerCase().includes(a.employee.toLowerCase()) ||
        a.employee.toLowerCase().includes(userName.toLowerCase())) &&
      (a.status === "assigned" || a.status === "return_requested"),
  ).length;
  const myBookingsCount = bookings.filter(
    (b) =>
      ((b.organizer &&
        (b.organizer.toLowerCase() === userName.toLowerCase() ||
          userName.toLowerCase().includes(b.organizer.toLowerCase()) ||
          b.organizer.toLowerCase().includes(userName.toLowerCase()))) ||
        (b.employee &&
          (b.employee.toLowerCase() === userName.toLowerCase() ||
            userName.toLowerCase().includes(b.employee.toLowerCase()) ||
            b.employee.toLowerCase().includes(userName.toLowerCase())))) &&
      b.status !== "cancelled",
  ).length;

  const recentActivities = getDynamicActivity(myTickets.length > 0 ? myTickets : tickets);

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${userName}`}
        description="Here's what's happening across your workplace today."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setTicketModalOpen(true)}>
            New Ticket
          </Button>
        }
      />

      <div className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground p-6 mb-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide opacity-80">{todayStr}</div>
            <h2 className="mt-1 text-xl font-semibold">
              You have {openCount} active tickets in progress.
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Track issues, submit requests, and check updates anytime.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 px-4 h-10 text-sm font-medium backdrop-blur"
            >
              View tickets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="My Open Tickets"
          value={String(openCount)}
          delta="Your active tickets"
          trend="up"
          icon={<TicketCheck className="h-5 w-5" />}
        />
        <StatCard
          label="My Pending Leaves"
          value={String(myPendingLeaves)}
          delta="Awaiting approval"
          trend="neutral"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="My Assets in Use"
          value={String(myAssignedAssets)}
          delta="Assigned to you"
          trend="up"
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          label="My Room Bookings"
          value={String(myBookingsCount)}
          delta="Upcoming / Active"
          trend="neutral"
          icon={<DoorOpen className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardCard
          title="Recent Activity Stream"
          description="Live workplace events and ticket updates"
          action={<Activity className="h-4 w-4 text-muted-foreground" />}
          className="lg:col-span-2"
        >
          <ul className="divide-y divide-border -mx-5">
            {recentActivities.map((a, i) => (
              <li key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {a.who
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-foreground truncate">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <StatusBadge status={a.status} />
                </div>
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
          <Link
            to="/announcements"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </DashboardCard>
      </div>

      <DashboardCard title="Quick Actions" description="Jump straight into a task">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setTicketModalOpen(true)}
            className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors px-4 py-3 text-left"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <TicketCheck className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">New Ticket</span>
          </button>

          <Link
            to="/leave-requests"
            className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors px-4 py-3"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Request Leave</span>
          </Link>

          <Link
            to="/assets"
            className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors px-4 py-3"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Assign Asset</span>
          </Link>

          <Link
            to="/meeting-rooms"
            className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors px-4 py-3"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <DoorOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Book Room</span>
          </Link>
        </div>
      </DashboardCard>

      <TicketFormModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}

/* -------------------- Support Engineer dashboard -------------------- */

function SupportDashboard() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const engineerName = user?.fullName || CURRENT_ENGINEER;
  const greeting = getTimeGreeting();
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const openUnassigned = tickets.filter((t) => t.status === "open" && !t.assignee);
  const assignedToMe = tickets.filter(
    (t) =>
      Boolean(t.assignee) &&
      (t.assignee?.toLowerCase() === engineerName.toLowerCase() ||
        engineerName.toLowerCase().includes((t.assignee || "").toLowerCase()) ||
        (t.assignee || "").toLowerCase().includes(engineerName.toLowerCase())) &&
      t.status !== "closed" &&
      t.status !== "resolved",
  );
  const highPriority = tickets.filter(
    (t) => (t.priority === "High" || t.priority === "Critical") && t.status !== "closed",
  );
  const resolvedToday = tickets.filter((t) => t.status === "resolved");

  const recentlyUpdated = [...tickets]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${engineerName}`}
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
            <div className="text-xs uppercase tracking-wide opacity-80">{todayStr}</div>
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
          description={`Tickets currently owned by ${engineerName}`}
          action={
            <Link
              to="/assigned-tickets"
              className="text-xs font-medium text-primary hover:underline"
            >
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
              {
                to: "/assigned-tickets" as const,
                label: "View Assigned Tickets",
                icon: TicketCheck,
              },
              { to: "/leave-requests" as const, label: "My Leave Requests", icon: CalendarDays },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors px-4 py-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      <TicketFormModal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
    </div>
  );
}
