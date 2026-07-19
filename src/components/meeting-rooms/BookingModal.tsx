import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import {
  overlapsBooking,
  rooms,
  TODAY_ISO,
  type Booking,
  type Room,
} from "@/data/rooms";

interface Props {
  open: boolean;
  onClose: () => void;
  /** When set, form is pre-selected to this room. */
  room?: Room;
  /** When set, opens in edit mode for an existing booking. */
  initial?: Booking;
}

export function BookingModal({ open, onClose, room, initial }: Props) {
  const initialRoomId = initial?.roomId ?? room?.id ?? rooms[0].id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [roomId, setRoomId] = useState(initialRoomId);
  const [date, setDate] = useState(initial?.date ?? TODAY_ISO);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "11:00");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const isEdit = Boolean(initial);
  const roomLocked = Boolean(room) && !isEdit;

  const validationError = useMemo(() => {
    if (!title.trim()) return "Please enter a meeting title.";
    if (!date) return "Please pick a date.";
    if (date < TODAY_ISO) return "Bookings cannot be made in the past.";
    if (!startTime || !endTime) return "Please choose start and end times.";
    if (endTime <= startTime) return "End time must be later than start time.";
    if (selectedRoom?.status === "maintenance") {
      return `${selectedRoom.name} is under maintenance and cannot be booked.`;
    }
    if (overlapsBooking(roomId, date, startTime, endTime, initial?.id)) {
      return "This room is already booked during the selected time. Choose another slot.";
    }
    return null;
  }, [title, date, startTime, endTime, roomId, selectedRoom, initial?.id]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
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
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? "Edit Booking" : "Book Meeting Room"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? "Update the details of your booking."
                : "Reserve a room for your meeting."}
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
            <label className="text-xs font-medium text-foreground">Meeting Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Sprint Planning"
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={roomLocked}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring disabled:opacity-60"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} disabled={r.status === "maintenance"}>
                  {r.name} · Seats {r.capacity}
                  {r.status === "maintenance" ? " (Under Maintenance)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Date</label>
            <input
              type="date"
              min={TODAY_ISO}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">
              Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything the room owner should know."
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
            <Button type="submit">{isEdit ? "Save Changes" : "Book Room"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
