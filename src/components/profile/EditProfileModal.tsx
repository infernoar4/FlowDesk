import { useEffect, useState } from "react";
import { Modal } from "@/components/ui-kit/Modal";
import { Button } from "@/components/ui-kit/Button";
import type { UserProfile } from "@/data/profile";

export type ProfileDraft = Pick<
  UserProfile,
  "phone" | "emergencyContact" | "address" | "photoUrl"
>;

interface Props {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (draft: ProfileDraft) => void;
}

const inputClass =
  "mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring";
const readOnlyClass =
  "mt-1 w-full h-10 px-3 rounded-lg bg-muted border border-transparent text-sm text-muted-foreground flex items-center";
const labelClass = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className={labelClass}>{label}</div>
      <div className={readOnlyClass}>{value}</div>
    </div>
  );
}

export function EditProfileModal({ open, profile, onClose, onSave }: Props) {
  const [phone, setPhone] = useState(profile.phone);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [address, setAddress] = useState(profile.address);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhone(profile.phone);
    setEmergencyContact(profile.emergencyContact);
    setAddress(profile.address);
    setPhotoUrl(profile.photoUrl ?? "");
    setError(null);
  }, [open, profile]);

  const submit = () => {
    if (!phone.trim()) return setError("Phone number is required.");
    if (!emergencyContact.trim()) return setError("Emergency contact is required.");
    setError(null);
    onSave({
      phone: phone.trim(),
      emergencyContact: emergencyContact.trim(),
      address: address.trim(),
      photoUrl: photoUrl.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Profile"
      description="Update your contact details. Company records stay read-only."
      maxWidthClass="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${profile.fullName} profile photo`}
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              {profile.initials}
            </div>
          )}
          <div className="flex-1">
            <label className={labelClass} htmlFor="photoUrl">
              Profile Photo URL
            </label>
            <input
              id="photoUrl"
              className={inputClass}
              value={photoUrl}
              placeholder="https://…"
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="emergency">
              Emergency Contact
            </label>
            <input
              id="emergency"
              className={inputClass}
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="address">
              Residential Address
            </label>
            <textarea
              id="address"
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <ReadOnlyField label="Employee ID" value={profile.employeeId} />
          <ReadOnlyField label="Username" value={profile.username} />
          <ReadOnlyField label="Department" value={profile.department} />
          <ReadOnlyField label="Designation" value={profile.designation} />
          <ReadOnlyField label="Company Email" value={profile.companyEmail} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}
