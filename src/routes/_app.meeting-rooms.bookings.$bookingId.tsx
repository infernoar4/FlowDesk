import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, DoorOpen, Pencil, StickyNote, User, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { BookingStatusBadge } from "@/components/meeting-rooms/BookingStatusBadge";
import { BookingTimeline } from "@/components/meeting-rooms/BookingTimeline";
import { BookingModal } from "@/components/meeting-rooms/BookingModal";
import { useMeetingRoomView } from "@/context/MeetingRoomViewContext";
import {
  bookings,
  CURRENT_EMPLOYEE,
  formatDate,
  formatTimeRange,
  getRoom,
  isBeforeStart,
  type Booking,
} from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/bookings/$bookingId")({
  head: () => ({ meta: [{ title: "Booking Details — FlowDesk" }] }),
  loader: ({ params }): Booking => {
    const b = bookings.find((x) => x.id === params.bookingId);
    if (!b) throw notFound();
    return b;
  },
  notFoundComponent: BookingNotFound,
  component: BookingDetailsPage,
});

function BookingNotFound() {
  return (
    <div>
      <PageHeader title="Booking not found" description="This booking may have been removed." />
      <Link to="/meeting-rooms/bookings" className="text-sm font-medium text-primary hover:underline">
        ← Back to Bookings
      </Link>
    </div>
  );
}

function BookingDetailsPage() {
  const booking = Route.useLoaderData();
  const { view } = useMeetingRoomView();
  const room = getRoom(booking.roomId);
  const isOwner = booking.employee === CURRENT_EMPLOYEE && view !== "support";
  const editable = isOwner && booking.status === "booked" && isBeforeStart(booking);

  const [editOpen, setEditOpen] = useState(false);

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/meeting-rooms/bookings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Bookings
        </Link>
      </div>

      <PageHeader
        title={booking.title}
        description={`Booking ${booking.id} by ${booking.employee}`}
        actions={
          isOwner && booking.status === "booked" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => setEditOpen(true)}
                disabled={!editable}
                title={!editable ? "Editing is only allowed before the meeting start time." : undefined}
              >
                Edit Booking
              </Button>
              <Button variant="destructive" leftIcon={<X className="h-4 w-4" />}>
                Cancel Booking
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 flex items-center gap-2">
        <BookingStatusBadge status={booking.status} />
        <span className="text-xs text-muted-foreground">Created {booking.createdOn}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Booking Timeline">
            <BookingTimeline status={booking.status} />
          </DashboardCard>

          <DashboardCard title="Meeting Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Booked By</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" /> {booking.employee}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-foreground">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> {formatDate(booking.date)}
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
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <BookingStatusBadge status={booking.status} />
                </dd>
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
          <DashboardCard title="Room Information">
            {room ? (
              <div className="space-y-2 text-sm">
                <Link
                  to="/meeting-rooms/rooms/$roomId"
                  params={{ roomId: room.id }}
                  className="text-base font-semibold text-foreground hover:text-primary flex items-center gap-1.5"
                >
                  <DoorOpen className="h-4 w-4 text-muted-foreground" /> {room.name}
                </Link>
                <div className="text-xs text-muted-foreground">{room.floor}</div>
                <div className="text-xs text-muted-foreground">Seats {room.capacity}</div>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {room.equipment.map((e: string) => (
                    <span
                      key={e}
                      className="inline-flex items-center rounded-md bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Room information unavailable.</p>
            )}
          </DashboardCard>

          {isOwner && booking.status === "booked" && !editable && (
            <div className="rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground p-3">
              Editing is only allowed before the meeting start time.
            </div>
          )}
        </aside>
      </div>

      <BookingModal open={editOpen} onClose={() => setEditOpen(false)} initial={booking} />
    </div>
  );
}
