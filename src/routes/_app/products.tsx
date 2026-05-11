import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { useProductStore, type Product } from "@/stores/product-store";

export const Route = createFileRoute("/_app/products")({
  head: () => ({ meta: [{ title: "Products — Lreturns" }] }),
  component: AdminProductsPage,
});

const CATEGORIES = ["Apparel", "Footwear", "Electronics", "Luggage", "Home", "Other"];
const emptyForm = { name: "", sku: "", category: "Apparel", price: "", stock: "", description: "" };

function formFromProduct(p: Product) {
  return { 
    name: p.name, 
    sku: p.sku, 
    category: p.category, 
    price: String(p.price), 
    stock: String(p.stock), 
    description: p.description 
  };
}

function AdminProductsPage() {
  const { products, addProduct, removeProduct, updateProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  // editId = which product card is in edit mode
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const filtered = products.filter(
    (p) => !search 
    || p.name.toLowerCase().includes(search.toLowerCase()) 
    || p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  function validate(form: typeof emptyForm, setErrors: (e: Record<string, string>) => void) {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required.";
    if (!form.sku.trim()) e.sku = "Required.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price.";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Enter a valid quantity.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(addForm, setAddErrors)) return;
    addProduct({ 
      name: addForm.name.trim(), 
      sku: addForm.sku.trim().toUpperCase(), 
      category: addForm.category, 
      price: Number(addForm.price), 
      stock: Number(addForm.stock), 
      description: addForm.description.trim() 
    });
    toast.success(`"${addForm.name}" added to catalog.`);
    setAddForm(emptyForm);
    setShowAdd(false);
  }

  function startEdit(p: Product) {
    setEditId(p.id);
    setEditForm(formFromProduct(p));
    setEditErrors({});
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    if (!validate(editForm, setEditErrors)) return;
    updateProduct(editId, { 
      name: editForm.name.trim(), 
      sku: editForm.sku.trim().toUpperCase(), 
      category: editForm.category, 
      price: Number(editForm.price), 
      stock: Number(editForm.stock), 
      description: editForm.description.trim() 
    });
    toast.success(`"${editForm.name}" updated.`);
    setEditId(null);
  }

  function field(label: string, id: string, value: string, onChange: (v: string) => void, error?: string, rest?: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <div className="space-y-1.5">
        <Label>Category</Label>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage the product catalog visible to customers."
        actions={
          <Button onClick={() => { setShowAdd((v) => !v); setEditId(null); }}>
            {showAdd ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
            {showAdd ? "Cancel" : "Add Product"}
          </Button>
        }
      />

      {/* Add product form */}
      {showAdd && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-display mb-4 text-base font-semibold">New Product</h3>
          <form onSubmit={handleAdd} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("Product Name", "a-name", addForm.name, (v) => setAddForm((f) => ({ ...f, name: v })), addErrors.name, { placeholder: "e.g. Aurora Wool Coat" })}
            {field("SKU", "a-sku", addForm.sku, (v) => setAddForm((f) => ({ ...f, sku: v })), addErrors.sku, { placeholder: "e.g. AWC-1042" })}
            <CategorySelect value={addForm.category} onChange={(v) => setAddForm((f) => ({ ...f, category: v }))} />
            {field("Price ($)", "a-price", addForm.price, (v) => setAddForm((f) => ({ ...f, price: v })), addErrors.price, { type: "number", min: "0", step: "0.01", placeholder: "0.00" })}
            {field("Stock Qty", "a-stock", addForm.stock, (v) => setAddForm((f) => ({ ...f, stock: v })), addErrors.stock, { type: "number", min: "0", placeholder: "0" })}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="a-desc">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="a-desc" placeholder="Short product description…" value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="sm:col-span-2"><Button type="submit"><Plus className="mr-1 h-4 w-4" /> Save Product</Button></div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Input placeholder="Search by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <span className="text-sm text-muted-foreground">{filtered.length} products</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center shadow-sm">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) =>
            editId === p.id ? (
              // ── EDIT CARD ──────────────────────────────────────────────────
              <div key={p.id} className="rounded-xl border-2 border-primary bg-card p-5 shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Editing</span>
                  <button onClick={() => setEditId(null)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleEdit} noValidate className="space-y-3">
                  {field("Name", `e-name-${p.id}`, editForm.name, (v) => setEditForm((f) => ({ ...f, name: v })), editErrors.name)}
                  {field("SKU", `e-sku-${p.id}`, editForm.sku, (v) => setEditForm((f) => ({ ...f, sku: v })), editErrors.sku)}
                  <CategorySelect value={editForm.category} onChange={(v) => setEditForm((f) => ({ ...f, category: v }))} />
                  <div className="grid grid-cols-2 gap-2">
                    {field("Price ($)", `e-price-${p.id}`, editForm.price, (v) => setEditForm((f) => ({ ...f, price: v })), editErrors.price, { type: "number", min: "0", step: "0.01" })}
                    {field("Stock", `e-stock-${p.id}`, editForm.stock, (v) => setEditForm((f) => ({ ...f, stock: v })), editErrors.stock, { type: "number", min: "0" })}
                  </div>
                  {field("Description", `e-desc-${p.id}`, editForm.description, (v) => setEditForm((f) => ({ ...f, description: v })))}
                  <Button type="submit" className="w-full" size="sm"><Check className="mr-1 h-3.5 w-3.5" /> Save Changes</Button>
                </form>
              </div>
            ) : (
              // ── DISPLAY CARD ───────────────────────────────────────────────
              <div key={p.id} className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
                  <button onClick={() => startEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { removeProduct(p.id); toast.message(`"${p.name}" removed.`); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="mb-2 self-start text-[11px]">{p.category}</Badge>
                <h4 className="font-display font-semibold leading-snug">{p.name}</h4>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{p.sku}</p>
                {p.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                <div className="mt-auto flex items-end justify-between pt-4">
                  <span className="text-lg font-bold">${p.price.toLocaleString()}</span>
                  <span className={`text-xs font-medium ${p.stock > 20 ? "text-success" : p.stock > 0 ? "text-warning" : "text-destructive"}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}