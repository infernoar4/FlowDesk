import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/ui-kit/SearchBar";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { MeetingRoomCard } from "@/components/meeting-rooms/MeetingRoomCard";
import { EditRoomModal } from "@/components/meeting-rooms/EditRoomModal";
import { useRole } from "@/context/RoleContext";
import { useRooms } from "@/context/RoomContext";
import {
  EQUIPMENT_OPTIONS,
  ROOM_STATUS_LABELS,
  type Equipment,
  type MeetingRoom,
  type RoomStatus,
} from "@/data/rooms";

export const Route = createFileRoute("/_app/meeting-rooms/rooms/")({
  head: () => ({ meta: [{ title: "All Rooms — FlowDesk" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  const { rooms } = useRooms();
  const { role } = useRole();
  const isSupport = role === "support";

  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState<"all" | "small" | "medium" | "large">("all");
  const [status, setStatus] = useState<"all" | RoomStatus>("all");
  const [equipment, setEquipment] = useState<"all" | Equipment>("all");

  const [editRoom, setEditRoom] = useState<MeetingRoom | null>(null);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (
        query &&
        !`${r.name} ${r.floor} ${r.location}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (status !== "all" && r.status !== status) return false;
      if (equipment !== "all" && !(r.amenities ?? r.equipment ?? []).includes(equipment))
        return false;
      if (capacity === "small" && r.capacity > 6) return false;
      if (capacity === "medium" && (r.capacity < 7 || r.capacity > 12)) return false;
      if (capacity === "large" && r.capacity < 13) return false;
      return true;
    });
  }, [rooms, query, capacity, status, equipment]);

  return (
    <div>
      <PageHeader
        title={isSupport ? "Room Management" : "All Rooms"}
        description={
          isSupport
            ? "Manage meeting rooms, capacity limits and maintenance status."
            : "Browse available rooms across corporate office floors."
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <SearchBar
            placeholder="Search rooms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lg:col-span-2"
          />
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value as typeof capacity)}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All Capacities</option>
            <option value="small">Small (up to 6)</option>
            <option value="medium">Medium (7–12)</option>
            <option value="large">Large (13+)</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((s) => (
              <option key={s} value={s}>
                {ROOM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Equipment:</span>
          <button
            type="button"
            onClick={() => setEquipment("all")}
            className={[
              "px-2.5 h-7 rounded-md text-xs font-medium border transition-colors",
              equipment === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-muted",
            ].join(" ")}
          >
            Any
          </button>
          {EQUIPMENT_OPTIONS.map((e) => {
            const active = equipment === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => setEquipment(e)}
                className={[
                  "px-2.5 h-7 rounded-md text-xs font-medium border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted",
                ].join(" ")}
              >
                {e}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No rooms match your filters"
          description="Try clearing filters or search for a different room."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((room) => (
            <MeetingRoomCard
              key={room.id}
              room={room}
              supportActions={
                isSupport ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditRoom(room)}>
                      Edit Room
                    </Button>
                    <Link
                      to="/meeting-rooms/rooms/$roomId"
                      params={{ roomId: room.id }}
                      className="text-xs font-medium text-primary hover:underline px-2"
                    >
                      Details
                    </Link>
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {editRoom && (
        <EditRoomModal open={!!editRoom} onClose={() => setEditRoom(null)} room={editRoom} />
      )}
    </div>
  );
}
