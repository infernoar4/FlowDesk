import { createServerFn } from "@tanstack/react-start";

export type AuthenticatedRole = "employee" | "support" | "manager";

export type AuthenticatedUser = {
  id: number;
  employeeId: string;
  fullName: string;
  companyEmail: string;
  username: string;
  role: AuthenticatedRole;
  accountStatus: "active";
  department: string | null;
  designation: string | null;
  phone: string | null;
  location: string | null;
  photoUrl: string | null;
  lastLogin: Date | string | null;
  inAppNotifications: boolean;
  emailNotifications: boolean;
};

// Keep this public module client-safe. The server-only implementation is
// dynamically loaded inside handlers, so neither MySQL nor Node crypto is
// emitted into the login bundle.
export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getAuthenticatedUser } = await import("./auth-session.server");
  return getAuthenticatedUser();
});

export const login = createServerFn({ method: "POST" })
  .validator((input: { identifier: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { loginWithCredentials } = await import("./auth-session.server");
    return loginWithCredentials(data);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutCurrentUser } = await import("./auth-session.server");
  return logoutCurrentUser();
});
