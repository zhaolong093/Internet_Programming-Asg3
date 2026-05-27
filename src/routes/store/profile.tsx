import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Mail, Lock, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { useUserStore } from "@/stores/user-store";

export const Route = createFileRoute("/store/profile")({
  head: () => ({ meta: [{ title: "My Profile — Lreturns" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useUserStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuth) navigate({ to: "/login" });
  }, [isAuth, navigate]);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";
    if (newPw && newPw.length < 8) e.newPw = "Password must be at least 8 characters.";
    if (newPw && newPw !== confirmPw) e.confirmPw = "Passwords do not match.";
    if (newPw && !currentPw) e.currentPw = "Enter your current password to change it.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !user) return;
    // Update in user store (admin can see changes)
    updateUser(user.id, { name: name.trim(), email: email.trim() });
    // Update the active session's display name too
    const stored = localStorage.getItem("lreturns_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      const nameParts = name.trim().split(" ");
      const initials =
        (nameParts[0]?.[0] ?? "U").toUpperCase() + (nameParts[1]?.[0] ?? "").toUpperCase();
      localStorage.setItem(
        "lreturns_user",
        JSON.stringify({ ...parsed, name: name.trim(), email: email.trim(), initials }),
      );
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success("Profile updated successfully.");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/store">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Shop
          </Button>
        </Link>
        <h1 className="font-display text-2xl font-semibold">My Profile</h1>
      </div>

      {/* Avatar / header card */}
      <div className="flex items-center gap-5 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {user.initials}
        </div>
        <div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-1 inline-flex items-center rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
            {user.role}
          </div>
        </div>
        {saved && (
          <div className="ml-auto flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} noValidate className="space-y-5">
        {/* Personal info */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-medium mb-2">
            <User className="h-4 w-4 text-primary" /> Personal Information
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Full Name</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="p-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-medium mb-2">
            <Lock className="h-4 w-4 text-primary" /> Change Password
            <span className="text-xs font-normal text-muted-foreground">
              (leave blank to keep current)
            </span>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cur-pw">Current Password</Label>
            <Input
              id="cur-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
            {errors.currentPw && <p className="text-xs text-destructive">{errors.currentPw}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
              />
              {errors.newPw && <p className="text-xs text-destructive">{errors.newPw}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="conf-pw">Confirm New Password</Label>
              <Input
                id="conf-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat password"
              />
              {errors.confirmPw && <p className="text-xs text-destructive">{errors.confirmPw}</p>}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </form>
    </div>
  );
}
