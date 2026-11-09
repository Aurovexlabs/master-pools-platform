import mongoose from "mongoose";

/**
 * Uploaded image bytes, stored in MongoDB.
 *
 * The platform is deployed to hosts with ephemeral disks and ImageKit is not
 * always configured, so an uploaded project photo needs somewhere durable to
 * live. Documents are capped at 16 MB by MongoDB; uploads are limited to 10 MB
 * upstream, which leaves room for the metadata.
 */
const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    folder: { type: String, default: "masterpools/general" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

imageSchema.index({ createdAt: -1 });

// The binary payload must never be serialised into a JSON response.
imageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.data;
    return ret;
  },
});

export default mongoose.model("Image", imageSchema);
