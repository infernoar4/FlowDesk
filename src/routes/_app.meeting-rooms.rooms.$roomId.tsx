import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users, Wrench, Pencil, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { RoomStatusBadge } from "@/components/meeting-rooms/RoomStatusBadge";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { BookingModal } from "@/components/meeting-rooms/BookingModal";
import { EditRoomModal } from "@/components/meeting-rooms/EditRoomModal";
import { useMeetingRoomView } from "@/context/MeetingRoomViewContext";
import {
  formatDate,
  formatTimeRange,
  roomBookings,
  rooms,
  TODAY_ISO,
  type Room,
} from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/rooms/$roomId")({
  head: () => ({ meta: [{ title: "Room Details — FlowDesk" }] }),
  loader: ({ params }): Room => {
    const room = rooms.find((r) => r.id === params.roomId);
    if (!room) throw notFound();
    return room;
  },
  notFoundComponent: RoomNotFound,
  component: RoomDetailsPage,
});

function RoomNotFound() {
  return (
    <div>
      <PageHeader title="Room not found" description="This room may have been removed." />
      <Link to="/meeting-rooms/rooms" className="text-sm font-medium text-primary hover:underline">
        ← Back to Rooms
      </Link>
    </div>
  );
}

function RoomDetailsPage() {
  const room = Route.useLoaderData();
  const { view } = useMeetingRoomView();
  const isSupport = view === "support";
  const [bookOpen, setBookOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const upcoming = useMemo(
    () =>
      roomBookings(room.id)
        .filter((b) => b.date >= TODAY_ISO)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [room.id],
  );
  const today = upcoming.filter((b) => b.date === TODAY_ISO);
  const disabled = room.status === "maintenance";

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/meeting-rooms/rooms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Rooms
        </Link>
      </div>

      <PageHeader
        title={room.name}
        description={room.description}
        actions={
          isSupport ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
                Edit Room
              </Button>
              {room.status === "maintenance" ? (
                <Button leftIcon={<PlayCircle className="h-4 w-4" />}>Resume Service</Button>
              ) : (
                <Button variant="outline" leftIcon={<Wrench className="h-4 w-4" />}>
                  Mark Under Maintenance
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={() => setBookOpen(true)} disabled={disabled}>
              {disabled ? "Booking Unavailable" : "Book Room"}
            </Button>
          )
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <RoomStatusBadge status={room.status} />
        <span className="text-xs text-muted-foreground">Room ID · {room.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Room Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Capacity</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" /> Seats {room.capacity}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Floor / Location</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {room.floor}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Equipment</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {room.equipment.map((e: string) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded-md bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium"
                    >
                      {e}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">About</dt>
                <dd className="mt-1 text-sm text-foreground">{room.description}</dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard
            title={isSupport ? "Today's Schedule" : "Today's / Upcoming Bookings"}
            description={
              isSupport
                ? "Bookings scheduled for today in this room."
                : "Preview of upcoming bookings in this room."
            }
          >
            {(isSupport ? today : upcoming.slice(0, 6)).length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings to show.</p>
            ) : (
              <ul className="divide-y divide-border -mx-5">
                {(isSupport ? today : upcoming.slice(0, 6)).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/meeting-rooms/bookings/$bookingId"
                        params={{ bookingId: b.id }}
                        className="text-sm font-medium text-foreground hover:text-primary"
                      >
                        {b.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {b.employee} · {formatDate(b.date)} · {formatTimeRange(b.startTime, b.endTime)}
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          {isSupport && (
            <DashboardCard title="Maintenance History">
              {room.maintenanceLog && room.maintenanceLog.length > 0 ? (
                <ul className="space-y-3">
                  {room.maintenanceLog.map((m: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{m.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.date} · {m.by}
                        </div>
                        {m.note && (
                          <div className="text-xs text-muted-foreground mt-1">{m.note}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance events recorded.</p>
              )}
            </DashboardCard>
          )}
        </div>

        <aside className="space-y-6">
          <DashboardCard title="Current Status">
            <div className="flex items-center justify-between">
              <RoomStatusBadge status={room.status} />
              <span className="text-xs text-muted-foreground">{room.id}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {room.status === "maintenance"
                ? "This room is temporarily unavailable for bookings."
                : room.status === "occupied"
                ? "This room is currently in use."
                : "This room can be booked right now."}
            </p>
          </DashboardCard>
        </aside>
      </div>

      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} room={room} />
      <EditRoomModal open={editOpen} onClose={() => setEditOpen(false)} room={room} />
    </div>
  );
}
