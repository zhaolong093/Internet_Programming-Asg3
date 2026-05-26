import { create } from "zustand";
import type { AuthUser } from "./auth-store";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface UserState {
  users: AuthUser[];
  loading: boolean;
  loadUsers: () => Promise<void>;
  addUser: (u: AuthUser) => Promise<void>;
  updateUser: (id: string, patch: Partial<Pick<AuthUser, "name" | "email" | "role">>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,

  loadUsers: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/api/users`);
      if (res.ok) set({ users: await res.json() });
    } catch { /* server down — stay empty */ }
    finally { set({ loading: false }); }
  },

  // addUser: async (u) => {
  //   // Avoid duplicate
  //   if (get().users.find((x) => x.id === u.id)) return;
  //   set({ users: [u, ...get().users] });
  //   try {
  //     await fetch(`${API}/api/auth/register`, {
  //       method:  "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body:    JSON.stringify(u),
  //     });
  //   } catch { /* ignore — local state already updated */ }
  // },
  addUser: async (u) => {
  if (get().users.find((x) => x.id === u.id)) return;
  set({ users: [u, ...get().users] });
},

  updateUser: async (id, patch) => {
    set({ users: get().users.map((u) => u.id === id ? { ...u, ...patch } : u) });
    try {
      await fetch(`${API}/api/users/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(patch),
      });
    } catch { /* ignore */ }
  },
}));