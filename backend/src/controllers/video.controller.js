import multer from "multer";
import imagekit from "../config/imagekit.js";
import Video from "../models/Video.model.js";

const storage = multer.memoryStorage();

export const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["video/mp4", "video/webm", "video/quicktime"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, WebM, MOV) are allowed"));
    }
  },
});

// Generate thumbnail URL using ImageKit transformations
const makeThumbnail = (url) => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");
    parts.splice(2, 0, "tr:w-400,h-300,c-at_max");
    urlObj.pathname = parts.join("/");
    return urlObj.toString();
  } catch {
    return url;
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!imagekit) {
      return res
        .status(503)
        .json({ message: "ImageKit is not configured on this server" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Video title is required" });
    }

    const folder = "masterpools/videos";
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const result = await imagekit.files.upload({
      file: dataURI,
      fileName: `${Date.now()}-${req.file.originalname
        .replace(/\s+/g, "-")
        .toLowerCase()}`,
      folder,
      useUniqueFileName: true,
      tags: ["masterpools-videos"],
    });

    // Create video record in database
    const video = new Video({
      title,
      url: result.url,
      fileId: result.fileId,
      thumbnail: makeThumbnail(result.url),
      size: result.size,
      order: (await Video.countDocuments()) || 0,
    });

    await video.save();

    res.status(201).json({
      success: true,
      video: {
        _id: video._id,
        title: video.title,
        url: video.url,
        fileId: video.fileId,
        thumbnail: video.thumbnail,
        size: video.size,
        order: video.order,
        active: video.active,
      },
    });
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getVideos = async (req, res) => {
  try {
    // `active` is a boolean on the model, so it must not be compared to the
    // string "true" — doing that returned inactive videos to the public site.
    const activeOnly =
      req.query.active === undefined ? true : req.query.active === "true";

    const query = activeOnly ? { active: true } : {};
    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 });

    if (activeOnly) {
      res.set(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=86400",
      );
    } else {
      res.set("Cache-Control", "no-store");
    }

    res.json({
      success: true,
      count: videos.length,
      videos: videos.map((v) => ({
        _id: v._id,
        title: v.title,
        src: v.url,
        url: v.url,
        fileId: v.fileId,
        thumbnail: v.thumbnail,
        size: v.size,
        order: v.order,
        active: v.active,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) {
    console.error("Get videos error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order, active } = req.body;

    const video = await Video.findByIdAndUpdate(
      id,
      { title, order, active },
      { new: true, runValidators: true },
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      success: true,
      video: {
        _id: video._id,
        title: video.title,
        url: video.url,
        fileId: video.fileId,
        thumbnail: video.thumbnail,
        size: video.size,
        order: video.order,
        active: video.active,
      },
    });
  } catch (err) {
    console.error("Update video error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete from ImageKit
    if (imagekit && video.fileId) {
      try {
        await imagekit.deleteFile(video.fileId);
      } catch (err) {
        console.warn("Failed to delete file from ImageKit:", err.message);
      }
    }

    // Delete from database
    await Video.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const reorderVideos = async (req, res) => {
  try {
    const { videos } = req.body;

    if (!Array.isArray(videos)) {
      return res.status(400).json({ message: "Invalid videos format" });
    }

    // Update order for all videos
    await Promise.all(
      videos.map((item, index) =>
        Video.findByIdAndUpdate(item._id, { order: index }),
      ),
    );

    const updated = await Video.find().sort({ order: 1 });

    res.json({
      success: true,
      videos: updated.map((v) => ({
        _id: v._id,
        title: v.title,
        url: v.url,
        order: v.order,
      })),
    });
  } catch (err) {
    console.error("Reorder videos error:", err);
    res.status(500).json({ message: err.message });
  }
};
