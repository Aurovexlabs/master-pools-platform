import { createFileRoute } from "@tanstack/react-router";

import QuoteBasketPage from "../pages/QuoteBasketPage";

export const Route = createFileRoute("/market/quote")({
  component: QuoteBasketPage,
});
