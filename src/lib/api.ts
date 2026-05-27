export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function apiHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;

  const token = localStorage.getItem("lreturns_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
