import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  notifications as seedNotifications,
  sortNotifications,
  type Notification,
} from "@/data/notifications";

interface NotificationsContextValue {
  items: Notification[];
  unreadCount: number;
  /** Latest five notifications, newest first — used by the navbar dropdown. */
  latest: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>(() => sortNotifications(seedNotifications));

  const value = useMemo<NotificationsContextValue>(() => {
    const markRead = (id: string) =>
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    return {
      items,
      unreadCount: items.filter((n) => !n.read).length,
      latest: items.slice(0, 5),
      markRead,
      markAllRead,
    };
  }, [items]);

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
