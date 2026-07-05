import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";

export const Route = createFileRoute("/_app/assets")({
  head: () => ({ meta: [{ title: "Assets — FlowDesk" }] }),
  component: AssetsPage,
});

function AssetsPage() {
  return (
    <div>
      <PageHeader
        title="Assets"
        description="Manage hardware, licenses and equipment assigned to your team."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Add Asset</Button>}
      />
      <EmptyState
        icon={<Boxes className="h-6 w-6" />}
        title="Asset inventory coming soon"
        description="The asset registry, assignment history and lifecycle tracking will appear here."
      />
    </div>
  );
}
