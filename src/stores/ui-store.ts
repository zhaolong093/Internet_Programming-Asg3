import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: (v: boolean) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  hydrate: () => void;
}

const THEME_KEY = "lreturns_theme";

function applyTheme(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  theme: "light",
  setTheme: (t) => {
    if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
    set({ theme: t });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  cmdkOpen: false,
  setCmdkOpen: (v) => set({ cmdkOpen: v }),
  notifOpen: false,
  setNotifOpen: (v) => set({ notifOpen: v }),
  hydrate: () => {
    if (typeof window === "undefined") return;
    const t = (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
    applyTheme(t);
    set({ theme: t });
  },
}));