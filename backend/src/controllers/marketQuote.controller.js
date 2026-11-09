import MarketQuote from "../models/MarketQuote.model.js";
import Product from "../models/Product.model.js";
import { Conversation, default as Message } from "../models/Message.model.js";
import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

const round = (n) => Math.round(n * 100) / 100;

/**
 * Rebuilds basket lines from live product records so a stale or tampered
 * client price can never reach the quotation.
 */
const resolveItems = async (rawItems) => {
  const ids = rawItems.map((i) => i.product || i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids }, isPublished: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const raw of rawItems) {
    const product = byId.get(String(raw.product || raw.productId));
    if (!product) continue;

    const qty = Math.max(1, Number(raw.qty) || 1);
    items.push({
      product: product._id,
      title: product.title,
      sku: product.sku,
      unit: product.unit,
      unitPrice: product.price.amount,
      qty,
      lineTotal: round(product.price.amount * qty),
    });
  }
  return items;
};

const notifyAdmins = async (quote) => {
  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  if (!admins.length) return;

  await Notification.insertMany(
    admins.map((admin) => ({
      user: admin._id,
      type: "system",
      title: "New equipment quote request",
      body: `${quote.referenceNumber} — ${quote.items.length} line(s), ${quote.currency} ${quote.subtotal}`,
      link: "/admin/market-quotes",
    })),
  );
};

/* POST /api/market-quotes */
export const createMarketQuote = async (req, res) => {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (!rawItems.length) {
    return res.status(400).json({ message: "Add at least one product to the basket" });
  }

  const items = await resolveItems(rawItems);
  if (!items.length) {
    return res.status(400).json({ message: "None of the basket products are available" });
  }

  const subtotal = round(items.reduce((sum, item) => sum + item.lineTotal, 0));

  const quote = await MarketQuote.create({
    user: req.user._id,
    items,
    subtotal,
    currency: "USD",
    deliveryCity: req.body.deliveryCity,
    notes: req.body.notes,
    contact: {
      name: req.body.contact?.name || req.user.name,
      email: req.body.contact?.email || req.user.email,
      phone: req.body.contact?.phone || req.user.phone,
    },
  });

  // A quote request always opens a chat thread so staff can answer in one place.
  const subject = `Equipment quote ${quote.referenceNumber}`;
  let conversation = await Conversation.findOne({ user: req.user._id, status: "open" });
  if (!conversation) {
    conversation = await Conversation.create({ user: req.user._id, subject });
  }

  const summary = items
    .map((i) => `${i.qty} × ${i.title} (${i.sku}) — $${i.lineTotal}`)
    .join("\n");

  await Message.create({
    conversationId: conversation._id,
    sender: req.user._id,
    senderRole: "user",
    content: `Quote request ${quote.referenceNumber}\n${summary}\nSubtotal: $${subtotal}${
      quote.deliveryCity ? `\nDeliver to: ${quote.deliveryCity}` : ""
    }${quote.notes ? `\nNotes: ${quote.notes}` : ""}`,
    type: "text",
  });

  conversation.lastMessage = `Quote request ${quote.referenceNumber} — ${items.length} line(s)`;
  conversation.lastMessageAt = new Date();
  conversation.unreadByAdmin = (conversation.unreadByAdmin || 0) + 1;
  await conversation.save();

  quote.conversationId = conversation._id;
  await quote.save();

  await notifyAdmins(quote);

  res.status(201).json({ quote, conversationId: conversation._id });
};

/* GET /api/market-quotes/my */
export const getMyMarketQuotes = async (req, res) => {
  const quotes = await MarketQuote.find({ user: req.user._id }).sort("-createdAt").lean();
  res.json({ quotes });
};

/* GET /api/market-quotes/:id */
export const getMarketQuote = async (req, res) => {
  const quote = await MarketQuote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Quote not found" });

  const isOwner = String(quote.user) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ quote });
};

/* GET /api/market-quotes/admin/all */
export const adminGetMarketQuotes = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ referenceNumber: rx }, { "contact.name": rx }, { "contact.email": rx }];
  }

  const [total, quotes] = await Promise.all([
    MarketQuote.countDocuments(filter),
    MarketQuote.find(filter)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
  ]);

  res.json({
    quotes,
    pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit },
  });
};

/* PUT /api/market-quotes/admin/:id */
export const adminUpdateMarketQuote = async (req, res) => {
  const quote = await MarketQuote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Quote not found" });

  const { status, quotedAmount, adminNotes } = req.body;
  if (status) quote.status = status;
  if (quotedAmount !== undefined) quote.quotedAmount = quotedAmount;
  if (adminNotes !== undefined) quote.adminNotes = adminNotes;
  if (status === "quoted") {
    quote.quotedAt = new Date();
    quote.quotedBy = req.user._id;
  }

  await quote.save();
  res.json({ quote });
};
