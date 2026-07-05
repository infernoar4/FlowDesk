import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/ui-kit/DashboardCard";
import { Button } from "@/components/ui-kit/Button";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — FlowDesk" }] }),
  component: ProfilePage,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your personal information and workspace preferences."
        actions={<Button variant="outline">Edit Profile</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
              AL
            </div>
            <div className="mt-3 text-lg font-semibold text-foreground">Alex Lee</div>
            <div className="text-sm text-muted-foreground">Operations Manager</div>
            <div className="mt-3"><StatusBadge status="active" /></div>
          </div>
        </DashboardCard>

        <DashboardCard title="Personal Information" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full name" value="Alex Lee" />
            <Field label="Email" value="alex.lee@flowdesk.co" />
            <Field label="Department" value="Operations" />
            <Field label="Employee ID" value="EMP-00214" />
            <Field label="Manager" value="Rachel Ortiz" />
            <Field label="Location" value="Berlin HQ" />
          </div>
        </DashboardCard>

        <DashboardCard title="Preferences" className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Field label="Language" value="English (US)" />
            <Field label="Timezone" value="Europe/Berlin" />
            <Field label="Notifications" value="Email + In-app" />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
