import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import ProductCard from "../components/market/ProductCard";
import { useProductFacets, useProducts, type ProductListParams } from "../hooks/useMarket";
import { categoryLabel, formatUSDCompact } from "../utils/format";

export type MarketSearch = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: string;
  page?: number;
};

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "USD price low to high" },
  { value: "price-desc", label: "USD price high to low" },
  { value: "name", label: "Name A–Z" },
  { value: "stock", label: "Most stock" },
];

const DELIVERY_CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru"];

export default function MarketPage({ search }: { search: MarketSearch }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params: ProductListParams = useMemo(
    () => ({
      page: search.page ?? 1,
      limit: 9,
      category: search.category,
      brand: search.brand,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      inStock: search.inStock ? "true" : undefined,
      search: search.search,
      sort: search.sort ?? "relevance",
    }),
    [search],
  );

  const { data, isLoading } = useProducts(params);
  const { data: facets } = useProductFacets();

  const update = (patch: Partial<MarketSearch>) =>
    navigate({ to: "/market", search: { ...search, page: 1, ...patch } });

  const toggleValue = (key: "category" | "brand", value: string) =>
    update({ [key]: search[key] === value ? undefined : value } as Partial<MarketSearch>);

  const activeFilters = [
    search.category && { key: "category", label: categoryLabel(search.category) },
    search.brand && { key: "brand", label: search.brand },
    search.inStock && { key: "inStock", label: "In stock only" },
    (search.minPrice || search.maxPrice) && {
      key: "price",
      label: `${formatUSDCompact(search.minPrice ?? 0)} – ${formatUSDCompact(search.maxPrice ?? 0)}`,
    },
    search.search && { key: "search", label: `“${search.search}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearFilter = (key: string) => {
    if (key === "price") update({ minPrice: undefined, maxPrice: undefined });
    else if (key === "search") {
      setTerm("");
      update({ search: undefined });
    } else update({ [key]: undefined } as Partial<MarketSearch>);
  };

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Catalogue band */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-xl flex flex-wrap items-center gap-5 py-5">
          <h1 className="heading-lg shrink-0">Pool equipment</h1>
          <form
            className="order-3 w-full min-w-0 flex-1 sm:order-none sm:max-w-[520px]"
            onSubmit={(e) => {
              e.preventDefault();
              update({ search: term.trim() || undefined });
            }}
            role="search"
          >
            <label className="relative block">
              <span className="sr-only">Search equipment</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search by name, model or SKU"
                className="input h-11 pl-9"
                type="search"
              />
            </label>
          </form>
          <p className="order-2 ml-auto hidden text-[13px] text-ink-500 lg:block">
            Stock held in Harare
          </p>
        </div>
      </section>

      <div className="container-xl py-6">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p className="text-[13px] font-medium text-ink-600">
            {isLoading ? "Loading products…" : `${pagination?.total ?? 0} products`}
          </p>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="btn btn-secondary btn-sm lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="market-sort" className="text-[13px] text-ink-500">
              Sort
            </label>
            <select
              id="market-sort"
              className="select h-9 w-auto min-w-[190px] py-0 text-[13px]"
              value={search.sort ?? "relevance"}
              onChange={(e) => update({ sort: e.target.value })}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => clearFilter(filter.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[12.5px] font-medium text-sky-800 hover:border-sky-300"
              >
                {filter.label}
                <X size={12} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setTerm("");
                navigate({ to: "/market", search: {} });
              }}
              className="text-[12.5px] font-semibold text-ink-500 underline underline-offset-2 hover:text-ink-900"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[224px_minmax(0,1fr)]">
          {/* Facets */}
          <aside
            className={`${filtersOpen ? "block" : "hidden"} lg:block`}
            aria-label="Filter products"
          >
            <div className="space-y-6 rounded-xl border border-ink-200 bg-white p-4">
              <FacetGroup
                title="Category"
                items={(facets?.categories ?? []).map((c) => ({
                  value: c.value,
                  label: categoryLabel(c.value),
                  count: c.count,
                }))}
                selected={search.category}
                onSelect={(v) => toggleValue("category", v)}
              />

              <FacetGroup
                title="Brand"
                items={(facets?.brands ?? []).map((b) => ({
                  value: b.value,
                  label: b.value,
                  count: b.count,
                }))}
                selected={search.brand}
                onSelect={(v) => toggleValue("brand", v)}
              />

              <div>
                <h2 className="mb-2 text-[13px] font-semibold text-ink-900">Price (USD)</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder={String(facets?.priceRange.min ?? 0)}
                    value={search.minPrice ?? ""}
                    onChange={(e) =>
                      update({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="input h-9 px-2.5 text-[13px]"
                    aria-label="Minimum price"
                  />
                  <span className="text-[12px] text-ink-400">to</span>
                  <input
                    type="number"
                    min={0}
                    placeholder={String(facets?.priceRange.max ?? 0)}
                    value={search.maxPrice ?? ""}
                    onChange={(e) =>
                      update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="input h-9 px-2.5 text-[13px]"
                    aria-label="Maximum price"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-[13px] font-semibold text-ink-900">
                  Availability
                </legend>
                <div className="space-y-1.5">
                  {[
                    { label: "All products", value: undefined, count: facets?.totals.all },
                    { label: "In stock", value: true, count: facets?.totals.inStock },
                    { label: "Out of stock", value: false, count: facets?.totals.outOfStock },
                  ].map((option) => (
                    <label
                      key={option.label}
                      className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-600"
                    >
                      <input
                        type="radio"
                        name="availability"
                        className="h-3.5 w-3.5 accent-sky-600"
                        checked={search.inStock === option.value}
                        onChange={() => update({ inStock: option.value })}
                      />
                      <span className="flex-1">{option.label}</span>
                      <span className="text-[12px] text-ink-400">{option.count ?? 0}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-[300px] rounded-xl" />
                  ))
                : products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
            </div>

            {!isLoading && products.length === 0 && (
              <div className="rounded-xl border border-ink-200 bg-white px-6 py-16 text-center">
                <h2 className="heading-sm">No products match those filters</h2>
                <p className="mt-2 text-[14px] text-ink-600">
                  Clear the filters to see all equipment, or call the sales desk on
                  +263 772 562 125.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTerm("");
                    navigate({ to: "/market", search: {} });
                  }}
                  className="btn btn-primary btn-md mt-5"
                >
                  Clear filters
                </button>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-6 flex items-center justify-between gap-4 border-t border-ink-200 pt-4"
              >
                <p className="text-[13px] text-ink-500">
                  Showing {(pagination.page - 1) * (pagination.limit ?? 9) + 1}–
                  {Math.min(pagination.page * (pagination.limit ?? 9), pagination.total)} of{" "}
                  {pagination.total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => update({ page: pagination.page - 1 })}
                    className="btn btn-secondary btn-sm h-8 w-8 px-0 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => update({ page })}
                        aria-current={pagination.page === page ? "page" : undefined}
                        className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold ${
                          pagination.page === page
                            ? "border border-sky-200 bg-sky-50 text-sky-800"
                            : "text-ink-500 hover:bg-ink-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {pagination.pages > 5 && (
                    <span className="px-1 text-[13px] text-ink-400">… {pagination.pages}</span>
                  )}
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => update({ page: pagination.page + 1 })}
                    className="btn btn-secondary btn-sm h-8 w-8 px-0 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </nav>
            )}
          </div>
        </div>

        {/* Factual service band */}
        <div className="mt-8 grid gap-4 rounded-xl border border-ink-200 bg-white p-5 sm:grid-cols-3">
          <div>
            <h2 className="text-[13px] font-semibold text-ink-900">Delivery</h2>
            <p className="mt-1 text-[13px] text-ink-600">
              {DELIVERY_CITIES.join(", ")}. Other centres are quoted per order.
            </p>
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-ink-900">Quotation</h2>
            <p className="mt-1 text-[13px] text-ink-600">
              Basket items go to our sales desk as a quote request. No online payment.
            </p>
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-ink-900">Sales desk</h2>
            <p className="mt-1 text-[13px] text-ink-600">
              Call or WhatsApp{" "}
              <a href="tel:+263772562125" className="text-sky-700">
                +263 772 562 125
              </a>
              .
            </p>
          </div>
        </div>

        <p className="mt-4 text-[12.5px] text-ink-500">
          Looking for a service instead?{" "}
          <Link to="/quotation" className="font-semibold text-sky-700">
            Request a construction quotation
          </Link>
          .
        </p>
      </div>
    </>
  );
}

function FacetGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: { value: string; label: string; count: number }[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  if (!items.length) return null;

  return (
    <fieldset>
      <legend className="mb-2 w-full text-[13px] font-semibold text-ink-900">{title}</legend>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label
            key={item.value}
            className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-600"
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded-sm accent-sky-600"
              checked={selected === item.value}
              onChange={() => onSelect(item.value)}
            />
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-[12px] tabular-nums text-ink-400">{item.count}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
