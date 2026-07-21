import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { EQUIPMENT_OPTIONS, type Equipment, type Room, type RoomStatus } from "@/data/rooms";

interface Props {
  open: boolean;
  onClose: () => void;
  room: Room;
}

/** Editable statuses. "occupied" is derived from active bookings and cannot be set manually. */
type EditableStatus = Exclude<RoomStatus, "occupied">;

export function EditRoomModal({ open, onClose, room }: Props) {
  const [name, setName] = useState(room.name);
  const [floor, setFloor] = useState(room.floor);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [equipment, setEquipment] = useState<Equipment[]>(room.equipment);
  const [description, setDescription] = useState(room.description);
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
    // Placeholder: no backend wiring in this sprint.
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Edit Room</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update room details, capacity and equipment.
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
            <label className="text-xs font-medium text-foreground">Room Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground">Floor / Location</label>
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Capacity</label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Equipment</label>
            <div className="mt-2 flex flex-wrap gap-2">
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
            <label className="text-xs font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
