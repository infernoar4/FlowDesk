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
    initials: "AL",
    fullName: "Alex Lee",
    employeeId: "EMP-00214",
    department: "Operations",
    designation: "Operations Manager",
    companyEmail: "alex.lee@flowdesk.co",
    phone: "+49 151 2244 8890",
    username: "alex.lee",
    accountStatus: "active",
    lastLogin: "Today at 09:12 · Berlin HQ",
    emergencyContact: "Marta Lee · +49 151 8890 2244",
    address: "Torstraße 118, 10119 Berlin, Germany",
    location: "Berlin HQ",
    inAppNotifications: true,
    emailNotifications: true,
  },
  support: {
    initials: "RK",
    fullName: "Rahul Kumar",
    employeeId: "EMP-00108",
    department: "IT Support",
    designation: "Support Engineer",
    companyEmail: "rahul.kumar@flowdesk.co",
    phone: "+91 98450 33127",
    username: "rahul.kumar",
    accountStatus: "active",
    lastLogin: "Today at 08:41 · Bengaluru Office",
    emergencyContact: "Sneha Kumar · +91 98450 77219",
    address: "12 Indiranagar 100ft Road, Bengaluru 560038, India",
    location: "Bengaluru Office",
    inAppNotifications: true,
    emailNotifications: false,
  },
};

export const ACTIVITY_SUMMARY: Record<Role, ActivitySummary> = {
  employee: { openTickets: 2, leaveRequests: 4, assignedAssets: 3, upcomingMeetings: 2 },
  support: { openTickets: 6, leaveRequests: 1, assignedAssets: 4, upcomingMeetings: 3 },
};

export const BACKEND_PENDING_NOTE = "Available after backend integration.";
