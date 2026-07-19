import type { BookingStatus } from "@/data/rooms";
import { BOOKING_STATUS_LABELS } from "@/data/rooms";

const styles: Record<BookingStatus, string> = {
  booked: "bg-info/10 text-info",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
