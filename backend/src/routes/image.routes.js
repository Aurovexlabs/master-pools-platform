import { Router } from "express";
import { serveImage } from "../controllers/image.controller.js";

const router = Router();

// Public: these are project photographs rendered on the public portfolio.
router.get("/:id", serveImage);

export default router;
