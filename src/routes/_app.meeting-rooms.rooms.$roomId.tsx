import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { RoomStatusBadge } from "@/components/meeting-rooms/RoomStatusBadge";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { BookingModal } from "@/components/meeting-rooms/BookingModal";
import { EditRoomModal } from "@/components/meeting-rooms/EditRoomModal";
import { useRole } from "@/context/RoleContext";
import { useRooms } from "@/context/RoomContext";
import { computeRoomStatus, formatDate, formatTimeRange, TODAY_ISO } from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/rooms/$roomId")({
  head: ({ params }) => ({ meta: [{ title: `${params.roomId} — FlowDesk` }] }),
  component: RoomDetailsPage,
});

function BackLink() {
  return (
    <Link
      to="/meeting-rooms/rooms"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to Rooms
    </Link>
  );
}

function RoomDetailsPage() {
  const { roomId } = useParams({ from: "/_app/meeting-rooms/rooms/$roomId" });
  const { getRoomById, bookings } = useRooms();
  const { role } = useRole();
  const isSupport = role === "support";

  const room = getRoomById(roomId);
  const [bookOpen, setBookOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === roomId),
    [bookings, roomId],
  );

  const upcoming = useMemo(
    () =>
      roomBookings
        .filter((b) => b.date >= TODAY_ISO && b.status !== "cancelled")
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [roomBookings],
  );
  const today = upcoming.filter((b) => b.date === TODAY_ISO);

  if (!room) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-base font-semibold text-foreground">Room not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Meeting room <code className="font-mono text-xs">{roomId}</code> doesn't exist or was
            removed.
          </p>
        </div>
      </div>
    );
  }

  const effectiveStatus = computeRoomStatus(room);
  const disabled = effectiveStatus === "maintenance";

  return (
    <div>
      <div className="mb-4">
        <BackLink />
      </div>

      <PageHeader
        title={room.name}
        description={`Meeting room located on ${room.floor} (${room.location})`}
        actions={
          isSupport ? (
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit Room
            </Button>
          ) : (
            <Button onClick={() => setBookOpen(true)} disabled={disabled}>
              {disabled ? "Booking Unavailable" : "Book Room"}
            </Button>
          )
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <RoomStatusBadge status={effectiveStatus} />
        <span className="text-xs text-muted-foreground font-mono">Room ID · {room.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Room Specs & Amenities">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Capacity</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" /> Seats {room.capacity} people
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                  Floor & Location
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {room.floor} ·{" "}
                  {room.location}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                  Equipment & Amenities
                </dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {(room.amenities ?? room.equipment ?? []).map((e: string) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
                    >
                      {e}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard
            title={isSupport ? "Today's Room Schedule" : "Upcoming Schedule"}
            description="Booked time slots for this room"
          >
            {(isSupport ? today : upcoming.slice(0, 6)).length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings scheduled for this room.</p>
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
                        {b.organizer} · {formatDate(b.date)} ·{" "}
                        {formatTimeRange(b.startTime, b.endTime)}
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <aside className="space-y-6">
          <DashboardCard title="Availability Status">
            <div className="flex items-center justify-between">
              <RoomStatusBadge status={effectiveStatus} />
              <span className="text-xs font-mono text-muted-foreground">{room.id}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {effectiveStatus === "maintenance"
                ? "This room is offline for maintenance."
                : effectiveStatus === "occupied"
                  ? "This room is currently occupied."
                  : "This room is available for instant reservation."}
            </p>
          </DashboardCard>
        </aside>
      </div>

      <BookingModal open={bookOpen} onClose={() => setBookOpen(false)} room={room} />
      <EditRoomModal open={editOpen} onClose={() => setEditOpen(false)} room={room} />
    </div>
  );
}
