export type AnnouncementCategory = "HR" | "IT" | "Operations" | "Security" | "General";

export const CATEGORY_OPTIONS: AnnouncementCategory[] = [
  "HR",
  "IT",
  "Operations",
  "Security",
  "General",
];

export type AnnouncementPriority = "high" | "medium" | "low";

export const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export type AnnouncementStatus = "active" | "archived";

export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  active: "Active",
  archived: "Archived",
};

export type Audience =
  "All Employees" | "Engineering" | "Sales" | "Human Resources" | "Finance" | "Managers";

export const AUDIENCE_OPTIONS: Audience[] = [
  "All Employees",
  "Engineering",
  "Sales",
  "Human Resources",
  "Finance",
  "Managers",
];

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audience: Audience;
  author: string;
  authorRole: string;
  /** ISO YYYY-MM-DD */
  createdOn: string;
  publishedOn: string;
  expiresOn?: string;
  pinned: boolean;
  read: boolean;
  attachment?: string;
};

/** Reference "today" for deterministic mock data. */
export const TODAY_ISO = "2026-08-05";

export const announcements: Announcement[] = [
  {
    id: "ANN-1041",
    title: "Mandatory Security Awareness Training — Complete by August 22",
    summary:
      "All employees must complete the Q3 phishing and data-handling training module in the learning portal.",
    body: "Following the security review in July, every employee is required to complete the Q3 Security Awareness Training. The module covers phishing recognition, secure handling of customer data, password hygiene and the updated incident reporting process.\n\nThe course takes approximately 40 minutes and can be paused at any point. Completion is tracked automatically — no confirmation email is needed. Managers will receive a compliance summary on August 24 for anyone still outstanding.",
    category: "Security",
    priority: "high",
    status: "active",
    audience: "All Employees",
    author: "Neha Kapoor",
    authorRole: "Head of Information Security",
    createdOn: "2026-07-30",
    publishedOn: "2026-08-01",
    expiresOn: "2026-08-22",
    pinned: true,
    read: false,
    attachment: "security-training-guide.pdf",
  },
  {
    id: "ANN-1040",
    title: "Office Network Maintenance — Saturday, August 8",
    summary:
      "Core switches will be replaced between 8:00 PM and 2:00 AM. Wi-Fi and VPN access will be intermittent.",
    body: "The IT infrastructure team will replace the core network switches on the 3rd and 4th floors this Saturday, August 8, between 8:00 PM and 2:00 AM.\n\nDuring this window expect intermittent Wi-Fi, VPN and printer access. Cloud tools (email, chat, ticketing) remain available from outside the office. If you plan to work from the office that evening, please save work locally and reconnect after the window.\n\nRaise a ticket under IT → Network if connectivity does not recover by Sunday morning.",
    category: "IT",
    priority: "high",
    status: "active",
    audience: "All Employees",
    author: "Rahul Verma",
    authorRole: "Support Engineering Lead",
    createdOn: "2026-08-02",
    publishedOn: "2026-08-03",
    expiresOn: "2026-08-09",
    pinned: true,
    read: true,
    attachment: "maintenance-window.pdf",
  },
  {
    id: "ANN-1039",
    title: "Updated Leave Policy Effective September 1",
    summary:
      "Carry-forward limits increase to 12 days and a new 5-day caregiver leave category is introduced.",
    body: "The revised leave policy takes effect on September 1, 2026. Key changes:\n\n• Annual carry-forward increases from 8 to 12 days.\n• A new caregiver leave category grants 5 paid days per year.\n• Sick leave beyond 3 consecutive days requires medical documentation.\n• Leave requests should be submitted at least 5 working days in advance where possible.\n\nBalances in FlowDesk will be recalculated automatically on September 1. Reach out to HR with questions about existing approved requests.",
    category: "HR",
    priority: "medium",
    status: "active",
    audience: "All Employees",
    author: "Priya Nair",
    authorRole: "HR Business Partner",
    createdOn: "2026-07-24",
    publishedOn: "2026-07-28",
    expiresOn: "2026-09-30",
    pinned: false,
    read: false,
    attachment: "leave-policy-2026.pdf",
  },
  {
    id: "ANN-1038",
    title: "New Asset Request Workflow in FlowDesk",
    summary:
      "Hardware requests now route through the Assets module with support-engineer approval and return verification.",
    body: "Hardware and peripheral requests are no longer handled over email. Submit requests from the Assets module; a support engineer reviews, approves and assigns the specific device.\n\nWhen returning equipment, raise a return request so the asset can be verified and released back to inventory. Requests raised over email after August 10 will be redirected to FlowDesk.",
    category: "Operations",
    priority: "medium",
    status: "active",
    audience: "All Employees",
    author: "Arjun Mehta",
    authorRole: "Workplace Operations Manager",
    createdOn: "2026-07-18",
    publishedOn: "2026-07-20",
    pinned: false,
    read: true,
  },
  {
    id: "ANN-1037",
    title: "Quarterly Town Hall — August 14, 4:00 PM",
    summary:
      "Leadership will present Q2 results, the H2 roadmap and answer submitted questions in the Horizon room.",
    body: "Join the quarterly town hall on Friday, August 14 at 4:00 PM in the Horizon meeting room, with a live stream for remote colleagues.\n\nAgenda:\n1. Q2 business review\n2. H2 product roadmap\n3. Hiring and workplace updates\n4. Open Q&A\n\nSubmit questions in advance through the internal form; anonymous submissions are welcome.",
    category: "General",
    priority: "medium",
    status: "active",
    audience: "All Employees",
    author: "Daniel Osei",
    authorRole: "Chief Operating Officer",
    createdOn: "2026-08-01",
    publishedOn: "2026-08-04",
    expiresOn: "2026-08-14",
    pinned: false,
    read: false,
  },
  {
    id: "ANN-1036",
    title: "Engineering On-Call Rotation for August",
    summary:
      "The August on-call schedule is published. Primary and secondary responders rotate every Monday.",
    body: "The August on-call rotation is now published in the engineering handbook. Primary and secondary responders rotate weekly, starting Monday at 10:00 AM.\n\nIf you cannot cover an assigned week, arrange a swap at least 5 days in advance and update the schedule. Escalation contacts and severity definitions are unchanged from July.",
    category: "IT",
    priority: "low",
    status: "active",
    audience: "Engineering",
    author: "Sofia Almeida",
    authorRole: "Engineering Manager",
    createdOn: "2026-07-27",
    publishedOn: "2026-07-29",
    expiresOn: "2026-08-31",
    pinned: false,
    read: true,
    attachment: "oncall-august.csv",
  },
  {
    id: "ANN-1035",
    title: "Access Badge Re-Issue for Floors 3 and 4",
    summary:
      "Badges issued before 2024 stop working on August 18. Collect a replacement from the front desk.",
    body: "As part of the physical access upgrade, badges issued before January 2024 will stop working on August 18. Visit the front desk between 9:30 AM and 5:30 PM with your old badge and employee ID to collect a replacement.\n\nVisitor and contractor badges are handled separately by the operations team.",
    category: "Security",
    priority: "medium",
    status: "active",
    audience: "All Employees",
    author: "Neha Kapoor",
    authorRole: "Head of Information Security",
    createdOn: "2026-07-15",
    publishedOn: "2026-07-16",
    expiresOn: "2026-08-18",
    pinned: false,
    read: true,
  },
  {
    id: "ANN-1034",
    title: "Manager Guidance: Mid-Year Performance Conversations",
    summary: "Mid-year review conversations should be documented and closed out by August 29.",
    body: "Managers should complete mid-year performance conversations with each direct report by August 29. Use the shared conversation template and record outcomes, development goals and any support needs.\n\nHR will host two 30-minute calibration sessions in the final week of August. Escalate concerns about performance or retention risk to your HR partner before those sessions.",
    category: "HR",
    priority: "medium",
    status: "active",
    audience: "Managers",
    author: "Priya Nair",
    authorRole: "HR Business Partner",
    createdOn: "2026-08-01",
    publishedOn: "2026-08-03",
    expiresOn: "2026-08-29",
    pinned: false,
    read: false,
    attachment: "midyear-template.docx",
  },
  {
    id: "ANN-1033",
    title: "Expense Submission Cut-Off for July",
    summary:
      "July expense claims closed on August 3. Late claims will be processed in the September cycle.",
    body: "July expense claims closed on August 3. Anything submitted after the cut-off moves to the September reimbursement cycle.\n\nPlease attach itemised receipts and select the correct cost centre — missing cost centres are the most common cause of rejected claims. Finance office hours are Tuesdays, 3:00–4:00 PM.",
    category: "Operations",
    priority: "low",
    status: "active",
    audience: "Finance",
    author: "Marcus Lin",
    authorRole: "Finance Operations Lead",
    createdOn: "2026-07-10",
    publishedOn: "2026-07-12",
    expiresOn: "2026-08-30",
    pinned: false,
    read: true,
  },
  {
    id: "ANN-1032",
    title: "Summer Offsite Recap and Photo Gallery",
    summary:
      "Thanks to everyone who joined the July offsite. Photos and the feedback summary are now available.",
    body: "Thank you to the 180 colleagues who joined the summer offsite in Lonavala. Attendance feedback averaged 4.6 out of 5, with the cross-team workshops rated highest.\n\nPhotos are available in the shared gallery, and the full feedback summary is attached. Planning for the winter offsite begins in October — volunteers for the organising committee are welcome.",
    category: "General",
    priority: "low",
    status: "active",
    audience: "Sales",
    author: "Arjun Mehta",
    authorRole: "Workplace Operations Manager",
    createdOn: "2026-07-05",
    publishedOn: "2026-07-07",
    pinned: false,
    read: true,
    attachment: "offsite-feedback.pdf",
  },
];

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Pinned first, then most recently published. */
export function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.publishedOn.localeCompare(a.publishedOn);
  });
}
