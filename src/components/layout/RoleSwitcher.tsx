import { UserCog } from "lucide-react";
import { useRole, type Role } from "@/context/RoleContext";

/**
 * Temporary role switcher for demo purposes only.
 * Replaced later by Spring Security / JWT authentication.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="hidden md:flex items-center gap-2 h-10 pl-3 pr-1 rounded-lg border border-border bg-background">
      <UserCog className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Viewing as</span>
      <div className="flex items-center rounded-md bg-muted p-0.5">
        {(
          [
            { value: "employee", label: "Employee" },
            { value: "support", label: "Support" },
          ] as { value: Role; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            className={[
              "px-2.5 h-7 rounded-md text-xs font-medium transition-colors",
              role === opt.value
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
