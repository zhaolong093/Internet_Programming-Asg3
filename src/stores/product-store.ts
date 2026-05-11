import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, p: Partial<Omit<Product, "id" | "createdAt">>) => void;

}

const STORAGE_KEY = "lreturns_products";

const defaultProducts: Product[] = [
  { id: "p-001", name: "Aurora Wool Coat", sku: "AWC-1042", category: "Apparel", price: 289, stock: 42, description: "Premium merino wool coat.", createdAt: "2026-01-10T09:00:00Z" },
  { id: "p-002", name: "Drift Runner Sneakers", sku: "DRN-220", category: "Footwear", price: 149, stock: 88, description: "Lightweight daily trainer.", createdAt: "2026-01-12T09:00:00Z" },
  { id: "p-003", name: "Heron Wireless Earbuds", sku: "HWE-540", category: "Electronics", price: 199, stock: 55, description: "Active noise cancellation.", createdAt: "2026-01-15T09:00:00Z" },
  { id: "p-004", name: "Pulse Smart Watch", sku: "PSW-712", category: "Electronics", price: 329, stock: 30, description: "Health tracking & notifications.", createdAt: "2026-02-01T09:00:00Z" },
  { id: "p-005", name: "Atlas Carry-On 35L", sku: "ATC-091", category: "Luggage", price: 245, stock: 17, description: "TSA-approved hardshell carry-on.", createdAt: "2026-02-10T09:00:00Z" },
];

function load(): Product[] {
  if (typeof window === "undefined") return defaultProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

function save(products: Product[]) {
  if (typeof window !== "undefined")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: load(),
  addProduct: (p) => {
    const newProduct: Product = {
      ...p,
      id: "p-" + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...get().products];
    save(updated);
    set({ products: updated });
  },
  removeProduct: (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    save(updated);
    set({ products: updated });
  },
  updateProduct: (id, p) => {
  const updated = get().products.map((prod) =>
    prod.id === id ? { ...prod, ...p } : prod
  );
  save(updated);
  set({ products: updated });
},
}));