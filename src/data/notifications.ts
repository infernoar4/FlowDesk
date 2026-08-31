/** Notification mock data for FlowDesk.
 *  Notifications are produced by system events only — there is no manual
 *  authoring UI. Replaced later by a backend feed / websocket stream. */

export type NotificationType =
  "tickets" | "leave" | "assets" | "meetings" | "announcements" | "system";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  tickets: "Tickets",
  leave: "Leave",
  assets: "Assets",
  meetings: "Meetings",
  announcements: "Announcements",
  system: "System",
};

export const NOTIFICATION_TYPES: NotificationType[] = [
  "tickets",
  "leave",
  "assets",
  "meetings",
  "announcements",
  "system",
];

export type NotificationEvent =
  | "Ticket Assigned"
  | "Ticket Resolved"
  | "Leave Approved"
  | "Leave Rejected"
  | "Asset Assigned"
  | "Asset Return Pending"
  | "Meeting Booking Confirmed"
  | "Meeting Reminder"
  | "New Announcement Published"
  | "System Maintenance";

/** Target of a notification. `refId` points at an existing record so the card
 *  can deep-link into the module using the routes already in FlowDesk. */
export type Notification = {
  id: string;
  type: NotificationType;
  event: NotificationEvent;
  title: string;
  description: string;
  /** Minutes ago, relative to the session start. Keeps mock data stable. */
  minutesAgo: number;
  read: boolean;
  refId?: string;
};

export const notifications: Notification[] = [
  {
    id: "NT-9012",
    type: "tickets",
    event: "Ticket Assigned",
    title: "Ticket TKT-4821 assigned to you",
    description: "Rahul assigned “Laptop not booting after update” to your queue.",
    minutesAgo: 6,
    read: false,
    refId: "TKT-4821",
  },
  {
    id: "NT-9011",
    type: "meetings",
    event: "Meeting Reminder",
    title: "Sprint Review starts in 30 minutes",
    description: "Aurora Room, Floor 3 · 11:00 – 12:00 with the Engineering team.",
    minutesAgo: 24,
    read: false,
    refId: "BK-3021",
  },
  {
    id: "NT-9010",
    type: "leave",
    event: "Leave Approved",
    title: "Casual Leave approved",
    description: "Priya Kapoor approved your leave request LR-1041 for 2 days.",
    minutesAgo: 52,
    read: false,
    refId: "LR-1041",
  },
  {
    id: "NT-9009",
    type: "assets",
    event: "Asset Assigned",
    title: 'MacBook Pro 14" assigned',
    description: "Request AR-2050 fulfilled. Collect the device from IT Desk, Level 2.",
    minutesAgo: 96,
    read: false,
    refId: "AR-2050",
  },
  {
    id: "NT-9008",
    type: "announcements",
    event: "New Announcement Published",
    title: "New announcement from Human Resources",
    description: "Updated hybrid work policy takes effect from the first of next month.",
    minutesAgo: 140,
    read: false,
    refId: "ANN-1041",
  },
  {
    id: "NT-9007",
    type: "tickets",
    event: "Ticket Resolved",
    title: "Ticket TKT-4818 resolved",
    description: "VPN access restored. The ticket will auto-close in 48 hours.",
    minutesAgo: 320,
    read: true,
    refId: "TKT-4818",
  },
  {
    id: "NT-9006",
    type: "meetings",
    event: "Meeting Booking Confirmed",
    title: "Booking confirmed for Nimbus Room",
    description: "BK-3022 confirmed for tomorrow, 14:00 – 15:00.",
    minutesAgo: 480,
    read: true,
    refId: "BK-3022",
  },
  {
    id: "NT-9005",
    type: "assets",
    event: "Asset Return Pending",
    title: "Asset return pending verification",
    description: "Return for AR-2040 is awaiting IT verification at the asset desk.",
    minutesAgo: 1150,
    read: true,
    refId: "AR-2040",
  },
  {
    id: "NT-9004",
    type: "system",
    event: "System Maintenance",
    title: "Scheduled maintenance this Saturday",
    description: "FlowDesk will be unavailable from 01:00 to 03:00 IST for upgrades.",
    minutesAgo: 1520,
    read: true,
  },
  {
    id: "NT-9003",
    type: "leave",
    event: "Leave Rejected",
    title: "Sick Leave request declined",
    description: "LR-1035 was declined — medical certificate was not attached.",
    minutesAgo: 2600,
    read: true,
    refId: "LR-1035",
  },
  {
    id: "NT-9002",
    type: "tickets",
    event: "Ticket Assigned",
    title: "Ticket TKT-4817 moved to In Progress",
    description: "Arjun picked up “Printer on Floor 2 offline”.",
    minutesAgo: 4300,
    read: true,
    refId: "TKT-4817",
  },
  {
    id: "NT-9001",
    type: "announcements",
    event: "New Announcement Published",
    title: "Security advisory published by IT",
    description: "Mandatory password rotation for all corporate accounts this quarter.",
    minutesAgo: 7200,
    read: true,
    refId: "ANN-1039",
  },
];

/** Human friendly relative time from a minutes-ago offset. */
export function relativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks < 5 ? `${weeks}w ago` : `${Math.floor(days / 30)}mo ago`;
}

export function sortNotifications(list: Notification[]): Notification[] {
  return [...list].sort((a, b) => a.minutesAgo - b.minutesAgo);
}
