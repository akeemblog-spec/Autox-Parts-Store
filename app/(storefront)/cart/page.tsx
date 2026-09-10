"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAppUI } from "@/components/ui/AppUIProvider";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface CartItemRow {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; alt: string }[];
  };
}

interface PaymentMethodOption {
  id: string;
  method: string;
  label: string;
  description: string | null;
}

interface SavedAddress {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  phone: string;
  isDefault?: boolean;
}

type CheckoutAddress = {
  line1: string;
  line2: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
};

const emptyAddress: CheckoutAddress = {
  line1: "",
  line2: "",
  city: "",
  district: "",
  postalCode: "",
  phone: "",
};

const methodIcons: Record<string, React.ElementType> = {
  cod: Truck,
  bank_transfer: Wallet,
  koko: Zap,
  mintpay: Zap,
  card: CreditCard,
  installment: CreditCard,
};

function SectionHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-autox-border/80 px-4 py-4 sm:px-5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-autox-red/60 bg-autox-red/10 text-[11px] font-extrabold text-autox-red">
        {step}
      </span>
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-autox-gray">{description}</p>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { confirm, toast } = useAppUI();
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [shipping, setShipping] = useState({ standardDeliveryFee: 500, expressDeliveryFee: 750, expressEnabled: true });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && (!session?.user?.id || session.user.invalidated))) {
      router.push("/login?callbackUrl=/cart");
      return;
    }
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/cart").then((res) => res.json()),
      fetch("/api/payment-methods").then((res) => res.json()),
      fetch("/api/account/addresses").then((res) => (res.ok ? res.json() : { addresses: [] })),
      fetch("/api/storefront/checkout-settings").then((res) =>
        res.ok ? res.json() : { standardDeliveryFee: 500, expressDeliveryFee: 750, expressEnabled: true },
      ),
    ])
      .then(([cartData, methodsData, addressData, shippingData]) => {
        setItems(cartData.items ?? []);
        const methods: PaymentMethodOption[] = methodsData.methods ?? [];
        setPaymentMethods(methods);
        setSelectedMethod(methods[0]?.method ?? null);
        setShipping(shippingData);

        const addresses: SavedAddress[] = addressData.addresses ?? [];
        setSavedAddresses(addresses);
        const saved = addresses.find((item) => item.isDefault) ?? addresses[0];
        if (saved) {
          setSelectedAddressId(saved.id);
          setAddress({
            line1: saved.line1 ?? "",
            line2: saved.line2 ?? "",
            city: saved.city ?? "",
            district: saved.district ?? "",
            postalCode: saved.postalCode ?? "",
            phone: saved.phone ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setCheckoutError("We couldn't load all checkout details. Please refresh and try again.");
        setLoading(false);
      });
  }, [status, session?.user?.id, session?.user?.invalidated, router]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const previous = items.find((item) => item.id === itemId)?.quantity;
    if (previous == null || previous === quantity) return;

    setCheckoutError(null);
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setItems((current) => current.map((item) => (item.id === itemId ? { ...item, quantity: previous } : item)));
      const message = data.error ?? "Unable to update quantity. Please check available stock.";
      setCheckoutError(message);
      toast(message, "error");
    }
  };

  const removeItem = async (item: CartItemRow) => {
    const accepted = await confirm({
      title: "Remove from cart?",
      description: `Remove “${item.product.name}” from your cart?`,
      confirmLabel: "Remove Item",
      destructive: true,
    });
    if (!accepted) return;

    const previous = items;
    setCheckoutError(null);
    setItems((current) => current.filter((row) => row.id !== item.id));
    const response = await fetch(`/api/cart/items/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setItems(previous);
      const message = data.error ?? "Unable to remove this item. Please try again.";
      setCheckoutError(message);
      toast(message, "error");
      return;
    }
    toast("Item removed from your cart.", "success");
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const standardDelivery = subtotal > 0 ? shipping.standardDeliveryFee : 0;
  const expressExtra = subtotal > 0 && deliveryMethod === "express" ? shipping.expressDeliveryFee : 0;
  const delivery = standardDelivery + expressExtra;
  const total = Math.max(0, subtotal - couponDiscount) + delivery;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code first.");
      return;
    }
    setCouponMessage(null);
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setCouponDiscount(0);
      setCouponMessage(data.error || "Invalid coupon");
      return;
    }
    setCouponCode(data.code);
    setCouponDiscount(data.discountAmount);
    setCouponMessage(`Coupon applied. You save ${formatPrice(data.discountAmount)}.`);
    toast(`${data.code} applied successfully.`, "success");
  };

  const selectSavedAddress = (saved: SavedAddress) => {
    setSelectedAddressId(saved.id);
    setAddress({
      line1: saved.line1 ?? "",
      line2: saved.line2 ?? "",
      city: saved.city ?? "",
      district: saved.district ?? "",
      postalCode: saved.postalCode ?? "",
      phone: saved.phone ?? "",
    });
  };

  const updateAddress = (field: keyof CheckoutAddress, value: string) => {
    setSelectedAddressId(null);
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const checkout = async () => {
    if (!selectedMethod) {
      setCheckoutError("Please select a payment method.");
      return;
    }
    if (!address.line1.trim() || !address.city.trim() || !address.district.trim() || address.phone.trim().length < 7) {
      setCheckoutError("Please enter your delivery address, city, district and phone number.");
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        paymentMethod: selectedMethod,
        deliveryMethod,
        couponCode: couponDiscount > 0 ? couponCode : undefined,
      }),
    });
    setCheckingOut(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message = data.error ?? "Couldn't place your order. Please try again.";
      setCheckoutError(message);
      toast(message, "error");
      return;
    }

    setItems([]);
    toast("Order placed successfully.", "success");
    router.push("/account");
  };

  if (status === "loading" || loading) {
    return (
      <main>
        <LoadingState label="Loading your cart..." />
      </main>
    );
  }

  return (
    <main className="pb-16">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      </div>

      <section className="mx-auto max-w-[1500px] px-4 lg:px-6">
        <div className="mb-7 flex flex-col gap-5 border-b border-autox-border/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-autox-red">Secure Checkout</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Your Cart</h1>
            <p className="mt-2 text-sm text-autox-gray">
              {items.length > 0 ? `${items.length} ${items.length === 1 ? "product" : "products"} ready for checkout.` : "Your selected parts will appear here."}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-autox-gray sm:gap-3">
              <span className="flex items-center gap-2 text-white"><span className="grid h-6 w-6 place-items-center rounded-full bg-autox-red text-white">1</span> Cart</span>
              <span className="h-px w-5 bg-autox-border sm:w-10" />
              <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-autox-border">2</span> Delivery</span>
              <span className="h-px w-5 bg-autox-border sm:w-10" />
              <span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full border border-autox-border">3</span> Payment</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse genuine parts and add items to your cart to get started."
            action={<ButtonLink href="/products">Shop Parts</ButtonLink>}
          />
        ) : (
          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel shadow-[0_10px_30px_rgba(0,0,0,.18)]">
                <div className="flex items-center justify-between border-b border-autox-border/80 px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-white">Cart Items</h2>
                    <p className="mt-1 text-xs text-autox-gray">Review quantities and pricing before checkout.</p>
                  </div>
                  <Link href="/products" className="hidden items-center gap-1 text-xs font-bold text-autox-red hover:text-white sm:flex">
                    Continue Shopping <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="hidden grid-cols-[minmax(0,1fr)_150px_130px_34px] gap-4 border-b border-autox-border/70 bg-black/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.13em] text-autox-gray md:grid">
                  <span>Product</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                <div className="divide-y divide-autox-border/70">
                  {items.map((item) => {
                    const { id, quantity, product } = item;
                    return (
                      <div key={id} className="group p-4 transition-colors hover:bg-white/[0.015] sm:p-5">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px_130px_34px] md:items-center">
                          <div className="flex min-w-0 gap-4">
                            <Link href={`/products/${product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-autox-border bg-autox-panel3 sm:h-28 sm:w-28">
                              {product.images[0] ? (
                                <img src={product.images[0].url} alt={product.images[0].alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-autox-gray"><PackageCheck size={24} /></div>
                              )}
                            </Link>
                            <div className="min-w-0 py-1">
                              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-emerald-400">
                                <CheckCircle2 size={10} /> In Cart
                              </p>
                              <Link href={`/products/${product.slug}`} className="block text-sm font-bold leading-5 text-white transition-colors hover:text-autox-red sm:text-base">
                                {product.name}
                              </Link>
                              <p className="mt-2 text-xs text-autox-gray">Unit price <span className="font-semibold text-white">{formatPrice(product.price)}</span></p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 md:justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-autox-gray md:hidden">Quantity</span>
                            <div className="inline-flex h-10 items-center rounded-xl border border-autox-border bg-autox-panel3">
                              <button aria-label="Decrease quantity" onClick={() => updateQuantity(id, quantity - 1)} className="grid h-full w-10 place-items-center text-autox-gray transition-colors hover:bg-white/5 hover:text-white">
                                <Minus size={14} />
                              </button>
                              <span className="grid h-full min-w-10 place-items-center border-x border-autox-border px-2 text-sm font-bold text-white">{quantity}</span>
                              <button aria-label="Increase quantity" onClick={() => updateQuantity(id, quantity + 1)} className="grid h-full w-10 place-items-center text-autox-gray transition-colors hover:bg-white/5 hover:text-white">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:block md:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-autox-gray md:hidden">Item Total</span>
                            <p className="text-base font-extrabold text-white">{formatPrice(product.price * quantity)}</p>
                          </div>

                          <div className="flex justify-end">
                            <button aria-label={`Remove ${product.name}`} onClick={() => removeItem(item)} className="grid h-9 w-9 place-items-center rounded-xl border border-transparent text-autox-gray transition-colors hover:border-autox-red/30 hover:bg-autox-red/10 hover:text-autox-red">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel shadow-[0_10px_30px_rgba(0,0,0,.18)]">
                <SectionHeading step="2" title="Delivery" description="Choose a delivery speed and confirm where your order should be sent." />
                <div className="p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => setDeliveryMethod("standard")} className={cn("relative rounded-xl border p-4 text-left transition-all", deliveryMethod === "standard" ? "border-autox-red bg-autox-red/[0.07]" : "border-autox-border bg-autox-panel3 hover:border-autox-gray/70")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3"><span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", deliveryMethod === "standard" ? "border-autox-red/40 bg-autox-red/10 text-autox-red" : "border-autox-border text-autox-gray")}><Truck size={17} /></span><div><p className="text-sm font-bold text-white">Standard Delivery</p><p className="mt-1 text-[11px] leading-5 text-autox-gray">Reliable islandwide delivery.</p></div></div>
                        {deliveryMethod === "standard" && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-autox-red text-white"><Check size={12} strokeWidth={3} /></span>}
                      </div>
                      <p className="mt-4 text-sm font-extrabold text-white">{formatPrice(standardDelivery)}</p>
                    </button>

                    {shipping.expressEnabled && (
                      <button type="button" onClick={() => setDeliveryMethod("express")} className={cn("relative rounded-xl border p-4 text-left transition-all", deliveryMethod === "express" ? "border-autox-red bg-autox-red/[0.07]" : "border-autox-border bg-autox-panel3 hover:border-autox-gray/70")}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3"><span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", deliveryMethod === "express" ? "border-autox-red/40 bg-autox-red/10 text-autox-red" : "border-autox-border text-autox-gray")}><Zap size={17} /></span><div><p className="text-sm font-bold text-white">Express Delivery</p><p className="mt-1 text-[11px] leading-5 text-autox-gray">Standard delivery + express priority fee.</p></div></div>
                          {deliveryMethod === "express" && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-autox-red text-white"><Check size={12} strokeWidth={3} /></span>}
                        </div>
                        <p className="mt-4 text-sm font-extrabold text-white">{formatPrice(standardDelivery + shipping.expressDeliveryFee)}</p>
                      </button>
                    )}
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-autox-gray">Saved Addresses</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedAddresses.slice(0, 4).map((saved) => {
                          const active = selectedAddressId === saved.id;
                          return (
                            <button key={saved.id} type="button" onClick={() => selectSavedAddress(saved)} className={cn("rounded-xl border p-3 text-left transition-colors", active ? "border-autox-red bg-autox-red/[0.06]" : "border-autox-border bg-black/10 hover:border-autox-gray/70")}>
                              <div className="flex items-start gap-2.5"><MapPin size={15} className={cn("mt-0.5 shrink-0", active ? "text-autox-red" : "text-autox-gray")} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-xs font-bold text-white">{saved.label || (saved.isDefault ? "Default Address" : "Saved Address")}</p>{saved.isDefault && <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-autox-gray">Default</span>}</div><p className="mt-1 text-[10px] leading-4 text-autox-gray">{saved.line1}{saved.line2 ? `, ${saved.line2}` : ""}, {saved.city}, {saved.district}</p></div>{active && <CheckCircle2 size={15} className="shrink-0 text-autox-red" />}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-autox-gray">Delivery Details</p><Link href="/account/addresses" className="text-[10px] font-bold uppercase tracking-wide text-autox-red hover:text-white">Manage addresses</Link></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={address.line1} onChange={(event) => updateAddress("line1", event.target.value)} placeholder="Address line 1 *" className="sm:col-span-2 w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                      <input value={address.line2} onChange={(event) => updateAddress("line2", event.target.value)} placeholder="Address line 2" className="sm:col-span-2 w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                      <input value={address.city} onChange={(event) => updateAddress("city", event.target.value)} placeholder="City *" className="w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                      <input value={address.district} onChange={(event) => updateAddress("district", event.target.value)} placeholder="District *" className="w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                      <input value={address.postalCode} onChange={(event) => updateAddress("postalCode", event.target.value)} placeholder="Postal code" className="w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                      <input value={address.phone} onChange={(event) => updateAddress("phone", event.target.value)} placeholder="Phone number *" className="w-full rounded-xl border border-autox-border bg-autox-panel3 px-3.5 py-3 text-sm text-white outline-none ring-0 transition-colors focus:border-autox-red focus:ring-0" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel shadow-[0_10px_30px_rgba(0,0,0,.18)]">
                <SectionHeading step="3" title="Payment" description="Select one of the payment methods currently available for your order." />
                <div className="p-4 sm:p-5">
                  {paymentMethods.length === 0 ? (
                    <p className="rounded-xl border border-autox-red/30 bg-autox-red/10 px-4 py-3 text-xs leading-5 text-autox-red">No payment methods are currently available. Please contact support.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((method) => {
                        const Icon = methodIcons[method.method] ?? CreditCard;
                        const active = selectedMethod === method.method;
                        return (
                          <button key={method.id} type="button" onClick={() => setSelectedMethod(method.method)} className={cn("flex min-h-[76px] items-center gap-3 rounded-xl border p-3.5 text-left transition-all", active ? "border-autox-red bg-autox-red/[0.07]" : "border-autox-border bg-autox-panel3 hover:border-autox-gray/70")}>
                            <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", active ? "border-autox-red/40 bg-autox-red/10 text-autox-red" : "border-autox-border text-autox-gray")}><Icon size={18} /></span>
                            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-white">{method.label}</span>{method.description && <span className="mt-1 block text-[10px] leading-4 text-autox-gray">{method.description}</span>}</span>
                            <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border", active ? "border-autox-red bg-autox-red text-white" : "border-autox-border text-transparent")}><Check size={11} strokeWidth={3} /></span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="xl:sticky xl:top-28">
              <div className="overflow-hidden rounded-2xl border border-autox-border bg-autox-panel shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
                <div className="border-b border-autox-border/80 px-5 py-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-autox-red">Checkout</p>
                  <h2 className="mt-1 text-lg font-extrabold text-white">Order Summary</h2>
                </div>

                <div className="p-5">
                  <div className="rounded-xl border border-autox-border bg-black/15 p-3.5">
                    <div className="flex items-center gap-2"><Tag size={14} className="text-autox-red" /><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-white">Have a coupon?</p></div>
                    {couponDiscount > 0 ? (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-full border border-emerald-400/25 bg-emerald-400/10 py-2 pl-3.5 pr-2">
                        <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-emerald-400">
                          <CheckCircle2 size={14} className="shrink-0" />
                          <span className="truncate">{couponCode} applied · you save {formatPrice(couponDiscount)}</span>
                        </span>
                        <button
                          type="button"
                          aria-label="Remove coupon"
                          onClick={() => { setCouponCode(""); setCouponDiscount(0); setCouponMessage(null); }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-emerald-400/70 transition-colors hover:bg-emerald-400/15 hover:text-emerald-300"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 flex gap-2">
                          <input value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCouponDiscount(0); setCouponMessage(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyCoupon(); } }} placeholder="Enter code" className="min-w-0 flex-1 rounded-xl border border-autox-border bg-autox-panel3 px-3 py-2.5 text-sm font-semibold uppercase text-white outline-none ring-0 transition-colors placeholder:normal-case placeholder:font-normal focus:border-autox-red focus:ring-0" />
                          <button type="button" onClick={applyCoupon} className="rounded-xl border border-white/15 bg-white px-4 text-xs font-extrabold uppercase tracking-wide text-black transition-colors hover:bg-white/90">Apply</button>
                        </div>
                        {couponMessage && <p className="mt-2 text-[11px] leading-4 text-autox-red">{couponMessage}</p>}
                      </>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 text-autox-gray"><span>Subtotal <span className="text-[10px]">({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span></span><span className="font-semibold text-white">{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between gap-4 text-autox-gray"><span>Standard Delivery</span><span className="font-semibold text-white">{formatPrice(standardDelivery)}</span></div>
                    {deliveryMethod === "express" && <div className="flex justify-between gap-4 text-autox-gray"><span>Express Priority Fee</span><span className="font-semibold text-white">+ {formatPrice(expressExtra)}</span></div>}
                    {couponDiscount > 0 && <div className="flex justify-between gap-4 text-emerald-400"><span>Coupon ({couponCode})</span><span className="font-bold">- {formatPrice(couponDiscount)}</span></div>}
                  </div>

                  <div className="my-5 h-px bg-autox-border" />

                  <div className="flex items-end justify-between gap-4">
                    <div><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-autox-gray">Total</p><p className="mt-1 text-[10px] text-autox-gray">Including delivery</p></div>
                    <p className="text-2xl font-black tracking-tight text-white">{formatPrice(total)}</p>
                  </div>

                  {checkoutError && <div className="mt-4 rounded-xl border border-autox-red/30 bg-autox-red/10 px-3 py-2.5 text-xs leading-5 text-autox-red">{checkoutError}</div>}

                  <Button onClick={checkout} disabled={checkingOut || !selectedMethod || items.length === 0} size="lg" className="mt-5 w-full">
                    <ShoppingCart size={17} /> {checkingOut ? "Placing Order..." : "Place Order"}
                  </Button>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-autox-border bg-black/10 p-2.5"><ShieldCheck size={15} className="text-autox-red" /><p className="mt-2 text-[10px] font-bold uppercase text-white">Secure Checkout</p><p className="mt-1 text-[9px] leading-4 text-autox-gray">Server-validated pricing</p></div>
                    <div className="rounded-xl border border-autox-border bg-black/10 p-2.5"><PackageCheck size={15} className="text-autox-red" /><p className="mt-2 text-[10px] font-bold uppercase text-white">Stock Checked</p><p className="mt-1 text-[9px] leading-4 text-autox-gray">Revalidated on order</p></div>
                  </div>
                </div>
              </div>

              <Link href="/products" className="mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-autox-gray transition-colors hover:text-white sm:hidden">Continue Shopping <ChevronRight size={14} /></Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
