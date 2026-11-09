import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String },
    avatar: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// OTP and password reset fields
userSchema.add({
  // Stored as a SHA-256 hash, never the six digits themselves.
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  resetToken: { type: String },
  resetExpires: { type: Date },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.otpAttempts;
  delete obj.resetToken;
  delete obj.resetExpires;
  return obj;
};

export default mongoose.model("User", userSchema);
