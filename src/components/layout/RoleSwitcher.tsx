import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserCog, AlertCircle, ShieldAlert, ArrowRight, X } from "lucide-react";
import { useRole, type Role } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui-kit/Button";
import { toast } from "sonner";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const roleOptions: { value: Role; label: string; email: string }[] = [
    { value: "employee", label: "Employee Persona", email: "alex.morgan@flowdesk.co" },
    { value: "support", label: "IT Support Persona", email: "rahul.verma@flowdesk.co" },
    { value: "manager", label: "Manager / HR Persona", email: "sarah.connor@flowdesk.co" },
  ];

  const targetRoleObj = roleOptions.find((r) => r.value === pendingRole);

  const handleConfirmSwitch = () => {
    if (!pendingRole) return;

    const selected = pendingRole;
    setRole(selected);
    logout();
    setPendingRole(null);

    toast.info(
      `Role switched to ${selected.toUpperCase()}. Please sign in with ${targetRoleObj?.label} credentials.`,
      { duration: 5000 },
    );

    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Current Active Role</div>
            <div className="text-xs text-muted-foreground">
              You are currently viewing as{" "}
              <span className="font-semibold text-primary capitalize">{role}</span>.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-muted p-1 rounded-xl border border-border">
          {roleOptions.map((opt) => {
            const isActive = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (opt.value !== role) {
                    setPendingRole(opt.value);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-soft border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Switch Confirmation Modal */}
      {pendingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setPendingRole(null)}
          />
          <div className="relative bg-card w-full max-w-md rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-base">
                <AlertCircle className="h-5 w-5" /> Confirm Role Switch
              </div>
              <button
                type="button"
                onClick={() => setPendingRole(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-foreground leading-relaxed">
              <p>
                Are you sure you want to switch your active role to{" "}
                <strong className="text-primary capitalize">{pendingRole}</strong>?
              </p>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  You will be logged out of your current session and redirected to the Sign In page
                  to continue with {targetRoleObj?.label} credentials (e.g.{" "}
                  <span className="font-semibold">{targetRoleObj?.email}</span>).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setPendingRole(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSwitch}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Proceed & Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
