import { createFileRoute } from "@tanstack/react-router";

import ProductPage from "../pages/ProductPage";

export const Route = createFileRoute("/market/$slug")({
  component: ProductRoute,
});

function ProductRoute() {
  const { slug } = Route.useParams();
  return <ProductPage slug={slug} />;
}
