import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  tickets as initialTickets,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
  type SupportEngineer,
} from "@/data/tickets";
import { useAuth } from "./AuthContext";

interface TicketContextValue {
  tickets: Ticket[];
  createTicket: (draft: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    attachment?: string;
  }) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, assignee: SupportEngineer | null) => void;
  addComment: (ticketId: string, message: string) => void;
  addInternalNote: (ticketId: string, message: string) => void;
  getTicketById: (ticketId: string) => Ticket | undefined;
}

const TicketContext = createContext<TicketContextValue | undefined>(undefined);
const TICKETS_STORAGE_KEY = "flowdesk_tickets_data";

export function TicketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ticketsList, setTicketsList] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: Ticket) => {
            let assignee = t.assignee;
            if (assignee === "Rahul") assignee = "Rahul Verma";
            if (assignee === "Priya") assignee = "Priya Nair";
            if (assignee === "Arjun") assignee = "Arjun Mehta";
            return { ...t, assignee };
          });
        }
      }
    } catch {
      // Fallback
    }
    return initialTickets;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(ticketsList));
    } catch {
      // Storage save fallback
    }
  }, [ticketsList]);

  const createTicket = (draft: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    attachment?: string;
  }): Ticket => {
    const nextNum = 4822 + Math.floor(Math.random() * 100);
    const newId = `TKT-${nextNum}`;
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const nowTimeStr = `${nowStr} · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    // Automated Workload Auto-Assignment Engine: find active support engineer with lowest open ticket count
    const supportList: SupportEngineer[] = [
      "Rahul Verma",
      "Priya Nair",
      "Arjun Mehta",
      "Vikram Rao",
      "Ananya Sen",
      "Kabir Sharma",
      "Neha Kapoor",
    ];

    const loads = supportList.map((eng) => {
      const openCount = ticketsList.filter(
        (t) =>
          t.assignee === eng &&
          (t.status === "open" || t.status === "assigned" || t.status === "in_progress"),
      ).length;
      return { engineer: eng, count: openCount };
    });

    loads.sort((a, b) => a.count - b.count);
    const selectedEngineer = loads[0].engineer;

    const newTicket: Ticket = {
      id: newId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      status: "assigned",
      priority: draft.priority,
      assignee: selectedEngineer,
      createdAt: nowStr,
      updatedAt: nowTimeStr,
      reporter: user?.fullName || "Alex Morgan",
      attachment: draft.attachment,
      comments: [
        {
          author: "FlowDesk Auto-Assign System",
          role: "Support",
          message: `Ticket automatically assigned to ${selectedEngineer} based on active workload load-balancing algorithm.`,
          at: nowTimeStr,
        },
      ],
      internalNotes: [],
    };

    setTicketsList((prev) => [newTicket, ...prev]);
    toast.success(`Ticket ${newId} created & automatically assigned to ${selectedEngineer}!`);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTicketsList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status,
          updatedAt: `Today · ${nowTimeStr}`,
        };
      }),
    );
    toast.success(`Ticket ${ticketId} status updated to "${status.replace("_", " ")}"`);
  };

  const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTicketsList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          priority,
          updatedAt: `Today · ${nowTimeStr}`,
        };
      }),
    );
    toast.success(`Ticket ${ticketId} priority set to "${priority}"`);
  };

  const assignTicket = (ticketId: string, assignee: SupportEngineer | null) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setTicketsList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assignee,
          status: assignee && t.status === "open" ? "assigned" : t.status,
          updatedAt: `Today · ${nowTimeStr}`,
        };
      }),
    );
    toast.success(
      assignee ? `Ticket ${ticketId} assigned to ${assignee}` : `Ticket ${ticketId} unassigned`,
    );
  };

  const addComment = (ticketId: string, message: string) => {
    if (!message.trim()) return;
    const authorName = user?.fullName || "User";
    const authorRole = user?.role === "support" ? "Support" : "Employee";
    const nowTimeStr = `Today · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    setTicketsList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          updatedAt: nowTimeStr,
          comments: [
            ...t.comments,
            {
              author: authorName,
              role: authorRole,
              message: message.trim(),
              at: nowTimeStr,
            },
          ],
        };
      }),
    );
    toast.success("Comment added");
  };

  const addInternalNote = (ticketId: string, message: string) => {
    if (!message.trim()) return;
    const authorName = (user?.fullName.split(" ")[0] as SupportEngineer) || "Rahul";
    const nowTimeStr = `Today · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    setTicketsList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          updatedAt: nowTimeStr,
          internalNotes: [
            ...t.internalNotes,
            {
              author: authorName,
              message: message.trim(),
              at: nowTimeStr,
            },
          ],
        };
      }),
    );
    toast.success("Internal note added");
  };

  const getTicketById = (ticketId: string) => {
    return ticketsList.find((t) => t.id === ticketId);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets: ticketsList,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        addComment,
        addInternalNote,
        getTicketById,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets(): TicketContextValue {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within a TicketProvider");
  return ctx;
}
