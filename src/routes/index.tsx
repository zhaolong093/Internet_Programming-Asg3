import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role)
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-background" />;
  if (!isAuth) return <Navigate to= "/store" />;
  if (role === "customer") return <Navigate to="/store" />;
  return <Navigate to="/dashboard" />;
}
