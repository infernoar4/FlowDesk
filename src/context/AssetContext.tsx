import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  assets as initialAssets,
  type AssetRequest,
  type AssetCategory,
  type AssetStatus,
} from "@/data/assets";
import { useAuth } from "./AuthContext";

interface AssetContextValue {
  assets: AssetRequest[];
  requestAsset: (draft: { category: AssetCategory; reason: string }) => AssetRequest | null;
  approveAssetRequest: (requestId: string, comment?: string) => void;
  rejectAssetRequest: (requestId: string, reason?: string) => void;
  assignPhysicalAsset: (requestId: string, assetId: string, assetName: string) => void;
  requestReturn: (requestId: string, reason?: string) => void;
  confirmReturn: (requestId: string) => void;
  getAssetById: (requestId: string) => AssetRequest | undefined;
}

const AssetContext = createContext<AssetContextValue | undefined>(undefined);
const ASSETS_STORAGE_KEY = "flowdesk_assets_data";

export function AssetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [assetsList, setAssetsList] = useState<AssetRequest[]>(() => {
    try {
      const saved = localStorage.getItem(ASSETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return initialAssets;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assetsList));
    } catch {
      // Storage save fallback
    }
  }, [assetsList]);

  const requestAsset = (draft: {
    category: AssetCategory;
    reason: string;
  }): AssetRequest | null => {
    const reporterName = user?.fullName || "Alex Morgan";

    // Business rule: Check if employee already has an active assignment for this category
    const hasActive = assetsList.some(
      (a) =>
        (a.employee === reporterName || a.employee === "Alex Morgan") &&
        a.category === draft.category &&
        (a.status === "assigned" || a.status === "return_requested" || a.status === "pending"),
    );

    if (hasActive) {
      toast.error(`You already have an active request or assignment for a ${draft.category}.`);
      return null;
    }

    const nextNum = 2056 + Math.floor(Math.random() * 100);
    const newId = `AR-${nextNum}`;
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newRequest: AssetRequest = {
      id: newId,
      employee: reporterName,
      category: draft.category,
      reason: draft.reason.trim(),
      requestedOn: todayStr,
      status: "pending",
    };

    setAssetsList((prev) => [newRequest, ...prev]);
    toast.success(`Hardware request ${newId} submitted for ${draft.category}.`);
    return newRequest;
  };

  const approveAssetRequest = (requestId: string, comment?: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Rahul Verma";

    setAssetsList((prev) =>
      prev.map((a) => {
        if (a.id !== requestId) return a;
        const newComments = a.comments ? [...a.comments] : [];
        if (comment) {
          newComments.push({
            author: reviewerName,
            date: todayStr,
            message: comment,
          });
        }
        return {
          ...a,
          status: "approved",
          reviewedBy: reviewerName,
          reviewedOn: todayStr,
          comments: newComments,
        };
      }),
    );

    toast.success(`Asset request ${requestId} approved.`);
  };

  const rejectAssetRequest = (requestId: string, reason?: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Rahul Verma";

    setAssetsList((prev) =>
      prev.map((a) => {
        if (a.id !== requestId) return a;
        return {
          ...a,
          status: "rejected",
          reviewedBy: reviewerName,
          reviewedOn: todayStr,
          rejectionReason: reason || "Does not meet standard IT hardware catalog rules.",
        };
      }),
    );

    toast.error(`Asset request ${requestId} rejected.`);
  };

  const assignPhysicalAsset = (requestId: string, assetId: string, assetName: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Rahul Verma";

    setAssetsList((prev) =>
      prev.map((a) => {
        if (a.id !== requestId) return a;
        const newComments = a.comments ? [...a.comments] : [];
        newComments.push({
          author: reviewerName,
          date: todayStr,
          message: `Assigned physical hardware asset: ${assetName} (${assetId}).`,
        });

        return {
          ...a,
          status: "assigned",
          assetId,
          assetName,
          assignedOn: todayStr,
          comments: newComments,
        };
      }),
    );

    toast.success(`Hardware asset ${assetId} assigned to request ${requestId}.`);
  };

  const requestReturn = (requestId: string, reason?: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reporterName = user?.fullName || "Alex Morgan";

    setAssetsList((prev) =>
      prev.map((a) => {
        if (a.id !== requestId) return a;
        const newComments = a.comments ? [...a.comments] : [];
        if (reason) {
          newComments.push({
            author: reporterName,
            date: todayStr,
            message: `Return requested: ${reason}`,
          });
        }

        return {
          ...a,
          status: "return_requested",
          returnRequestedOn: todayStr,
          comments: newComments,
        };
      }),
    );

    toast.info(`Return initiated for asset request ${requestId}.`);
  };

  const confirmReturn = (requestId: string) => {
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const reviewerName = user?.fullName || "Rahul Verma";

    setAssetsList((prev) =>
      prev.map((a) => {
        if (a.id !== requestId) return a;
        const newComments = a.comments ? [...a.comments] : [];
        newComments.push({
          author: reviewerName,
          date: todayStr,
          message: "Asset received at IT desk in good condition. Return complete.",
        });

        return {
          ...a,
          status: "returned",
          returnedOn: todayStr,
          comments: newComments,
        };
      }),
    );

    toast.success(`Hardware asset return confirmed for ${requestId}.`);
  };

  const getAssetById = (requestId: string) => {
    return assetsList.find((a) => a.id === requestId);
  };

  return (
    <AssetContext.Provider
      value={{
        assets: assetsList,
        requestAsset,
        approveAssetRequest,
        rejectAssetRequest,
        assignPhysicalAsset,
        requestReturn,
        confirmReturn,
        getAssetById,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets(): AssetContextValue {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used within an AssetProvider");
  return ctx;
}
