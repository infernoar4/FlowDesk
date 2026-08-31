import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTickets } from "./TicketContext";
import { useLeaves } from "./LeaveContext";
import { useAssets } from "./AssetContext";
import { useRooms } from "./RoomContext";

export type AuditLogModule = "Tickets" | "Leaves" | "Assets" | "Rooms" | "System";

export type AuditLogItem = {
  id: string;
  timestamp: string;
  user: string;
  role: "Employee" | "Support Engineer" | "Manager / HR" | "System Auto-Assign";
  action: string;
  module: AuditLogModule;
  status: "success" | "approved" | "in_progress" | "system" | "pending";
};

interface AuditContextValue {
  logs: AuditLogItem[];
}

const AuditContext = createContext<AuditContextValue | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const { tickets } = useTickets();
  const { leaves } = useLeaves();
  const { assets } = useAssets();
  const { bookings } = useRooms();

  const logs = useMemo<AuditLogItem[]>(() => {
    const list: AuditLogItem[] = [];
    let count = 1;

    // 1. Audit logs from Tickets
    tickets.forEach((t) => {
      list.push({
        id: `LOG-${1000 + count++}`,
        timestamp: t.createdAt,
        user: t.reporter,
        role: "Employee",
        action: `Submitted Ticket ${t.id} ("${t.title.length > 30 ? t.title.substring(0, 30) + "…" : t.title}")`,
        module: "Tickets",
        status: t.status === "resolved" || t.status === "closed" ? "success" : "in_progress",
      });

      if (t.assignee) {
        list.push({
          id: `LOG-${1000 + count++}`,
          timestamp: t.updatedAt,
          user: "Workload Balancer",
          role: "System Auto-Assign",
          action: `Auto-assigned Ticket ${t.id} to Support Engineer ${t.assignee}`,
          module: "Tickets",
          status: "system",
        });
      }

      if (t.status === "resolved" || t.status === "closed") {
        list.push({
          id: `LOG-${1000 + count++}`,
          timestamp: t.updatedAt,
          user: t.assignee || "Support Team",
          role: "Support Engineer",
          action: `Marked Ticket ${t.id} as "${t.status.toUpperCase()}"`,
          module: "Tickets",
          status: "success",
        });
      }
    });

    // 2. Audit logs from Leaves
    leaves.forEach((l) => {
      list.push({
        id: `LOG-${1000 + count++}`,
        timestamp: l.appliedOn || "Jul 5, 2026",
        user: l.employee,
        role: "Employee",
        action: `Applied for ${l.days} day(s) ${l.type} Leave (${l.startDate} to ${l.endDate})`,
        module: "Leaves",
        status:
          l.status === "approved" ? "approved" : l.status === "pending" ? "pending" : "in_progress",
      });

      if (l.status === "approved" || l.status === "rejected") {
        list.push({
          id: `LOG-${1000 + count++}`,
          timestamp: l.appliedOn || "Jul 6, 2026",
          user: l.reviewedBy || "Priya Kapoor",
          role: "Manager / HR",
          action: `${l.status === "approved" ? "Approved" : "Rejected"} Leave Request ${l.id} for ${l.employee}`,
          module: "Leaves",
          status: l.status === "approved" ? "approved" : "success",
        });
      }
    });

    // 3. Audit logs from Assets
    assets.forEach((a) => {
      list.push({
        id: `LOG-${1000 + count++}`,
        timestamp: a.requestedOn,
        user: a.employee,
        role: "Employee",
        action: `Requested workplace asset "${a.category}"`,
        module: "Assets",
        status: a.status === "assigned" ? "approved" : "pending",
      });

      if (a.status === "assigned" || a.status === "approved") {
        list.push({
          id: `LOG-${1000 + count++}`,
          timestamp: a.requestedOn,
          user: "Rahul Verma",
          role: "Support Engineer",
          action: `Approved & assigned ${a.assetName ?? a.category} (${a.assetId ?? a.id}) to ${a.employee}`,
          module: "Assets",
          status: "approved",
        });
      }
    });

    // 4. Audit logs from Room Bookings
    bookings.forEach((b) => {
      list.push({
        id: `LOG-${1000 + count++}`,
        timestamp: b.date,
        user: b.organizer || b.employee || "Aryan Giri",
        role: "Employee",
        action: `Reserved Meeting Room "${b.roomName ?? "Conference Room"}" for "${b.title}"`,
        module: "Rooms",
        status: b.status === "confirmed" ? "success" : "in_progress",
      });
    });

    // Sort chronologically (newest first)
    list.sort((a, b) => (a.id < b.id ? 1 : -1));
    return list;
  }, [tickets, leaves, assets, bookings]);

  return <AuditContext.Provider value={{ logs }}>{children}</AuditContext.Provider>;
}

export function useAuditLogs() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAuditLogs must be used within an AuditProvider");
  return ctx;
}
