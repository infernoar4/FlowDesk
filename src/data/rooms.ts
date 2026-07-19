export type RoomStatus = "available" | "occupied" | "maintenance";

export type Equipment =
  | "Projector"
  | "TV"
  | "Video Conference"
  | "Whiteboard"
  | "Conference Phone"
  | "HDMI";

export const EQUIPMENT_OPTIONS: Equipment[] = [
  "Projector",
  "TV",
  "Video Conference",
  "Whiteboard",
  "Conference Phone",
  "HDMI",
];

export type MaintenanceLog = {
  date: string;
  action: "Marked Under Maintenance" | "Service Resumed";
  by: string;
  note?: string;
};

export type Room = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: Equipment[];
  status: RoomStatus;
  description: string;
  maintenanceLog?: MaintenanceLog[];
};

export type BookingStatus = "booked" | "completed" | "cancelled";

export type Booking = {
  id: string;
  roomId: string;
  employee: string;
  title: string;
  /** ISO YYYY-MM-DD */
  date: string;
  /** HH:mm 24h */
  startTime: string;
  endTime: string;
  notes?: string;
  status: BookingStatus;
  createdOn: string;
  cancelledOn?: string;
};

/** Reference "today" for deterministic mock data. */
export const TODAY_ISO = "2026-07-11";

export const CURRENT_EMPLOYEE = "Alex Morgan";
export const CURRENT_SUPPORT = "Rahul Verma";

export const rooms: Room[] = [
  {
    id: "RM-001",
    name: "Conference Room A",
    floor: "Floor 3 · North Wing",
    capacity: 12,
    equipment: ["Projector", "Video Conference", "Whiteboard", "Conference Phone"],
    status: "available",
    description:
      "Large conference room with a long meeting table and a dedicated video conferencing setup. Ideal for department reviews and client calls.",
  },
  {
    id: "RM-002",
    name: "Conference Room B",
    floor: "Floor 3 · North Wing",
    capacity: 8,
    equipment: ["TV", "Whiteboard", "HDMI"],
    status: "occupied",
    description:
      "Mid-sized conference room with a wall-mounted TV for screen sharing. Best for team syncs and design reviews.",
  },
  {
    id: "RM-003",
    name: "Board Room",
    floor: "Floor 5 · Executive",
    capacity: 16,
    equipment: ["Projector", "TV", "Video Conference", "Conference Phone"],
    status: "available",
    description:
      "Premium executive board room for leadership meetings, quarterly business reviews and investor discussions.",
  },
  {
    id: "RM-004",
    name: "Training Room",
    floor: "Floor 2 · Learning Hub",
    capacity: 24,
    equipment: ["Projector", "Whiteboard", "HDMI"],
    status: "maintenance",
    description:
      "Classroom-style training room with movable desks. Currently offline for projector replacement.",
    maintenanceLog: [
      {
        date: "Jul 9, 2026",
        action: "Marked Under Maintenance",
        by: "Rahul Verma",
        note: "Projector failing, replacement scheduled.",
      },
    ],
  },
  {
    id: "RM-005",
    name: "Interview Room",
    floor: "Floor 1 · Reception",
    capacity: 4,
    equipment: ["TV", "Video Conference"],
    status: "available",
    description:
      "Small private room for candidate interviews and one-on-one conversations.",
  },
  {
    id: "RM-006",
    name: "Brainstorm Zone",
    floor: "Floor 2 · Learning Hub",
    capacity: 6,
    equipment: ["Whiteboard", "TV"],
    status: "available",
    description:
      "Creative space with wall-to-wall whiteboards and flexible seating for design sprints.",
  },
];

export const bookings: Booking[] = [
  // Current employee — active
  {
    id: "BK-3021",
    roomId: "RM-001",
    employee: "Alex Morgan",
    title: "Quarterly Planning Sync",
    date: TODAY_ISO,
    startTime: "10:00",
    endTime: "11:30",
    notes: "Bring the FY26 roadmap deck.",
    status: "booked",
    createdOn: "Jul 8, 2026",
  },
  {
    id: "BK-3022",
    roomId: "RM-005",
    employee: "Alex Morgan",
    title: "Candidate Interview — Backend Engineer",
    date: "2026-07-13",
    startTime: "14:00",
    endTime: "15:00",
    status: "booked",
    createdOn: "Jul 9, 2026",
  },
  {
    id: "BK-3023",
    roomId: "RM-006",
    employee: "Alex Morgan",
    title: "Design Brainstorm — Onboarding Revamp",
    date: "2026-07-15",
    startTime: "15:30",
    endTime: "17:00",
    notes: "Whiteboarding session, no laptops.",
    status: "booked",
    createdOn: "Jul 10, 2026",
  },
  {
    id: "BK-3010",
    roomId: "RM-002",
    employee: "Alex Morgan",
    title: "Sprint Retrospective",
    date: "2026-07-03",
    startTime: "16:00",
    endTime: "17:00",
    status: "completed",
    createdOn: "Jun 30, 2026",
  },
  {
    id: "BK-3005",
    roomId: "RM-003",
    employee: "Alex Morgan",
    title: "Vendor Contract Review",
    date: "2026-06-24",
    startTime: "11:00",
    endTime: "12:00",
    status: "cancelled",
    createdOn: "Jun 20, 2026",
    cancelledOn: "Jun 23, 2026",
  },

  // Other employees
  {
    id: "BK-3024",
    roomId: "RM-002",
    employee: "Jamal Turner",
    title: "Mobile Team Standup",
    date: TODAY_ISO,
    startTime: "09:00",
    endTime: "09:30",
    status: "booked",
    createdOn: "Jul 10, 2026",
  },
  {
    id: "BK-3025",
    roomId: "RM-003",
    employee: "Nora Klein",
    title: "Leadership Weekly",
    date: TODAY_ISO,
    startTime: "13:00",
    endTime: "14:30",
    status: "booked",
    createdOn: "Jul 9, 2026",
  },
  {
    id: "BK-3026",
    roomId: "RM-001",
    employee: "Meera Patel",
    title: "Customer Success Review",
    date: TODAY_ISO,
    startTime: "15:00",
    endTime: "16:00",
    status: "booked",
    createdOn: "Jul 10, 2026",
  },
  {
    id: "BK-3027",
    roomId: "RM-005",
    employee: "Ivan Rossi",
    title: "1:1 with Manager",
    date: "2026-07-12",
    startTime: "10:00",
    endTime: "10:45",
    status: "booked",
    createdOn: "Jul 9, 2026",
  },
  {
    id: "BK-3028",
    roomId: "RM-006",
    employee: "Sara Lopez",
    title: "Marketing Campaign Kickoff",
    date: "2026-07-14",
    startTime: "11:00",
    endTime: "12:30",
    status: "booked",
    createdOn: "Jul 9, 2026",
  },
  {
    id: "BK-3011",
    roomId: "RM-001",
    employee: "Nora Klein",
    title: "All Hands Rehearsal",
    date: "2026-07-04",
    startTime: "09:00",
    endTime: "10:00",
    status: "completed",
    createdOn: "Jul 1, 2026",
  },
  {
    id: "BK-3012",
    roomId: "RM-002",
    employee: "Jamal Turner",
    title: "Architecture Review",
    date: "2026-07-06",
    startTime: "14:00",
    endTime: "15:00",
    status: "completed",
    createdOn: "Jul 2, 2026",
  },
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Under Maintenance",
};

export function getRoom(id: string): Room | undefined {
  return rooms.find((r) => r.id === id);
}

export function getBooking(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function roomBookings(roomId: string, includeCancelled = false): Booking[] {
  return bookings.filter(
    (b) => b.roomId === roomId && (includeCancelled || b.status !== "cancelled"),
  );
}

/** Overlap check for a new booking against existing bookings on the same room and date. */
export function overlapsBooking(
  roomId: string,
  date: string,
  start: string,
  end: string,
  ignoreBookingId?: string,
): boolean {
  return bookings.some((b) => {
    if (b.id === ignoreBookingId) return false;
    if (b.roomId !== roomId) return false;
    if (b.date !== date) return false;
    if (b.status === "cancelled") return false;
    return start < b.endTime && end > b.startTime;
  });
}

/** Human date formatting helper — matches the "Jul 11, 2026" style used across the project. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

/** True when the booking hasn't started yet (uses TODAY_ISO reference). */
export function isBeforeStart(booking: Booking): boolean {
  const now = `${TODAY_ISO}T09:00`;
  const bookingStart = `${booking.date}T${booking.startTime}`;
  return bookingStart > now;
}

export const BOOKING_STAGES = [
  { key: "booked", label: "Booked" },
  { key: "completed", label: "Completed" },
] as const;
