import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  announcements as initialAnnouncements,
  TODAY_ISO,
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementPriority,
  type Audience,
} from "@/data/announcements";
import { useAuth } from "./AuthContext";

interface AnnouncementContextValue {
  announcements: Announcement[];
  createAnnouncement: (draft: {
    title: string;
    category: AnnouncementCategory;
    content?: string;
    body?: string;
    summary?: string;
    priority: AnnouncementPriority;
    pinned: boolean;
    audience?: Audience;
  }) => Announcement;
  togglePin: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
}

const AnnouncementContext = createContext<AnnouncementContextValue | undefined>(undefined);
const ANNOUNCEMENTS_STORAGE_KEY = "flowdesk_announcements_data";

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialAnnouncements;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcementsList));
    } catch {
      // Storage fallback
    }
  }, [announcementsList]);

  const createAnnouncement = (draft: {
    title: string;
    category: AnnouncementCategory;
    content?: string;
    body?: string;
    summary?: string;
    priority: AnnouncementPriority;
    pinned: boolean;
    audience?: Audience;
  }): Announcement => {
    const authorName = user?.fullName || "Sarah Connor";
    const authorRole = user?.role === "support" ? "IT Support Team" : "People Operations";
    const nextNum = 4050 + Math.floor(Math.random() * 100);
    const newId = `ANN-${nextNum}`;
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const textBody = draft.body?.trim() || draft.content?.trim() || draft.title.trim();
    const textSummary = draft.summary?.trim() || textBody;

    const newNotice: Announcement = {
      id: newId,
      title: draft.title.trim(),
      summary: textSummary,
      body: textBody,
      category: draft.category,
      priority: draft.priority,
      status: "active",
      pinned: draft.pinned,
      audience: draft.audience || "All Employees",
      author: authorName,
      authorRole: authorRole,
      createdOn: TODAY_ISO,
      publishedOn: todayStr,
      read: false,
    };

    setAnnouncementsList((prev) => [newNotice, ...prev]);
    toast.success(`Announcement "${draft.title}" published successfully!`);
    return newNotice;
  };

  const togglePin = (id: string) => {
    setAnnouncementsList((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updatedPinned = !a.pinned;
        toast.info(`Announcement ${updatedPinned ? "pinned to top" : "unpinned"}.`);
        return { ...a, pinned: updatedPinned };
      }),
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncementsList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement deleted.");
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announcements: announcementsList,
        createAnnouncement,
        togglePin,
        deleteAnnouncement,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements(): AnnouncementContextValue {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error("useAnnouncements must be used within an AnnouncementProvider");
  return ctx;
}
