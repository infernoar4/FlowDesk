export type TicketCategory =
  "Hardware" | "Software" | "Network" | "Account Access" | "Printer" | "Other";

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

/** Support engineers a Support user can assign tickets to. */
export const SUPPORT_ENGINEERS = [
  "Rahul Verma",
  "Priya Nair",
  "Arjun Mehta",
  "Vikram Rao",
  "Ananya Sen",
  "Kabir Sharma",
  "Neha Kapoor",
  "Aryan Giri",
] as const;
export type SupportEngineer = (typeof SUPPORT_ENGINEERS)[number] | string;

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
  role: "Employee" | "Support";
  message: string;
  at: string;
};

export type InternalNote = {
  author: string;
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
  assignee: string | null;
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
    assignee: "Rahul Verma",
    createdAt: "Jul 5, 2026",
    updatedAt: "Jul 6, 2026 · 09:20",
    reporter: "Alex Morgan",
    attachment: "outlook-error.png",
    comments: [
      {
        author: "Support Team",
        role: "Support",
        message: "We've received your request and are looking into it.",
        at: "Jul 5, 2026 · 10:12",
      },
      {
        author: "Alex Morgan",
        role: "Employee",
        message: "Thank you. Let me know if you need remote access.",
        at: "Jul 5, 2026 · 10:34",
      },
      {
        author: "Rahul Verma",
        role: "Support",
        message: "Investigating now. I'll try recreating your Outlook profile.",
        at: "Jul 5, 2026 · 11:02",
      },
    ],
    internalNotes: [
      {
        author: "Rahul Verma",
        message: "Checked Outlook event logs — repeated MAPI errors.",
        at: "Jul 5, 2026 · 11:20",
      },
      {
        author: "Rahul Verma",
        message: "Possible profile corruption. Testing profile recreation on a test account first.",
        at: "Jul 6, 2026 · 09:20",
      },
    ],
  },
  {
    id: "TKT-4820",
    title: "Laptop battery draining quickly",
    description: "Battery drops from 100% to 20% in under 90 minutes even on light workload.",
    category: "Hardware",
    status: "assigned",
    priority: "Medium",
    assignee: "Priya Nair",
    createdAt: "Jul 4, 2026",
    updatedAt: "Jul 4, 2026 · 16:05",
    reporter: "David Miller",
    comments: [
      {
        author: "Support Team",
        role: "Support",
        message: "We've received your request.",
        at: "Jul 4, 2026 · 14:20",
      },
      {
        author: "Priya Nair",
        role: "Support",
        message: "Assigned to me. I'll run a battery health check tomorrow.",
        at: "Jul 4, 2026 · 16:05",
      },
    ],
    internalNotes: [
      {
        author: "Priya Nair",
        message: "Device is 3 years old — may need battery replacement.",
        at: "Jul 4, 2026 · 16:10",
      },
    ],
  },
  {
    id: "TKT-4818",
    title: "VPN connection issue",
    description: "VPN client fails to connect from home network. Error code 812.",
    category: "Network",
    status: "assigned",
    priority: "High",
    assignee: "Vikram Rao",
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 09:15",
    reporter: "Emily Chen",
    comments: [
      {
        author: "FlowDesk Auto-Assign System",
        role: "Support",
        message:
          "Ticket automatically assigned to Vikram Rao based on active workload load-balancing algorithm.",
        at: "Jul 3, 2026 · 09:15",
      },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4817",
    title: "Cannot install approved design software",
    description: "Installer requires admin rights that my account doesn't have.",
    category: "Software",
    status: "assigned",
    priority: "Low",
    assignee: "Arjun Mehta",
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 08:40",
    reporter: "Michael Scott",
    comments: [
      {
        author: "FlowDesk Auto-Assign System",
        role: "Support",
        message:
          "Ticket automatically assigned to Arjun Mehta based on active workload load-balancing algorithm.",
        at: "Jul 3, 2026 · 08:40",
      },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4816",
    title: "Payroll system throws 500 error",
    description: "Getting HTTP 500 when opening the payroll dashboard. Blocks month-end close.",
    category: "Software",
    status: "assigned",
    priority: "Critical",
    assignee: "Ananya Sen",
    createdAt: "Jul 3, 2026",
    updatedAt: "Jul 3, 2026 · 08:10",
    reporter: "Sophia Martinez",
    comments: [
      {
        author: "FlowDesk Auto-Assign System",
        role: "Support",
        message:
          "Ticket automatically assigned to Ananya Sen based on active workload load-balancing algorithm.",
        at: "Jul 3, 2026 · 08:10",
      },
    ],
    internalNotes: [],
  },
  {
    id: "TKT-4815",
    title: "Printer not responding — Floor 3",
    description:
      "Shared printer on the third floor is offline. Print jobs stack in the queue but never process.",
    category: "Printer",
    status: "resolved",
    priority: "Medium",
    assignee: "Rahul Verma",
    createdAt: "Jul 2, 2026",
    updatedAt: "Jul 8, 2026 · 10:00",
    reporter: "Alex Morgan",
    comments: [
      {
        author: "Support Team",
        role: "Support",
        message: "We've received your request.",
        at: "Jul 2, 2026 · 11:00",
      },
      {
        author: "Rahul Verma",
        role: "Support",
        message: "Printer firmware updated. Please try again.",
        at: "Jul 2, 2026 · 15:40",
      },
      {
        author: "Alex Morgan",
        role: "Employee",
        message: "Working now, thanks!",
        at: "Jul 2, 2026 · 16:10",
      },
    ],
    internalNotes: [
      {
        author: "Rahul Verma",
        message: "Firmware was 2 versions behind. Scheduled a fleet-wide update.",
        at: "Jul 2, 2026 · 15:45",
      },
    ],
  },
  {
    id: "TKT-4814",
    title: "Second monitor not detected",
    description: "External monitor connected via HDMI is not recognized after latest OS update.",
    category: "Hardware",
    status: "in_progress",
    priority: "Medium",
    assignee: "Kabir Sharma",
    createdAt: "Jul 1, 2026",
    updatedAt: "Jul 8, 2026 · 08:15",
    reporter: "Jessica Taylor",
    comments: [
      {
        author: "Support Team",
        role: "Support",
        message: "We've received your request.",
        at: "Jul 1, 2026 · 12:00",
      },
      {
        author: "Kabir Sharma",
        role: "Support",
        message: "I'll roll back the graphics driver — please keep the monitor plugged in.",
        at: "Jul 8, 2026 · 08:15",
      },
    ],
    internalNotes: [
      {
        author: "Kabir Sharma",
        message: "Suspect graphics driver regression from the latest OS patch.",
        at: "Jul 8, 2026 · 08:16",
      },
    ],
  },
  {
    id: "TKT-4810",
    title: "Keyboard keys not working",
    description: "The 'E' and 'R' keys on the external keyboard are unresponsive.",
    category: "Hardware",
    status: "closed",
    priority: "Low",
    assignee: "Neha Kapoor",
    createdAt: "Jun 28, 2026",
    updatedAt: "Jun 29, 2026 · 10:00",
    reporter: "Alex Morgan",
    comments: [
      {
        author: "Neha Kapoor",
        role: "Support",
        message: "Replacement keyboard delivered to your desk.",
        at: "Jun 29, 2026 · 10:00",
      },
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
    assignee: "Arjun Mehta",
    createdAt: "Jun 27, 2026",
    updatedAt: "Jun 27, 2026 · 10:00",
    reporter: "Daniel Lee",
    comments: [
      {
        author: "Support Team",
        role: "Support",
        message: "We've received your request.",
        at: "Jun 27, 2026 · 09:22",
      },
      {
        author: "Arjun Mehta",
        role: "Support",
        message: "Requesting group membership from the Finance owner.",
        at: "Jun 27, 2026 · 10:00",
      },
    ],
    internalNotes: [
      {
        author: "Arjun Mehta",
        message: "Sent permission approval request to Finance Director.",
        at: "Jun 27, 2026 · 10:05",
      },
    ],
  },
];
