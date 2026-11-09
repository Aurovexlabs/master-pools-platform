import { createFileRoute } from "@tanstack/react-router";

import ServiceDetailPage from "../pages/ServiceDetailPage";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetailRoute,
});

function ServiceDetailRoute() {
  const { slug } = Route.useParams();
  return <ServiceDetailPage slug={slug} />;
}
