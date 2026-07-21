import { Link } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
import { computeRoomStatus, type Room } from "@/data/rooms";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { Button } from "@/components/ui-kit/Button";

interface Props {
  room: Room;
  /** When true, render support-only management actions instead of "View Details". */
  supportActions?: React.ReactNode;
}

export function MeetingRoomCard({ room, supportActions }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-mono text-muted-foreground">{room.id}</div>
          <h3 className="text-base font-semibold text-foreground truncate">{room.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {room.floor}
          </div>
        </div>
        <RoomStatusBadge status={computeRoomStatus(room)} />
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>Seats {room.capacity}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {room.equipment.map((e) => (
          <span
            key={e}
            className="inline-flex items-center rounded-md bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium"
          >
            {e}
          </span>
        ))}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
        {supportActions ?? (
          <Link to="/meeting-rooms/rooms/$roomId" params={{ roomId: room.id }}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
