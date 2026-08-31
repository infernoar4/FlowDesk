import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { EQUIPMENT_OPTIONS, type Equipment, type MeetingRoom, type RoomStatus } from "@/data/rooms";
import { useRooms } from "@/context/RoomContext";

interface Props {
  open: boolean;
  onClose: () => void;
  room: MeetingRoom;
}

type EditableStatus = Exclude<RoomStatus, "occupied">;

export function EditRoomModal({ open, onClose, room }: Props) {
  const { updateRoom } = useRooms();
  const [name, setName] = useState(room.name);
  const [floor, setFloor] = useState(room.floor);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [equipment, setEquipment] = useState<Equipment[]>(room.equipment ?? []);
  const [status, setStatus] = useState<EditableStatus>(
    room.status === "occupied" ? "available" : (room.status as EditableStatus),
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const toggle = (e: Equipment) => {
    setEquipment((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!name.trim()) return setError("Room name is required.");
    if (Number(capacity) < 1) return setError("Capacity must be at least 1.");

    updateRoom(room.id, {
      name: name.trim(),
      floor: floor.trim(),
      capacity: Number(capacity),
      equipment,
      status,
    });

    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Edit Meeting Room</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update room properties and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Room Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Floor / Location
              </label>
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Capacity</label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Amenities & Equipment
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((e) => {
                const active = equipment.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggle(e)}
                    className={[
                      "px-2.5 h-8 rounded-md text-xs font-medium border transition-colors",
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

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Room Maintenance Status
            </label>
            <div className="mt-1 flex items-center gap-2">
              {(
                [
                  { value: "available", label: "Available" },
                  { value: "maintenance", label: "Under Maintenance" },
                ] as { value: EditableStatus; label: string }[]
              ).map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={[
                      "px-3 h-9 rounded-md text-xs font-medium border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
