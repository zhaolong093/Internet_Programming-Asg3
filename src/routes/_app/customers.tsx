import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Search, ShieldCheck, ShoppingBag, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import type { AuthUser, Role } from "@/stores/auth-store";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({ meta: [{ title: "Customers — Lreturns" }] }),
  component: CustomersPage,
});

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-primary/10 text-primary border-primary/20" },
  staff: { label: "Staff", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  customer: { label: "Customer", className: "bg-muted text-muted-foreground border-border" },
};

function CustomersPage() {
  const { users, updateUser } = useUserStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "customer" as Role });

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    total: users.length,
    customers: users.filter((u) => u.role === "customer").length,
    admins: users.filter((u) => u.role === "admin" || u.role === "staff").length,
  };

  function startEdit(u: AuthUser) {
    setEditId(u.id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  }

  function saveEdit() {
    if (!editId) return;
    if (!editForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!editForm.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    updateUser(editId, {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: editForm.role,
    });
    toast.success("User updated.");
    setEditId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="All registered users across admin and storefront." />

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Users", value: counts.total, icon: Users },
          { label: "Customers", value: counts.customers, icon: ShoppingBag },
          { label: "Admin / Staff", value: counts.admins, icon: ShieldCheck },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border bg-card px-5 py-3 shadow-sm"
          >
            <s.icon className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xl font-bold leading-none">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "customer", "admin", "staff"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center shadow-sm">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">
            {users.length === 0
              ? "No users yet — they'll appear here after registering."
              : "No users match your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => {
                const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.customer;
                const isEditing = editId === u.id;
                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${isEditing ? "bg-primary/5" : "hover:bg-muted/20"}`}
                  >
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="h-8 w-36 text-sm"
                          placeholder="Full name"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {u.initials}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          className="h-8 w-48 text-sm"
                          placeholder="email@example.com"
                        />
                      ) : (
                        <span className="text-muted-foreground">{u.email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, role: e.target.value as Role }))
                          }
                          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" className="h-7 px-2" onClick={saveEdit}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => setEditId(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => startEdit(u)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
