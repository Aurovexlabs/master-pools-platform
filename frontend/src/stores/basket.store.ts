import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BasketLine, Product } from "../types";

const MAX_LINES = 20;

type BasketState = {
  lines: BasketLine[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const toBasketLine = (product: Product, qty = 1): BasketLine => ({
  productId: product._id,
  slug: product.slug,
  sku: product.sku,
  title: product.title,
  brand: product.brand,
  unit: product.unit || "each",
  unitPrice: product.price.amount,
  stock: product.stock,
  image: product.images?.[0]?.url,
  qty: Math.max(1, qty),
});

export const useBasketStore = create<BasketState>()(
  persist(
    (set) => ({
      lines: [],

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product._id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product._id
                  ? { ...l, qty: l.qty + Math.max(1, qty) }
                  : l,
              ),
            };
          }
          if (state.lines.length >= MAX_LINES) return state;
          return { lines: [...state.lines, toBasketLine(product, qty)] };
        }),

      setQty: (productId, qty) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l,
          ),
        })),

      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      clear: () => set({ lines: [] }),
    }),
    { name: "mp-quote-basket" },
  ),
);

/* ── Derived values ─────────────────────────────────────────────────────── */

export const basketUnitCount = (lines: BasketLine[]) =>
  lines.reduce((sum, line) => sum + line.qty, 0);

export const basketSubtotal = (lines: BasketLine[]) =>
  Math.round(lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0) * 100) / 100;
