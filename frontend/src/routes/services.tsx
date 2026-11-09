import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout for the services section. The index renders the directory and
 * `/services/$slug` renders a single service.
 */
export const Route = createFileRoute("/services")({
  component: ServicesLayout,
});

function ServicesLayout() {
  return <Outlet />;
}
