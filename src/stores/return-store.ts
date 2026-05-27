import { create } from "zustand";
import { returns as mockReturns } from "@/lib/mock/data";
import type { ReturnItem, ReturnStatus } from "@/lib/mock/types";

interface ReturnState {
  returns: ReturnItem[];
  updateStatus: (id: string, status: ReturnStatus) => void;
  addNote: (id: string, author: string, text: string) => void;
  bulkUpdateStatus: (ids: string[], status: ReturnStatus) => void;
}

const STORAGE_KEY = "lreturns_returns";

function load(): ReturnItem[] {
  if (typeof window === "undefined") return mockReturns;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : mockReturns;
  } catch {
    return mockReturns;
  }
}

function save(returns: ReturnItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
}

export const useReturnStore = create<ReturnState>((set, get) => ({
  returns: load(),

  updateStatus: (id, status) => {
    const updated = get().returns.map((r) =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r,
    );
    save(updated);
    set({ returns: updated });
  },

  addNote: (id, author, text) => {
    const updated = get().returns.map((r) =>
      r.id === id
        ? {
            ...r,
            notes: [
              ...r.notes,
              {
                id: "n-" + Math.random().toString(36).slice(2, 7),
                author,
                createdAt: new Date().toISOString(),
                text,
              },
            ],
          }
        : r,
    );
    save(updated);
    set({ returns: updated });
  },

  bulkUpdateStatus: (ids, status) => {
    const idSet = new Set(ids);
    const updated = get().returns.map((r) =>
      idSet.has(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r,
    );
    save(updated);
    set({ returns: updated });
  },
}));
