// auth.routes.js
import { Router } from "express";
import {
  changePassword,
  getMe,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Credential endpoints are throttled per IP: 10 attempts per 15 minutes.
// Applied here rather than router-wide so a signed-in customer browsing the
// app is not caught by the same bucket.
router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/send-otp", authRateLimit, sendOtp);
router.post("/verify-otp", authRateLimit, verifyOtp);
router.post("/request-password-reset", authRateLimit, requestPasswordReset);
router.post("/reset-password", authRateLimit, resetPassword);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;
