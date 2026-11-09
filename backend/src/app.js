import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { apiRateLimit } from "./middleware/rateLimit.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import imageRoutes from "./routes/image.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import marketQuoteRoutes from "./routes/marketQuote.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import productRoutes from "./routes/product.routes.js";
import projectRoutes from "./routes/project.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,https://www.masterspools.co.zw,https://masterspools.co.zw"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  // If explicitly allowed for testing, accept any origin
  if (process.env.ALLOW_ALL_ORIGINS === "true") return true;

  if (!origin) return true;
  if (allowedOrigins.includes("*")) return true;
  if (allowedOrigins.includes(origin)) return true;

  if (process.env.ALLOW_VERCEL_PREVIEWS === "true") {
    try {
      const host = new URL(origin).hostname;
      return host.endsWith(".vercel.app");
    } catch {
      return false;
    }
  }

  return false;
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      // Reject as 403 rather than letting this surface as a 500.
      const error = new Error("Not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Log allowed origins at startup for debugging
console.log("Allowed origins:", allowedOrigins);
if (process.env.ALLOW_ALL_ORIGINS === "true")
  console.log("CORS: allowing all origins (ALLOW_ALL_ORIGINS=true)");
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(apiRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/products", productRoutes);
app.use("/api/market-quotes", marketQuoteRoutes);

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    message: "MATERPOOLS AND CONTRUCTION API",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  }),
);

// Serve frontend build in production when available
if (
  process.env.NODE_ENV === "production" &&
  process.env.SERVE_FRONTEND === "true"
) {
  const clientBuildPath = path.resolve(process.cwd(), "../frontend/dist");
  app.use(
    express.static(clientBuildPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }),
  );

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      res.setHeader("Cache-Control", "no-cache");
      return res.sendFile(path.join(clientBuildPath, "index.html"));
    }

    next();
  });
}

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const UPLOAD_ERROR_MESSAGES = {
  LIMIT_FILE_SIZE: "That file is too large",
  LIMIT_FILE_COUNT: "Too many files in one request",
  LIMIT_UNEXPECTED_FILE: "Unexpected file field",
};

app.use((err, _req, res, _next) => {
  console.error(err.stack);

  const isMulter = err?.name === "MulterError";
  const isUploadRejection =
    typeof err?.message === "string" &&
    (err.message.startsWith("Only JPEG") ||
      err.message.includes("valid image"));

  const status = isMulter || isUploadRejection
    ? 400
    : err.status || err.statusCode || 500;

  // Client errors keep a useful message; server errors never leak internals.
  let message;
  if (isMulter) {
    message = UPLOAD_ERROR_MESSAGES[err.code] || "That upload could not be accepted";
  } else if (isUploadRejection) {
    message = err.message;
  } else if (status >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
  } else {
    message = err.message || "Internal server error";
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
