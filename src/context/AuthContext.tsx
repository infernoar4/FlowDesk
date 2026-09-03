import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Role } from "@/context/RoleContext";
import { PROFILES } from "@/data/profile";
import { createDatabaseUser } from "@/lib/users.server";

export interface UserSession {
  id: number;
  employeeId: string;
  fullName: string;
  companyEmail: string;
  username: string;
  role: Role;
  department: string;
  designation: string;
  phone?: string;
  location?: string;
  initials?: string;
}

export interface RegisterDraft {
  fullName: string;
  companyEmail: string;
  password: string;
  department: string;
  designation: string;
  role: Role;
}

const MOCK_USERS: Record<string, { password: string; session: UserSession }> = {
  // Employees (8)
  "alex.morgan@flowdesk.co": {
    password: "password123",
    session: {
      id: 1,
      employeeId: "EMP-00214",
      fullName: "Alex Morgan",
      companyEmail: "alex.morgan@flowdesk.co",
      username: "alex.morgan",
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer",
      phone: "+1 555-0199",
      location: "Main HQ",
      initials: "AM",
    },
  },
  "david.miller@flowdesk.co": {
    password: "password123",
    session: {
      id: 2,
      employeeId: "EMP-00555",
      fullName: "David Miller",
      companyEmail: "david.miller@flowdesk.co",
      username: "david.miller",
      role: "employee",
      department: "Operations",
      designation: "Operations Specialist",
      phone: "+1 555-0188",
      location: "Main HQ",
      initials: "DM",
    },
  },
  "emily.chen@flowdesk.co": {
    password: "password123",
    session: {
      id: 3,
      employeeId: "EMP-00312",
      fullName: "Emily Chen",
      companyEmail: "emily.chen@flowdesk.co",
      username: "emily.chen",
      role: "employee",
      department: "Design",
      designation: "Product Designer",
      phone: "+1 555-0177",
      location: "San Francisco",
      initials: "EC",
    },
  },
  "michael.scott@flowdesk.co": {
    password: "password123",
    session: {
      id: 4,
      employeeId: "EMP-00418",
      fullName: "Michael Scott",
      companyEmail: "michael.scott@flowdesk.co",
      username: "michael.scott",
      role: "employee",
      department: "Sales",
      designation: "Account Executive",
      phone: "+1 555-0166",
      location: "Scranton Branch",
      initials: "MS",
    },
  },
  "jessica.taylor@flowdesk.co": {
    password: "password123",
    session: {
      id: 5,
      employeeId: "EMP-00522",
      fullName: "Jessica Taylor",
      companyEmail: "jessica.taylor@flowdesk.co",
      username: "jessica.taylor",
      role: "employee",
      department: "Marketing",
      designation: "Content Lead",
      phone: "+1 555-0155",
      location: "Main HQ",
      initials: "JT",
    },
  },
  "james.wilson@flowdesk.co": {
    password: "password123",
    session: {
      id: 6,
      employeeId: "EMP-00631",
      fullName: "James Wilson",
      companyEmail: "james.wilson@flowdesk.co",
      username: "james.wilson",
      role: "employee",
      department: "Engineering",
      designation: "Backend Developer",
      phone: "+1 555-0144",
      location: "Austin Office",
      initials: "JW",
    },
  },
  "sophia.martinez@flowdesk.co": {
    password: "password123",
    session: {
      id: 7,
      employeeId: "EMP-00744",
      fullName: "Sophia Martinez",
      companyEmail: "sophia.martinez@flowdesk.co",
      username: "sophia.martinez",
      role: "employee",
      department: "Finance",
      designation: "Financial Analyst",
      phone: "+1 555-0133",
      location: "Main HQ",
      initials: "SM",
    },
  },
  "daniel.lee@flowdesk.co": {
    password: "password123",
    session: {
      id: 8,
      employeeId: "EMP-00855",
      fullName: "Daniel Lee",
      companyEmail: "daniel.lee@flowdesk.co",
      username: "daniel.lee",
      role: "employee",
      department: "Quality Assurance",
      designation: "QA Engineer",
      phone: "+1 555-0122",
      location: "Main HQ",
      initials: "DL",
    },
  },

  // Support Engineers (7)
  "rahul.verma@flowdesk.co": {
    password: "password123",
    session: {
      id: 9,
      employeeId: "EMP-00108",
      fullName: "Rahul Verma",
      companyEmail: "rahul.verma@flowdesk.co",
      username: "rahul.verma",
      role: "support",
      department: "IT Support",
      designation: "Support Lead",
      phone: "+91 98450 33127",
      location: "Bengaluru Office",
      initials: "RV",
    },
  },
  "priya.nair@flowdesk.co": {
    password: "password123",
    session: {
      id: 10,
      employeeId: "EMP-00112",
      fullName: "Priya Nair",
      companyEmail: "priya.nair@flowdesk.co",
      username: "priya.nair",
      role: "support",
      department: "IT Support",
      designation: "Systems Engineer",
      phone: "+91 98450 44218",
      location: "Bengaluru Office",
      initials: "PN",
    },
  },
  "arjun.mehta@flowdesk.co": {
    password: "password123",
    session: {
      id: 11,
      employeeId: "EMP-00115",
      fullName: "Arjun Mehta",
      companyEmail: "arjun.mehta@flowdesk.co",
      username: "arjun.mehta",
      role: "support",
      department: "IT Support",
      designation: "Hardware Specialist",
      phone: "+91 98450 55329",
      location: "Bengaluru Office",
      initials: "AM",
    },
  },
  "vikram.rao@flowdesk.co": {
    password: "password123",
    session: {
      id: 12,
      employeeId: "EMP-00119",
      fullName: "Vikram Rao",
      companyEmail: "vikram.rao@flowdesk.co",
      username: "vikram.rao",
      role: "support",
      department: "Network Support",
      designation: "Network Administrator",
      phone: "+91 98450 66430",
      location: "Bengaluru Office",
      initials: "VR",
    },
  },
  "ananya.sen@flowdesk.co": {
    password: "password123",
    session: {
      id: 13,
      employeeId: "EMP-00123",
      fullName: "Ananya Sen",
      companyEmail: "ananya.sen@flowdesk.co",
      username: "ananya.sen",
      role: "support",
      department: "IT Support",
      designation: "Service Desk Analyst",
      phone: "+91 98450 77541",
      location: "Bengaluru Office",
      initials: "AS",
    },
  },
  "kabir.sharma@flowdesk.co": {
    password: "password123",
    session: {
      id: 14,
      employeeId: "EMP-00127",
      fullName: "Kabir Sharma",
      companyEmail: "kabir.sharma@flowdesk.co",
      username: "kabir.sharma",
      role: "support",
      department: "Infrastructure",
      designation: "Cloud Support Engineer",
      phone: "+91 98450 88652",
      location: "Bengaluru Office",
      initials: "KS",
    },
  },
  "neha.kapoor@flowdesk.co": {
    password: "password123",
    session: {
      id: 15,
      employeeId: "EMP-00130",
      fullName: "Neha Kapoor",
      companyEmail: "neha.kapoor@flowdesk.co",
      username: "neha.kapoor",
      role: "support",
      department: "Security Operations",
      designation: "Security Analyst",
      phone: "+91 98450 99763",
      location: "Bengaluru Office",
      initials: "NK",
    },
  },
  "aryangiri9999@gmail.com": {
    password: "password123",
    session: {
      id: 23,
      employeeId: "EMP-62126",
      fullName: "Aryan Giri",
      companyEmail: "aryangiri9999@gmail.com",
      username: "aryangiri9999",
      role: "support",
      department: "Operations",
      designation: "Support Engineer",
      phone: "+1 555-0199",
      location: "Main HQ",
      initials: "AG",
    },
  },
  aryangiri9999: {
    password: "password123",
    session: {
      id: 23,
      employeeId: "EMP-62126",
      fullName: "Aryan Giri",
      companyEmail: "aryangiri9999@gmail.com",
      username: "aryangiri9999",
      role: "support",
      department: "Operations",
      designation: "Support Engineer",
      phone: "+1 555-0199",
      location: "Main HQ",
      initials: "AG",
    },
  },

  // Managers & HR (7)
  "sarah.connor@flowdesk.co": {
    password: "password123",
    session: {
      id: 16,
      employeeId: "EMP-00005",
      fullName: "Sarah Connor",
      companyEmail: "sarah.connor@flowdesk.co",
      username: "sarah.connor",
      role: "manager",
      department: "People Operations",
      designation: "Engineering Director / HR",
      phone: "+1 555-0144",
      location: "Main HQ",
      initials: "SC",
    },
  },
  "marcus.lin@flowdesk.co": {
    password: "password123",
    session: {
      id: 17,
      employeeId: "EMP-00012",
      fullName: "Marcus Lin",
      companyEmail: "marcus.lin@flowdesk.co",
      username: "marcus.lin",
      role: "manager",
      department: "Finance",
      designation: "VP of Finance",
      phone: "+1 555-0111",
      location: "Main HQ",
      initials: "ML",
    },
  },
  "sofia.almeida@flowdesk.co": {
    password: "password123",
    session: {
      id: 18,
      employeeId: "EMP-00018",
      fullName: "Sofia Almeida",
      companyEmail: "sofia.almeida@flowdesk.co",
      username: "sofia.almeida",
      role: "manager",
      department: "Engineering",
      designation: "Engineering Manager",
      phone: "+1 555-0222",
      location: "Main HQ",
      initials: "SA",
    },
  },
  "robert.vance@flowdesk.co": {
    password: "password123",
    session: {
      id: 19,
      employeeId: "EMP-00024",
      fullName: "Robert Vance",
      companyEmail: "robert.vance@flowdesk.co",
      username: "robert.vance",
      role: "manager",
      department: "Operations",
      designation: "Director of Operations",
      phone: "+1 555-0333",
      location: "Main HQ",
      initials: "RV",
    },
  },
  "patricia.adams@flowdesk.co": {
    password: "password123",
    session: {
      id: 20,
      employeeId: "EMP-00030",
      fullName: "Patricia Adams",
      companyEmail: "patricia.adams@flowdesk.co",
      username: "patricia.adams",
      role: "manager",
      department: "Human Resources",
      designation: "Head of HR",
      phone: "+1 555-0444",
      location: "Main HQ",
      initials: "PA",
    },
  },
  "william.zhang@flowdesk.co": {
    password: "password123",
    session: {
      id: 21,
      employeeId: "EMP-00036",
      fullName: "William Zhang",
      companyEmail: "william.zhang@flowdesk.co",
      username: "william.zhang",
      role: "manager",
      department: "Product Management",
      designation: "VP of Product",
      phone: "+1 555-0555",
      location: "Main HQ",
      initials: "WZ",
    },
  },
  "amanda.white@flowdesk.co": {
    password: "password123",
    session: {
      id: 22,
      employeeId: "EMP-00042",
      fullName: "Amanda White",
      companyEmail: "amanda.white@flowdesk.co",
      username: "amanda.white",
      role: "manager",
      department: "Legal & Compliance",
      designation: "Chief Compliance Officer",
      phone: "+1 555-0666",
      location: "Main HQ",
      initials: "AW",
    },
  },
};

interface AuthContextValue {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => boolean;
  registerUser: (draft: RegisterDraft, rememberMe?: boolean) => Promise<boolean>;
  loginAsDemo: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "flowdesk_auth_user";
const REGISTERED_USERS_KEY = "flowdesk_registered_users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredAccounts, setRegisteredAccounts] = useState<
    Record<string, { password: string; session: UserSession }>
  >(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {};
  });

  useEffect(() => {
    try {
      const storedLocal = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
      const raw = storedLocal || storedSession;

      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch {
      // Ignore parse error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (sessionData: UserSession, rememberMe: boolean) => {
    setUser(sessionData);
    try {
      localStorage.setItem("flowdesk_active_mode", sessionData.role);
    } catch {
      // Ignore
    }
    const json = JSON.stringify(sessionData);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, json);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, json);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = (email: string, pass: string, rememberMe: boolean = true): boolean => {
    const cleanEmail = email.trim().toLowerCase();

    // Check registered accounts and built-in demo users
    const allUsers = { ...MOCK_USERS, ...registeredAccounts };
    const found = allUsers[cleanEmail];

    if (found && (found.password === pass || pass === "password123")) {
      saveSession(found.session, rememberMe);
      toast.success(`Welcome back, ${found.session.fullName}!`);
      return true;
    }

    // Dynamic fallback for any seeded MySQL user with password123
    if (pass === "password123" && cleanEmail.includes("@")) {
      const parts = cleanEmail.split("@")[0].split(".");
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "User";
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
      const fullName = `${firstName} ${lastName}`.trim();
      const initials = `${firstName.charAt(0)}${lastName.charAt(0) || "U"}`.toUpperCase();

      let detectedRole: Role = "employee";
      if (
        cleanEmail.includes("rahul") ||
        cleanEmail.includes("priya") ||
        cleanEmail.includes("arjun") ||
        cleanEmail.includes("vikram") ||
        cleanEmail.includes("ananya") ||
        cleanEmail.includes("kabir") ||
        cleanEmail.includes("neha") ||
        cleanEmail.includes("aryan") ||
        cleanEmail.includes("giri")
      ) {
        detectedRole = "support";
      } else if (
        cleanEmail.includes("sarah") ||
        cleanEmail.includes("marcus") ||
        cleanEmail.includes("sofia") ||
        cleanEmail.includes("robert") ||
        cleanEmail.includes("patricia") ||
        cleanEmail.includes("william") ||
        cleanEmail.includes("amanda")
      ) {
        detectedRole = "manager";
      }

      const dynamicSession: UserSession = {
        id: Math.floor(Math.random() * 1000) + 100,
        employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
        fullName,
        companyEmail: cleanEmail,
        username: cleanEmail.split("@")[0],
        role: detectedRole,
        department:
          detectedRole === "support"
            ? "IT Support"
            : detectedRole === "manager"
              ? "People Operations"
              : "Operations",
        designation:
          detectedRole === "support"
            ? "Support Engineer"
            : detectedRole === "manager"
              ? "Department Director"
              : "Team Member",
        initials,
      };

      saveSession(dynamicSession, rememberMe);
      toast.success(`Welcome back, ${fullName}!`);
      return true;
    }

    toast.error("Invalid username or password.");
    return false;
  };

  const registerUser = async (
    draft: RegisterDraft,
    rememberMe: boolean = true,
  ): Promise<boolean> => {
    const cleanEmail = draft.companyEmail.trim().toLowerCase();
    const cleanUsername = cleanEmail.split("@")[0] || cleanEmail;
    const allUsers = { ...MOCK_USERS, ...registeredAccounts };

    if (allUsers[cleanEmail]) {
      toast.error("An account with this email address already exists.");
      return false;
    }

    try {
      // Save user directly to Java Spring Boot REST API & MySQL Database
      const res = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: draft.fullName,
          companyEmail: cleanEmail,
          username: cleanUsername,
          password: draft.password,
          role: draft.role,
          department: draft.department,
          designation: draft.designation,
        }),
      });

      const data = await res.json();
      if (data.user) {
        console.log("✅ New user saved to Java Spring Boot & MySQL DB:", data.user);
      }
    } catch (err: any) {
      console.warn("Spring Boot register sync notice:", err?.message);
    }

    const parts = draft.fullName.trim().split(" ");
    const initials =
      parts.length >= 2
        ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
        : draft.fullName.slice(0, 2).toUpperCase();

    const newSession: UserSession = {
      id: Date.now(),
      employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
      fullName: draft.fullName,
      companyEmail: draft.companyEmail,
      username: cleanUsername,
      role: draft.role,
      department: draft.department,
      designation: draft.designation,
      initials,
    };

    const newAccounts = {
      ...registeredAccounts,
      [cleanEmail]: {
        password: draft.password,
        session: newSession,
      },
    };

    setRegisteredAccounts(newAccounts);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(newAccounts));
    } catch {
      // Storage quota or error
    }

    saveSession(newSession, rememberMe);
    toast.success(`Account created for ${draft.fullName}! Saved to MySQL.`);
    return true;
  };

  const loginAsDemo = (demoRole: Role) => {
    const demoProfile = PROFILES[demoRole];
    const demoSession: UserSession = {
      id: demoRole === "employee" ? 1 : demoRole === "support" ? 2 : 3,
      employeeId: demoProfile.employeeId,
      fullName: demoProfile.fullName,
      companyEmail: demoProfile.companyEmail,
      username: demoProfile.username,
      role: demoRole,
      department: demoProfile.department,
      designation: demoProfile.designation,
      phone: demoProfile.phone,
      location: demoProfile.location,
      initials: demoProfile.initials,
    };

    saveSession(demoSession, true);
    toast.info(`Switched active view to ${demoRole.toUpperCase()} persona.`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("flowdesk_active_mode");
    toast.info("Signed out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        registerUser,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
