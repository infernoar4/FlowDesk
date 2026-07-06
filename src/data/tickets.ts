export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Network"
  | "Account Access"
  | "Printer"
  | "Other";

export type TicketStatus = "open" | "assigned" | "in_progress" | "resolved" | "closed";

export const TICKET_CATEGORIES: TicketCategory[] = [
  "Hardware",
  "Software",
  "Network",
  "Account Access",
  "Printer",
  "Other",
];

export const TICKET_STATUSES: TicketStatus[] = [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

export const TICKET_STAGES: { key: TicketStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export type TicketComment = {
  author: string;
  role: "Support" | "Employee";
  message: string;
  at: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  attachment?: string;
  comments: TicketComment[];
};

export const tickets: Ticket[] = [
  {
    id: "TKT-4821",
    title: "Microsoft Outlook crashes on startup",
    description:
      "Outlook closes immediately after the splash screen. Restarted the laptop twice, issue still persists. Blocks access to all mail and calendar.",
    category: "Software",
    status: "in_progress",
    createdAt: "Jul 5, 2026",
    attachment: "outlook-error.png",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request and are looking into it.", at: "Jul 5, 2026 · 10:12" },
      { author: "Alex Morgan", role: "Employee", message: "Thank you. Let me know if you need remote access.", at: "Jul 5, 2026 · 10:34" },
      { author: "Support Team", role: "Support", message: "The issue has been assigned to an engineer.", at: "Jul 5, 2026 · 11:02" },
    ],
  },
  {
    id: "TKT-4820",
    title: "Laptop battery draining quickly",
    description: "Battery drops from 100% to 20% in under 90 minutes even on light workload.",
    category: "Hardware",
    status: "assigned",
    createdAt: "Jul 4, 2026",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 4, 2026 · 14:20" },
      { author: "Support Team", role: "Support", message: "Assigned to hardware engineer for diagnosis.", at: "Jul 4, 2026 · 16:05" },
    ],
  },
  {
    id: "TKT-4818",
    title: "VPN connection issue",
    description: "VPN client fails to connect from home network. Error code 812.",
    category: "Network",
    status: "open",
    createdAt: "Jul 3, 2026",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 3, 2026 · 09:15" },
    ],
  },
  {
    id: "TKT-4815",
    title: "Printer not responding — Floor 3",
    description: "Shared printer on the third floor is offline. Print jobs stack in the queue but never process.",
    category: "Printer",
    status: "resolved",
    createdAt: "Jul 2, 2026",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 2, 2026 · 11:00" },
      { author: "Support Team", role: "Support", message: "Printer firmware updated. Please try again.", at: "Jul 2, 2026 · 15:40" },
      { author: "Alex Morgan", role: "Employee", message: "Working now, thanks!", at: "Jul 2, 2026 · 16:10" },
    ],
  },
  {
    id: "TKT-4810",
    title: "Keyboard keys not working",
    description: "The 'E' and 'R' keys on the external keyboard are unresponsive.",
    category: "Hardware",
    status: "closed",
    createdAt: "Jun 28, 2026",
    comments: [
      { author: "Support Team", role: "Support", message: "Replacement keyboard delivered to your desk.", at: "Jun 29, 2026 · 10:00" },
    ],
  },
  {
    id: "TKT-4807",
    title: "Unable to access Finance shared drive",
    description: "Getting a permission denied error when opening \\\\fileserver\\finance.",
    category: "Account Access",
    status: "assigned",
    createdAt: "Jun 27, 2026",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jun 27, 2026 · 09:22" },
    ],
  },
];
