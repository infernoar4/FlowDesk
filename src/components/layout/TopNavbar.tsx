import { useEffect, useRef, useState } from "react";
import { Bell, HelpCircle, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRole, CURRENT_ENGINEER } from "@/context/RoleContext";
import { NotificationBellDropdown } from "@/components/notifications/NotificationBellDropdown";
import { useNotifications } from "@/context/NotificationsContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

import { HelpModal } from "@/components/layout/HelpModal";

export function TopNavbar() {
  const { role, setRole } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || (role === "support" ? CURRENT_ENGINEER : "Alex Lee");
  const displayRole =
    user?.designation || (role === "support" ? "Support Engineer" : "Operations Manager");
  const initials = user?.initials || (role === "support" ? "RK" : "AL");

  useEffect(() => {
    if (!bellOpen && !userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (bellOpen && !bellRef.current?.contains(e.target as Node)) setBellOpen(false);
      if (userMenuOpen && !userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [bellOpen, userMenuOpen]);

  const handleSignOut = () => {
    logout();
    setUserMenuOpen(false);
    navigate({ to: "/login" });
  };

  const isSupportUser =
    user?.role === "support" ||
    role === "support" ||
    Boolean(user?.designation?.toLowerCase().includes("support")) ||
    Boolean(user?.department?.toLowerCase().includes("support")) ||
    Boolean(
      user?.companyEmail &&
      (user.companyEmail.includes("rahul") || user.companyEmail.includes("support")),
    );

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
          {/* Support Engineer Mode Switcher Slider */}
          {isSupportUser && (
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setRole("support")}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  role === "support"
                    ? "bg-card text-foreground font-semibold shadow-soft border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🛡️ Support Engineer
              </button>
              <button
                type="button"
                onClick={() => setRole("employee")}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  role === "employee"
                    ? "bg-card text-foreground font-semibold shadow-soft border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                👤 Employee View
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            aria-label="Help & Knowledge Center"
            title="Help & Knowledge Center"
            className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

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

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="ml-2 flex items-center gap-2 pl-2 pr-3 h-10 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-medium text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground">{displayRole}</div>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-popover border border-border shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.companyEmail || "user@flowdesk.co"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    View Profile
                  </Link>
                </div>
                <div className="border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
