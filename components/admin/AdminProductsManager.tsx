"use client";

/* eslint-disable react-hooks/set-state-in-effect -- paginated server props intentionally refresh local table state */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Check, ImagePlus, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useAppUI } from "@/components/ui/AppUIProvider";

interface CatalogOption { id: string; name: string; }
interface TaxonomyOption { slug: string; name: string; }
interface AdminProduct {
  id: string; name: string; slug: string; price: number; stock: number; genuine: boolean; archivedAt: Date | string | null;
  brand: { name: string }; category: { name: string }; images: { url: string; alt: string }[];
}
interface ImageRow { url: string; alt: string }
interface CompatibilityRow { brandName: string; modelName: string; years: string }
interface SpecRow { label: string; value: string }
interface ProductFormState {
  name: string; slug: string; brandId: string; categoryId: string; vehicleType: string;
  modelYears: string; partType: string;
  price: string; previousPrice: string; discount: string; stock: string; genuine: boolean; installmentAvailable: boolean;
  description: string; warranty: string; deliveryEstimate: string;
  images: ImageRow[]; compatibility: CompatibilityRow[]; specifications: SpecRow[];
}

const emptyForm = (brands: CatalogOption[], categories: CatalogOption[], vehicleTypes: TaxonomyOption[], partTypes: TaxonomyOption[]): ProductFormState => ({
  name: "", slug: "", brandId: brands[0]?.id ?? "", categoryId: categories[0]?.id ?? "", vehicleType: vehicleTypes[0]?.slug ?? "bike",
  modelYears: "", partType: partTypes[0]?.slug ?? "aftermarket", price: "", previousPrice: "", discount: "", stock: "0", genuine: false,
  installmentAvailable: false, description: "", warranty: "6 months", deliveryEstimate: "2-4 business days",
  images: [{ url: "", alt: "" }], compatibility: [{ brandName: "", modelName: "", years: "" }], specifications: [{ label: "", value: "" }],
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminProductsManager({ initialProducts, brands, categories, vehicleTypes, partTypes, totalCount, searchQuery = "", status = "active" }: { initialProducts: AdminProduct[]; brands: CatalogOption[]; categories: CatalogOption[]; vehicleTypes: TaxonomyOption[]; partTypes: TaxonomyOption[]; totalCount?: number; searchQuery?: string; status?: "active" | "archived" | "all" }) {
  const router = useRouter();
  const { confirm, toast } = useAppUI();
  const [items, setItems] = useState(initialProducts);
  useEffect(() => { setItems(initialProducts); }, [initialProducts]);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState({ price: "", stock: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(() => emptyForm(brands, categories, vehicleTypes, partTypes));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const title = useMemo(() => editingProductId ? "Edit Product" : "Add Product", [editingProductId]);

  const openCreate = () => {
    setEditingProductId(null); setForm(emptyForm(brands, categories, vehicleTypes, partTypes)); setError(null); setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/products/${id}`);
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !data.product) { setError(data.error ?? "Unable to load product"); return; }
    const p = data.product;
    setEditingProductId(id);
    setForm({
      name: p.name ?? "", slug: p.slug ?? "", brandId: p.brandId ?? "", categoryId: p.categoryId ?? "", vehicleType: p.vehicleType,
      modelYears: p.modelYears ?? "", partType: p.partType, price: String(p.price ?? ""), previousPrice: p.previousPrice == null ? "" : String(p.previousPrice),
      discount: p.discount == null ? "" : String(p.discount), stock: String(p.stock ?? 0), genuine: !!p.genuine, installmentAvailable: !!p.installmentAvailable,
      description: p.description ?? "", warranty: p.warranty ?? "", deliveryEstimate: p.deliveryEstimate ?? "",
      images: p.images?.length ? p.images.map((x: ImageRow) => ({ url: x.url, alt: x.alt })) : [{ url: "", alt: "" }],
      compatibility: p.compatibility?.length ? p.compatibility.map((x: CompatibilityRow) => ({ brandName: x.brandName, modelName: x.modelName, years: x.years })) : [{ brandName: "", modelName: "", years: "" }],
      specifications: p.specifications?.length ? p.specifications.map((x: SpecRow) => ({ label: x.label, value: x.value })) : [{ label: "", value: "" }],
    });
    setModalOpen(true);
  };

  const updateRow = <T extends keyof ProductFormState>(key: T, index: number, patch: Partial<ProductFormState[T] extends Array<infer U> ? U : never>) => {
    setForm((prev) => ({ ...prev, [key]: (prev[key] as unknown as Record<string, string>[]).map((row, i) => i === index ? { ...row, ...patch } : row) }));
  };

  const addRow = (key: "images" | "compatibility" | "specifications") => {
    const row = key === "images" ? { url: "", alt: "" } : key === "compatibility" ? { brandName: "", modelName: "", years: "" } : { label: "", value: "" };
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] as any[]), row] }));
  };

  const removeRow = (key: "images" | "compatibility" | "specifications", index: number) => {
    setForm((prev) => ({ ...prev, [key]: (prev[key] as any[]).filter((_, i) => i !== index) }));
  };

  const uploadImage = async (index: number, file?: File) => {
    if (!file) return;
    setUploadingIndex(index); setError(null);
    const body = new FormData(); body.append("file", file);
    const res = await fetch("/api/admin/uploads", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploadingIndex(null);
    if (!res.ok) { setError(data.error ?? "Image upload failed"); return; }
    updateRow("images", index, { url: data.url, alt: form.images[index]?.alt || form.name });
  };

  const saveProduct = async () => {
    setError(null);
    if (!form.name.trim() || !form.slug.trim() || !form.brandId || !form.categoryId || !form.description.trim()) {
      setError("Name, slug, brand, category and description are required."); return;
    }
    const payload = {
      ...form,
      price: Number(form.price), previousPrice: form.previousPrice ? Number(form.previousPrice) : null,
      discount: form.discount ? Number(form.discount) : null, stock: Number(form.stock),
      images: form.images.filter((x) => x.url.trim()).map((x, i) => ({ ...x, alt: x.alt.trim() || form.name, sortOrder: i })),
      compatibility: form.compatibility.filter((x) => x.brandName.trim() && x.modelName.trim() && x.years.trim()),
      specifications: form.specifications.filter((x) => x.label.trim() && x.value.trim()).map((x, i) => ({ ...x, sortOrder: i })),
    };
    if (!Number.isFinite(payload.price) || payload.price <= 0 || !Number.isInteger(payload.stock) || payload.stock < 0) {
      setError("Enter a valid price and stock quantity."); return;
    }
    setBusy(true);
    const res = await fetch(editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products", {
      method: editingProductId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) { setError(data.error ?? "Unable to save product"); return; }
    setModalOpen(false); toast(editingProductId ? "Product updated." : "Product created.", "success"); router.refresh();
  };

  const startInlineEdit = (item: AdminProduct) => { setEditingInlineId(item.id); setInlineDraft({ price: String(item.price), stock: String(item.stock) }); };
  const saveInline = async (id: string) => {
    const price = Number(inlineDraft.price), stock = Number(inlineDraft.stock);
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) { setError("Enter a valid price and stock quantity."); return; }
    setBusy(true); const res = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price, stock }) }); setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Update failed"); return; }
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, price, stock } : p)); setEditingInlineId(null);
  };
  const setArchived = async (item: AdminProduct, archived: boolean) => {
    const ok = await confirm({
      title: archived ? "Archive product?" : "Restore product?",
      description: archived
        ? `“${item.name}” will be hidden from the storefront, search, offers and Parts Finder, while order history remains intact.`
        : `“${item.name}” will become available to storefront queries again.`,
      confirmLabel: archived ? "Archive Product" : "Restore Product",
      destructive: archived,
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${item.id}/archive`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived }) });
    const data = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) { toast(data.error ?? "Unable to update product status.", "error"); return; }
    toast(archived ? "Product archived." : "Product restored.", "success"); router.refresh();
  };

  const deleteProduct = async (item: AdminProduct) => {
    const ok = await confirm({ title: "Delete product permanently?", description: `Permanently delete “${item.name}” only if it has no order or inventory history. Products with history must be archived instead.`, confirmLabel: "Delete Permanently", destructive: true });
    if (!ok) return;
    setBusy(true); const res = await fetch(`/api/admin/products/${item.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({})); setBusy(false);
    if (res.status === 409 && data.canArchive) {
      const archiveInstead = await confirm({ title: "Product has history", description: "This product is referenced by order or inventory history, so it cannot be permanently deleted. Archive it instead to hide it from customers while preserving records.", confirmLabel: "Archive Product", destructive: true });
      if (archiveInstead) await setArchived(item, true);
      return;
    }
    if (!res.ok) { setError(data.message ?? data.error ?? "Failed to delete product"); toast(data.message ?? "Failed to delete product.", "error"); return; }
    setItems((prev) => prev.filter((p) => p.id !== item.id)); toast("Product permanently deleted.", "success"); router.refresh();
  };

  const inputClass = "w-full bg-autox-panel3 border border-autox-border rounded-sm px-3 py-2 text-sm text-white outline-none ring-0 focus:border-autox-red focus:ring-0";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-autox-gray mb-1.5";

  return <>
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><h1 className="text-2xl font-extrabold text-white mb-1">Products</h1><p className="text-autox-gray text-sm">{totalCount ?? items.length} product{(totalCount ?? items.length) !== 1 ? "s" : ""} matching this view. Archive products with history instead of deleting them.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form className="flex h-10 min-w-0 overflow-hidden rounded-sm border border-autox-border bg-autox-panel focus-within:border-autox-red sm:w-[320px]">
          <input type="hidden" name="status" value={status}/><input name="q" defaultValue={searchQuery} placeholder="Search products..." className="min-w-0 flex-1 appearance-none bg-transparent px-3 text-sm text-white outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"/><button className="grid w-11 place-items-center bg-autox-red text-white focus:outline-none focus-visible:outline-none" aria-label="Search products"><Search size={15}/></button>
        </form>
        <button onClick={openCreate} className="flex h-10 items-center justify-center gap-2 rounded-sm bg-autox-red px-4 text-sm font-bold text-white hover:bg-autox-redDark"><Plus size={16}/> Add Product</button>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap gap-2">{([['active','Active'],['archived','Archived'],['all','All']] as const).map(([value,label])=><Link key={value} href={`/admin/products?status=${value}${searchQuery?`&q=${encodeURIComponent(searchQuery)}`:''}`} className={cn("rounded-sm border px-3 py-1.5 text-xs font-semibold",status===value?"border-autox-red bg-autox-red/10 text-white":"border-autox-border text-autox-gray hover:text-white")}>{label}</Link>)}</div>

    <div className="bg-autox-panel border border-autox-border rounded-md overflow-x-auto">
      {error && !modalOpen && <div className="bg-autox-red/10 text-autox-red text-sm px-5 py-3 border-b border-autox-red/30">{error}</div>}
      <table className="w-full min-w-[760px] text-sm"><thead><tr className="text-left text-xs text-autox-gray uppercase tracking-wide border-b border-autox-border">
        <th className="px-5 py-3">Product</th><th className="px-5 py-3">Brand</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3 text-right">Actions</th>
      </tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-autox-border/60 last:border-0">
        <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-sm overflow-hidden bg-autox-panel3 shrink-0">{item.images[0] && <img src={item.images[0].url} alt={item.images[0].alt} className="w-full h-full object-cover"/>}</div><span className="text-white font-medium">{item.name}</span>{item.archivedAt&&<span className="rounded-full border border-autox-border bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-autox-gray">Archived</span>}</div></td>
        <td className="px-5 py-3 text-autox-gray">{item.brand.name}</td><td className="px-5 py-3 text-autox-gray">{item.category.name}</td>
        <td className="px-5 py-3">{editingInlineId === item.id ? <input type="number" value={inlineDraft.price} onChange={(e)=>setInlineDraft(d=>({...d,price:e.target.value}))} className="w-24 bg-autox-panel3 border border-autox-border rounded-sm px-2 py-1 text-white"/> : <span className="text-white font-semibold">{formatPrice(item.price)}</span>}</td>
        <td className="px-5 py-3">{editingInlineId === item.id ? <input type="number" value={inlineDraft.stock} onChange={(e)=>setInlineDraft(d=>({...d,stock:e.target.value}))} className="w-20 bg-autox-panel3 border border-autox-border rounded-sm px-2 py-1 text-white"/> : <span className={cn("font-semibold", item.stock <= 10 ? "text-autox-red" : "text-white")}>{item.stock}</span>}</td>
        <td className="px-5 py-3"><div className="flex items-center justify-end gap-2">{editingInlineId === item.id ? <><button disabled={busy} onClick={()=>saveInline(item.id)} className="w-8 h-8 grid place-items-center bg-autox-red text-white rounded-sm"><Check size={14}/></button><button onClick={()=>setEditingInlineId(null)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray rounded-sm"><X size={14}/></button></> : <><button title="Quick price/stock edit" onClick={()=>startInlineEdit(item)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray hover:text-white rounded-sm"><Check size={13}/></button><button title="Edit full product" disabled={busy} onClick={()=>openEdit(item.id)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray hover:text-white rounded-sm"><Pencil size={13}/></button>{item.archivedAt?<button title="Restore product" disabled={busy} onClick={()=>setArchived(item,false)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray hover:text-emerald-400 rounded-sm"><RotateCcw size={13}/></button>:<button title="Archive product" disabled={busy} onClick={()=>setArchived(item,true)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray hover:text-amber-400 rounded-sm"><Archive size={13}/></button>}<button title="Delete permanently" disabled={busy} onClick={()=>deleteProduct(item)} className="w-8 h-8 grid place-items-center border border-autox-border text-autox-gray hover:text-autox-red rounded-sm"><Trash2 size={13}/></button></>}</div></td>
      </tr>)}</tbody></table>{items.length===0 && <p className="text-autox-gray text-sm p-5">No products found.</p>}
    </div>

    {modalOpen && <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-autox-panel border border-autox-border rounded-md shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-autox-panel border-b border-autox-border"><div><h2 className="text-xl font-extrabold text-white">{title}</h2><p className="text-xs text-autox-gray mt-1">Manage storefront content, images, compatibility and specifications.</p></div><button onClick={()=>setModalOpen(false)} className="w-9 h-9 grid place-items-center border border-autox-border rounded-sm text-autox-gray hover:text-white"><X size={18}/></button></div>
        <div className="p-5 space-y-7">
          {error && <div className="bg-autox-red/10 border border-autox-red/30 text-autox-red px-4 py-3 text-sm rounded-sm">{error}</div>}
          <section><h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Basic Information</h3><div className="grid md:grid-cols-2 gap-4">
            <label><span className={labelClass}>Product name *</span><input className={inputClass} value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value,slug: editingProductId ? f.slug : slugify(e.target.value)}))}/></label>
            <label><span className={labelClass}>Slug *</span><input className={inputClass} value={form.slug} onChange={(e)=>setForm(f=>({...f,slug:slugify(e.target.value)}))}/></label>
            <label><span className={labelClass}>Brand *</span><select className={inputClass} value={form.brandId} onChange={(e)=>setForm(f=>({...f,brandId:e.target.value}))}>{brands.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label><span className={labelClass}>Category *</span><select className={inputClass} value={form.categoryId} onChange={(e)=>setForm(f=>({...f,categoryId:e.target.value}))}>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label><span className={labelClass}>Vehicle type</span><select className={inputClass} value={form.vehicleType} onChange={(e)=>setForm(f=>({...f,vehicleType:e.target.value}))}>{vehicleTypes.map(x=><option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
            <label><span className={labelClass}>Part type</span><select className={inputClass} value={form.partType} onChange={(e)=>setForm(f=>({...f,partType:e.target.value}))}>{partTypes.map(x=><option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
            <label className="md:col-span-2"><span className={labelClass}>Model years / summary *</span><input placeholder="e.g. 2021-2025" className={inputClass} value={form.modelYears} onChange={(e)=>setForm(f=>({...f,modelYears:e.target.value}))}/></label>
          </div></section>

          <section><h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Pricing & Stock</h3><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label><span className={labelClass}>Price (LKR) *</span><input type="number" min="0" className={inputClass} value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))}/></label>
            <label><span className={labelClass}>Previous price</span><input type="number" min="0" className={inputClass} value={form.previousPrice} onChange={(e)=>setForm(f=>({...f,previousPrice:e.target.value}))}/></label>
            <label><span className={labelClass}>Discount %</span><input type="number" min="0" max="100" className={inputClass} value={form.discount} onChange={(e)=>setForm(f=>({...f,discount:e.target.value}))}/></label>
            <label><span className={labelClass}>Stock *</span><input type="number" min="0" className={inputClass} value={form.stock} onChange={(e)=>setForm(f=>({...f,stock:e.target.value}))}/></label>
          </div><div className="flex flex-wrap gap-5 mt-4 text-sm text-white"><label className="flex items-center gap-2"><input type="checkbox" checked={form.genuine} onChange={(e)=>setForm(f=>({...f,genuine:e.target.checked}))}/> Mark as genuine</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.installmentAvailable} onChange={(e)=>setForm(f=>({...f,installmentAvailable:e.target.checked}))}/> Installments available</label></div></section>

          <section><h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Description & Fulfilment</h3><div className="grid md:grid-cols-2 gap-4"><label className="md:col-span-2"><span className={labelClass}>Description *</span><textarea rows={5} className={inputClass} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))}/></label><label><span className={labelClass}>Warranty *</span><input className={inputClass} value={form.warranty} onChange={(e)=>setForm(f=>({...f,warranty:e.target.value}))}/></label><label><span className={labelClass}>Delivery estimate *</span><input className={inputClass} value={form.deliveryEstimate} onChange={(e)=>setForm(f=>({...f,deliveryEstimate:e.target.value}))}/></label></div></section>

          <section><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Product Images</h3><button onClick={()=>addRow("images")} className="text-xs text-autox-red font-bold">+ Add image</button></div><div className="space-y-3">{form.images.map((row,i)=><div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2 p-3 border border-autox-border rounded-sm"><div><span className={labelClass}>Image URL</span><input className={inputClass} value={row.url} onChange={(e)=>updateRow("images",i,{url:e.target.value})}/><label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer"><ImagePlus size={14}/>{uploadingIndex===i?"Uploading...":"Upload from computer"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadingIndex===i} onChange={(e)=>uploadImage(i,e.target.files?.[0])}/></label></div><label><span className={labelClass}>Alt text</span><input className={inputClass} value={row.alt} onChange={(e)=>updateRow("images",i,{alt:e.target.value})}/></label><button onClick={()=>removeRow("images",i)} className="self-end w-9 h-9 grid place-items-center text-autox-gray hover:text-autox-red"><Trash2 size={15}/></button></div>)}</div></section>

          <section><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Vehicle Compatibility / Fitment</h3><button onClick={()=>addRow("compatibility")} className="text-xs text-autox-red font-bold">+ Add fitment</button></div><div className="space-y-2">{form.compatibility.map((row,i)=><div key={i} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2"><input placeholder="Brand e.g. Honda" className={inputClass} value={row.brandName} onChange={(e)=>updateRow("compatibility",i,{brandName:e.target.value})}/><input placeholder="Model e.g. CBR150R" className={inputClass} value={row.modelName} onChange={(e)=>updateRow("compatibility",i,{modelName:e.target.value})}/><input placeholder="Years e.g. 2021-2025" className={inputClass} value={row.years} onChange={(e)=>updateRow("compatibility",i,{years:e.target.value})}/><button onClick={()=>removeRow("compatibility",i)} className="w-9 h-9 grid place-items-center text-autox-gray hover:text-autox-red"><Trash2 size={15}/></button></div>)}</div></section>

          <section><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-white uppercase tracking-wide">Specifications</h3><button onClick={()=>addRow("specifications")} className="text-xs text-autox-red font-bold">+ Add specification</button></div><div className="space-y-2">{form.specifications.map((row,i)=><div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2"><input placeholder="Label e.g. Part Number" className={inputClass} value={row.label} onChange={(e)=>updateRow("specifications",i,{label:e.target.value})}/><input placeholder="Value" className={inputClass} value={row.value} onChange={(e)=>updateRow("specifications",i,{value:e.target.value})}/><button onClick={()=>removeRow("specifications",i)} className="w-9 h-9 grid place-items-center text-autox-gray hover:text-autox-red"><Trash2 size={15}/></button></div>)}</div></section>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 px-5 py-4 bg-autox-panel border-t border-autox-border"><button onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-autox-gray border border-autox-border rounded-sm">Cancel</button><button disabled={busy} onClick={saveProduct} className="px-5 py-2 bg-autox-red hover:bg-autox-redDark disabled:opacity-50 text-white text-sm font-bold rounded-sm">{busy?"Saving...":"Save Product"}</button></div>
      </div>
    </div>}
  </>;
}
