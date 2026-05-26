import { create } from "zustand";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  address: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  placedAt: string;
  status: OrderStatus;
  adminNote: string;
}

type NewOrder = Omit<Order, "id" | "placedAt" | "status" | "subtotal" | "tax" | "total">;

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  placeOrder: (order: NewOrder) => Promise<Order>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateNote: (id: string, note: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(body.message || "Request failed.");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  loadOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await request<Order[]>("/api/orders");
      set({ orders, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Could not load orders.",
      });
    }
  },

  placeOrder: async (newOrder) => {
    const order = await request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(newOrder),
    });
    set({ orders: [order, ...get().orders], error: null });
    return order;
  },

  updateStatus: async (id, status) => {
    const order = await request<Order>(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    set({ orders: get().orders.map((current) => (current.id === id ? order : current)) });
  },

  updateNote: async (id, adminNote) => {
    const order = await request<Order>(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ adminNote }),
    });
    set({ orders: get().orders.map((current) => (current.id === id ? order : current)) });
  },

  deleteOrder: async (id) => {
    await request<void>(`/api/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
    set({ orders: get().orders.filter((order) => order.id !== id) });
  },
}));
