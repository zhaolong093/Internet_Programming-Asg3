import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/stores/auth-store";
import { useUserStore } from "@/stores/user-store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Lreturns" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const addUser = useUserStore((s) => s.addUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const role = useAuthStore((s) => s.user?.role);
  useEffect(() => {
    if (isAuth) window.location.replace(role === "customer" ? "/store" : "/dashboard"); // Force full reload to reset all stores and avoid SSR hydration issues
  }, [isAuth, role, navigate]);

  function validate(field?: "email" | "password") {
    const result = schema.safeParse({ email, password });
    if (result.success) {
      setErrors({});
      return true;
    }
    const e: typeof errors = {};
    for (const issue of result.error.issues) {
      const f = issue.path[0] as "email" | "password";
      if (!field || field === f) e[f] = issue.message;
    }
    setErrors((prev) => ({ ...prev, ...e }));
    return false;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // [BACKEND HOOK] POST /api/auth/login { email, password }
    await new Promise((r) => setTimeout(r, 700));
    try {
      const user = await login(email, password);
      addUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      window.location.replace(user.role === "customer" ? "/store" : "/dashboard"); // Force full reload to reset all stores and avoid SSR hydration issues
    } catch {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[55fr_45fr]">
      {/* Hero panel */}
      <div className="lr-grid-bg relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative">
          <Logo invert size="md" />
        </div>
        <div className="relative max-w-lg">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Returns,
            <br />
            Reimagined.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            The smartest way to manage product returns at scale.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { v: "98%", l: "Customer Satisfaction" },
            { v: "2.4x", l: "Faster Processing" },
            { v: "0", l: "Integration Headaches" },
          ].map((s, i) => (
            <div
              key={s.l}
              className="lr-fade-up rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              style={{ animationDelay: `${150 * (i + 1)}ms` }}
            >
              <div className="font-display text-2xl font-semibold">{s.v}</div>
              <div className="mt-1 text-xs text-slate-300">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-card px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="md" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your Lreturns account</p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validate("email")}
                  className="pl-9"
                  placeholder="you@company.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => validate("password")}
                  className="px-9"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox /> Remember me
              </label>
              <a href="#" className="font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>

            {/* <div className="relative my-2 text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-card px-2">or continue with</span>
              <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
            </div> */}

            {/* <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" onClick={() => toast.message("SSO is mocked in this demo.")}>
                <GoogleIcon /> Google
              </Button>
              <Button variant="outline" type="button" onClick={() => toast.message("SSO is mocked in this demo.")}>
                <MicrosoftIcon /> Microsoft
              </Button>
            </div> */}

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-primary hover:underline">
                Create one
              </a>
              {" . "}
              <a href="/store" className="font-medium text-primary hover:underline">
                Browse as guest
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.6 14.7 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.5H12z"
      />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#F25022" d="M3 3h8v8H3z" />
      <path fill="#7FBA00" d="M13 3h8v8h-8z" />
      <path fill="#00A4EF" d="M3 13h8v8H3z" />
      <path fill="#FFB900" d="M13 13h8v8h-8z" />
    </svg>
  );
}
