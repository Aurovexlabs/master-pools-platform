import { Router } from "express";

import {
  adminGetProducts,
  createProduct,
  deleteProduct,
  getFacets,
  getProduct,
  getProducts,
  toggleFeatured,
  togglePublish,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminOnly, optionalAuth, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/facets", getFacets);
router.get("/admin/all", protect, adminOnly, adminGetProducts);
router.get("/:idOrSlug", optionalAuth, getProduct);

router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/publish", protect, adminOnly, togglePublish);
router.patch("/:id/featured", protect, adminOnly, toggleFeatured);

export default router;
