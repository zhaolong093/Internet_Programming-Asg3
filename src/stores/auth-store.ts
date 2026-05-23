import { create } from "zustand";

export type Role = "admin" | "staff" | "customer";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  login: (email: string, role?: Role) => AuthUser;
  register: (name: string, email: string) => AuthUser;
  logout: () => void;
}

const TOKEN_KEY = "lreturns_token";
const USER_KEY = "lreturns_user";
const USERS_KEY = "lreturns_users";

function makeUser(email: string, role: Role = "admin", overrideName?: string): AuthUser {
  const local = email.split("@")[0] || "user";
  const parts = local.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  const autoName = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join(" ") || "User";
  const name = overrideName || autoName;
  const nameParts = name.trim().split(" ");
  const initials = (nameParts[0]?.[0] ?? "A").toUpperCase() + (nameParts[1]?.[0] ?? "U").toUpperCase();
  return { id: "u-" + Math.random().toString(36).slice(2, 8), name, email, role, initials };
}

// Look up an existing user by email in lreturns_users so login
// never overwrites their stored role
function findExistingUser(email: string): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return null;
    const users: AuthUser[] = JSON.parse(raw);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      try {
        set({ token, user: JSON.parse(userRaw), isAuthenticated: true });
      } catch {
        /* ignore */
      }
    }
  },
  login: (email, role) => {
    const existing = findExistingUser(email);
    const resolvedRole: Role = existing?.role ?? role ?? "admin";
    const user = existing 
      ? { ...existing} 
      : makeUser(email, resolvedRole);

    const token = "mock-" + Math.random().toString(36).slice(2);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
    return user;
  },
  
  register: (name, email) => {
    const user  = makeUser (email, "customer", name);
    const token = "mock-" + Math.random().toString(36).slice(2);
    if (typeof window !== "undefined"){
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({user, token, isAuthenticated: true});
    return user;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));