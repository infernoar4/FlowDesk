import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MeetingRoomViewProvider } from "@/context/MeetingRoomViewContext";
import { MeetingRoomViewSwitcher } from "@/components/meeting-rooms/MeetingRoomViewSwitcher";

export const Route = createFileRoute("/_app/meeting-rooms")({
  head: () => ({ meta: [{ title: "Meeting Rooms — FlowDesk" }] }),
  component: MeetingRoomsLayout,
});

function MeetingRoomsLayout() {
  return (
    <MeetingRoomViewProvider>
      <div className="flex justify-end mb-4">
        <MeetingRoomViewSwitcher />
      </div>
      <Outlet />
    </MeetingRoomViewProvider>
  );
}
