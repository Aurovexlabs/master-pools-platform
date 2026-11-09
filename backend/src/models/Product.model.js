import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileId: String,
    thumbnail: String,
    alt: String,
  },
  { _id: false },
);

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const PRODUCT_CATEGORIES = [
  "pumps",
  "filtration",
  "heating",
  "lighting",
  "cleaning",
  "chemicals",
  "covers",
  "ladders-rails",
  "tiles-finishes",
  "spares",
  "services",
];

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    brand: { type: String, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },

    shortDescription: { type: String, maxlength: 220 },
    description: { type: String, required: true },
    highlights: [String],
    specs: [specSchema],

    price: {
      amount: { type: Number, required: true },
      currency: { type: String, default: "USD" },
    },
    compareAtPrice: Number,
    unit: { type: String, default: "each", trim: true },

    stock: { type: Number, default: 0, min: 0 },
    images: [imageSchema],
    datasheet: imageSchema,
    warrantyMonths: Number,
    installRequired: { type: Boolean, default: false },

    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    views: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ title: "text", sku: "text", brand: "text" });

productSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    this.slug = `${base}-${Date.now()}`;
  }
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

export { PRODUCT_CATEGORIES };
export default mongoose.model("Product", productSchema);
