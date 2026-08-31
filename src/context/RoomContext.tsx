import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  rooms as initialRooms,
  bookings as initialBookings,
  type MeetingRoom,
  type RoomBooking,
  type RoomAmenity,
} from "@/data/rooms";
import { useAuth } from "./AuthContext";

interface RoomContextValue {
  rooms: MeetingRoom[];
  bookings: RoomBooking[];
  createBooking: (draft: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    attendeesCount: number;
    notes?: string;
  }) => RoomBooking | null;
  cancelBooking: (bookingId: string, reason?: string) => void;
  checkInBooking: (bookingId: string) => void;
  createRoom: (draft: {
    name: string;
    location: string;
    floor: string;
    capacity: number;
    amenities: RoomAmenity[];
  }) => MeetingRoom;
  updateRoom: (roomId: string, updates: Partial<MeetingRoom>) => void;
  getRoomById: (roomId: string) => MeetingRoom | undefined;
  getBookingById: (bookingId: string) => RoomBooking | undefined;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);
const ROOMS_STORAGE_KEY = "flowdesk_rooms_data";
const BOOKINGS_STORAGE_KEY = "flowdesk_bookings_data";

export function RoomProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [roomsList, setRoomsList] = useState<MeetingRoom[]>(() => {
    try {
      const saved = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialRooms;
  });

  const [bookingsList, setBookingsList] = useState<RoomBooking[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialBookings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(roomsList));
    } catch {
      // Storage fallback
    }
  }, [roomsList]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookingsList));
    } catch {
      // Storage fallback
    }
  }, [bookingsList]);

  const createBooking = (draft: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    attendeesCount: number;
    notes?: string;
  }): RoomBooking | null => {
    const targetRoom = roomsList.find((r) => r.id === draft.roomId);
    if (!targetRoom) {
      toast.error("Selected meeting room does not exist.");
      return null;
    }

    if (targetRoom.status === "maintenance") {
      toast.error(`${targetRoom.name} is currently under maintenance.`);
      return null;
    }

    if (draft.attendeesCount > targetRoom.capacity) {
      toast.error(
        `Attendees (${draft.attendeesCount}) exceed room capacity (${targetRoom.capacity}).`,
      );
      return null;
    }

    // Time slot conflict detection
    const conflictBooking = bookingsList.find((b) => {
      if (b.roomId !== draft.roomId || b.date !== draft.date || b.status === "cancelled")
        return false;
      // Overlap check
      const startNew = draft.startTime;
      const endNew = draft.endTime;
      const startExist = b.startTime;
      const endExist = b.endTime;

      return startNew < endExist && endNew > startExist;
    });

    if (conflictBooking) {
      const byPerson = conflictBooking.organizer || conflictBooking.employee || "another employee";
      toast.error(
        `Conflict Warning: "${targetRoom.name}" is already reserved for "${conflictBooking.title}" (${conflictBooking.startTime} - ${conflictBooking.endTime}) by ${byPerson}. Booking rejected.`,
        { duration: 6000 },
      );
      return null;
    }

    const organizerName = user?.fullName || "Alex Lee";
    const nextNum = 3050 + Math.floor(Math.random() * 100);
    const newId = `MB-${nextNum}`;

    const newBooking: RoomBooking = {
      id: newId,
      roomId: draft.roomId,
      roomName: targetRoom.name,
      organizer: organizerName,
      employee: organizerName,
      title: draft.title.trim(),
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      attendeesCount: draft.attendeesCount,
      status: "confirmed",
      notes: draft.notes?.trim(),
    };

    setBookingsList((prev) => [newBooking, ...prev]);
    toast.success(
      `Booking confirmed for ${targetRoom.name} (${draft.startTime} - ${draft.endTime}).`,
    );
    return newBooking;
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    setBookingsList((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: "cancelled",
          notes: reason ? `${b.notes ? b.notes + " | " : ""}Cancelled: ${reason}` : b.notes,
        };
      }),
    );

    toast.info(`Booking ${bookingId} cancelled.`);
  };

  const checkInBooking = (bookingId: string) => {
    setBookingsList((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: "checked_in",
        };
      }),
    );

    toast.success(`Checked into room for booking ${bookingId}.`);
  };

  const createRoom = (draft: {
    name: string;
    location: string;
    floor: string;
    capacity: number;
    amenities: RoomAmenity[];
  }): MeetingRoom => {
    const nextId = `MR-${Math.floor(100 + Math.random() * 900)}`;
    const newRoom: MeetingRoom = {
      id: nextId,
      name: draft.name.trim(),
      location: draft.location.trim(),
      floor: draft.floor.trim(),
      capacity: draft.capacity,
      status: "available",
      amenities: draft.amenities,
      equipment: draft.amenities,
      description: `${draft.name} located on ${draft.floor}`,
    };

    setRoomsList((prev) => [newRoom, ...prev]);
    toast.success(`Meeting room ${newRoom.name} created.`);
    return newRoom;
  };

  const updateRoom = (roomId: string, updates: Partial<MeetingRoom>) => {
    setRoomsList((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        return { ...r, ...updates };
      }),
    );

    toast.success(`Meeting room updated successfully.`);
  };

  const getRoomById = (roomId: string) => {
    return roomsList.find((r) => r.id === roomId);
  };

  const getBookingById = (bookingId: string) => {
    return bookingsList.find((b) => b.id === bookingId);
  };

  return (
    <RoomContext.Provider
      value={{
        rooms: roomsList,
        bookings: bookingsList,
        createBooking,
        cancelBooking,
        checkInBooking,
        createRoom,
        updateRoom,
        getRoomById,
        getBookingById,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRooms(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRooms must be used within a RoomProvider");
  return ctx;
}
