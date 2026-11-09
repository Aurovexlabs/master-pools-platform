import Product from "../models/Product.model.js";

const SORTS = {
  relevance: "-createdAt",
  newest: "-createdAt",
  "price-asc": "price.amount",
  "price-desc": "-price.amount",
  name: "title",
  stock: "-stock",
};

const buildFilter = (query, { publishedOnly }) => {
  const filter = {};
  if (publishedOnly) filter.isPublished = true;

  if (query.category) {
    filter.category = { $in: String(query.category).split(",").filter(Boolean) };
  }
  if (query.brand) {
    filter.brand = { $in: String(query.brand).split(",").filter(Boolean) };
  }
  if (query.minPrice || query.maxPrice) {
    filter["price.amount"] = {};
    if (query.minPrice) filter["price.amount"].$gte = Number(query.minPrice);
    if (query.maxPrice) filter["price.amount"].$lte = Number(query.maxPrice);
  }
  if (query.inStock === "true") filter.stock = { $gt: 0 };
  if (query.inStock === "false") filter.stock = { $lte: 0 };
  if (query.sku) filter.sku = String(query.sku).toUpperCase();

  if (query.search) {
    const term = String(query.search).trim();
    const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { sku: rx }, { brand: rx }, { shortDescription: rx }];
  }
  return filter;
};

/* GET /api/products */
export const getProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12));
  const sort = SORTS[req.query.sort] || SORTS.relevance;
  const filter = buildFilter(req.query, { publishedOnly: true });

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-description -highlights -specs -__v")
      .lean(),
  ]);

  // An empty catalogue is never cached: during a restart or a filtered miss the
  // client should retry, not keep showing "no products".
  if (total === 0) {
    res.set("Cache-Control", "no-store");
  } else {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
  }

  res.json({
    products,
    pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit },
  });
};

/* GET /api/products/facets */
export const getFacets = async (_req, res) => {
  const [categories, brands, priceRange] = await Promise.all([
    Product.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Product.aggregate([
      { $match: { isPublished: true, brand: { $nin: [null, ""] } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Product.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: null,
          min: { $min: "$price.amount" },
          max: { $max: "$price.amount" },
          total: { $sum: 1 },
          inStock: { $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const totals = priceRange[0] || { min: 0, max: 0, total: 0, inStock: 0 };
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
  res.json({
    categories: categories.map((c) => ({ value: c._id, count: c.count })),
    brands: brands.map((b) => ({ value: b._id, count: b.count })),
    priceRange: { min: totals.min || 0, max: totals.max || 0 },
    totals: { all: totals.total, inStock: totals.inStock, outOfStock: totals.total - totals.inStock },
  });
};

/* GET /api/products/:idOrSlug */
export const getProduct = async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const product = await Product.findOne({
    $or: [{ _id: isObjectId ? idOrSlug : null }, { slug: idOrSlug }],
    isPublished: true,
  });

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.set("Cache-Control", "no-store");
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).catch(() => {});

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isPublished: true,
  })
    .sort("-createdAt")
    .limit(4)
    .select("title slug sku brand price unit images stock category")
    .lean();

  res.json({ product, related });
};

/* GET /api/products/admin/all */
export const adminGetProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = buildFilter(req.query, { publishedOnly: false });

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    products,
    pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit },
  });
};

/* POST /api/products */
export const createProduct = async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ product });
};

/* PUT /api/products/:id */
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
};

/* DELETE /api/products/:id */
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};

/* PATCH /api/products/:id/publish */
export const togglePublish = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isPublished = !product.isPublished;
  if (product.isPublished && !product.publishedAt) product.publishedAt = new Date();
  await product.save();

  res.json({ product });
};

/* PATCH /api/products/:id/featured */
export const toggleFeatured = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.json({ product });
};
