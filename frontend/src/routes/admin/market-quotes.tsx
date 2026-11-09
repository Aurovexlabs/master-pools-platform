import { createFileRoute } from "@tanstack/react-router";

import AdminMarketQuotes from "../../pages/admin/AdminMarketQuotes";

export const Route = createFileRoute("/admin/market-quotes")({
  component: AdminMarketQuotes,
});
