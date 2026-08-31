import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui-kit/Button";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserCheck, Shield, KeyRound, Eye, EyeOff, UserPlus, X, CheckCircle2 } from "lucide-react";
import type { Role } from "@/context/RoleContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FlowDesk" }] }),
  component: LoginPageWrapper,
});

function LoginPageWrapper() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

function LoginPage() {
  const { login, loginAsDemo, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid work email address (e.g. alex.lee@flowdesk.co).");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const success = login(email, password, rememberMe);
    setIsSubmitting(false);
    if (success) {
      navigate({ to: "/" });
    } else {
      setFormError("Invalid username or password");
    }
  };

  const handleDemoLogin = (role: Role) => {
    loginAsDemo(role);
    navigate({ to: "/" });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground p-12">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center font-bold">
            F
          </div>
          <span className="text-lg font-semibold">FlowDesk</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight max-w-md">
            One workspace for tickets, people and operations.
          </h1>
          <p className="mt-4 text-white/80 max-w-md">
            Tickets, leave, assets, announcements and meeting rooms — all in a single, calm
            interface.
          </p>
          <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <KeyRound className="h-4 w-4" /> Quick Demo Credentials
            </div>
            <p className="text-xs text-white/80">
              <strong className="text-white">Employee:</strong> alex.morgan@flowdesk.co /
              password123
              <br />
              <strong className="text-white">IT Support:</strong> rahul.verma@flowdesk.co /
              password123
              <br />
              <strong className="text-white">Manager / HR:</strong> sarah.connor@flowdesk.co /
              password123
            </p>
          </div>
        </div>
        <div className="text-sm text-white/70">© 2026 FlowDesk</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              F
            </div>
            <span className="text-lg font-semibold text-foreground">FlowDesk</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your workspace.
          </p>

          {/* Quick Demo Sign-In Buttons */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("employee")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:bg-accent text-[11px] font-medium transition-colors text-foreground"
            >
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("support")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:bg-accent text-[11px] font-medium transition-colors text-foreground"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              Support
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("manager")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-border bg-card hover:bg-accent text-[11px] font-medium transition-colors text-foreground"
            >
              <UserCheck className="h-3.5 w-3.5 text-amber-500" />
              Manager / HR
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-background px-2 text-muted-foreground">
                or sign in with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-3 pr-10 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                Remember me on this device
              </label>
            </div>

            {formError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
                {formError}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setSignUpOpen(true)}
              className="font-semibold text-primary hover:underline"
            >
              Sign up here
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            By continuing, you agree to FlowDesk's Terms and Privacy Policy.
          </p>
        </div>
      </div>

      <SignUpModal open={signUpOpen} onClose={() => setSignUpOpen(false)} />
    </div>
  );
}

function SignUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState("Operations");
  const [designation, setDesignation] = useState("Team Member");
  const [role, setRole] = useState<Role>("employee");

  if (!open) return null;

  // Password strength meter calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-muted" };
    if (pass.length < 6) return { score: 1, label: "Weak (6+ chars needed)", color: "bg-red-500" };
    if (pass.length < 10 || !/\d/.test(pass))
      return { score: 2, label: "Medium", color: "bg-yellow-500" };
    return { score: 3, label: "Strong password", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = registerUser(
      {
        fullName,
        companyEmail: email,
        password,
        department,
        designation,
        role,
      },
      true,
    );

    if (success) {
      onClose();
      navigate({ to: "/" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              F
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Create Employee Account</h2>
              <p className="text-xs text-muted-foreground">Register your workplace profile.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah.connor@flowdesk.co"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Operations"
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Designation</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Specialist"
                className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("employee")}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  role === "employee"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Employee
              </button>
              <button
                type="button"
                onClick={() => setRole("support")}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  role === "support"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <Shield className="h-3.5 w-3.5" /> IT Support
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-10 pl-3 pr-10 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter bar */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground flex justify-between">
                  <span>Strength: {strength.label}</span>
                  {password.length >= 6 && (
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Valid
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<UserPlus className="h-4 w-4" />}>
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
