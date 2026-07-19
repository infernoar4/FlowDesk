import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { DataTable, type Column } from "@/components/ui-kit/DataTable";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { useMeetingRoomView } from "@/context/MeetingRoomViewContext";
import {
  BOOKING_STATUS_LABELS,
  bookings as allBookings,
  CURRENT_EMPLOYEE,
  formatDate,
  formatTimeRange,
  getRoom,
  rooms,
  type Booking,
  type BookingStatus,
} from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/bookings/")({
  head: () => ({ meta: [{ title: "Bookings — FlowDesk" }] }),
  component: BookingsPage,
});

type Row = {
  id: string;
  meeting: string;
  employee: string;
  room: string;
  date: string;
  time: string;
  status: BookingStatus;
};

function toRow(b: Booking): Row {
  return {
    id: b.id,
    meeting: b.title,
    employee: b.employee,
    room: getRoom(b.roomId)?.name ?? b.roomId,
    date: formatDate(b.date),
    time: formatTimeRange(b.startTime, b.endTime),
    status: b.status,
  };
}

function BookingsPage() {
  const { view } = useMeetingRoomView();
  const isSupport = view === "support";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [roomId, setRoomId] = useState<"all" | string>("all");
  const [date, setDate] = useState<string>("");

  const scoped = useMemo(
    () => (isSupport ? allBookings : allBookings.filter((b) => b.employee === CURRENT_EMPLOYEE)),
    [isSupport],
  );

  const filtered = useMemo(() => {
    return scoped.filter((b) => {
      if (query) {
        const hay = `${b.title} ${b.employee} ${getRoom(b.roomId)?.name ?? ""}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      if (status !== "all" && b.status !== status) return false;
      if (isSupport && roomId !== "all" && b.roomId !== roomId) return false;
      if (isSupport && date && b.date !== date) return false;
      return true;
    });
  }, [scoped, query, status, roomId, date, isSupport]);

  const columns: Column<Row>[] = [
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
    ...(isSupport ? [{ key: "employee", header: "Employee" } as Column<Row>] : []),
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
        title={isSupport ? "All Bookings" : "My Bookings"}
        description={
          isSupport
            ? "Search and manage every meeting room booking."
            : "Search and track the bookings you've made."
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <SearchBar
            placeholder="Search bookings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lg:col-span-2"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
              <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
            ))}
          </select>
          {isSupport && (
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            >
              <option value="all">All Rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
        {isSupport && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered.map(toRow)}
        empty={
          <EmptyState
            title="No bookings found"
            description="Try adjusting your search or filters."
          />
        }
      />
    </div>
  );
}
