import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  TicketCheck,
  CalendarDays,
  Boxes,
  Megaphone,
  DoorOpen,
  UserCircle,
} from "lucide-react";

type NavItem = {
  to: "/" | "/tickets" | "/leave-requests" | "/assets" | "/announcements" | "/meeting-rooms" | "/profile";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/tickets", label: "Tickets", icon: TicketCheck },
  { to: "/leave-requests", label: "Leave Requests", icon: CalendarDays },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/meeting-rooms", label: "Meeting Rooms", icon: DoorOpen },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          F
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">FlowDesk</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-soft"
                  : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-muted">
        v0.1.0 · Foundation
      </div>
    </aside>
  );
}
