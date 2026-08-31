import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  DoorOpen,
  Pencil,
  StickyNote,
  User,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { BookingTimeline } from "@/components/meeting-rooms/BookingTimeline";
import { BookingModal } from "@/components/meeting-rooms/BookingModal";
import { useRole } from "@/context/RoleContext";
import { useRooms } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatTimeRange } from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/bookings/$bookingId")({
  head: ({ params }) => ({ meta: [{ title: `${params.bookingId} — FlowDesk` }] }),
  component: BookingDetailsPage,
});

function BackLink() {
  return (
    <Link
      to="/meeting-rooms/bookings"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to Bookings
    </Link>
  );
}

function BookingDetailsPage() {
  const { bookingId } = useParams({ from: "/_app/meeting-rooms/bookings/$bookingId" });
  const { getBookingById, getRoomById, cancelBooking, checkInBooking } = useRooms();
  const { user } = useAuth();
  const { role } = useRole();

  const booking = getBookingById(bookingId);
  const room = booking ? getRoomById(booking.roomId) : undefined;
  const isSupport = role === "support";
  const userName = user?.fullName || "Alex Lee";
  const isOwner = booking
    ? booking.organizer === userName || booking.organizer === "Alex Lee"
    : false;

  const [editOpen, setEditOpen] = useState(false);

  if (!booking) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-base font-semibold text-foreground">Booking not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The booking <code className="font-mono text-xs">{bookingId}</code> doesn't exist or was
            removed.
          </p>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";

  return (
    <div>
      <div className="mb-4">
        <BackLink />
      </div>

      <PageHeader
        title={booking.title}
        description={`Booking ${booking.id} by ${booking.organizer}`}
        actions={
          <div className="flex items-center gap-2">
            {isConfirmed && (
              <Button
                variant="outline"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => checkInBooking(booking.id)}
              >
                Check In
              </Button>
            )}
            {(isOwner || isSupport) && isConfirmed && (
              <>
                <Button
                  variant="outline"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit Booking
                </Button>
                <Button
                  variant="destructive"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={() => cancelBooking(booking.id, "User requested cancellation.")}
                >
                  Cancel Booking
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Booking Progress">
            <BookingTimeline status={booking.status} />
          </DashboardCard>

          <DashboardCard title="Meeting Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Organizer</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" /> {booking.organizer}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />{" "}
                  {formatDate(booking.date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Time</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Attendees</dt>
                <dd className="mt-1 text-foreground">{booking.attendeesCount} people</dd>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Notes</dt>
                  <dd className="mt-1 flex items-start gap-1.5 text-foreground">
                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{booking.notes}</span>
                  </dd>
                </div>
              )}
            </dl>
          </DashboardCard>
        </div>

        <aside className="space-y-6">
          <DashboardCard title="Room Details">
            {room ? (
              <div className="space-y-2 text-sm">
                <Link
                  to="/meeting-rooms/rooms/$roomId"
                  params={{ roomId: room.id }}
                  className="text-base font-semibold text-foreground hover:text-primary flex items-center gap-1.5"
                >
                  <DoorOpen className="h-4 w-4 text-muted-foreground" /> {room.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {room.floor} · {room.location}
                </div>
                <div className="text-xs text-muted-foreground">Capacity: {room.capacity} seats</div>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {room.amenities?.map((e: string) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Room details for {booking.roomName || booking.roomId}.
              </p>
            )}
          </DashboardCard>
        </aside>
      </div>

      <BookingModal open={editOpen} onClose={() => setEditOpen(false)} initial={booking} />
    </div>
  );
}
