import mongoose from "mongoose";

const quoteItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    unit: { type: String, default: "each" },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const marketQuoteSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: { type: [quoteItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    deliveryCity: { type: String, trim: true },
    notes: { type: String, maxlength: 1000 },
    contact: {
      name: String,
      email: String,
      phone: String,
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "quoted", "accepted", "declined", "expired"],
      default: "pending",
    },
    quotedAmount: Number,
    adminNotes: String,
    quotedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    quotedAt: Date,

    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  },
  { timestamps: true },
);

marketQuoteSchema.index({ user: 1, createdAt: -1 });
marketQuoteSchema.index({ status: 1 });

marketQuoteSchema.pre("save", function (next) {
  if (!this.referenceNumber) {
    const year = new Date().getFullYear();
    const suffix = String(Math.floor(10000 + Math.random() * 89999));
    this.referenceNumber = `MQ-${year}-${suffix}`;
  }
  next();
});

export default mongoose.model("MarketQuote", marketQuoteSchema);
