import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Boxes,
  CalendarDays,
  Megaphone,
  Settings2,
  TicketCheck,
  DoorOpen,
} from "lucide-react";
import type { Notification, NotificationType } from "@/data/notifications";

const icons: Record<NotificationType, typeof TicketCheck> = {
  tickets: TicketCheck,
  leave: CalendarDays,
  assets: Boxes,
  meetings: DoorOpen,
  announcements: Megaphone,
  system: Settings2,
};

const tones: Record<NotificationType, string> = {
  tickets: "bg-primary-soft text-primary",
  leave: "bg-info/10 text-info",
  assets: "bg-accent text-accent-foreground",
  meetings: "bg-success/15 text-success",
  announcements: "bg-warning/15 text-warning-foreground",
  system: "bg-muted text-muted-foreground",
};

export function NotificationIcon({
  type,
  size = "md",
}: {
  type: NotificationType;
  size?: "sm" | "md";
}) {
  const Icon = icons[type];
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const glyph = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={`${box} shrink-0 rounded-lg flex items-center justify-center ${tones[type]}`}
      aria-hidden
    >
      <Icon className={glyph} />
    </div>
  );
}

/** Wraps children in a type-safe Link to the module record the notification
 *  refers to, using the routes that already exist in FlowDesk. */
export function NotificationLink({
  notification,
  className,
  onNavigate,
  children,
}: {
  notification: Notification;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const { type, refId } = notification;
  const props = { className, onClick: onNavigate };

  if (refId) {
    if (type === "tickets")
      return (
        <Link to="/tickets/$ticketId" params={{ ticketId: refId }} {...props}>
          {children}
        </Link>
      );
    if (type === "leave")
      return (
        <Link to="/leave-requests/$leaveId" params={{ leaveId: refId }} {...props}>
          {children}
        </Link>
      );
    if (type === "assets")
      return (
        <Link to="/assets/$assetId" params={{ assetId: refId }} {...props}>
          {children}
        </Link>
      );
    if (type === "meetings")
      return (
        <Link
          to="/meeting-rooms/bookings/$bookingId"
          params={{ bookingId: refId }}
          {...props}
        >
          {children}
        </Link>
      );
    if (type === "announcements")
      return (
        <Link to="/announcements" {...props}>
          {children}
        </Link>
      );
  }

  return (
    <Link to="/notifications" {...props}>
      {children}
    </Link>
  );
}
