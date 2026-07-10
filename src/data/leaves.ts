export type LeaveType = "Casual Leave" | "Sick Leave" | "Work From Home" | "Half Day";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export const LEAVE_TYPES: LeaveType[] = [
  "Casual Leave",
  "Sick Leave",
  "Work From Home",
  "Half Day",
];

/** Placeholder identity of the currently signed-in employee.
 *  Replaced later by Spring Security / JWT. */
export const CURRENT_EMPLOYEE = "Alex Morgan";

/** Placeholder identity of the reviewing manager. */
export const CURRENT_MANAGER = "Priya Kapoor";

export type LeaveBalance = {
  type: Exclude<LeaveType, "Half Day">;
  remaining: number | "Unlimited";
  total: number | "Unlimited";
};

export const LEAVE_BALANCES: LeaveBalance[] = [
  { type: "Casual Leave", remaining: 8, total: 12 },
  { type: "Sick Leave", remaining: 5, total: 10 },
  { type: "Work From Home", remaining: "Unlimited", total: "Unlimited" },
];

export type LeaveRequest = {
  id: string;
  employee: string;
  type: LeaveType;
  startDate: string; // Human-readable placeholder date
  endDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedOn?: string;
  managerComment?: string;
  rejectionReason?: string;
};

export const LEAVE_STAGES: { key: LeaveStatus | "requested"; label: string }[] = [
  { key: "requested", label: "Leave Requested" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Decision" },
];

export const leaves: LeaveRequest[] = [
  {
    id: "LR-1042",
    employee: "Alex Morgan",
    type: "Casual Leave",
    startDate: "Jul 15, 2026",
    endDate: "Jul 16, 2026",
    days: 2,
    reason: "Family function out of town.",
    appliedOn: "Jul 6, 2026",
    status: "pending",
  },
  {
    id: "LR-1041",
    employee: "Alex Morgan",
    type: "Work From Home",
    startDate: "Jul 10, 2026",
    endDate: "Jul 10, 2026",
    days: 1,
    reason: "Electrician visit at home.",
    appliedOn: "Jul 5, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jul 5, 2026",
    managerComment: "Approved. Please stay reachable on Slack.",
  },
  {
    id: "LR-1039",
    employee: "Alex Morgan",
    type: "Sick Leave",
    startDate: "Jun 24, 2026",
    endDate: "Jun 25, 2026",
    days: 2,
    reason: "Viral fever. Consulting doctor.",
    appliedOn: "Jun 23, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jun 23, 2026",
    managerComment: "Take rest. Get well soon.",
  },
  {
    id: "LR-1035",
    employee: "Alex Morgan",
    type: "Casual Leave",
    startDate: "Jun 12, 2026",
    endDate: "Jun 12, 2026",
    days: 1,
    reason: "Personal errand.",
    appliedOn: "Jun 10, 2026",
    status: "cancelled",
    managerComment: "Cancelled by employee before start date.",
  },
  {
    id: "LR-1030",
    employee: "Alex Morgan",
    type: "Casual Leave",
    startDate: "May 28, 2026",
    endDate: "May 30, 2026",
    days: 3,
    reason: "Short vacation.",
    appliedOn: "May 20, 2026",
    status: "rejected",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "May 21, 2026",
    rejectionReason: "Overlaps with the Q2 release freeze window.",
  },
  {
    id: "LR-1025",
    employee: "Alex Morgan",
    type: "Half Day",
    startDate: "May 15, 2026",
    endDate: "May 15, 2026",
    days: 0.5,
    reason: "Bank appointment in the afternoon.",
    appliedOn: "May 14, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "May 14, 2026",
  },

  // Other employees — visible to the Manager
  {
    id: "LR-1046",
    employee: "Jamal Turner",
    type: "Casual Leave",
    startDate: "Jul 20, 2026",
    endDate: "Jul 22, 2026",
    days: 3,
    reason: "Sister's wedding.",
    appliedOn: "Jul 7, 2026",
    status: "pending",
  },
  {
    id: "LR-1045",
    employee: "Nora Klein",
    type: "Sick Leave",
    startDate: "Jul 9, 2026",
    endDate: "Jul 9, 2026",
    days: 1,
    reason: "Migraine, unable to work today.",
    appliedOn: "Jul 9, 2026",
    status: "pending",
  },
  {
    id: "LR-1044",
    employee: "Ivan Rossi",
    type: "Work From Home",
    startDate: "Jul 11, 2026",
    endDate: "Jul 11, 2026",
    days: 1,
    reason: "Plumber visit scheduled.",
    appliedOn: "Jul 6, 2026",
    status: "pending",
  },
  {
    id: "LR-1043",
    employee: "Meera Patel",
    type: "Half Day",
    startDate: "Jul 8, 2026",
    endDate: "Jul 8, 2026",
    days: 0.5,
    reason: "Parent-teacher meeting.",
    appliedOn: "Jul 7, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jul 8, 2026",
    managerComment: "Approved.",
  },
  {
    id: "LR-1040",
    employee: "Sara Lopez",
    type: "Casual Leave",
    startDate: "Jul 8, 2026",
    endDate: "Jul 9, 2026",
    days: 2,
    reason: "Family emergency.",
    appliedOn: "Jul 6, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jul 8, 2026",
    managerComment: "Approved. Take care.",
  },
  {
    id: "LR-1038",
    employee: "Jamal Turner",
    type: "Sick Leave",
    startDate: "Jun 30, 2026",
    endDate: "Jun 30, 2026",
    days: 1,
    reason: "Food poisoning.",
    appliedOn: "Jun 30, 2026",
    status: "approved",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jun 30, 2026",
  },
  {
    id: "LR-1037",
    employee: "Ivan Rossi",
    type: "Casual Leave",
    startDate: "Jun 26, 2026",
    endDate: "Jun 27, 2026",
    days: 2,
    reason: "Weekend trip.",
    appliedOn: "Jun 20, 2026",
    status: "rejected",
    reviewedBy: "Priya Kapoor",
    reviewedOn: "Jun 21, 2026",
    rejectionReason: "Two team members already on leave the same days.",
  },
];

/** Simple placeholder overlap check used only by the Apply Leave form. */
export function overlapsExisting(
  employee: string,
  startISO: string,
  endISO: string,
): boolean {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  return leaves.some((l) => {
    if (l.employee !== employee) return false;
    if (l.status === "rejected" || l.status === "cancelled") return false;
    const ls = new Date(l.startDate).getTime();
    const le = new Date(l.endDate).getTime();
    if (Number.isNaN(ls) || Number.isNaN(le)) return false;
    return s <= le && e >= ls;
  });
}
