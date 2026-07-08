export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Network"
  | "Account Access"
  | "Printer"
  | "Other";

export type TicketStatus = "open" | "assigned" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

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

/** Support engineers a Support user can assign tickets to. Placeholder data. */
export const SUPPORT_ENGINEERS = ["Rahul", "Priya", "Arjun"] as const;
export type SupportEngineer = (typeof SUPPORT_ENGINEERS)[number];

export const TICKET_PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

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

export type InternalNote = {
  author: SupportEngineer;
  message: string;
  at: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: SupportEngineer | null;
  createdAt: string;
  updatedAt: string;
  reporter: string;
  attachment?: string;
  comments: TicketComment[];
  internalNotes: InternalNote[];
};

export const tickets: Ticket[] = [
  {
    id: "TKT-4821",
    title: "Microsoft Outlook crashes on startup",
    description:
      "Outlook closes immediately after the splash screen. Restarted the laptop twice, issue still persists. Blocks access to all mail and calendar.",
    category: "Software",
    status: "in_progress",
    priority: "High",
    assignee: "Rahul",
    createdAt: "Jul 5, 2026",
    updatedAt: "Jul 6, 2026 · 09:20",
    reporter: "Alex Morgan",
    attachment: "outlook-error.png",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request and are looking into it.", at: "Jul 5, 2026 · 10:12" },
      { author: "Alex Morgan", role: "Employee", message: "Thank you. Let me know if you need remote access.", at: "Jul 5, 2026 · 10:34" },
      { author: "Rahul", role: "Support", message: "Investigating now. I'll try recreating your Outlook profile.", at: "Jul 5, 2026 · 11:02" },
    ],
    internalNotes: [
      { author: "Rahul", message: "Checked Outlook event logs — repeated MAPI errors.", at: "Jul 5, 2026 · 11:20" },
      { author: "Rahul", message: "Possible profile corruption. Testing profile recreation on a test account first.", at: "Jul 6, 2026 · 09:20" },
    ],
  },
  {
    id: "TKT-4820",
    title: "Laptop battery draining quickly",
    description: "Battery drops from 100% to 20% in under 90 minutes even on light workload.",
    category: "Hardware",
    status: "assigned",
    priority: "Medium",
    assignee: "Priya",
    createdAt: "Jul 4, 2026",
    updatedAt: "Jul 4, 2026 · 16:05",
    reporter: "Jamal Turner",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 4, 2026 · 14:20" },
      { author: "Priya", role: "Support", message: "Assigned to me. I'll run a battery health check tomorrow.", at: "Jul 4, 2026 · 16:05" },
    ],
    internalNotes: [
      { author: "Priya", message: "Device is 3 years old — may need battery replacement.", at: "Jul 4, 2026 · 16:10" },
    ],
  },
  {
    id: "TKT-4818",
    title: "VPN connection issue",
    description: "VPN client fails to connect from home network. Error code 812.",
    category: "Network",
    status: "open",
    priority: "High",
    assignee: null,
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 09:15",
    reporter: "Nora Klein",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 3, 2026 · 09:15" },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4817",
    title: "Cannot install approved design software",
    description: "Installer requires admin rights that my account doesn't have.",
    category: "Software",
    status: "open",
    priority: "Low",
    assignee: null,
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 08:40",
    reporter: "Ivan Rossi",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 3, 2026 · 08:40" },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4816",
    title: "Payroll system throws 500 error",
    description: "Getting HTTP 500 when opening the payroll dashboard. Blocks month-end close.",
    category: "Software",
    status: "open",
    priority: "Critical",
    assignee: null,
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 08:10",
    reporter: "Meera Patel",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 3, 2026 · 08:10" },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4815",
    title: "Printer not responding — Floor 3",
    description: "Shared printer on the third floor is offline. Print jobs stack in the queue but never process.",
    category: "Printer",
    status: "resolved",
    priority: "Medium",
    assignee: "Rahul",
    createdAt: "Jul 2, 2026",
    updatedAt: "Jul 8, 2026 · 10:00",
    reporter: "Alex Morgan",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 2, 2026 · 11:00" },
      { author: "Rahul", role: "Support", message: "Printer firmware updated. Please try again.", at: "Jul 2, 2026 · 15:40" },
      { author: "Alex Morgan", role: "Employee", message: "Working now, thanks!", at: "Jul 2, 2026 · 16:10" },
    ],
    internalNotes: [
      { author: "Rahul", message: "Firmware was 2 versions behind. Scheduled a fleet-wide update.", at: "Jul 2, 2026 · 15:45" },
    ],
  },
  {
    id: "TKT-4814",
    title: "Second monitor not detected",
    description: "External monitor connected via HDMI is not recognized after latest OS update.",
    category: "Hardware",
    status: "in_progress",
    priority: "Medium",
    assignee: "Rahul",
    createdAt: "Jul 1, 2026",
    updatedAt: "Jul 8, 2026 · 08:15",
    reporter: "Sara Lopez",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jul 1, 2026 · 12:00" },
      { author: "Rahul", role: "Support", message: "I'll roll back the graphics driver — please keep the monitor plugged in.", at: "Jul 8, 2026 · 08:15" },
    ],
    internalNotes: [
      { author: "Rahul", message: "Suspect graphics driver regression from the latest OS patch.", at: "Jul 8, 2026 · 08:16" },
    ],
  },
  {
    id: "TKT-4810",
    title: "Keyboard keys not working",
    description: "The 'E' and 'R' keys on the external keyboard are unresponsive.",
    category: "Hardware",
    status: "closed",
    priority: "Low",
    assignee: "Priya",
    createdAt: "Jun 28, 2026",
    updatedAt: "Jun 29, 2026 · 10:00",
    reporter: "Alex Morgan",
    comments: [
      { author: "Priya", role: "Support", message: "Replacement keyboard delivered to your desk.", at: "Jun 29, 2026 · 10:00" },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4807",
    title: "Unable to access Finance shared drive",
    description: "Getting a permission denied error when opening \\\\fileserver\\finance.",
    category: "Account Access",
    status: "assigned",
    priority: "High",
    assignee: "Arjun",
    createdAt: "Jun 27, 2026",
    updatedAt: "Jun 27, 2026 · 10:00",
    reporter: "Jamal Turner",
    comments: [
      { author: "Support Team", role: "Support", message: "We've received your request.", at: "Jun 27, 2026 · 09:22" },
      { author: "Arjun", role: "Support", message: "Requesting group membership from the Finance owner.", at: "Jun 27, 2026 · 10:00" },
    ],
    internalNotes: [
      { author: "Arjun", message: "Waiting on approval from Finance group owner.", at: "Jun 27, 2026 · 10:02" },
    ],
  },
];
