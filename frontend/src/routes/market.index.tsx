import { createFileRoute } from "@tanstack/react-router";

import MarketPage, { type MarketSearch } from "../pages/MarketPage";

export const Route = createFileRoute("/market/")({
  validateSearch: (search: Record<string, unknown>): MarketSearch => {
    const num = (value: unknown) =>
      value === undefined || value === null || value === "" ? undefined : Number(value);

    const bool = (value: unknown) => {
      if (value === true || value === "true") return true;
      if (value === false || value === "false") return false;
      return undefined;
    };

    return {
      category: typeof search.category === "string" ? search.category : undefined,
      brand: typeof search.brand === "string" ? search.brand : undefined,
      minPrice: num(search.minPrice),
      maxPrice: num(search.maxPrice),
      inStock: bool(search.inStock),
      search: typeof search.search === "string" ? search.search : undefined,
      sort: typeof search.sort === "string" ? search.sort : undefined,
      page: num(search.page),
    };
  },
  component: MarketRoute,
});

function MarketRoute() {
  const search = Route.useSearch();
  return <MarketPage search={search} />;
}
