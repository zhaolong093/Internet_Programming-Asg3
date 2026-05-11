import { create } from "zustand";
import type { AuthUser } from "./auth-store";

const STORAGE_KEY = "lreturns_users";

interface UserState {
  users: AuthUser[];
  addUser: (u: AuthUser) => void;
  updateUser: (id: string, patch: Partial<Pick<AuthUser, "name" | "email" | "role">>) => void;
}

function load(): AuthUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(users: AuthUser[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const useUserStore = create<UserState>((set, get) => ({
  users: load(),
  addUser: (u) => {
    const already = get().users.find((x) => x.id === u.id);
    if (already) return;
    const updated = [u, ...get().users];
    save(updated);
    set({ users: updated });
    },
  updateUser: (id, patch) => {
  const updated = get().users.map((u) => u.id === id ? { ...u, ...patch } : u);
  save(updated);
  set({ users: updated });
    },
}));