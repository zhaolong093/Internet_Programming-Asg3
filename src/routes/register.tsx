import { useUserStore } from "@/stores/user-store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — Lreturns" }] }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match.",
  path: ["confirm"],
});

function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const addUser = useUserStore((s) => s.addUser);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function validate() {
    const result = schema.safeParse(form);
    if (result.success) { setErrors({}); return true; }
    const e: Record<string, string> = {};
    for (const issue of result.error.issues) e[issue.path[0]] = issue.message;
    setErrors(e);
    return false;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // [BACKEND HOOK] POST /api/auth/register { name, email, password }
    await new Promise((r) => setTimeout(r, 700));
    try {
      // After register, auto-login the new customer
      const user = register(form.name, form.email);
      // Add the user to the user store
      addUser(user);
      // Override role to customer for self-registered accounts
      // [BACKEND HOOK] role will come from the API response
      toast.success("Account created! Welcome to Lreturns.");
      navigate({ to: "/store" });
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage your returns in one place.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" className="pl-9" placeholder="Jane Smith"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" className="pl-9" placeholder="you@email.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" className="pl-9" placeholder="At least 8 characters"
                value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          {/* Confirm */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm" type="password" className="pl-9" placeholder="Repeat password"
                value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
            </div>
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="ml-1 h-4 w-4" /></>}
          </Button>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}