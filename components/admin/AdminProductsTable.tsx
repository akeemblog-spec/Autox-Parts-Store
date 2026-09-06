"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useAppUI } from "@/components/ui/AppUIProvider";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  genuine: boolean;
  brand: { name: string };
  category: { name: string };
  images: { url: string; alt: string }[];
}

export function AdminProductsTable({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const router = useRouter();
  const { confirm, toast } = useAppUI();
  const [items, setItems] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ price: string; stock: string }>({ price: "", stock: "" });
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const startEdit = (item: AdminProduct) => {
    setEditingId(item.id);
    setDraft({ price: String(item.price), stock: String(item.stock) });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async (id: string) => {
    setBusyId(id);
    setError(null);

    const price = Number(draft.price);
    const stock = Number(draft.stock);

    if (Number.isNaN(price) || price <= 0 || Number.isNaN(stock) || stock < 0) {
      setError("Enter a valid price and stock quantity.");
      setBusyId(null);
      return;
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, stock }),
    });

    setBusyId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update product");
      return;
    }

    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, price, stock } : p)));
    setEditingId(null);
    toast("Product deleted.", "success");
    router.refresh();
  };

  const deleteProduct = async (id: string) => {
    const ok = await confirm({ title: "Delete product?", description: "This action cannot be undone.", confirmLabel: "Delete Product", destructive: true });
    if (!ok) return;
    setBusyId(id);

    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);

    if (!res.ok) {
      setError("Failed to delete product"); toast("Failed to delete product.", "error");
      return;
    }

    setItems((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  return (
    <div className="bg-autox-panel border border-autox-border rounded-md overflow-hidden">
      {error && <div className="bg-autox-red/10 text-autox-red text-sm px-5 py-3 border-b border-autox-red/30">{error}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-autox-gray uppercase tracking-wide border-b border-autox-border">
            <th className="px-5 py-3 font-semibold">Product</th>
            <th className="px-5 py-3 font-semibold">Brand</th>
            <th className="px-5 py-3 font-semibold">Category</th>
            <th className="px-5 py-3 font-semibold">Price</th>
            <th className="px-5 py-3 font-semibold">Stock</th>
            <th className="px-5 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const editing = editingId === item.id;
            return (
              <tr key={item.id} className="border-b border-autox-border/60 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm overflow-hidden bg-autox-panel3 shrink-0">
                      {item.images[0] && (
                        <img src={item.images[0].url} alt={item.images[0].alt} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-autox-gray">{item.brand.name}</td>
                <td className="px-5 py-3 text-autox-gray">{item.category.name}</td>
                <td className="px-5 py-3">
                  {editing ? (
                    <input
                      type="number"
                      value={draft.price}
                      onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                      className="w-24 bg-autox-panel3 border border-autox-border rounded-sm px-2 py-1 text-white text-sm outline-none ring-0 focus:border-autox-red focus:ring-0"
                    />
                  ) : (
                    <span className="text-white font-semibold">{formatPrice(item.price)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {editing ? (
                    <input
                      type="number"
                      value={draft.stock}
                      onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                      className="w-20 bg-autox-panel3 border border-autox-border rounded-sm px-2 py-1 text-white text-sm outline-none ring-0 focus:border-autox-red focus:ring-0"
                    />
                  ) : (
                    <span className={cn("font-semibold", item.stock <= 10 ? "text-autox-red" : "text-white")}>
                      {item.stock}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {editing ? (
                      <>
                        <button
                          disabled={busyId === item.id}
                          onClick={() => saveEdit(item.id)}
                          aria-label="Save changes"
                          className="w-7 h-7 flex items-center justify-center rounded-sm bg-autox-red text-white hover:bg-autox-redDark disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          aria-label="Cancel editing"
                          className="w-7 h-7 flex items-center justify-center rounded-sm border border-autox-border text-autox-gray hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          aria-label="Edit product"
                          className="w-7 h-7 flex items-center justify-center rounded-sm border border-autox-border text-autox-gray hover:text-white hover:border-autox-red/50"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          disabled={busyId === item.id}
                          onClick={() => deleteProduct(item.id)}
                          aria-label="Delete product"
                          className="w-7 h-7 flex items-center justify-center rounded-sm border border-autox-border text-autox-gray hover:text-autox-red hover:border-autox-red/50 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length === 0 && <p className="text-autox-gray text-sm p-5">No products found.</p>}
    </div>
  );
}
