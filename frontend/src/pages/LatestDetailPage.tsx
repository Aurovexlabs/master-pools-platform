import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import {
  StructuredData,
  blogPostSchema,
  breadcrumbSchema,
} from "../components/seo/StructuredData";
import { useBlogPost, useBlogPosts } from "../hooks/useApi";

import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useMemo } from "react";
import { MetaHead } from "../components/seo/MetaHead";
import OptimizedImage from "../components/ui/Image";

const CATEGORY_LABELS: Record<string, string> = {
  update: "Update",
  blog: "Blog",
  announcement: "Announcement",
  project: "Project Story",
};

export default function LatestDetailPage({ slug }: { slug: string }) {
  const { data: post, isLoading } = useBlogPost(slug);
  const { data: relatedData } = useBlogPosts({ limit: 6 });

  const related = useMemo(
    () =>
      (relatedData?.posts ?? [])
        .filter((item) => item.slug !== slug)
        .slice(0, 3),
    [relatedData, slug],
  );

  if (isLoading) {
    return <div style={{ minHeight: "60vh" }} />;
  }

  if (!post) {
    return (
      <div
        className="container-xl"
        style={{ paddingTop: "6rem", paddingBottom: "5rem" }}
      >
        <div
          className="card"
          style={{ padding: "3rem 1.5rem", textAlign: "center" }}
        >
          <h1 className="heading-md" style={{ marginBottom: "0.75rem" }}>
            Post not found
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            The blog post you are looking for may have been removed or is still
            in draft.
          </p>
          <Link
            to="/latest"
            className="btn btn-primary btn-md"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to
            Latest
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl =
    post.coverImage?.url || "https://www.masterspools.co.zw/og-image.png";

  return (
    <>
      <MetaHead
        title={`${post.title} | MATERPOOLS AND CONTRUCTION`}
        description={post.excerpt || post.content.slice(0, 160)}
        ogImage={imageUrl}
        canonical={`https://www.masterspools.co.zw/latest/${post.slug}`}
      />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: "https://www.masterspools.co.zw/" },
          { name: "Latest", url: "https://www.masterspools.co.zw/latest" },
          {
            name: post.title,
            url: `https://www.masterspools.co.zw/latest/${post.slug}`,
          },
        ])}
      />
      <StructuredData
        schema={blogPostSchema({
          title: post.title,
          description: post.excerpt || post.content.slice(0, 160),
          url: `https://www.masterspools.co.zw/latest/${post.slug}`,
          image: imageUrl,
          author: post.createdBy?.name,
          datePublished: post.publishedAt || post.createdAt,
          dateModified: post.updatedAt,
        })}
      />

      <div className="page-enter" style={{ background: "var(--color-bg)" }}>
        <section style={{ paddingTop: "5.75rem" }}>
          <div className="container-xl" style={{ paddingBottom: "2rem" }}>
            <Link
              to="/latest"
              className="btn btn-secondary btn-md"
              style={{ textDecoration: "none", marginBottom: "1.25rem" }}
            >
              <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to
              Latest
            </Link>

            <div className="card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  aspectRatio: "16 / 8.5",
                  background: "var(--color-gray-100)",
                }}
              >
                {post.coverImage?.url ? (
                  <OptimizedImage
                    src={post.coverImage.url}
                    alt={post.coverImage.alt || post.title}
                    className="h-full w-full object-cover"
                    lazy={false}
                    priority
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "var(--color-sky-600)",
                    }}
                  />
                )}
              </div>

              <div style={{ padding: "1.5rem clamp(1rem, 3vw, 2.25rem) 2rem" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.7rem",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span className="badge badge-blue">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                  {post.featured && (
                    <span className="badge badge-amber">Featured</span>
                  )}
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: "0.75rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Calendar style={{ width: "0.85rem", height: "0.85rem" }} />
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "d MMM yyyy")
                      : format(new Date(post.createdAt), "d MMM yyyy")}
                  </span>
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: "0.75rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Clock style={{ width: "0.85rem", height: "0.85rem" }} />
                    {Math.max(
                      1,
                      Math.ceil(post.content.split(/\s+/).length / 220),
                    )}{" "}
                    min read
                  </span>
                </div>

                <h1
                  className="heading-xl"
                  style={{ maxWidth: "14ch", marginBottom: "1rem" }}
                >
                  {post.title}
                </h1>

                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "1.05rem",
                    lineHeight: 1.8,
                    maxWidth: "52rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {post.excerpt}
                </p>

                {post.tags?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-gray"
                        style={{ padding: "0.45rem 0.7rem" }}
                      >
                        <Tag style={{ width: "0.75rem", height: "0.75rem" }} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <article style={{ maxWidth: "56rem" }}>
                  <div
                    style={{
                      color: "var(--color-text)",
                      lineHeight: 1.95,
                      fontSize: "1.025rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {post.content}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ paddingBottom: "5rem" }}>
            <div className="container-xl">
              <div style={{ marginBottom: "1rem" }}>
                <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>
                  More Updates
                </p>
                <h2 className="heading-md" style={{ margin: 0 }}>
                  Related posts
                </h2>
              </div>
              <div
                className="grid-mobile-1-3"
                style={{ display: "grid", gap: "1.25rem" }}
              >
                {related.map((item) => (
                  <Link
                    key={item._id}
                    to="/latest/$slug"
                    params={{ slug: item.slug }}
                    className="card-hover"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "16 / 10",
                        background: "var(--color-gray-100)",
                      }}
                    >
                      {item.coverImage?.url ? (
                        <OptimizedImage
                          src={item.coverImage.thumbnail || item.coverImage.url}
                          alt={item.coverImage.alt || item.title}
                          className="h-full w-full object-cover"
                          lazy
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "rgba(0,0,0,0.42)",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
                      <h3
                        style={{
                          marginBottom: "0.55rem",
                          fontSize: "1.05rem",
                          lineHeight: 1.35,
                          fontWeight: 800,
                          color: "var(--color-text)",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
