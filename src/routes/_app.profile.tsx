import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  CalendarDays,
  DoorOpen,
  KeyRound,
  LogOut,
  Pencil,
  TicketCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { EditProfileModal, type ProfileDraft } from "@/components/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { useRole } from "@/context/RoleContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useAuth } from "@/context/AuthContext";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { ACTIVITY_SUMMARY, BACKEND_PENDING_NOTE, PROFILES, type UserProfile } from "@/data/profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — FlowDesk" },
      {
        name: "description",
        content:
          "View your FlowDesk profile: personal information, account details, preferences, security and workplace activity summary.",
      },
      { property: "og:title", content: "My Profile — FlowDesk" },
      {
        property: "og:description",
        content: "Personal information, account details, preferences and activity inside FlowDesk.",
      },
    ],
  }),
  component: ProfilePage,
});

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ActivityCard({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  children: (content: React.ReactNode) => React.ReactNode;
}) {
  return (
    <>
      {children(
        <div className="h-full rounded-xl border border-border bg-card shadow-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>,
      )}
    </>
  );
}

function ProfilePage() {
  const { role } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [overrides, setOverrides] = useState<Partial<Record<string, ProfileDraft>>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);

  const base = PROFILES[role];
  const profile: UserProfile = {
    ...base,
    fullName: user?.fullName || base.fullName,
    companyEmail: user?.companyEmail || base.companyEmail,
    employeeId: user?.employeeId || base.employeeId,
    department: user?.department || base.department,
    designation: user?.designation || base.designation,
    phone: user?.phone || base.phone,
    username: user?.username || base.username,
    initials: user?.initials || base.initials,
    ...(overrides[role] ?? {}),
  };
  const summary = ACTIVITY_SUMMARY[role];

  const handleSignOut = () => {
    logout();
    navigate({ to: "/login" });
  };

  const saveProfile = (draft: ProfileDraft) => {
    setOverrides((prev) => ({ ...prev, [role]: { ...prev[role], ...draft } }));
    setEditOpen(false);
  };

  const savePhone = () => {
    if (phoneDraft && phoneDraft.trim()) {
      setOverrides((prev) => ({
        ...prev,
        [role]: { ...(prev[role] as ProfileDraft), phone: phoneDraft.trim() },
      }));
    }
    setPhoneDraft(null);
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Your personal information, account details, role management, and workplace preferences."
        actions={
          <Button leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        }
      />

      <div className="mb-6">
        <RoleSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={`${profile.fullName} profile photo`}
                className="h-20 w-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                {profile.initials}
              </div>
            )}
            <div className="mt-3 text-lg font-semibold text-foreground">{profile.fullName}</div>
            <div className="text-sm text-muted-foreground">{profile.designation}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{profile.location}</div>
            <div className="mt-3">
              <StatusBadge status={profile.accountStatus} />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Personal Information"
          description="Company records are managed by HR and cannot be edited here."
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full name" value={profile.fullName} />
            <Field label="Employee ID" value={profile.employeeId} hint="Read-only" />
            <Field label="Department" value={profile.department} hint="Read-only" />
            <Field label="Designation" value={profile.designation} hint="Read-only" />
            <Field label="Company Email" value={profile.companyEmail} hint="Read-only" />

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone Number
              </div>
              {phoneDraft === null ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-foreground">{profile.phone}</span>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setPhoneDraft(profile.phone)}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <input
                    className="h-9 flex-1 min-w-40 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    aria-label="Phone number"
                  />
                  <Button size="sm" onClick={savePhone}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPhoneDraft(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Account" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Field label="Username" value={profile.username} />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Account Status
              </div>
              <div className="mt-1">
                <StatusBadge status={profile.accountStatus} />
              </div>
            </div>
            <Field label="Last Login" value={profile.lastLogin} />
          </div>
        </DashboardCard>

        <DashboardCard title="Security & Session" className="lg:col-span-1">
          <p className="text-sm text-muted-foreground">
            Manage your password or end your active session.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              leftIcon={<KeyRound className="h-4 w-4" />}
              onClick={() => setPasswordOpen(true)}
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-200 dark:border-red-900/50 hover:bg-red-500/10"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={handleSignOut}
            >
              Sign out of FlowDesk
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Preferences" className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field
              label="In-App Notifications"
              value={profile.inAppNotifications ? "Enabled" : "Disabled"}
            />
            <Field
              label="Email Notifications"
              value={profile.emailNotifications ? "Enabled" : "Disabled"}
            />
            <Field label="Theme Preference" value="System default" hint={BACKEND_PENDING_NOTE} />
            <Field label="Language" value="English (US)" hint={BACKEND_PENDING_NOTE} />
          </div>
        </DashboardCard>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-foreground">Activity Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ActivityCard
          label="Open Tickets"
          value={summary.openTickets}
          icon={<TicketCheck className="h-4 w-4" />}
        >
          {(content) => (
            <Link to="/tickets" className="block h-full">
              {content}
            </Link>
          )}
        </ActivityCard>
        <ActivityCard
          label="Leave Requests"
          value={summary.leaveRequests}
          icon={<CalendarDays className="h-4 w-4" />}
        >
          {(content) => (
            <Link to="/leave-requests" className="block h-full">
              {content}
            </Link>
          )}
        </ActivityCard>
        <ActivityCard
          label="Assigned Assets"
          value={summary.assignedAssets}
          icon={<Boxes className="h-4 w-4" />}
        >
          {(content) => (
            <Link to="/assets" className="block h-full">
              {content}
            </Link>
          )}
        </ActivityCard>
        <ActivityCard
          label="Upcoming Meetings"
          value={summary.upcomingMeetings}
          icon={<DoorOpen className="h-4 w-4" />}
        >
          {(content) => (
            <Link to="/meeting-rooms/bookings" className="block h-full">
              {content}
            </Link>
          )}
        </ActivityCard>
        <ActivityCard
          label="Unread Notifications"
          value={unreadCount}
          icon={<Bell className="h-4 w-4" />}
        >
          {(content) => (
            <Link to="/notifications" className="block h-full">
              {content}
            </Link>
          )}
        </ActivityCard>
      </div>

      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={saveProfile}
      />
      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}
