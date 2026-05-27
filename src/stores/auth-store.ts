import { create } from "zustand";
import { API_BASE } from "@/lib/api";

export type Role = "admin" | "staff" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const TOKEN_KEY = "lreturns_token";
const USER_KEY = "lreturns_user";

async function authRequest(path: string, payload: object) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({ message: "Authentication failed." }));
  if (!response.ok) {
    throw new Error(body.message || "Authentication failed.");
  }
  return body as AuthResponse;
}

function storeSession(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!token || !userRaw) return;

    try {
      const user = JSON.parse(userRaw) as AuthUser;
      if (user?.id) {
        set({ token, user, isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  login: async (email, password) => {
    const response = await authRequest("/api/auth/login", { email, password });
    storeSession(response);
    set({ user: response.user, token: response.token, isAuthenticated: true });
    return response.user;
  },

  register: async (name, email, password) => {
    const response = await authRequest("/api/auth/register", { name, email, password });
    storeSession(response);
    set({ user: response.user, token: response.token, isAuthenticated: true });
    return response.user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
    window.location.replace("/login");
  },
}));
