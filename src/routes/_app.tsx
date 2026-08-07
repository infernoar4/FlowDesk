import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { RoleProvider } from "@/context/RoleContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <RoleProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="md:pl-64 flex flex-col min-h-screen">
              <TopNavbar />
              <main className="flex-1 px-6 py-6">
                <Outlet />
              </main>
            </div>
          </div>
        </NotificationsProvider>
      </ThemeProvider>
    </RoleProvider>
  );
}

