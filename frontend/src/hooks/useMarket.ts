import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/client";
import type {
  MarketQuote,
  MarketQuoteStatus,
  Pagination,
  Product,
  ProductFacets,
} from "../types";

export const QK_MARKET = {
  products: (p?: unknown) => ["products", p] as const,
  product: (idOrSlug: string) => ["product", idOrSlug] as const,
  facets: ["product-facets"] as const,
  adminProducts: (p?: unknown) => ["admin-products", p] as const,
  myQuotes: ["my-market-quotes"] as const,
  adminQuotes: (p?: unknown) => ["admin-market-quotes", p] as const,
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean | string;
  search?: string;
  sort?: string;
  [key: string]: unknown;
};

const clean = (params?: Record<string, unknown>) => {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all",
    ),
  );
};

/* ── Public catalogue ────────────────────────────────────────────────────── */

export const useProducts = (params?: ProductListParams) =>
  useQuery({
    queryKey: QK_MARKET.products(params),
    queryFn: () =>
      api
        .get<{ products: Product[]; pagination: Pagination }>("/products", {
          params: clean(params),
        })
        .then((r) => r.data),
    staleTime: 60_000,
  });

export const useProductFacets = () =>
  useQuery({
    queryKey: QK_MARKET.facets,
    queryFn: () =>
      api.get<ProductFacets>("/products/facets").then((r) => r.data),
    staleTime: 5 * 60_000,
  });

export const useProduct = (idOrSlug: string) =>
  useQuery({
    queryKey: QK_MARKET.product(idOrSlug),
    queryFn: () =>
      api
        .get<{ product: Product; related: Product[] }>(`/products/${idOrSlug}`)
        .then((r) => r.data),
    enabled: Boolean(idOrSlug),
    staleTime: 60_000,
  });

/* ── Admin catalogue ─────────────────────────────────────────────────────── */

export const useAdminProducts = (params?: ProductListParams & { search?: string }) =>
  useQuery({
    queryKey: QK_MARKET.adminProducts(params),
    queryFn: () =>
      api
        .get<{ products: Product[]; pagination: Pagination }>("/products/admin/all", {
          params: clean(params),
        })
        .then((r) => r.data),
  });

const useInvalidateProducts = () => {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["products"] }),
      qc.invalidateQueries({ queryKey: ["admin-products"] }),
      qc.invalidateQueries({ queryKey: QK_MARKET.facets }),
    ]);
};

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (payload: Partial<Product>) =>
      api.post<{ product: Product }>("/products", payload).then((r) => r.data.product),
    onSuccess: invalidate,
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Product> & { id: string }) =>
      api
        .put<{ product: Product }>(`/products/${id}`, payload)
        .then((r) => r.data.product),
    onSuccess: invalidate,
  });
};

export const useDeleteProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/products/${id}`).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useToggleProductPublish = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ product: Product }>(`/products/${id}/publish`)
        .then((r) => r.data.product),
    onSuccess: invalidate,
  });
};

export const useToggleProductFeatured = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) =>
      api
        .patch<{ product: Product }>(`/products/${id}/featured`)
        .then((r) => r.data.product),
    onSuccess: invalidate,
  });
};

/* ── Quote requests ──────────────────────────────────────────────────────── */

export type CreateMarketQuoteInput = {
  items: { product: string; qty: number }[];
  deliveryCity?: string;
  notes?: string;
  contact?: { name?: string; email?: string; phone?: string };
};

export const useCreateMarketQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarketQuoteInput) =>
      api
        .post<{ quote: MarketQuote; conversationId: string }>("/market-quotes", payload)
        .then((r) => r.data),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: QK_MARKET.myQuotes }),
        qc.invalidateQueries({ queryKey: ["admin-market-quotes"] }),
      ]),
  });
};

export const useMyMarketQuotes = (enabled = true) =>
  useQuery({
    queryKey: QK_MARKET.myQuotes,
    queryFn: () =>
      api.get<{ quotes: MarketQuote[] }>("/market-quotes/my").then((r) => r.data.quotes),
    enabled,
  });

export const useAdminMarketQuotes = (params?: { status?: string; search?: string }) =>
  useQuery({
    queryKey: QK_MARKET.adminQuotes(params),
    queryFn: () =>
      api
        .get<{ quotes: MarketQuote[]; pagination: Pagination }>(
          "/market-quotes/admin/all",
          { params: clean(params) },
        )
        .then((r) => r.data),
  });

export const useUpdateMarketQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      status?: MarketQuoteStatus;
      quotedAmount?: number;
      adminNotes?: string;
    }) =>
      api
        .put<{ quote: MarketQuote }>(`/market-quotes/admin/${id}`, payload)
        .then((r) => r.data.quote),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-market-quotes"] }),
  });
};
