import { useEffect, useState } from "react";
import { Modal } from "@/components/ui-kit/Modal";
import { Button } from "@/components/ui-kit/Button";
import { BACKEND_PENDING_NOTE } from "@/data/profile";

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring";
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

export function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setNotice(null);
    }
  }, [open]);

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
          <Button onClick={() => setNotice(`Password management will be ${BACKEND_PENDING_NOTE.toLowerCase()}`)}>
            Save
          </Button>
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
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {notice && (
          <p className="rounded-lg bg-primary-soft/50 px-3 py-2 text-sm text-primary">
            {notice}
          </p>
        )}
      </div>
    </Modal>
  );
}
