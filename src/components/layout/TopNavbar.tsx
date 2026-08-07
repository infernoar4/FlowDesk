import { useEffect, useRef, useState } from "react";
import { Bell, HelpCircle, Moon, Search, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { useRole, CURRENT_ENGINEER } from "@/context/RoleContext";
import { NotificationBellDropdown } from "@/components/notifications/NotificationBellDropdown";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/context/ThemeContext";

export function TopNavbar() {
  const { role } = useRole();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const displayName = role === "support" ? CURRENT_ENGINEER : "Alex Lee";
  const displayRole = role === "support" ? "Support Engineer" : "Operations";
  const initials = role === "support" ? "RK" : "AL";

  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [bellOpen]);


  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-border">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tickets, people, rooms…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:bg-background transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setBellOpen((o) => !o)}
              aria-label="Notifications"
              aria-expanded={bellOpen}
              className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
            {bellOpen && <NotificationBellDropdown onClose={() => setBellOpen(false)} />}
          </div>

          <Link
            to="/profile"
            className="ml-2 flex items-center gap-2 pl-2 pr-3 h-10 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-medium text-foreground">{displayName}</div>
              <div className="text-xs text-muted-foreground">{displayRole}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
