import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Message, { Conversation } from "../models/Message.model.js";
import User from "../models/User.model.js";

let io;

/** Clients may only send these message kinds over the socket. */
const ALLOWED_TYPES = new Set(["text", "image"]);
const MAX_CONTENT_LENGTH = 4000;

const allowedOrigins = () =>
  (
    process.env.CLIENT_URL ||
    "http://localhost:5173,https://www.masterspools.co.zw,https://masterspools.co.zw"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * A conversation is readable only by its owner or by an administrator.
 * Every socket event that names a conversation must pass through this.
 */
const canAccessConversation = async (conversationId, user) => {
  if (!conversationId || typeof conversationId !== "string") return false;
  if (user.role === "admin") return true;

  try {
    const conversation = await Conversation.findById(conversationId).select("user");
    if (!conversation) return false;
    return conversation.user?.toString() === user.id;
  } catch {
    return false;
  }
};

export const initSocket = (server) => {
  // Never allow every origin in production, even if the flag is set.
  const allowAll =
    process.env.ALLOW_ALL_ORIGINS === "true" &&
    process.env.NODE_ENV !== "production";

  io = new Server(server, {
    cors: allowAll
      ? { origin: true, credentials: true }
      : { origin: allowedOrigins(), credentials: true },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
  });

  // Authenticate the handshake and load the authoritative role from the database
  // — never trust the role baked into the token.
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role isActive");
      if (!user || !user.isActive) return next(new Error("Account unavailable"));

      socket.user = {
        id: String(user._id),
        role: user.role,
        name: user.name,
      };
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room, plus the shared admin room for staff.
    socket.join(`user:${socket.user.id}`);
    if (socket.user.role === "admin") socket.join("admin");

    socket.on("join:conversation", async ({ conversationId } = {}) => {
      const allowed = await canAccessConversation(conversationId, socket.user);
      if (!allowed) {
        socket.emit("error", { message: "Access denied" });
        return;
      }
      socket.join(`conv:${conversationId}`);
    });

    socket.on("send:message", async (data = {}) => {
      try {
        const { conversationId, content, type = "text" } = data;

        const allowed = await canAccessConversation(conversationId, socket.user);
        if (!allowed) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        if (typeof content !== "string" || !content.trim()) {
          socket.emit("error", { message: "Message is empty" });
          return;
        }
        if (content.length > MAX_CONTENT_LENGTH) {
          socket.emit("error", { message: "Message is too long" });
          return;
        }
        if (!ALLOWED_TYPES.has(type)) {
          socket.emit("error", { message: "Unsupported message type" });
          return;
        }

        const message = await Message.create({
          conversationId,
          sender: socket.user.id,
          senderRole: socket.user.role,
          content: content.trim(),
          type,
        });
        const populated = await message.populate("sender", "name avatar");

        io.to(`conv:${conversationId}`).emit("message:new", populated);

        // Keep the conversation list counters in step with REST sends.
        const inc =
          socket.user.role === "admin"
            ? { unreadByUser: 1 }
            : { unreadByAdmin: 1 };
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content.slice(0, 100),
          lastMessageAt: new Date(),
          $inc: inc,
        });

        if (socket.user.role !== "admin") {
          io.to("admin").emit("notification:message", {
            conversationId,
            senderName: socket.user.name,
            preview: content.slice(0, 60),
          });
        }
      } catch (err) {
        console.error("Socket send:message failed:", err.message);
        socket.emit("error", { message: "Message could not be sent" });
      }
    });

    const relayTyping = (event) => async ({ conversationId } = {}) => {
      const allowed = await canAccessConversation(conversationId, socket.user);
      if (!allowed) return;
      socket.to(`conv:${conversationId}`).emit(event, {
        userId: socket.user.id,
        role: socket.user.role,
      });
    };

    socket.on("typing:start", relayTyping("typing:start"));
    socket.on("typing:stop", relayTyping("typing:stop"));
  });

  return io;
};

export const getIO = () => io;
