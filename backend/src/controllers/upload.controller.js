import multer from "multer";
import imagekit from "../config/imagekit.js";
import Image from "../models/Image.model.js";
import { safeFileName, safeFolder } from "../utils/safe.js";

const storage = multer.memoryStorage();

/**
 * Accepted image types. SVG is deliberately excluded: it can carry script and
 * is served from the same origin as the site.
 */
const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** The client-supplied mimetype is a claim; the leading bytes are the fact. */
const detectImageMime = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer
      .slice(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.slice(0, 4).toString("latin1") === "RIFF" &&
    buffer.slice(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.slice(0, 3).toString("latin1") === "GIF") {
    return "image/gif";
  }
  if (buffer.slice(4, 8).toString("latin1") === "ftyp") {
    return "image/avif";
  }
  return null;
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, GIF or AVIF images are allowed"));
    }
  },
});

// Build a thumbnail URL using ImageKit URL transformations
const makeThumbnail = (url) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");
    // Insert tr: after the first two segments (/ and imagekit-id)
    parts.splice(2, 0, "tr:w-400,h-300,c-at_max");
    urlObj.pathname = parts.join("/");
    return urlObj.toString();
  } catch {
    return url;
  }
};

const notConfigured = (res) =>
  res.status(503).json({ message: "ImageKit is not configured on this server" });

/**
 * Persist the bytes in MongoDB and return the same shape the ImageKit path
 * returns, so callers do not care which storage backend is active.
 */
const storeImage = async (req, file, contentType, folder) => {
  const image = await Image.create({
    filename: safeFileName(file.originalname, "image"),
    contentType,
    size: file.size,
    data: file.buffer,
    folder,
    uploadedBy: req.user?._id,
  });

  const url = `${req.protocol}://${req.get("host")}/api/images/${image._id}`;

  return {
    url,
    fileId: String(image._id),
    thumbnail: url,
    name: image.filename,
    size: image.size,
  };
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const detected = detectImageMime(req.file.buffer);
    if (!detected) {
      return res.status(400).json({ message: "That file is not a valid image" });
    }

    const folder = safeFolder(req.body.folder, "masterpools/general");

    // With no external CDN configured, the bytes go into MongoDB and are served
    // from /api/images/:id. This is what lets an admin upload project photos on
    // a deployment that has no ImageKit keys.
    if (!imagekit) {
      const stored = await storeImage(req, req.file, detected, folder);
      return res.status(201).json(stored);
    }

    const dataURI = `data:${detected};base64,${req.file.buffer.toString("base64")}`;

    const result = await imagekit.files.upload({
      file: dataURI,
      fileName: `${Date.now()}-${safeFileName(req.file.originalname, "image")}`,
      folder,
      useUniqueFileName: true,
      tags: [folder.replace(/\//g, "-")],
    });

    res.json({
      url: result.url,
      fileId: result.fileId,
      thumbnail: makeThumbnail(result.url),
      name: result.name,
      size: result.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "The image could not be uploaded" });
  }
};

export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ message: "No files provided" });

    // Validate every file before uploading any of them.
    const detected = req.files.map((file) => detectImageMime(file.buffer));
    if (detected.some((mime) => !mime)) {
      return res
        .status(400)
        .json({ message: "One or more files are not valid images" });
    }

    const folder = safeFolder(req.body.folder, "masterpools/gallery");

    if (!imagekit) {
      const images = await Promise.all(
        req.files.map((file, index) =>
          storeImage(req, file, detected[index], folder),
        ),
      );
      return res.status(201).json({ images });
    }

    const uploads = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await imagekit.files.upload({
          file: `data:${detected[index]};base64,${file.buffer.toString("base64")}`,
          fileName: `${Date.now()}-${safeFileName(file.originalname, "image")}`,
          folder,
          useUniqueFileName: true,
        });
        return {
          url: result.url,
          fileId: result.fileId,
          thumbnail: makeThumbnail(result.url),
          name: result.name,
        };
      }),
    );

    res.json({ images: uploads });
  } catch (err) {
    console.error("Multi-upload error:", err);
    res.status(500).json({ message: "The images could not be uploaded" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (typeof fileId !== "string" || !fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    if (!imagekit) {
      // Ids issued by the database-backed store are Mongo ids.
      if (!/^[a-f\d]{24}$/i.test(fileId)) {
        return res.status(400).json({ message: "That image could not be found" });
      }
      await Image.findByIdAndDelete(fileId);
      return res.json({ message: "Image deleted successfully" });
    }

    await imagekit.files.delete(fileId);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ message: "The image could not be deleted" });
  }
};

export const getAuthParams = (_req, res) => {
  try {
    if (!imagekit) return notConfigured(res);
    const result = imagekit.helper.getAuthenticationParameters();
    res.json(result);
  } catch (err) {
    console.error("Upload auth params error:", err);
    res.status(500).json({ message: "Upload parameters are unavailable" });
  }
};
