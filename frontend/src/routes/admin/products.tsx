import { createFileRoute } from "@tanstack/react-router";

import AdminProducts from "../../pages/admin/AdminProducts";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});
