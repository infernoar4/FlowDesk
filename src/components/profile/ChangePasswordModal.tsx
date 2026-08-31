import { useEffect, useState } from "react";
import { Modal } from "@/components/ui-kit/Modal";
import { Button } from "@/components/ui-kit/Button";
import { toast } from "sonner";

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring font-medium";
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground block";

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setError(null);
    }
  }, [open]);

  const handleSave = () => {
    setError(null);
    if (!current) {
      setError("Please enter your current password.");
      return;
    }
    if (next.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }

    toast.success("Password updated successfully.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Password"
      description="Keep your FlowDesk account secure."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Password</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="currentPassword">
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            className={inputClass}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            className={inputClass}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
