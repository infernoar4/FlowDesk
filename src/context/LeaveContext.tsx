import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  leaves as initialLeaves,
  LEAVE_BALANCES as initialBalances,
  type LeaveRequest,
  type LeaveType,
  type LeaveStatus,
  type LeaveBalance,
} from "@/data/leaves";
import { useAuth } from "./AuthContext";

interface LeaveContextValue {
  leaves: LeaveRequest[];
  balances: LeaveBalance[];
  applyLeave: (draft: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => LeaveRequest | null;
  approveLeave: (leaveId: string, comment?: string) => void;
  rejectLeave: (leaveId: string, reason?: string) => void;
  cancelLeave: (leaveId: string) => void;
  getLeaveById: (leaveId: string) => LeaveRequest | undefined;
}

const LeaveContext = createContext<LeaveContextValue | undefined>(undefined);
const LEAVES_STORAGE_KEY = "flowdesk_leaves_data";
const BALANCES_STORAGE_KEY = "flowdesk_leave_balances";

function calculateBusinessDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    if (end < start) return 1;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count === 0 ? 1 : count;
  } catch {
    return 1;
  }
}

export function LeaveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [leavesList, setLeavesList] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LEAVES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialLeaves;
  });

  const [balancesList, setBalancesList] = useState<LeaveBalance[]>(() => {
    try {
      const saved = localStorage.getItem(BALANCES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialBalances;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(leavesList));
    } catch {
      // Storage save fallback
    }
  }, [leavesList]);

  useEffect(() => {
    try {
      localStorage.setItem(BALANCES_STORAGE_KEY, JSON.stringify(balancesList));
    } catch {
      // Storage save fallback
    }
  }, [balancesList]);

  const applyLeave = (draft: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): LeaveRequest | null => {
    const numDays =
      draft.type === "Half Day" ? 0.5 : calculateBusinessDays(draft.startDate, draft.endDate);
    const nextNum = 1047 + Math.floor(Math.random() * 100);
    const newId = `LR-${nextNum}`;
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reporterName = user?.fullName || "Alex Morgan";

    const newRequest: LeaveRequest = {
      id: newId,
      employee: reporterName,
      type: draft.type,
      startDate: draft.startDate,
      endDate: draft.endDate,
      days: numDays,
      reason: draft.reason.trim(),
      appliedOn: todayStr,
      status: "pending",
    };

    setLeavesList((prev) => [newRequest, ...prev]);
    toast.success(`Leave request ${newId} submitted for ${numDays} day(s).`);
    return newRequest;
  };

  const approveLeave = (leaveId: string, comment?: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Priya Kapoor";

    const targetLeave = leavesList.find((l) => l.id === leaveId);
    if (!targetLeave) return;

    setLeavesList((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: "approved",
          reviewedBy: reviewerName,
          reviewedOn: todayStr,
          managerComment: comment || "Approved.",
        };
      }),
    );

    // Deduct remaining leave days if Casual or Sick Leave
    if (targetLeave.type === "Casual Leave" || targetLeave.type === "Sick Leave") {
      setBalancesList((prev) =>
        prev.map((b) => {
          if (b.type === targetLeave.type && typeof b.remaining === "number") {
            const nextRemaining = Math.max(0, b.remaining - targetLeave.days);
            return { ...b, remaining: nextRemaining };
          }
          return b;
        }),
      );
    }

    toast.success(`Leave request ${leaveId} approved.`);
  };

  const rejectLeave = (leaveId: string, reason?: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Priya Kapoor";

    setLeavesList((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: "rejected",
          reviewedBy: reviewerName,
          reviewedOn: todayStr,
          rejectionReason: reason || "Overlaps with schedule.",
        };
      }),
    );

    toast.error(`Leave request ${leaveId} rejected.`);
  };

  const cancelLeave = (leaveId: string) => {
    setLeavesList((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: "cancelled",
          managerComment: "Cancelled by employee.",
        };
      }),
    );

    toast.info(`Leave request ${leaveId} cancelled.`);
  };

  const getLeaveById = (leaveId: string) => {
    return leavesList.find((l) => l.id === leaveId);
  };

  return (
    <LeaveContext.Provider
      value={{
        leaves: leavesList,
        balances: balancesList,
        applyLeave,
        approveLeave,
        rejectLeave,
        cancelLeave,
        getLeaveById,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeaves(): LeaveContextValue {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error("useLeaves must be used within a LeaveProvider");
  return ctx;
}
