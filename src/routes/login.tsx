import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui-kit/Button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FlowDesk" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground p-12">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center font-bold">F</div>
          <span className="text-lg font-semibold">FlowDesk</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight max-w-md">
            One workspace for tickets, people and operations.
          </h1>
          <p className="mt-4 text-white/80 max-w-md">
            Tickets, leave, assets, announcements and meeting rooms — all in a single, calm interface.
          </p>
        </div>
        <div className="text-sm text-white/70">© 2026 FlowDesk</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">F</div>
            <span className="text-lg font-semibold text-foreground">FlowDesk</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your workspace.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Work email</label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            <Link to="/" className="block">
              <Button type="button" className="w-full" size="lg">Sign in</Button>
            </Link>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" size="lg" type="button">
              Continue with SSO
            </Button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            By continuing, you agree to FlowDesk's Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
