import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  notifications as seedNotifications,
  sortNotifications,
  type Notification,
  type NotificationType,
} from "@/data/notifications";

interface NotificationsContextValue {
  items: Notification[];
  unreadCount: number;
  latest: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
const NOTIFICATIONS_STORAGE_KEY = "flowdesk_notifications_data";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return sortNotifications(seedNotifications);
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage fallback
    }
  }, [items]);

  const value = useMemo<NotificationsContextValue>(() => {
    const markRead = (id: string) =>
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const markAllRead = () => {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    };

    const clearAll = () => {
      setItems([]);
      toast.info("Notifications cleared.");
    };

    const deleteNotification = (id: string) => {
      setItems((prev) => prev.filter((n) => n.id !== id));
    };

    const addNotification = (title: string, message: string, type: NotificationType = "system") => {
      const nextId = `NTF-${Date.now()}`;
      const newNotification: Notification = {
        id: nextId,
        type,
        event: "System Maintenance",
        title,
        description: message,
        minutesAgo: 0,
        read: false,
      };

      setItems((prev) => [newNotification, ...prev]);
    };

    return {
      items,
      unreadCount: items.filter((n) => !n.read).length,
      latest: items.slice(0, 5),
      markRead,
      markAllRead,
      clearAll,
      deleteNotification,
      addNotification,
    };
  }, [items]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
