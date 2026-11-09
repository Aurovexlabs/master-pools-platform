import { ArrowUpRight, Calendar, Clock, Sparkles, Tag } from "lucide-react";
import {
  StructuredData,
  blogCollectionSchema,
  breadcrumbSchema,
} from "../components/seo/StructuredData";

import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useMemo } from "react";
import { MetaHead } from "../components/seo/MetaHead";
import OptimizedImage from "../components/ui/Image";
import { useBlogPosts } from "../hooks/useApi";

const CATEGORY_LABELS: Record<string, string> = {
  update: "Update",
  blog: "Blog",
  announcement: "Announcement",
  project: "Project Story",
};

const excerpt = (value: string) =>
  value.length > 160 ? `${value.slice(0, 157)}...` : value;

export default function LatestPage() {
  const { data } = useBlogPosts({ limit: 12 });
  const posts = data?.posts ?? [];

  const featured = useMemo(
    () => posts.find((post) => post.featured) || posts[0],
    [posts],
  );
  const visiblePosts = featured
    ? posts.filter((post) => post._id !== featured._id)
    : posts;

  const collection = useMemo(
    () =>
      blogCollectionSchema(
        posts.slice(0, 6).map((post) => ({
          title: post.title,
          url: `https://www.masterspools.co.zw/latest/${post.slug}`,
          image: post.coverImage?.url,
          description: post.excerpt,
        })),
      ),
    [posts],
  );

  return (
    <>
      <MetaHead
        title="Latest Updates | MATERPOOLS AND CONTRUCTION"
        description="Read the latest company updates, project stories, and insights from MATERPOOLS AND CONTRUCTION."
        canonical="https://www.masterspools.co.zw/latest"
      />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: "https://www.masterspools.co.zw/" },
          { name: "Latest", url: "https://www.masterspools.co.zw/latest" },
        ])}
      />
      <StructuredData schema={collection} />

      <div className="page-enter" style={{ background: "var(--color-bg)" }}>
        <section
          style={{
            background:
              "#ffffff",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            className="container-xl"
            style={{ paddingTop: "4.5rem", paddingBottom: "3.5rem" }}
          >
            <div
              className="grid-mobile-1-2"
              style={{ display: "grid", gap: "2rem", alignItems: "center" }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>
                  Latest Updates
                </p>
                <h1
                  className="heading-xl"
                  style={{ maxWidth: "12ch", marginBottom: "1rem" }}
                >
                  Company news, project stories, and insights.
                </h1>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    maxWidth: "44rem",
                    fontSize: "1.0625rem",
                    lineHeight: 1.75,
                    marginBottom: "1.5rem",
                  }}
                >
                  Follow what the team is building, learning, and launching. We
                  post project highlights, announcements, and practical
                  pool-building updates from the field.
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
                >
                  <Link
                    to="/projects"
                    className="btn btn-primary btn-lg"
                    style={{ textDecoration: "none" }}
                  >
                    View Projects{" "}
                    <ArrowUpRight style={{ width: "1rem", height: "1rem" }} />
                  </Link>
                  <span
                    className="badge badge-blue"
                    style={{ padding: "0.55rem 0.9rem" }}
                  >
                    <Sparkles style={{ width: "0.8rem", height: "0.8rem" }} />
                    Fresh from the team
                  </span>
                </div>
              </div>

              <div
                className="card"
                style={{
                  padding: "1.25rem",
                  background: "rgba(255,255,255,0.92)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>
                      Publishing cadence
                    </p>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.0625rem",
                        fontWeight: 800,
                        color: "var(--color-text)",
                      }}
                    >
                      Updates from admin dashboard
                    </h2>
                  </div>
                  <Calendar
                    style={{
                      width: "1.2rem",
                      height: "1.2rem",
                      color: "var(--color-primary-700)",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {[
                    [
                      "Published posts",
                      posts.filter((post) => post.isPublished).length,
                    ],
                    [
                      "Featured stories",
                      posts.filter((post) => post.featured).length,
                    ],
                    [
                      "Drafts",
                      posts.filter((post) => !post.isPublished).length,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.8rem 0.95rem",
                        borderRadius: "12px",
                        background: "var(--color-gray-50)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          color: "var(--color-text)",
                          fontSize: "1rem",
                          fontWeight: 800,
                        }}
                      >
                        {value as number}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <main
          className="container-xl"
          style={{ paddingTop: "2rem", paddingBottom: "5rem" }}
        >
          {featured && (
            <section
              className="card"
              style={{ overflow: "hidden", marginBottom: "2rem" }}
            >
              <div className="grid-mobile-1-2" style={{ display: "grid" }}>
                <div
                  style={{
                    minHeight: "16rem",
                    background: "var(--color-gray-100)",
                  }}
                >
                  {featured.coverImage?.url ? (
                    <OptimizedImage
                      src={
                        featured.coverImage.thumbnail || featured.coverImage.url
                      }
                      alt={featured.coverImage.alt || featured.title}
                      className="h-full w-full object-cover"
                      lazy={false}
                      priority
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "16rem",
                        background:
                          "var(--color-sky-600)",
                      }}
                    />
                  )}
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <span
                    className="badge badge-blue"
                    style={{ marginBottom: "0.75rem" }}
                  >
                    Featured
                  </span>
                  <h2
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
                      lineHeight: 1.15,
                      marginBottom: "0.9rem",
                      fontWeight: 800,
                      color: "var(--color-text)",
                    }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.75,
                      marginBottom: "1rem",
                    }}
                  >
                    {featured.excerpt || excerpt(featured.content)}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      color: "var(--color-text-tertiary)",
                      fontSize: "0.8125rem",
                      marginBottom: "1.25rem",
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
                        style={{ width: "0.85rem", height: "0.85rem" }}
                      />
                      {featured.publishedAt
                        ? format(new Date(featured.publishedAt), "d MMM yyyy")
                        : format(new Date(featured.createdAt), "d MMM yyyy")}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Clock style={{ width: "0.85rem", height: "0.85rem" }} />
                      {Math.max(
                        1,
                        Math.ceil(featured.content.split(/\s+/).length / 220),
                      )}{" "}
                      min read
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        textTransform: "capitalize",
                      }}
                    >
                      <Tag style={{ width: "0.85rem", height: "0.85rem" }} />
                      {CATEGORY_LABELS[featured.category] || featured.category}
                    </span>
                  </div>
                  <Link
                    to="/latest/$slug"
                    params={{ slug: featured.slug }}
                    className="btn btn-primary btn-md"
                    style={{ textDecoration: "none" }}
                  >
                    Read update{" "}
                    <ArrowUpRight style={{ width: "1rem", height: "1rem" }} />
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: "0.35rem" }}>
                  All Posts
                </p>
                <h2 className="heading-md" style={{ margin: 0 }}>
                  Latest stories
                </h2>
              </div>
            </div>

            {posts.length === 0 ? (
              <div
                className="card"
                style={{ padding: "3rem 1.5rem", textAlign: "center" }}
              >
                <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                  No posts have been published yet.
                </p>
              </div>
            ) : (
              <div
                className="grid-mobile-1-3"
                style={{ display: "grid", gap: "1.25rem" }}
              >
                {visiblePosts.map((post) => (
                  <article
                    key={post._id}
                    className="card-hover"
                    style={{ overflow: "hidden", background: "#fff" }}
                  >
                    <Link
                      to="/latest/$slug"
                      params={{ slug: post.slug }}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          aspectRatio: "16 / 10",
                          background: "var(--color-gray-100)",
                        }}
                      >
                        {post.coverImage?.url ? (
                          <OptimizedImage
                            src={
                              post.coverImage.thumbnail || post.coverImage.url
                            }
                            alt={post.coverImage.alt || post.title}
                            className="h-full w-full object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                      <div style={{ padding: "1.2rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.7rem",
                            color: "var(--color-text-tertiary)",
                            fontSize: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span className="badge badge-blue">
                            {CATEGORY_LABELS[post.category] || post.category}
                          </span>
                          <span>
                            {post.publishedAt
                              ? format(new Date(post.publishedAt), "d MMM yyyy")
                              : format(new Date(post.createdAt), "d MMM yyyy")}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            lineHeight: 1.35,
                            marginBottom: "0.75rem",
                            fontWeight: 800,
                            color: "var(--color-text)",
                          }}
                        >
                          {post.title}
                        </h3>
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.7,
                            marginBottom: "1rem",
                          }}
                        >
                          {post.excerpt || excerpt(post.content)}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            color: "var(--color-text-tertiary)",
                            fontSize: "0.75rem",
                          }}
                        >
                          <span>
                            {post.createdBy?.name || "MATERPOOLS Team"}
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            Read more{" "}
                            <ArrowUpRight
                              style={{ width: "0.85rem", height: "0.85rem" }}
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
