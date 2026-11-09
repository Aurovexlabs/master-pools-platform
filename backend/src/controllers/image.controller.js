import Image from "../models/Image.model.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Public read of a stored image. Content is immutable once written. */
export const serveImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!OBJECT_ID.test(id || "")) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = await Image.findById(id).select("data contentType size");
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set({
      "Content-Type": image.contentType,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    return res.send(image.data);
  } catch (err) {
    console.error("Serve image failed:", err);
    return res.status(500).json({ message: "Image could not be loaded" });
  }
};
