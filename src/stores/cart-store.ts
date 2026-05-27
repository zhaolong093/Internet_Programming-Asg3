import { create } from "zustand";
import { API_BASE, apiHeaders } from "@/lib/api";
import type { AuthUser } from "./auth-store";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  customer: AuthUser | null;
  loading: boolean;
  error: string | null;
  setCustomer: (customer: AuthUser | null) => Promise<void>;
  add: (item: Omit<CartItem, "qty">) => Promise<void>;
  updateQty: (id: string, delta: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: apiHeaders(),
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(body.message || "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

async function saveCart(customer: AuthUser, items: CartItem[]) {
  return request<{ items: CartItem[] }>(`/api/carts/${encodeURIComponent(customer.email)}`, {
    method: "PUT",
    body: JSON.stringify({ customerName: customer.name, items }),
  });
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  loading: false,
  error: null,

  setCustomer: async (customer) => {
    const previousEmail = get().customer?.email;
    if (previousEmail === customer?.email) return;

    if (!customer) {
      set({ customer: null, items: [], loading: false, error: null });
      return;
    }

    const localItems = previousEmail ? [] : get().items;
    set({ customer, loading: true, error: null });
    try {
      const remoteCart = await request<{ items: CartItem[] }>(
        `/api/carts?customerEmail=${encodeURIComponent(customer.email)}`,
      );
      if (remoteCart.items.length === 0 && localItems.length > 0) {
        await saveCart(customer, localItems);
        set({ items: localItems, loading: false });
      } else {
        set({ items: remoteCart.items, loading: false });
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Could not load cart.",
      });
    }
  },

  add: async (item) => {
    const previousItems = get().items;
    const existing = previousItems.find((current) => current.id === item.id);
    const items = existing
      ? previousItems.map((current) =>
          current.id === item.id ? { ...current, qty: current.qty + 1 } : current,
        )
      : [...previousItems, { ...item, qty: 1 }];
    set({ items, error: null });
    if (!get().customer) return;
    try {
      const cart = await saveCart(get().customer!, items);
      set({ items: cart.items });
    } catch (error) {
      set({
        items: previousItems,
        error: error instanceof Error ? error.message : "Could not save cart.",
      });
    }
  },

  updateQty: async (id, delta) => {
    const previousItems = get().items;
    const items = previousItems
      .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
      .filter((item) => item.qty > 0);
    set({ items, error: null });
    if (!get().customer) return;
    try {
      const cart = await saveCart(get().customer!, items);
      set({ items: cart.items });
    } catch (error) {
      set({
        items: previousItems,
        error: error instanceof Error ? error.message : "Could not save cart.",
      });
    }
  },

  remove: async (id) => {
    const previousItems = get().items;
    const items = previousItems.filter((item) => item.id !== id);
    set({ items, error: null });
    if (!get().customer) return;
    try {
      const cart = await saveCart(get().customer!, items);
      set({ items: cart.items });
    } catch (error) {
      set({
        items: previousItems,
        error: error instanceof Error ? error.message : "Could not save cart.",
      });
    }
  },

  clear: async () => {
    const customer = get().customer;
    set({ items: [], error: null });
    if (!customer) return;
    try {
      await request<void>(`/api/carts/${encodeURIComponent(customer.email)}`, {
        method: "DELETE",
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Could not clear cart." });
    }
  },
}));
