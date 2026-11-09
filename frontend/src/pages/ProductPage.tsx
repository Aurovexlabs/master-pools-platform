import { Link } from "@tanstack/react-router";
import { ChevronRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

import { MetaHead } from "../components/seo/MetaHead";
import ProductCard from "../components/market/ProductCard";
import QuantityStepper from "../components/market/QuantityStepper";
import { useProduct } from "../hooks/useMarket";
import { useBasketStore } from "../stores/basket.store";
import type { Product } from "../types";
import { categoryLabel, formatUSD } from "../utils/format";

export default function ProductPage({ slug }: { slug: string }) {
  const { data, isLoading } = useProduct(slug);
  const add = useBasketStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <div className="container-xl py-10">
        <div className="skeleton h-[420px] rounded-xl" />
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="container-xl py-20 text-center">
        <h1 className="heading-md">Product not found</h1>
        <p className="mt-2 text-[14px] text-ink-600">
          This item may have been unpublished. Browse the catalogue instead.
        </p>
        <Link to="/market" className="btn btn-primary btn-md mt-6">
          Back to shop
        </Link>
      </div>
    );
  }

  const { product, related } = data;
  const gallery = product.images?.length ? product.images : [];
  const inStock = product.stock > 0;

  return (
    <>
      <MetaHead
        title={`${product.title} | MasterPools Equipment`}
        description={
          product.shortDescription ??
          `${product.title} available from MasterPools Zimbabwe. Request a quotation online.`
        }
        canonical={`https://www.masterspools.co.zw/market/${product.slug}`}
      />

      <div className="container-xl py-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-500">
          <Link to="/market" className="hover:text-sky-700">
            Shop
          </Link>
          <ChevronRight size={13} className="text-ink-300" />
          <Link
            to="/market"
            search={{ category: product.category }}
            className="hover:text-sky-700"
          >
            {categoryLabel(product.category)}
          </Link>
          <ChevronRight size={13} className="text-ink-300" />
          <span className="text-ink-700">{product.title}</span>
        </nav>
      </div>

      <div className="container-xl grid gap-8 pb-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
            {gallery[active] ? (
              <img
                src={gallery[active].url}
                alt={gallery[active].alt || product.title}
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="aspect-[4/3] w-full" />
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === active}
                  className={`h-16 w-20 overflow-hidden rounded-lg border ${
                    index === active ? "border-sky-500" : "border-ink-200"
                  }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div>
          <p className="text-[12.5px] font-medium text-ink-500">
            {product.brand || "MasterPools"} · {categoryLabel(product.category)}
          </p>
          <h1 className="heading-md mt-1.5">{product.title}</h1>
          <p className="mt-1 font-mono text-[12px] tracking-tight text-ink-400">
            SKU {product.sku}
          </p>

          {product.shortDescription && (
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-600">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-5 rounded-xl border border-ink-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-[28px] font-bold leading-none text-ink-900">
                {formatUSD(product.price.amount)}
              </span>
              <span className="text-[13px] text-ink-500">per {product.unit}</span>
            </div>
            <p className="mt-1.5 text-[13px] text-ink-600">
              {inStock ? `${product.stock} ${product.unit}s in stock` : "Out of stock"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={qty}
                onChange={setQty}
                max={99}
                size="md"
                label="Quantity"
              />
              {inStock ? (
                <button
                  type="button"
                  onClick={() => add(product, qty)}
                  className="btn btn-primary btn-lg flex-1"
                >
                  Add to quote
                </button>
              ) : (
                <Link to="/contact" className="btn btn-secondary btn-lg flex-1">
                  Ask availability
                </Link>
              )}
            </div>

            <Link to="/contact" className="btn btn-outline btn-md mt-3 w-full">
              Talk to a specialist
            </Link>

            <ul className="mt-4 space-y-2 border-t border-ink-200 pt-3 text-[13px] text-ink-600">
              <li className="flex items-center gap-2">
                <Truck size={15} className="text-sky-600" />
                Delivery quoted per order — Harare, Bulawayo, Mutare, Gweru
              </li>
              <li className="flex items-center gap-2">
                <PackageCheck size={15} className="text-sky-600" />
                {product.installRequired
                  ? "Installation by our team available on request"
                  : "Collect from the Harare warehouse on weekdays"}
              </li>
              {product.warrantyMonths ? (
                <li className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-sky-600" />
                  {product.warrantyMonths} month warranty
                </li>
              ) : null}
            </ul>
          </div>

          {product.highlights?.length ? (
            <ul className="mt-5 space-y-1.5">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2 text-[14px] text-ink-700">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-600" />
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Specs + description */}
      <div className="border-t border-ink-200 bg-white">
        <div className="container-xl grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="heading-sm">Description</h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line text-[14.5px] leading-relaxed text-ink-600">
              {product.description}
            </p>
          </div>

          {product.specs?.length ? (
            <div>
              <h2 className="heading-sm">Specifications</h2>
              <dl className="mt-3 divide-y divide-ink-200 border-y border-ink-200">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-[13px] text-ink-500">{spec.label}</dt>
                    <dd className="text-[13px] font-semibold text-ink-900">{spec.value}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-[13px] text-ink-500">Selling unit</dt>
                  <dd className="text-[13px] font-semibold text-ink-900">{product.unit}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      {related?.length ? (
        <section className="container-xl py-10">
          <div className="section-head">
            <h2 className="heading-md">
              More {categoryLabel(product.category).toLowerCase()}
            </h2>
            <Link to="/market" search={{ category: product.category }} className="textlink">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item as Product} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
