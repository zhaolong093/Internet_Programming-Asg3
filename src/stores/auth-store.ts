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
  login:    (email: string, roleHint?: Role, password?: string) => Promise<AuthUser>;
  register: (name: string, email: string, password?: string)   => Promise<AuthUser>;
  logout: () => void;
}
// const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TOKEN_KEY = "lreturns_token";
const USER_KEY  = "lreturns_user";
const API       = import.meta.env.VITE_API_URL || "http://localhost:4000";

// List admin emails — users matching these always get admin role
const ADMIN_EMAILS = ["admin@lreturns.com"];

function makeUser(email: string, role: Role = "customer", overrideName?: string): AuthUser {
  const local = email.split("@")[0] || "user";
  const parts = local.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  const autoName = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join(" ") || "User";
  const name = overrideName || autoName;
  const nameParts = name.trim().split(" ");
  const initials = (nameParts[0]?.[0] ?? "U").toUpperCase() + (nameParts[1]?.[0] ?? "").toUpperCase();
  return { id: "u-" + Math.random().toString(36).slice(2, 8), name, email, role, initials };
}

function resolveRole(email: string, storedRole: Role): Role {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : storedRole;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Restores session from localStorage on page load
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token   = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!token || !userRaw) return;
    try {
      const user = JSON.parse(userRaw) as AuthUser;
      if (user && user.id) {
        set({ token, user, isAuthenticated: true });
      }
    } catch { /* corrupted — ignore */ }
  },

  login: async (email, roleHint, password?: string) => {
    try {
      // Try MongoDB first
      const res  = await fetch(`${API}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const { user: dbUser } = await res.json();
        const user: AuthUser = {
          id:       dbUser.id,
          name:     dbUser.name,
          email:    dbUser.email,
          role:     resolveRole(dbUser.email, dbUser.role),
          initials: dbUser.initials,
        };
        const token = "tok-" + Math.random().toString(36).slice(2);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return user;
      }
      const err = await res.json();
      throw new Error(err.message ?? "Login failed");
    } catch (err) {
      /* server not running — fall through to local */
      throw err;
    }

    // Fallback: create local user (works offline / dev)
    const role = ADMIN_EMAILS.includes(email.toLowerCase())
      ? "admin"
      : (roleHint ?? "admin");
    const user  = makeUser(email, role);
    const token = "tok-" + Math.random().toString(36).slice(2);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
    return user;
  },

  register: async (name, email, password?: string) => {
    const user  = makeUser(email, "customer", name);
    const token = "tok-" + Math.random().toString(36).slice(2);

    try {
      // Save to MongoDB
      const res = await fetch(`${API}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...user, password }),
      });
      if (!res.ok){
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
    } catch (err)       {
      throw err; /* In a real app, you'd want better error handling here. For now, just fail if the server isn't running, since we don't want silent fallbacks on registration. */
       /* server not running — continue anyway */ 
      }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
    window.location.replace("/login");
  },
}));
