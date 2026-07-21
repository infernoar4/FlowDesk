import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/meeting-rooms")({
  head: () => ({ meta: [{ title: "Meeting Rooms — FlowDesk" }] }),
  component: MeetingRoomsLayout,
});

function MeetingRoomsLayout() {
  return <Outlet />;
}
