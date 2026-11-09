import User from "../models/User.model.js";
import { sendFromPlatform } from "../utils/email.service.js";
import { escapeRegex } from "../utils/safe.js";

export const adminGetUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: "user" };
  if (search) {
    const term = escapeRegex(search);
    filter.$or = [
      { name: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ];
  }
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({
    users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

export const adminToggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  // Notify user of account status change
  try {
    await sendFromPlatform({
      to: user.email,
      subject: user.isActive ? "Account Reactivated" : "Account Deactivated",
      html: `<p>Your account has been ${user.isActive ? "reactivated" : "deactivated"} by an administrator.</p>`,
    });
  } catch (err) {
    console.error("Account status email failed:", err);
  }

  res.json({ user });
};
