import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TicketProvider } from "@/context/TicketContext";
import { LeaveProvider } from "@/context/LeaveContext";
import { AssetProvider } from "@/context/AssetContext";
import { RoomProvider } from "@/context/RoomContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";
import { AuditProvider } from "@/context/AuditContext";

export const Route = createFileRoute("/_app")({
  component: AppLayoutWrapper,
});

function AppLayoutWrapper() {
  return (
    <AuthProvider>
      <TicketProvider>
        <LeaveProvider>
          <AssetProvider>
            <RoomProvider>
              <AnnouncementProvider>
                <AuditProvider>
                  <RoleProvider>
                    <ThemeProvider>
                      <NotificationsProvider>
                        <AppLayout />
                      </NotificationsProvider>
                    </ThemeProvider>
                  </RoleProvider>
                </AuditProvider>
              </AnnouncementProvider>
            </RoomProvider>
          </AssetProvider>
        </LeaveProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.role) {
      try {
        const activeMode = localStorage.getItem("flowdesk_active_mode");
        if (!activeMode) {
          setRole(user.role);
        }
      } catch {
        // Fallback
      }
    }
  }, [user?.role, setRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl animate-pulse">
            F
          </div>
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <TopNavbar />
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
