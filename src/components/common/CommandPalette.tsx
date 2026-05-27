import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { customers, returns } from "@/lib/mock/data";
import { RotateCcw, User, Package } from "lucide-react";

export function CommandPalette() {
  const open = useUIStore((s) => s.cmdkOpen);
  const setOpen = useUIStore((s) => s.setCmdkOpen);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const lowQ = debounced.toLowerCase().trim();
  const filteredReturns = useMemo(
    () =>
      returns
        .filter(
          (r) =>
            !lowQ ||
            r.id.toLowerCase().includes(lowQ) ||
            r.customer.name.toLowerCase().includes(lowQ) ||
            r.product.name.toLowerCase().includes(lowQ),
        )
        .slice(0, 6),
    [lowQ],
  );
  const filteredCustomers = useMemo(
    () =>
      customers
        .filter(
          (c) =>
            !lowQ || c.name.toLowerCase().includes(lowQ) || c.email.toLowerCase().includes(lowQ),
        )
        .slice(0, 5),
    [lowQ],
  );
  const filteredProducts = useMemo(() => {
    const seen = new Set<string>();
    const out: { name: string; sku: string }[] = [];
    for (const r of returns) {
      if (seen.has(r.product.sku)) continue;
      seen.add(r.product.sku);
      if (
        !lowQ ||
        r.product.name.toLowerCase().includes(lowQ) ||
        r.product.sku.toLowerCase().includes(lowQ)
      ) {
        out.push({ name: r.product.name, sku: r.product.sku });
      }
      if (out.length >= 5) break;
    }
    return out;
  }, [lowQ]);

  function go(path: string) {
    setOpen(false);
    setQ("");
    navigate({ to: path });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search returns, customers, products…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {filteredReturns.length > 0 && (
          <CommandGroup heading="Returns">
            {filteredReturns.map((r) => (
              <CommandItem
                key={r.id}
                value={`${r.id} ${r.customer.name}`}
                onSelect={() => go(`/returns/${r.id}`)}
              >
                <RotateCcw className="mr-2 h-4 w-4 text-primary" />
                <span className="font-mono text-xs text-primary">{r.id}</span>
                <span className="ml-2 text-muted-foreground">— {r.customer.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {filteredCustomers.length > 0 && (
          <CommandGroup heading="Customers">
            {filteredCustomers.map((c) => (
              <CommandItem
                key={c.id}
                value={c.name + c.email}
                onSelect={() => go(`/customers/${c.id}`)}
              >
                <User className="mr-2 h-4 w-4" />
                {c.name}
                <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {filteredProducts.length > 0 && (
          <CommandGroup heading="Products">
            {filteredProducts.map((p) => (
              <CommandItem key={p.sku} value={p.name + p.sku} onSelect={() => go(`/products`)}>
                <Package className="mr-2 h-4 w-4" />
                {p.name}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{p.sku}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
