export type AssetCategory =
  | "Laptop"
  | "Monitor"
  | "Keyboard"
  | "Mouse"
  | "Headset"
  | "Docking Station"
  | "Charger";

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Laptop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Docking Station",
  "Charger",
];

export type AssetStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "assigned"
  | "return_requested"
  | "returned"
  | "cancelled";

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  assigned: "Assigned",
  return_requested: "Return Requested",
  returned: "Returned",
  cancelled: "Cancelled",
};

/** Placeholder identity of the currently signed-in employee.
 *  Replaced later by Spring Security / JWT. */
export const CURRENT_EMPLOYEE = "Alex Morgan";

/** Placeholder identity of the reviewing support engineer. */
export const CURRENT_SUPPORT = "Rahul Verma";

export type SupportComment = {
  author: string;
  date: string;
  message: string;
};

export type AssetRequest = {
  id: string;
  employee: string;
  category: AssetCategory;
  reason: string;
  requestedOn: string;
  status: AssetStatus;
  reviewedBy?: string;
  reviewedOn?: string;
  rejectionReason?: string;
  /** Assigned physical asset. */
  assetId?: string;
  assetName?: string;
  assignedOn?: string;
  returnRequestedOn?: string;
  returnedOn?: string;
  comments?: SupportComment[];
};

export const assets: AssetRequest[] = [
  {
    id: "AR-2051",
    employee: "Alex Morgan",
    category: "Laptop",
    reason: "Current laptop is running out of storage for local builds.",
    requestedOn: "Jul 8, 2026",
    status: "pending",
  },
  {
    id: "AR-2050",
    employee: "Alex Morgan",
    category: "Headset",
    reason: "Frequent client calls, need a noise-cancelling headset.",
    requestedOn: "Jul 6, 2026",
    status: "approved",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jul 7, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jul 7, 2026",
        message: "Approved. Will assign a Jabra Evolve2 65 shortly.",
      },
    ],
  },
  {
    id: "AR-2049",
    employee: "Alex Morgan",
    category: "Monitor",
    reason: "Second monitor for improved productivity.",
    requestedOn: "Jun 28, 2026",
    status: "assigned",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jun 29, 2026",
    assetId: "MON-DL2723-014",
    assetName: 'Dell UltraSharp 27" U2723QE',
    assignedOn: "Jul 1, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jun 29, 2026",
        message: "Approved for a second monitor.",
      },
      {
        author: "Rahul Verma",
        date: "Jul 1, 2026",
        message: "Assigned Dell U2723QE. Please collect from IT desk.",
      },
    ],
  },
  {
    id: "AR-2048",
    employee: "Alex Morgan",
    category: "Keyboard",
    reason: "Requesting a mechanical keyboard for long coding sessions.",
    requestedOn: "Jun 15, 2026",
    status: "rejected",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jun 16, 2026",
    rejectionReason:
      "Mechanical keyboards are not part of the standard hardware catalog.",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jun 16, 2026",
        message:
          "Not part of the standard catalog. Please raise a business justification via your manager if required.",
      },
    ],
  },
  {
    id: "AR-2040",
    employee: "Alex Morgan",
    category: "Docking Station",
    reason: "Home setup — need a docking station for the loaner laptop.",
    requestedOn: "May 20, 2026",
    status: "returned",
    reviewedBy: "Rahul Verma",
    reviewedOn: "May 21, 2026",
    assetId: "DCK-CAL-021",
    assetName: "CalDigit TS4 Thunderbolt Dock",
    assignedOn: "May 24, 2026",
    returnRequestedOn: "Jun 30, 2026",
    returnedOn: "Jul 2, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "May 21, 2026",
        message: "Approved. Assigning the CalDigit TS4.",
      },
      {
        author: "Rahul Verma",
        date: "Jul 2, 2026",
        message: "Asset received in good condition. Return complete.",
      },
    ],
  },

  // Other employees — visible to the Support Engineer
  {
    id: "AR-2055",
    employee: "Jamal Turner",
    category: "Laptop",
    reason: "Joining the mobile team; need a MacBook for iOS builds.",
    requestedOn: "Jul 9, 2026",
    status: "pending",
  },
  {
    id: "AR-2054",
    employee: "Nora Klein",
    category: "Monitor",
    reason: "Working on design mocks, need a colour-accurate display.",
    requestedOn: "Jul 8, 2026",
    status: "pending",
  },
  {
    id: "AR-2053",
    employee: "Ivan Rossi",
    category: "Charger",
    reason: "Original charger stopped working.",
    requestedOn: "Jul 8, 2026",
    status: "pending",
  },
  {
    id: "AR-2052",
    employee: "Meera Patel",
    category: "Mouse",
    reason: "Ergonomic mouse to reduce wrist strain.",
    requestedOn: "Jul 7, 2026",
    status: "approved",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jul 8, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jul 8, 2026",
        message: "Approved. Waiting for stock — Logitech MX Vertical.",
      },
    ],
  },
  {
    id: "AR-2047",
    employee: "Sara Lopez",
    category: "Laptop",
    reason: "Replacement for aging development laptop.",
    requestedOn: "Jul 5, 2026",
    status: "assigned",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jul 6, 2026",
    assetId: "LAP-MBP16-058",
    assetName: 'Apple MacBook Pro 16" M3 Pro',
    assignedOn: "Jul 8, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jul 6, 2026",
        message: "High-performance laptop approved.",
      },
      {
        author: "Rahul Verma",
        date: "Jul 8, 2026",
        message: "Assigned MacBook Pro 16 M3 Pro.",
      },
    ],
  },
  {
    id: "AR-2046",
    employee: "Jamal Turner",
    category: "Headset",
    reason: "Client interviews — need a good headset.",
    requestedOn: "Jul 2, 2026",
    status: "assigned",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jul 3, 2026",
    assetId: "HST-JAB65-032",
    assetName: "Jabra Evolve2 65",
    assignedOn: "Jul 4, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jul 4, 2026",
        message: "Assigned. Please acknowledge receipt.",
      },
    ],
  },
  {
    id: "AR-2045",
    employee: "Ivan Rossi",
    category: "Docking Station",
    reason: "New workstation setup.",
    requestedOn: "Jun 25, 2026",
    status: "return_requested",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jun 26, 2026",
    assetId: "DCK-CAL-018",
    assetName: "CalDigit TS4 Thunderbolt Dock",
    assignedOn: "Jun 28, 2026",
    returnRequestedOn: "Jul 8, 2026",
    comments: [
      {
        author: "Rahul Verma",
        date: "Jun 26, 2026",
        message: "Approved.",
      },
      {
        author: "Ivan Rossi",
        date: "Jul 8, 2026",
        message: "Return requested — no longer required.",
      },
    ],
  },
  {
    id: "AR-2042",
    employee: "Meera Patel",
    category: "Keyboard",
    reason: "Wireless keyboard for hot-desk setup.",
    requestedOn: "Jun 12, 2026",
    status: "returned",
    reviewedBy: "Rahul Verma",
    reviewedOn: "Jun 13, 2026",
    assetId: "KBD-MX-011",
    assetName: "Logitech MX Keys",
    assignedOn: "Jun 15, 2026",
    returnRequestedOn: "Jul 1, 2026",
    returnedOn: "Jul 3, 2026",
  },
  {
    id: "AR-2041",
    employee: "Sara Lopez",
    category: "Mouse",
    reason: "Backup mouse.",
    requestedOn: "May 30, 2026",
    status: "cancelled",
    comments: [
      {
        author: "Sara Lopez",
        date: "Jun 1, 2026",
        message: "Cancelled — found a spare in the office.",
      },
    ],
  },
];

/** Business rule: an employee cannot request the same category
 *  while one of that type is already assigned to them. */
export function hasActiveAssignment(
  employee: string,
  category: AssetCategory,
): boolean {
  return assets.some(
    (a) =>
      a.employee === employee &&
      a.category === category &&
      (a.status === "assigned" || a.status === "return_requested"),
  );
}

export const ASSET_STAGES: { key: string; label: string }[] = [
  { key: "submitted", label: "Request Submitted" },
  { key: "review", label: "Under Review" },
  { key: "decision", label: "Approved" },
  { key: "assigned", label: "Assigned" },
  { key: "return_requested", label: "Return Requested" },
  { key: "returned", label: "Returned" },
];
