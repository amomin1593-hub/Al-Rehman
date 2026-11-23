"use client";
// Cart + wishlist state, saved in the browser (localStorage).
// Later: sync to Supabase `orders` / `wishlist` tables once auth is connected.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { profile } from "@/lib/profile";
import { useCatalog } from "./CatalogProvider";

export type CartLine = { id: number; finish: string | null; qty: number };

type Store = {
  cart: CartLine[];
  wishlist: number[];
  count: number;
  subtotal: number;
  add: (id: number, finish: string | null, qty?: number) => void;
  setQty: (id: number, finish: string | null, qty: number) => void;
  remove: (id: number, finish: string | null) => void;
  clear: () => void;
  toggleWish: (id: number) => void;
  drawer: boolean;
  setDrawer: (v: boolean) => void;
};

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { getProductById } = useCatalog();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<number[]>(profile.wishlist);
  const [drawer, setDrawer] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(load("art-cart", []));
    setWishlist(load("art-wish", profile.wishlist));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("art-cart", JSON.stringify(cart));
      localStorage.setItem("art-wish", JSON.stringify(wishlist));
    } catch {}
  }, [cart, wishlist, ready]);

  const value = useMemo<Store>(() => {
    const same = (l: CartLine, id: number, f: string | null) => l.id === id && l.finish === f;
    return {
      cart,
      wishlist,
      drawer,
      setDrawer,
      count: cart.reduce((s, l) => s + l.qty, 0),
      subtotal: cart.reduce((s, l) => s + l.qty * (getProductById(l.id)?.price ?? 0), 0),
      add: (id, finish, qty = 1) => {
        setCart((c) =>
          c.some((l) => same(l, id, finish))
            ? c.map((l) => (same(l, id, finish) ? { ...l, qty: l.qty + qty } : l))
            : [...c, { id, finish, qty }]
        );
        setDrawer(true);
      },
      setQty: (id, finish, qty) =>
        setCart((c) => c.map((l) => (same(l, id, finish) ? { ...l, qty: Math.max(1, qty) } : l))),
      remove: (id, finish) => setCart((c) => c.filter((l) => !same(l, id, finish))),
      clear: () => setCart([]),
      toggleWish: (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    };
  }, [cart, wishlist, drawer, getProductById]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
};
