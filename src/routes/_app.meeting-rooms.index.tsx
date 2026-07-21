import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  DoorOpen,
  ListChecks,
  Plus,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard, StatCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { RoomStatusBadge } from "@/components/meeting-rooms/RoomStatusBadge";
import { BookingModal } from "@/components/meeting-rooms/BookingModal";
import { useRole } from "@/context/RoleContext";
import {
  bookings,
  CURRENT_EMPLOYEE,
  CURRENT_SUPPORT,
  formatDate,
  formatTimeRange,
  getRoom,
  rooms,
  TODAY_ISO,
  type Booking,
} from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/")({
  head: () => ({ meta: [{ title: "Meeting Rooms — FlowDesk" }] }),
  component: MeetingRoomsDashboardRouter,
});

function MeetingRoomsDashboardRouter() {
  const { role } = useRole();
  const view = role;
  return view === "support" ? <SupportDashboard /> : <EmployeeDashboard />;
}

type BookingRow = {
  id: string;
  meeting: string;
  employee: string;
  room: string;
  date: string;
  time: string;
  status: Booking["status"];
};

function toRow(b: Booking): BookingRow {
  const room = getRoom(b.roomId);
  return {
    id: b.id,
    meeting: b.title,
    employee: b.employee,
    room: room?.name ?? b.roomId,
    date: formatDate(b.date),
    time: formatTimeRange(b.startTime, b.endTime),
    status: b.status,
  };
}

/* -------------------- Employee Dashboard -------------------- */

function EmployeeDashboard() {
  const [bookOpen, setBookOpen] = useState(false);

  const mine = useMemo(
    () => bookings.filter((b) => b.employee === CURRENT_EMPLOYEE),
    [],
  );
  const today = mine.filter((b) => b.date === TODAY_ISO && b.status !== "cancelled");
  const upcoming = mine
    .filter((b) => b.date >= TODAY_ISO && b.status === "booked")
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const active = mine.filter((b) => b.status === "booked");

  const columns: Column<BookingRow>[] = [
    {
      key: "meeting",
      header: "Meeting",
      render: (r) => (
        <Link
          to="/meeting-rooms/bookings/$bookingId"
          params={{ bookingId: r.id }}
          className="text-sm font-medium text-foreground hover:text-primary"
        >
          {r.meeting}
        </Link>
      ),
    },
    { key: "room", header: "Room" },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    {
      key: "status",
      header: "Status",
      render: (r) => <BookingStatusBadge status={r.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Meeting Rooms"
        description="Book rooms and manage your upcoming meetings."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setBookOpen(true)}>
            Book Meeting Room
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Today's Meetings"
          value={String(today.length)}
          delta="Scheduled for today"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Upcoming Bookings"
          value={String(upcoming.length)}
          delta="From today onward"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="My Active Bookings"
          value={String(active.length)}
          delta="Currently booked"
          icon={<ListChecks className="h-5 w-5" />}
        />
      </div>

      <DashboardCard title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBookOpen(true)}
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/40 p-4 hover:border-primary hover:bg-primary/5 transition-colors text-left"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">Book Meeting Room</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Reserve a room for your next meeting.
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
          </button>
          <Link
            to="/meeting-rooms/bookings"
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-muted transition-colors"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">View My Bookings</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                See all bookings you've made.
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <ListChecks className="h-5 w-5" />
            </div>
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Upcoming Meetings"
        description="Your next scheduled bookings"
        action={
          <Link
            to="/meeting-rooms/bookings"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <DataTable
          columns={columns}
          data={upcoming.slice(0, 5).map(toRow)}
          empty={
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No upcoming meetings. Book one to get started.
            </div>
          }
        />
      </DashboardCard>

      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} />
    </div>
  );
}

/* -------------------- Support Dashboard -------------------- */

function SupportDashboard() {
  const todayBookings = bookings.filter(
    (b) => b.date === TODAY_ISO && b.status !== "cancelled",
  );
  const active = bookings.filter((b) => b.status === "booked");
  const available = rooms.filter((r) => r.status === "available");
  const maintenance = rooms.filter((r) => r.status === "maintenance");

  return (
    <div>
      <PageHeader
        title="Meeting Operations"
        description={`Managing rooms and bookings as ${CURRENT_SUPPORT}.`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/meeting-rooms/rooms">
              <Button variant="outline" leftIcon={<DoorOpen className="h-4 w-4" />}>
                Manage Rooms
              </Button>
            </Link>
            <Link to="/meeting-rooms/bookings">
              <Button leftIcon={<ListChecks className="h-4 w-4" />}>All Bookings</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Today's Bookings"
          value={String(todayBookings.length)}
          delta="Across all rooms"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Active Bookings"
          value={String(active.length)}
          delta="Confirmed and upcoming"
          icon={<ListChecks className="h-5 w-5" />}
        />
        <StatCard
          label="Rooms Available"
          value={String(available.length)}
          delta="Ready to book"
          trend="up"
          icon={<DoorOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Under Maintenance"
          value={String(maintenance.length)}
          delta="Currently offline"
          trend={maintenance.length > 0 ? "down" : "neutral"}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <DashboardCard
        title="Rooms Overview"
        description="Current status of every meeting room"
        action={
          <Link to="/meeting-rooms/rooms" className="text-xs font-medium text-primary hover:underline">
            Manage rooms
          </Link>
        }
      >
        <ul className="divide-y divide-border -mx-5">
          {rooms.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <Link
                  to="/meeting-rooms/rooms/$roomId"
                  params={{ roomId: r.id }}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  {r.name}
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {r.floor} · Seats {r.capacity}
                </div>
              </div>
              <RoomStatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}
