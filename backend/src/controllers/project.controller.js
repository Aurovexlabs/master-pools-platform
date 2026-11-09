import Project from "../models/Project.model.js";
import { escapeRegex, pick } from "../utils/safe.js";

/** Fields an administrator may set on a project. */
const PROJECT_FIELDS = [
  "title",
  "slug",
  "description",
  "shortDescription",
  "category",
  "status",
  "location",
  "client",
  "duration",
  "area",
  "depth",
  "isFeatured",
  "isPublished",
  "completedAt",
  "startedAt",
];

const asImage = (value) => {
  if (!value || typeof value !== "object") return undefined;
  if (typeof value.url !== "string" || !value.url.trim()) return undefined;

  return {
    url: value.url.trim(),
    fileId: typeof value.fileId === "string" ? value.fileId : "",
    thumbnail: typeof value.thumbnail === "string" ? value.thumbnail : "",
    alt: typeof value.alt === "string" ? value.alt.slice(0, 200) : "",
  };
};

const asStringList = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
        .slice(0, 30)
    : [];

/**
 * The safe subset of a project body. Images are normalised so a malformed entry
 * cannot reach the database, and administrative or derived fields such as
 * `views`, `createdBy` and `publishedAt` are never taken from the request.
 */
const projectPayload = (body = {}) => {
  const payload = pick(body, PROJECT_FIELDS);

  if (body.features !== undefined) payload.features = asStringList(body.features);
  if (body.tags !== undefined) payload.tags = asStringList(body.tags);
  if (body.isFeatured !== undefined) payload.isFeatured = Boolean(body.isFeatured);
  if (body.isPublished !== undefined) payload.isPublished = Boolean(body.isPublished);

  const coverImage = asImage(body.coverImage);
  if (coverImage) payload.coverImage = coverImage;

  if (Array.isArray(body.gallery)) {
    payload.gallery = body.gallery
      .map(asImage)
      .filter(Boolean)
      .slice(0, 24);
  }

  return payload;
};

export const getProjects = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    status,
    category,
    featured,
    search,
    sort = "-createdAt",
  } = req.query;
  const filter = { isPublished: true };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (featured === "true") filter.isFeatured = true;
  if (search) {
    const term = escapeRegex(search);
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { tags: { $in: [new RegExp(term, "i")] } },
    ];
  }
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("createdBy", "name");
  // Never let an empty result be cached — a restarting or empty database would
  // otherwise leave visitors on an empty portfolio for the whole max-age window.
  if (total === 0) {
    res.set("Cache-Control", "no-store");
  } else {
    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=600",
    );
  }

  res.json({
    projects,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  });
};

export const getProject = async (req, res) => {
  const project = await Project.findOne({
    $or: [
      { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
      { slug: req.params.id },
    ],
    isPublished: true,
  }).populate("createdBy", "name");
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.set("Cache-Control", "no-store");
  project.views += 1;
  await project.save({ validateBeforeSave: false });
  res.json({ project });
};

export const getStats = async (req, res) => {
  const [total, completed, ongoing, upcoming] = await Promise.all([
    Project.countDocuments({ isPublished: true }),
    Project.countDocuments({ isPublished: true, status: "completed" }),
    Project.countDocuments({ isPublished: true, status: "ongoing" }),
    Project.countDocuments({ isPublished: true, status: "upcoming" }),
  ]);
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
  res.json({ total, completed, ongoing, upcoming });
};

export const adminGetProjects = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("createdBy", "name");
  res.json({
    projects,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

export const createProject = async (req, res) => {
  const project = await Project.create({
    ...projectPayload(req.body),
    createdBy: req.user._id,
  });
  res.status(201).json({ project });
};

export const updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    projectPayload(req.body),
    { new: true, runValidators: true },
  );
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ project });
};

export const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ message: "Project deleted" });
};

export const togglePublish = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  project.isPublished = !project.isPublished;
  if (project.isPublished) project.publishedAt = new Date();
  await project.save();
  res.json({ project });
};
