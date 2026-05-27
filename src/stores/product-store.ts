import { create } from "zustand";
import { API_BASE, apiHeaders } from "@/lib/api";

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

export type ProductInput = Omit<Product, "id" | "createdAt">;

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  addProduct: (p: ProductInput) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, p: ProductInput) => Promise<Product>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: apiHeaders(),
    ...init,
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      /* response did not include JSON */
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await request<Product[]>("/api/products");
      set({ products, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Could not load products.",
      });
    }
  },

  addProduct: async (p) => {
    const product = await request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(p),
    });
    set({ products: [product, ...get().products], error: null });
    return product;
  },

  removeProduct: async (id) => {
    await request<void>(`/api/products/${id}`, { method: "DELETE" });
    set({
      products: get().products.filter((p) => p.id !== id),
      error: null,
    });
  },

  updateProduct: async (id, p) => {
    const product = await request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(p),
    });
    set({
      products: get().products.map((current) => (current.id === id ? product : current)),
      error: null,
    });
    return product;
  },
}));
