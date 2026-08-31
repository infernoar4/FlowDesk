import { Check } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";
import { NotificationIcon, NotificationLink } from "@/components/notifications/NotificationIcon";
import { NOTIFICATION_TYPE_LABELS, relativeTime, type Notification } from "@/data/notifications";

interface Props {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: Props) {
  const { id, title, description, minutesAgo, read, type, event } = notification;

  return (
    <article
      className={[
        "rounded-xl border shadow-card transition-colors",
        read ? "bg-card border-border" : "bg-primary-soft/30 border-primary/30",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4">
        <NotificationIcon type={type} />

        <NotificationLink
          notification={notification}
          onNavigate={() => onMarkRead(id)}
          className="min-w-0 flex-1 group"
        >
          <div className="flex items-start gap-2">
            {!read && (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-label="Unread"
              />
            )}
            <h3
              className={[
                "text-sm text-foreground group-hover:text-primary transition-colors",
                read ? "font-medium" : "font-semibold",
              ].join(" ")}
            >
              {title}
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              {NOTIFICATION_TYPE_LABELS[type]}
            </span>
            <span>{event}</span>
            <span aria-hidden>·</span>
            <span>{relativeTime(minutesAgo)}</span>
            <span aria-hidden>·</span>
            <span className={read ? "" : "text-primary font-medium"}>
              {read ? "Read" : "Unread"}
            </span>
          </div>
        </NotificationLink>

        {!read && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 self-start"
            leftIcon={<Check className="h-3.5 w-3.5" />}
            onClick={() => onMarkRead(id)}
          >
            Mark as Read
          </Button>
        )}
      </div>
    </article>
  );
}
