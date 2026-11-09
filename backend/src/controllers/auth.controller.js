import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  renderOtp,
  renderPasswordChanged,
  renderPasswordReset,
  renderWelcome,
} from "../emails/templates.js";
import User from "../models/User.model.js";
import { sendFromPlatform } from "../utils/email.service.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

/* ── Input handling ─────────────────────────────────────────────────────── */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns a normalised email or null. Anything that is not a string is
 * rejected — an object such as `{ $ne: null }` must never reach a Mongoose
 * filter, which is how operator injection works.
 */
const normaliseEmail = (value) => {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : null;
};

/* ── One-time codes ─────────────────────────────────────────────────────── */

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/** Codes are stored as a hash, never as the digits themselves. */
const hashCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

const generateCode = () => String(crypto.randomInt(100000, 1000000));

export const register = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const name =
    typeof req.body.name === "string" ? req.body.name.trim().slice(0, 80) : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";
  const phone =
    typeof req.body.phone === "string"
      ? req.body.phone.trim().slice(0, 32)
      : undefined;

  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!email)
    return res.status(400).json({ message: "A valid email is required" });
  if (password.length < 8)
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({
    name,
    email,
    password,
    phone,
    isVerified: false,
  });
  const token = signToken(user);

  // Generate and send OTP for email verification
  try {
    const code = generateCode();
    user.otp = hashCode(code);
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    user.otpAttempts = 0;
    await user.save();

    await sendFromPlatform({
      to: user.email,
      subject: "Verify your MasterPools account",
      html: renderOtp(user.name, code),
    });
  } catch (err) {
    console.error("Send OTP failed:", err);
  }

  // Also send a friendly welcome message
  try {
    await sendFromPlatform({
      to: user.email,
      subject: "Welcome to MasterPools",
      html: renderWelcome(user.name),
    });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }

  res.status(201).json({ token, user });
};

export const sendOtp = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  if (!email) return res.status(400).json({ message: "A valid email is required" });

  const user = await User.findOne({ email });

  // Same response whether or not the address exists, so this cannot be used to
  // discover registered accounts.
  const genericResponse = {
    message: "If that address has an account, a verification code has been sent",
  };
  if (!user) return res.json(genericResponse);

  const sentRecently =
    user.otpExpires instanceof Date &&
    user.otpExpires.getTime() - Date.now() > OTP_TTL_MS - OTP_RESEND_COOLDOWN_MS;
  if (sentRecently) {
    return res
      .status(429)
      .json({ message: "A code was just sent. Wait a minute before requesting another." });
  }

  const code = generateCode();
  user.otp = hashCode(code);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  await user.save();

  try {
    await sendFromPlatform({
      to: user.email,
      subject: "Your verification code",
      html: renderOtp(user.name, code),
    });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Unable to send OTP" });
  }
  res.json({ message: "OTP sent" });
};

export const verifyOtp = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const code = req.body.code;
  if (!email || !code)
    return res.status(400).json({ message: "Email and code required" });
  if (!/^\d{6}$/.test(String(code))) {
    return res.status(400).json({ message: "Code must be a 6-digit number" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid or expired code" });

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res
      .status(429)
      .json({ message: "Too many attempts. Request a new code." });
  }

  if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  if (user.otp !== hashCode(code)) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      // Burn the code rather than allowing further guesses.
      user.otp = undefined;
      user.otpExpires = undefined;
    }
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  await user.save();
  res.json({ message: "Account verified" });
};

export const requestPasswordReset = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  if (!email)
    return res.status(400).json({ message: "A valid email is required" });
  const user = await User.findOne({ email });
  // Prevent account enumeration by returning a generic success message.
  if (!user)
    return res.json({
      message: "If that email exists, a password reset email has been sent",
    });
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.resetToken = tokenHash;
  user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
  await user.save();
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}&id=${user._id}`;
  try {
    await sendFromPlatform({
      to: user.email,
      subject: "Reset your MATERPOOLS AND CONTRUCTION password",
      html: renderPasswordReset(user.name, link),
    });
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return res.status(500).json({ message: "Unable to send reset email" });
  }
  res.json({
    message: "If that email exists, a password reset email has been sent",
  });
};

export const resetPassword = async (req, res) => {
  const { id, token, password } = req.body;
  if (
    typeof id !== "string" ||
    typeof token !== "string" ||
    typeof password !== "string" ||
    !id ||
    !token
  ) {
    return res.status(400).json({ message: "id, token and password required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ _id: id, resetToken: tokenHash });
  if (!user || !user.resetExpires || user.resetExpires < new Date())
    return res.status(400).json({ message: "Invalid or expired token" });
  user.password = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();
  try {
    await sendFromPlatform({
      to: user.email,
      subject: "Your password was changed",
      html: renderPasswordChanged(user.name),
    });
  } catch (err) {
    console.error("resetPassword notification failed:", err);
  }
  res.json({ message: "Password updated" });
};

export const login = async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const password =
    typeof req.body.password === "string" ? req.body.password : null;

  if (!email || !password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in",
      needsVerification: true,
    });
  }
  if (!user.isActive)
    return res.status(403).json({ message: "Account deactivated" });
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });
  const token = signToken(user);
  res.json({ token, user });
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true },
  );
  res.json({ user });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
};
