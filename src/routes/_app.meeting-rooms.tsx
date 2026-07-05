import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";

export const Route = createFileRoute("/_app/meeting-rooms")({
  head: () => ({ meta: [{ title: "Meeting Rooms — FlowDesk" }] }),
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <div>
      <PageHeader
        title="Meeting Rooms"
        description="Browse availability and book rooms across offices."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Book Room</Button>}
      />
      <EmptyState
        icon={<DoorOpen className="h-6 w-6" />}
        title="Room booking coming soon"
        description="Room calendars, capacity filters and instant booking will appear here."
      />
    </div>
  );
}
