import type { Role } from "@/context/RoleContext";

export type UserProfile = {
  initials: string;
  fullName: string;
  employeeId: string;
  department: string;
  designation: string;
  companyEmail: string;
  phone: string;
  username: string;
  accountStatus: "active" | "inactive";
  lastLogin: string;
  emergencyContact: string;
  address: string;
  location: string;
  photoUrl?: string;
  inAppNotifications: boolean;
  emailNotifications: boolean;
};

export type ActivitySummary = {
  openTickets: number;
  leaveRequests: number;
  assignedAssets: number;
  upcomingMeetings: number;
};

/** Profile of the signed-in user for each persona. Replaced later by the
 *  authenticated user returned from the backend. */
export const PROFILES: Record<Role, UserProfile> = {
  employee: {
    initials: "AM",
    fullName: "Alex Morgan",
    employeeId: "EMP-00214",
    department: "Engineering",
    designation: "Software Engineer",
    companyEmail: "alex.morgan@flowdesk.co",
    phone: "+1 555-0199",
    username: "alex.morgan",
    accountStatus: "active",
    lastLogin: "Today at 09:12 · HQ",
    emergencyContact: "Taylor Morgan · +1 555-0188",
    address: "742 Evergreen Terrace, San Francisco, CA",
    location: "Main HQ",
    inAppNotifications: true,
    emailNotifications: true,
  },
  support: {
    initials: "RV",
    fullName: "Rahul Verma",
    employeeId: "EMP-00108",
    department: "IT Support",
    designation: "Support Lead",
    companyEmail: "rahul.verma@flowdesk.co",
    phone: "+91 98450 33127",
    username: "rahul.verma",
    accountStatus: "active",
    lastLogin: "Today at 08:41 · Bengaluru Office",
    emergencyContact: "Sneha Verma · +91 98450 77219",
    address: "12 Indiranagar 100ft Road, Bengaluru 560038, India",
    location: "Bengaluru Office",
    inAppNotifications: true,
    emailNotifications: false,
  },
  manager: {
    initials: "SC",
    fullName: "Sarah Connor",
    employeeId: "EMP-00005",
    department: "People Operations",
    designation: "Engineering Director / HR",
    companyEmail: "sarah.connor@flowdesk.co",
    phone: "+1 555-0144",
    username: "sarah.connor",
    accountStatus: "active",
    lastLogin: "Today at 07:30 · HQ",
    emergencyContact: "John Connor · +1 555-0133",
    address: "100 Cyberdyne Way, San Francisco, CA",
    location: "Main HQ",
    inAppNotifications: true,
    emailNotifications: true,
  },
};

export const ACTIVITY_SUMMARY: Record<Role, ActivitySummary> = {
  employee: { openTickets: 2, leaveRequests: 4, assignedAssets: 3, upcomingMeetings: 2 },
  support: { openTickets: 6, leaveRequests: 1, assignedAssets: 4, upcomingMeetings: 3 },
  manager: { openTickets: 1, leaveRequests: 8, assignedAssets: 2, upcomingMeetings: 5 },
};

export const BACKEND_PENDING_NOTE = "Available after backend integration.";
