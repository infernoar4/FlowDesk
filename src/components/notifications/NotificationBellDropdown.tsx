import { Link } from "@tanstack/react-router";
import { NotificationIcon, NotificationLink } from "@/components/notifications/NotificationIcon";
import { useNotifications } from "@/context/NotificationsContext";
import { relativeTime } from "@/data/notifications";

/** Panel shown when the Top Navbar bell is clicked. Latest five only. */
export function NotificationBellDropdown({ onClose }: { onClose: () => void }) {
  const { latest, unreadCount, markRead } = useNotifications();

  return (
    <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-elevated">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
            {unreadCount} unread
          </span>
        )}
      </header>

      {latest.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          You have no notifications yet.
        </p>
      ) : (
        <ul className="max-h-96 overflow-y-auto divide-y divide-border">
          {latest.map((n) => (
            <li key={n.id}>
              <NotificationLink
                notification={n}
                onNavigate={() => {
                  markRead(n.id);
                  onClose();
                }}
                className={[
                  "flex gap-3 px-4 py-3 hover:bg-muted transition-colors",
                  n.read ? "" : "bg-primary-soft/25",
                ].join(" ")}
              >
                <NotificationIcon type={n.type} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                    <p
                      className={[
                        "text-sm text-foreground",
                        n.read ? "font-medium" : "font-semibold",
                      ].join(" ")}
                    >
                      {n.title}
                    </p>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {n.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{relativeTime(n.minutesAgo)}</p>
                </div>
              </NotificationLink>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-4 py-3">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-primary hover:underline"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
}
