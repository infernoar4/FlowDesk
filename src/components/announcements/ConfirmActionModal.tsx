import { Button } from "@/components/ui-kit/Button";
import { AnnouncementModalShell } from "@/components/announcements/AnnouncementModalShell";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
}

export function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  destructive = false,
}: Props) {
  return (
    <AnnouncementModalShell
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </AnnouncementModalShell>
  );
}
