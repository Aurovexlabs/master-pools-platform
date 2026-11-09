import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { useBasketStore } from "../../stores/basket.store";
import type { Product } from "../../types";
import { categoryLabel, formatUSD } from "../../utils/format";
import QuantityStepper from "./QuantityStepper";

export default function ProductCard({ product }: { product: Product }) {
  const add = useBasketStore((s) => s.add);
  const [qty, setQty] = useState(1);

  const image = product.images?.[0];
  const inStock = product.stock > 0;
  const keySpec = product.specs?.[0]?.value ?? categoryLabel(product.category);

  return (
    <article className="flex flex-col rounded-xl border border-ink-200 bg-white p-4 transition-colors hover:border-sky-200">
      <Link
        to="/market/$slug"
        params={{ slug: product.slug }}
        className="group block"
      >
        <div className="h-28 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
          {image ? (
            <img
              src={image.url}
              alt={image.alt || `${product.brand ?? ""} ${product.title}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-ink-100" />
          )}
        </div>
        <p className="mt-3 text-[12px] font-medium text-ink-500">
          {product.brand || categoryLabel(product.category)}
        </p>
        <h3 className="mt-1 font-sans text-[15px] font-semibold leading-snug text-ink-900 group-hover:text-sky-800">
          {product.title}
        </h3>
        <p className="mt-1 font-mono text-[11.5px] tracking-tight text-ink-400">
          {product.sku}
        </p>
      </Link>

      <p className="mt-2 text-[13px] text-ink-600">{keySpec}</p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold tabular-nums text-ink-900">
          {formatUSD(product.price.amount)}
        </span>
        <span className="text-[12px] text-ink-500">/ {product.unit}</span>
      </div>

      <p className="mt-1 text-[12px] text-ink-500">
        {inStock ? `${product.stock} in stock` : "Out of stock"}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-3">
        {inStock ? (
          <>
            <QuantityStepper value={qty} onChange={setQty} max={99} label="Quantity" />
            <button
              type="button"
              onClick={() => add(product, qty)}
              className="btn btn-primary btn-md flex-1"
            >
              Add to quote
            </button>
          </>
        ) : (
          <Link
            to="/contact"
            className="btn btn-secondary btn-md w-full"
            aria-label={`Ask about availability of ${product.title}`}
          >
            Ask availability
          </Link>
        )}
      </div>
    </article>
  );
}
