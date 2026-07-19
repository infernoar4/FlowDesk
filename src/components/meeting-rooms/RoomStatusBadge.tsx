import type { RoomStatus } from "@/data/rooms";
import { ROOM_STATUS_LABELS } from "@/data/rooms";

const styles: Record<RoomStatus, string> = {
  available: "bg-success/15 text-success",
  occupied: "bg-warning/15 text-warning-foreground",
  maintenance: "bg-destructive/10 text-destructive",
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {ROOM_STATUS_LABELS[status]}
    </span>
  );
}
