import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bold,
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  List,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useDeleteBlogPost,
  useToggleBlogPublish,
  useUpdateBlogPost,
  useUploadSingle,
} from "../../hooks/useApi";
import type { BlogCategory, BlogPost } from "../../types";

import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type BlogForm = {
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  featured: boolean;
  isPublished: boolean;
  tagsText: string;
};

const CATEGORY_OPTIONS: { value: BlogCategory; label: string }[] = [
  { value: "update", label: "Update" },
  { value: "blog", label: "Blog" },
  { value: "announcement", label: "Announcement" },
  { value: "project", label: "Project Story" },
];

const DEFAULTS: BlogForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "update",
  featured: false,
  isPublished: false,
  tagsText: "",
};

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  update: "Update",
  blog: "Blog",
  announcement: "Announcement",
  project: "Project Story",
};

type PreviewBlock =
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

function parsePreviewBlocks(content: string): PreviewBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: PreviewBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length) blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading1", text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading3", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderPreviewBlocks(content: string) {
  const blocks = parsePreviewBlocks(content);

  if (blocks.length === 0) {
    return (
      <p style={{ margin: 0, color: "var(--color-text-tertiary)" }}>
        Start typing content to see a live preview.
      </p>
    );
  }

  return blocks.map((block, index) => {
    if (block.type === "heading1") {
      return (
        <h3
          key={index}
          style={{
            margin: "0 0 0.65rem",
            fontSize: "1.2rem",
            lineHeight: 1.25,
            fontWeight: 800,
          }}
        >
          {block.text}
        </h3>
      );
    }

    if (block.type === "heading2") {
      return (
        <h4
          key={index}
          style={{
            margin: "0 0 0.55rem",
            fontSize: "1.05rem",
            lineHeight: 1.3,
            fontWeight: 800,
          }}
        >
          {block.text}
        </h4>
      );
    }

    if (block.type === "heading3") {
      return (
        <h5
          key={index}
          style={{
            margin: "0 0 0.45rem",
            fontSize: "0.95rem",
            lineHeight: 1.35,
            fontWeight: 800,
          }}
        >
          {block.text}
        </h5>
      );
    }

    if (block.type === "list") {
      return (
        <ul
          key={index}
          style={{ margin: "0 0 0.95rem", paddingLeft: "1.2rem" }}
        >
          {block.items.map((item, itemIndex) => (
            <li
              key={`${index}-${itemIndex}`}
              style={{ marginBottom: "0.4rem" }}
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} style={{ margin: "0 0 0.95rem", lineHeight: 1.8 }}>
        {block.text}
      </p>
    );
  });
}

export default function AdminBlogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverPayload, setCoverPayload] = useState<BlogPost["coverImage"]>();
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const { data, refetch } = useAdminBlogPosts({
    page,
    limit: 12,
    ...(search && { search }),
  });
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const togglePublish = useToggleBlogPublish();
  const uploadSingle = useUploadSingle();

  const posts = data?.posts ?? [];
  const pagination = data?.pagination;

  const { register, handleSubmit, reset, setValue, watch } = useForm<BlogForm>({
    defaultValues: DEFAULTS,
  });
  const contentValue = watch("content");

  const insertSnippet = (snippet: string) => {
    const current = contentValue || "";
    const next = current ? `${current}\n\n${snippet}` : snippet;
    setValue("content", next, { shouldDirty: true, shouldTouch: true });
  };

  const openCreate = () => {
    setEditing(null);
    setCoverPreview("");
    setCoverPayload(undefined);
    reset(DEFAULTS);
    setModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setCoverPreview(post.coverImage?.url || "");
    setCoverPayload(post.coverImage);
    reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      featured: post.featured,
      isPublished: post.isPublished,
      tagsText: post.tags.join(", "),
    });
    setModalOpen(true);
  };

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("folder", "masterpools/blogs");
    uploadSingle.mutate(fd, {
      onSuccess: (data: any) => {
        setCoverPreview(data.url);
        setCoverPayload({
          url: data.url,
          fileId: data.fileId,
          thumbnail: data.thumbnail,
          alt: "",
        });
        setUploading(false);
      },
      onError: () => {
        toast.error("Cover upload failed");
        setUploading(false);
      },
    });
  };

  const onSubmit = (values: BlogForm) => {
    const payload = {
      title: values.title,
      excerpt: values.excerpt,
      content: values.content,
      category: values.category,
      featured: values.featured,
      isPublished: values.isPublished,
      coverImage: coverPayload,
      tags: values.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (editing) {
      updatePost.mutate(
        { id: editing._id, data: payload },
        {
          onSuccess: () => {
            toast.success("Blog post updated");
            setModalOpen(false);
            refetch();
          },
          onError: (err: any) =>
            toast.error(err.response?.data?.message || "Update failed"),
        },
      );
      return;
    }

    createPost.mutate(payload, {
      onSuccess: () => {
        toast.success("Blog post created");
        setModalOpen(false);
        refetch();
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.message || "Create failed"),
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deletePost.mutate(id, {
      onSuccess: () => {
        toast.success("Blog post deleted");
        refetch();
      },
      onError: () => toast.error("Delete failed"),
    });
  };

  const handleTogglePublish = (post: BlogPost) => {
    togglePublish.mutate(post._id, {
      onSuccess: (updated) => {
        toast.success(
          updated.isPublished ? "Post published" : "Post moved to draft",
        );
        refetch();
      },
      onError: () => toast.error("Publish status update failed"),
    });
  };

  const totalPosts = useMemo(() => data?.pagination?.total ?? 0, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          background:
            "var(--color-sky-600)",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(30,58,138,0.2)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.35rem",
            }}
          >
            Blog Manager
          </p>
          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: 800,
            }}
          >
            Latest updates and blog posts
          </h1>
          <p
            style={{
              margin: "0.35rem 0 0",
              color: "rgba(255,255,255,0.68)",
              fontSize: "0.875rem",
            }}
          >
            Create posts, schedule drafts, and publish company updates from the
            dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn btn-primary btn-md"
          style={{
            background: "rgba(255,255,255,0.14)",
            borderColor: "rgba(255,255,255,0.24)",
          }}
        >
          <Plus style={{ width: "1rem", height: "1rem" }} /> New Post
        </button>
      </motion.div>

      <div className="grid-mobile-1-3" style={{ display: "grid", gap: "1rem" }}>
        {[
          { label: "Total posts", value: totalPosts },
          {
            label: "Published",
            value: posts.filter((post) => post.isPublished).length,
          },
          {
            label: "Drafts",
            value: posts.filter((post) => !post.isPublished).length,
          },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <p
              style={{
                margin: 0,
                color: "var(--color-text-tertiary)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                margin: 0,
                color: "var(--color-text)",
                fontSize: "1.7rem",
                fontWeight: 800,
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "240px" }}>
            <Search
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "1rem",
                height: "1rem",
                color: "var(--color-gray-400)",
              }}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search blog posts"
              className="input"
              style={{
                paddingLeft: "2.5rem",
                background: "var(--color-gray-50)",
              }}
            />
          </div>
          <Link
            to="/latest"
            className="btn btn-secondary btn-md"
            style={{ textDecoration: "none" }}
          >
            Public page{" "}
            <ArrowUpRight style={{ width: "1rem", height: "1rem" }} />
          </Link>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--color-text-secondary)",
              }}
            >
              No posts yet. Create the first update.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="card"
                style={{
                  padding: "1rem",
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr",
                  borderRadius: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span className="badge badge-blue">
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      {post.featured && (
                        <span className="badge badge-amber">Featured</span>
                      )}
                      <span
                        className={
                          post.isPublished
                            ? "badge badge-green"
                            : "badge badge-gray"
                        }
                      >
                        {post.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        color: "var(--color-text)",
                      }}
                    >
                      {post.title}
                    </h3>
                    <p
                      style={{
                        margin: "0.35rem 0 0",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.65,
                      }}
                    >
                      {post.excerpt}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.8rem",
                        marginTop: "0.75rem",
                        color: "var(--color-text-tertiary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <Calendar
                          style={{ width: "0.8rem", height: "0.8rem" }}
                        />{" "}
                        {format(new Date(post.createdAt), "d MMM yyyy")}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        {post.tags?.length || 0} tags
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      alignSelf: "flex-start",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit2 style={{ width: "0.85rem", height: "0.85rem" }} />{" "}
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(post)}
                      className={
                        post.isPublished
                          ? "btn btn-ghost btn-sm"
                          : "btn btn-primary btn-sm"
                      }
                      disabled={togglePublish.isPending}
                    >
                      {post.isPublished ? (
                        <EyeOff
                          style={{ width: "0.85rem", height: "0.85rem" }}
                        />
                      ) : (
                        <Eye style={{ width: "0.85rem", height: "0.85rem" }} />
                      )}
                      {post.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post._id, post.title)}
                      className="btn btn-danger btn-sm"
                      disabled={deletePost.isPending}
                    >
                      <Trash2 style={{ width: "0.85rem", height: "0.85rem" }} />{" "}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.875rem",
              }}
            >
              Page {page} of {pagination.pages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setPage((current) => Math.min(pagination.pages, current + 1))
              }
              disabled={page >= pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(15,23,42,0.55)",
              backdropFilter: "blur(10px)",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              style={{
                maxWidth: "56rem",
                margin: "3rem auto",
                background: "#fff",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>
                    {editing ? "Edit post" : "New post"}
                  </p>
                  <h2
                    style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}
                  >
                    {editing ? "Update blog post" : "Create blog post"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X style={{ width: "1rem", height: "1rem" }} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}
              >
                <div
                  className="grid-mobile-1-2"
                  style={{ display: "grid", gap: "1rem" }}
                >
                  <div>
                    <label className="label">Title</label>
                    <input
                      {...register("title", { required: true })}
                      className="input"
                      placeholder="Latest project update"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select {...register("category")} className="select">
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Excerpt</label>
                  <textarea
                    {...register("excerpt")}
                    rows={3}
                    className="textarea"
                    placeholder="Short summary for the card and search previews"
                  />
                </div>

                <div>
                  <label className="label">Content</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => insertSnippet("# New section")}
                    >
                      <Heading1
                        style={{ width: "0.85rem", height: "0.85rem" }}
                      />{" "}
                      H1
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => insertSnippet("## Smaller section")}
                    >
                      <Heading2
                        style={{ width: "0.85rem", height: "0.85rem" }}
                      />{" "}
                      H2
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        insertSnippet("- Key point one\n- Key point two")
                      }
                    >
                      <List style={{ width: "0.85rem", height: "0.85rem" }} />{" "}
                      List
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => insertSnippet("**Bold text**")}
                    >
                      <Bold style={{ width: "0.85rem", height: "0.85rem" }} />{" "}
                      Bold
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowPreview((current) => !current)}
                    >
                      {showPreview ? "Hide preview" : "Show preview"}
                    </button>
                  </div>
                  <textarea
                    {...register("content", { required: true })}
                    rows={10}
                    className="textarea"
                    placeholder="Write the full update or blog post here..."
                  />
                  {showPreview && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "1rem",
                        borderRadius: "14px",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-gray-50)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <strong
                          style={{
                            color: "var(--color-text)",
                            fontSize: "0.9rem",
                          }}
                        >
                          Live preview
                        </strong>
                        <span
                          style={{
                            color: "var(--color-text-tertiary)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {contentValue?.split(/\s+/).filter(Boolean).length ||
                            0}{" "}
                          words
                        </span>
                      </div>
                      <div
                        style={{
                          color: "var(--color-text)",
                          fontSize: "0.95rem",
                          lineHeight: 1.8,
                        }}
                      >
                        {renderPreviewBlocks(contentValue || "")}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="grid-mobile-1-2"
                  style={{ display: "grid", gap: "1rem" }}
                >
                  <div>
                    <label className="label">Tags</label>
                    <input
                      {...register("tagsText")}
                      className="input"
                      placeholder="updates, projects, company news"
                    />
                  </div>
                  <div>
                    <label className="label">Cover image</label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        alignItems: "center",
                      }}
                    >
                      <label
                        className="btn btn-secondary btn-sm"
                        style={{ cursor: "pointer" }}
                      >
                        <Upload
                          style={{ width: "0.85rem", height: "0.85rem" }}
                        />{" "}
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                      {coverPreview && (
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Image ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {coverPreview && (
                  <div
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      background: "var(--color-gray-50)",
                    }}
                  >
                    <img
                      src={coverPreview}
                      alt="Blog cover preview"
                      style={{
                        width: "100%",
                        height: "16rem",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                <div
                  className="grid-mobile-1-3"
                  style={{ display: "grid", gap: "0.75rem" }}
                >
                  <label
                    className="card"
                    style={{
                      padding: "0.9rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <input type="checkbox" {...register("featured")} />
                    <span>
                      <Sparkles
                        style={{
                          width: "0.9rem",
                          height: "0.9rem",
                          display: "inline",
                          marginRight: "0.4rem",
                        }}
                      />
                      Featured
                    </span>
                  </label>
                  <label
                    className="card"
                    style={{
                      padding: "0.9rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <input type="checkbox" {...register("isPublished")} />
                    <span>
                      <Eye
                        style={{
                          width: "0.9rem",
                          height: "0.9rem",
                          display: "inline",
                          marginRight: "0.4rem",
                        }}
                      />
                      Published
                    </span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={
                      createPost.isPending || updatePost.isPending || uploading
                    }
                  >
                    {createPost.isPending || updatePost.isPending
                      ? "Saving…"
                      : editing
                        ? "Update post"
                        : "Create post"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
