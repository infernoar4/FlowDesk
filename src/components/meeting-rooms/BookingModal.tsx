import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { TODAY_ISO, getTodayISO, type MeetingRoom, type RoomBooking } from "@/data/rooms";
import { useRooms } from "@/context/RoomContext";

interface Props {
  open: boolean;
  onClose: () => void;
  room?: MeetingRoom;
  initial?: RoomBooking;
}

export function BookingModal({ open, onClose, room, initial }: Props) {
  const { rooms, bookings, createBooking } = useRooms();
  const initialRoomId = initial?.roomId ?? room?.id ?? rooms[0]?.id ?? "MR-101";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [roomId, setRoomId] = useState(initialRoomId);
  const [date, setDate] = useState(initial?.date ?? getTodayISO());
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "11:00");
  const [attendeesCount, setAttendeesCount] = useState(initial?.attendeesCount ?? 4);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const activeConflict = useMemo(() => {
    if (!open) return null;
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === date &&
        b.status !== "cancelled" &&
        (!initial || b.id !== initial.id) &&
        startTime < b.endTime &&
        endTime > b.startTime,
    );
  }, [open, bookings, roomId, date, startTime, endTime, initial]);

  if (!open) return null;

  const isEdit = Boolean(initial);
  const roomLocked = Boolean(room) && !isEdit;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a meeting title.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be later than start time.");
      return;
    }

    const todayStr = getTodayISO();
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (date < todayStr || (date === todayStr && startTime < currentHHMM)) {
      setError("Cannot book room for a past date or time.");
      return;
    }

    if (activeConflict) {
      const byPerson = activeConflict.organizer || activeConflict.employee || "another employee";
      setError(
        `Conflict: Room is already reserved for "${activeConflict.title}" (${activeConflict.startTime} - ${activeConflict.endTime}) by ${byPerson}.`,
      );
      return;
    }

    const created = createBooking({
      roomId,
      title,
      date,
      startTime,
      endTime,
      attendeesCount,
      notes,
    });

    if (created) {
      setTitle("");
      setNotes("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? "Edit Booking" : "Book Meeting Room"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? "Update your meeting reservation." : "Reserve a workspace room."}
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
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeConflict && !error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Time Slot Conflict Warning:</span> This room is
                already reserved for <span className="font-semibold">"{activeConflict.title}"</span>{" "}
                ({activeConflict.startTime} - {activeConflict.endTime}) by{" "}
                {activeConflict.organizer || activeConflict.employee}. Please choose a different
                time slot or room.
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Meeting Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Q3 Sprint Planning"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Select Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={roomLocked}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring disabled:opacity-60 font-medium"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} disabled={r.status === "maintenance"}>
                  {r.name} · Capacity: {r.capacity} seats · {r.location}
                  {r.status === "maintenance" ? " (Maintenance)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Date</label>
              <input
                type="date"
                min={getTodayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Attendees Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Need video conference setup and whiteboard markers."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring resize-none"
            />
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
            <Button type="submit">{isEdit ? "Save Changes" : "Confirm Booking"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
