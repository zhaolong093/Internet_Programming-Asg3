import { create } from "zustand";

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
  status: "processing" | "shipped" | "delivered" | "cancelled";
}

interface OrderState {
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "placedAt" | "status">) => Order;
}

const STORAGE_KEY = "lreturns_orders";

function load(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(orders: Order[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: load(),
  placeOrder: (o) => {
    const order: Order = {
      ...o,
      id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      placedAt: new Date().toISOString(),
      status: "processing",
    };
    const updated = [order, ...get().orders];
    save(updated);
    set({ orders: updated });
    return order;
  },
}));