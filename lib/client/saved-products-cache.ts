type SavedState = { wishlist: Set<string>; compare: Set<string> };

let cached: SavedState | null = null;
let inFlight: Promise<SavedState> | null = null;

async function fetchSavedState(): Promise<SavedState> {
  const [wishlistRes, compareRes] = await Promise.all([
    fetch('/api/wishlist', { cache: 'no-store' }),
    fetch('/api/compare', { cache: 'no-store' }),
  ]);
  const wishlistData = wishlistRes.ok ? await wishlistRes.json() : { items: [] };
  const compareData = compareRes.ok ? await compareRes.json() : { items: [] };
  return {
    wishlist: new Set<string>((wishlistData.items ?? []).map((item: { product?: { id?: string } }) => item.product?.id).filter(Boolean)),
    compare: new Set<string>((compareData.items ?? []).map((item: { product?: { id?: string } }) => item.product?.id).filter(Boolean)),
  };
}

export function loadSavedProductState(force = false) {
  if (!force && cached) return Promise.resolve(cached);
  if (!force && inFlight) return inFlight;
  inFlight = fetchSavedState().then((value) => {
    cached = value;
    inFlight = null;
    return value;
  }).catch((error) => {
    inFlight = null;
    throw error;
  });
  return inFlight;
}

export function setSavedMembership(kind: keyof SavedState, productId: string, value: boolean) {
  if (!cached) cached = { wishlist: new Set(), compare: new Set() };
  if (value) cached[kind].add(productId);
  else cached[kind].delete(productId);
}

export function clearSavedProductState() {
  cached = null;
  inFlight = null;
}
