import BlogPost from "../models/BlogPost.model.js";
import { escapeRegex } from "../utils/safe.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function makeExcerpt(content, existingExcerpt = "") {
  const clean = (content || "").replace(/\s+/g, " ").trim();
  if (existingExcerpt?.trim()) return existingExcerpt.trim();
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean;
}

async function uniqueSlug(baseSlug, excludeId) {
  const root = baseSlug || "latest-update";
  let candidate = root;
  let counter = 1;

  while (
    await BlogPost.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    counter += 1;
    candidate = `${root}-${counter}`;
  }

  return candidate;
}

function serializePost(post) {
  if (!post) return post;
  const plain = post.toObject ? post.toObject() : post;
  return {
    ...plain,
    excerpt: makeExcerpt(plain.content, plain.excerpt),
  };
}

function buildFilter({
  publishedOnly = true,
  search,
  category,
  tag,
  featured,
}) {
  const filter = {};

  if (publishedOnly) filter.isPublished = true;
  if (category && category !== "all") filter.category = category;
  if (featured === "true") filter.featured = true;
  if (tag) filter.tags = { $in: [new RegExp(escapeRegex(tag), "i")] };
  if (search) {
    const term = escapeRegex(search);
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { excerpt: { $regex: term, $options: "i" } },
      { content: { $regex: term, $options: "i" } },
      { tags: { $in: [new RegExp(term, "i")] } },
    ];
  }

  return filter;
}

async function listPosts(res, filter, page, limit) {
  const total = await BlogPost.countDocuments(filter);
  const posts = await BlogPost.find(filter)
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "name");

  res.json({
    posts: posts.map(serializePost),
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
}

export const getPosts = async (req, res) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    category,
    tag,
    featured,
  } = req.query;
  res.set("Cache-Control", "public, max-age=180, stale-while-revalidate=86400");
  return listPosts(
    res,
    buildFilter({ publishedOnly: true, search, category, tag, featured }),
    Number(page),
    Number(limit),
  );
};

export const getPost = async (req, res) => {
  const { slug } = req.params;
  const query =
    req.user?.role === "admin" ? { slug } : { slug, isPublished: true };
  const post = await BlogPost.findOne(query).populate("createdBy", "name");

  if (!post) return res.status(404).json({ message: "Blog post not found" });

  res.set("Cache-Control", "public, max-age=180, stale-while-revalidate=86400");
  res.json({ post: serializePost(post) });
};

export const adminGetPosts = async (req, res) => {
  const { page = DEFAULT_PAGE, limit = 12, search, category, tag } = req.query;
  return listPosts(
    res,
    buildFilter({ publishedOnly: false, search, category, tag }),
    Number(page),
    Number(limit),
  );
};

export const createPost = async (req, res) => {
  const {
    title,
    excerpt,
    content,
    coverImage,
    tags = [],
    category,
    featured,
    isPublished,
  } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const slug = await uniqueSlug(slugify(title.trim()));
  const post = await BlogPost.create({
    title: title.trim(),
    slug,
    excerpt: makeExcerpt(content, excerpt),
    content: content.trim(),
    coverImage,
    tags: Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    category: category || "update",
    featured: Boolean(featured),
    isPublished: Boolean(isPublished),
    publishedAt: isPublished ? new Date() : undefined,
    createdBy: req.user._id,
  });

  await post.populate("createdBy", "name");
  res.status(201).json({ post: serializePost(post) });
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    excerpt,
    content,
    coverImage,
    tags = [],
    category,
    featured,
    isPublished,
  } = req.body;

  const post = await BlogPost.findById(id);
  if (!post) return res.status(404).json({ message: "Blog post not found" });

  const nextTitle = title?.trim() || post.title;
  const titleChanged = nextTitle !== post.title;
  const nextSlug = titleChanged
    ? await uniqueSlug(slugify(nextTitle), post._id)
    : post.slug;

  post.title = nextTitle;
  post.slug = nextSlug;
  post.excerpt = makeExcerpt(content ?? post.content, excerpt ?? post.excerpt);
  if (content?.trim()) post.content = content.trim();
  if (coverImage !== undefined) post.coverImage = coverImage;
  post.tags = Array.isArray(tags)
    ? tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
  post.category = category || post.category;
  post.featured = Boolean(featured);

  const nextPublished = Boolean(isPublished);
  if (nextPublished && !post.isPublished) {
    post.publishedAt = new Date();
  }
  if (!nextPublished && post.isPublished) {
    post.publishedAt = undefined;
  }
  post.isPublished = nextPublished;

  await post.save();
  await post.populate("createdBy", "name");
  res.json({ post: serializePost(post) });
};

export const deletePost = async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: "Blog post not found" });
  res.json({ message: "Blog post deleted" });
};

export const togglePublish = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Blog post not found" });

  post.isPublished = !post.isPublished;
  post.publishedAt = post.isPublished ? new Date() : undefined;
  await post.save();
  await post.populate("createdBy", "name");

  res.json({ post: serializePost(post) });
};
