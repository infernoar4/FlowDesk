import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";

export const Route = createFileRoute("/_app/announcements")({
  head: () => ({ meta: [{ title: "Announcements — FlowDesk" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Company-wide updates from HR, IT and leadership."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>New Announcement</Button>}
      />
      <EmptyState
        icon={<Megaphone className="h-6 w-6" />}
        title="Announcements module coming soon"
        description="Broadcast, target and archive announcements from a single stream."
      />
    </div>
  );
}
