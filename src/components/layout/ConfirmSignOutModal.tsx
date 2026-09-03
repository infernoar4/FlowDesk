import React from "react";
import { LogOut, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui-kit/Button";

interface ConfirmSignOutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export function ConfirmSignOutModal({ open, onClose, onConfirm, userName }: ConfirmSignOutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div 
        className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-soft">
          <AlertTriangle className="h-7 w-7 animate-pulse" />
        </div>

        {/* Content */}
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-bold text-foreground">Sign Out Confirmation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {userName ? (
              <>
                Are you sure you want to sign out, <span className="font-semibold text-foreground">{userName}</span>?
              </>
            ) : (
              "Are you sure you want to sign out of FlowDesk?"
            )}
            <br />
            You will need to log back in to access your tickets, requests, and workplace dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-11 border-border hover:bg-muted text-foreground font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl h-11 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
