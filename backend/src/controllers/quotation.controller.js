import { Conversation } from "../models/Message.model.js";
import Quotation from "../models/Quotation.model.js";
import { sendFromPlatform } from "../utils/email.service.js";
import { escapeRegex, pick } from "../utils/safe.js";
import { createNotification } from "./notification.controller.js";

export const createQuotation = async (req, res) => {
  // Whitelisted fields only. A customer must not be able to set status,
  // quotedAmount, quotedBy, quotedAt or any other administrative field by
  // posting it in the body.
  const payload = pick(req.body, [
    "poolType",
    "poolShape",
    "dimensions",
    "features",
    "location",
    "budget",
    "timeline",
    "additionalNotes",
    "attachments",
  ]);

  if (
    typeof payload.poolType !== "string" ||
    typeof payload.poolShape !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Pool type and pool shape are required" });
  }
  if (
    payload.additionalNotes !== undefined &&
    typeof payload.additionalNotes !== "string"
  ) {
    return res.status(400).json({ message: "Notes must be text" });
  }

  if (Array.isArray(payload.attachments)) {
    payload.attachments = payload.attachments
      .filter((file) => file && typeof file.url === "string")
      .slice(0, 10)
      .map((file) => ({
        url: file.url,
        fileId: typeof file.fileId === "string" ? file.fileId : "",
        name: typeof file.name === "string" ? file.name : "Attachment",
      }));
  } else {
    delete payload.attachments;
  }

  const conversation = await Conversation.create({
    user: req.user._id,
    subject: `Quotation — ${payload.poolType} Pool`,
  });
  const quotation = await Quotation.create({
    ...payload,
    user: req.user._id,
    conversationId: conversation._id,
  });
  conversation.quotation = quotation._id;
  await conversation.save();
  res.status(201).json({ quotation, conversationId: conversation._id });
};

export const getUserQuotations = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  const total = await Quotation.countDocuments(filter);
  const quotations = await Quotation.find(filter)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("conversationId", "_id");
  res.json({
    quotations,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

export const getQuotation = async (req, res) => {
  const quotation = await Quotation.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("quotedBy", "name");
  if (!quotation)
    return res.status(404).json({ message: "Quotation not found" });
  res.json({ quotation });
};

export const adminGetQuotations = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const term = escapeRegex(search);
    filter.$or = [
      { referenceNumber: { $regex: term, $options: "i" } },
      { poolType: { $regex: term, $options: "i" } },
    ];
  }
  const total = await Quotation.countDocuments(filter);
  const quotations = await Quotation.find(filter)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("user", "name email phone")
    .populate("quotedBy", "name");
  res.json({
    quotations,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

export const adminUpdateQuotation = async (req, res) => {
  const { quotedAmount, status, adminNotes, validUntil } = req.body;
  const update = {};
  if (status) update.status = status;
  if (adminNotes) update.adminNotes = adminNotes;
  if (validUntil) update.validUntil = validUntil;
  if (quotedAmount) {
    update.quotedAmount = quotedAmount;
    update.quotedBy = req.user._id;
    update.quotedAt = new Date();
    if (!update.status) update.status = "quoted";
  }

  const quotation = await Quotation.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate("user", "name email _id");
  if (!quotation)
    return res.status(404).json({ message: "Quotation not found" });

  // Create notification for the user
  const userId = quotation.user?._id || quotation.user;
  if (userId) {
    const msgs = {
      reviewing: {
        title: "Quotation Under Review",
        body: `We're reviewing your ${quotation.poolType} pool request #${quotation.referenceNumber}`,
      },
      quoted: {
        title: "Your Quote is Ready",
        body: `View your ${quotation.poolType} pool quote #${quotation.referenceNumber} — $${quotation.quotedAmount?.amount?.toLocaleString() || ""}`,
      },
      accepted: {
        title: "Quotation Accepted",
        body: `Your quotation #${quotation.referenceNumber} has been accepted!`,
      },
      rejected: {
        title: "Quotation Update",
        body: `Update on your quotation #${quotation.referenceNumber}`,
      },
    };
    const msg = msgs[update.status];
    if (msg)
      await createNotification({
        userId,
        type: "quotation_update",
        ...msg,
        link: "/dashboard",
      });

    // Send transactional email to the user about quotation status update
    try {
      const userEmail = quotation.user?.email;
      if (userEmail) {
        await sendFromPlatform({
          to: userEmail,
          subject: msg.title,
          html: `<p>${msg.body}</p><p><a href=\"${process.env.CLIENT_URL}/dashboard\">View in dashboard</a></p>`,
        });
      }
    } catch (err) {
      console.error("Quotation status email failed:", err);
    }
  }

  res.json({ quotation });
};

export const adminGetStats = async (req, res) => {
  const stats = await Quotation.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json({ stats });
};
