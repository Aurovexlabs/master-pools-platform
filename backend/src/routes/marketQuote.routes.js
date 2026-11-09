import { Router } from "express";

import {
  adminGetMarketQuotes,
  adminUpdateMarketQuote,
  createMarketQuote,
  getMarketQuote,
  getMyMarketQuotes,
} from "../controllers/marketQuote.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createMarketQuote);
router.get("/my", protect, getMyMarketQuotes);
router.get("/admin/all", protect, adminOnly, adminGetMarketQuotes);
router.put("/admin/:id", protect, adminOnly, adminUpdateMarketQuote);
router.get("/:id", protect, getMarketQuote);

export default router;
