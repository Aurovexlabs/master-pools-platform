import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Ruler,
  Share2,
  Sparkles,
  Star,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import {
  StructuredData,
  breadcrumbSchema,
  projectSchema,
} from "../components/seo/StructuredData";
import { useProject, usePublicReviews } from "../hooks/useApi";

import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { MetaHead } from "../components/seo/MetaHead";
import ReviewModal from "../components/shared/ReviewModal";
import { useAuthStore } from "../stores/auth.store";
import { cn } from "../utils/cn";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "badge badge-green" },
  ongoing: { label: "In Progress", cls: "badge badge-blue" },
  upcoming: { label: "Upcoming", cls: "badge badge-amber" },
};

export default function ProjectDetailPage({
  projectId,
}: {
  projectId: string;
}) {
  const { data: project, isLoading } = useProject(projectId);
  const { data: reviews = [] } = usePublicReviews({ project: project?._id });
  const { isAuthenticated } = useAuthStore();
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (isLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: "6rem",
        }}
      >
        <div
          style={{ maxWidth: "64rem", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div
            className="skeleton"
            style={{ height: "32rem", borderRadius: "16px" }}
          />
          <div style={{ marginTop: "2rem" }}>
            <div
              className="skeleton"
              style={{ height: "2.5rem", width: "60%", borderRadius: "8px" }}
            />
            <div
              className="skeleton"
              style={{
                height: "1.5rem",
                width: "30%",
                borderRadius: "6px",
                marginTop: "1rem",
              }}
            />
            <div
              className="skeleton"
              style={{
                height: "8rem",
                width: "100%",
                borderRadius: "12px",
                marginTop: "2rem",
              }}
            />
          </div>
        </div>
      </div>
    );

  if (!project)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "50%",
              background: "var(--color-gray-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <X
              style={{
                width: "2.5rem",
                height: "2.5rem",
                color: "var(--color-gray-300)",
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Project not found
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/projects"
            className="btn btn-primary btn-md"
            style={{ textDecoration: "none" }}
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );

  const allImages = [
    ...(project.coverImage ? [project.coverImage] : []),
    ...(project.gallery ?? []),
  ];

  const prevImg = () =>
    setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % allImages.length);

  const shareProject = () => {
    if (navigator.share)
      navigator.share({ title: project.title, url: window.location.href });
    else
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Link copied to clipboard!"));
  };

  const status = STATUS_MAP[project.status] || STATUS_MAP.ongoing;

  return (
    <>
      <MetaHead
        title={
          project
            ? `${project.title} | MATERPOOLS AND CONTRUCTION`
            : "Project Detail | MATERPOOLS AND CONTRUCTION"
        }
        description={
          project?.description ||
          "View this stunning pool project by MATERPOOLS AND CONTRUCTION."
        }
        ogImage={
          project?.coverImage?.url ||
          "https://www.masterspools.co.zw/og-image.png"
        }
        canonical={`https://www.masterspools.co.zw/projects/${projectId}`}
      />
      {project && (
        <StructuredData
          schema={projectSchema({
            id: project._id,
            title: project.title,
            description: project.description,
            category: project.category,
            status: project.status,
            image: project.coverImage?.url,
            reviewCount: reviews.length,
          })}
        />
      )}
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: "https://www.masterspools.co.zw/" },
          { name: "Projects", url: "https://www.masterspools.co.zw/projects" },
          {
            name: project?.title || "Project",
            url: `https://www.masterspools.co.zw/projects/${projectId}`,
          },
        ])}
      />
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: "5.75rem",
          paddingBottom: "6rem",
        }}
      >
        {/* Hero / Slider */}
        <div
          style={{
            position: "relative",
            height: "48vh",
            minHeight: "280px",
            maxHeight: "560px",
            background: "var(--color-gray-900)",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            {allImages[activeImg] ? (
              <motion.img
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={allImages[activeImg].url}
                alt={allImages[activeImg].alt || project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  background: "var(--color-gray-900)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-primary-950)",
                }}
              >
                <Droplets
                  style={{
                    width: "6rem",
                    height: "6rem",
                    color: "var(--color-primary-500)",
                  }}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Overlays */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "rgba(0,0,0,0.34)",
            }}
          />

          {/* Back navigation */}
          <Link
            to="/projects"
            style={{
              position: "absolute",
              top: "1.5rem",
              left: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
              zIndex: 10,
            }}
          >
            <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to
            Projects
          </Link>

          {/* Top actions */}
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              zIndex: 10,
            }}
          >
            <span className={cn(status.cls, "shadow-lg")}>{status.label}</span>
            {project.isFeatured && (
              <span className="badge badge-amber shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured Build
              </span>
            )}
          </div>

          {/* Image Nav */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImg}
                aria-label="Previous image"
                title="Previous image"
                style={{
                  position: "absolute",
                  left: "1.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              >
                <ChevronLeft style={{ width: "1.5rem", height: "1.5rem" }} />
              </button>
              <button
                onClick={nextImg}
                aria-label="Next image"
                title="Next image"
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              >
                <ChevronRight style={{ width: "1.5rem", height: "1.5rem" }} />
              </button>
            </>
          )}

          {/* Bottom actions */}
          <div
            style={{
              position: "absolute",
              bottom: "1.5rem",
              right: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setLightbox(true)}
              aria-label="Zoom in gallery"
              title="Zoom in"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <ZoomIn style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
            <button
              onClick={shareProject}
              aria-label="Share project"
              title="Share project"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <Share2 style={{ width: "1.125rem", height: "1.125rem" }} />
            </button>
            <div
              style={{
                height: "2.5rem",
                padding: "0 1rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
            >
              <Eye style={{ width: "1rem", height: "1rem" }} />{" "}
              {project.views.toLocaleString()} views
            </div>
          </div>

          {/* Counter */}
          {allImages.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "1.5rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {activeImg + 1}{" "}
              <span style={{ opacity: 0.5, margin: "0 0.25rem" }}>/</span>{" "}
              {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails strip */}
        {allImages.length > 1 && (
          <div
            style={{
              background: "#fff",
              borderBottom: "1px solid var(--color-border)",
              padding: "1rem 0",
            }}
          >
            <div
              style={{
                maxWidth: "64rem",
                margin: "0 auto",
                padding: "0 1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                }}
                className="scrollbar-hide"
              >
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      flexShrink: 0,
                      width: "6rem",
                      height: "4.5rem",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "3px solid",
                      borderColor:
                        activeImg === i
                          ? "var(--color-primary-900)"
                          : "transparent",
                      background: "var(--color-gray-100)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      padding: 0,
                      opacity: activeImg === i ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={img.thumbnail || img.url}
                      alt={img.alt || `Pool project image ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            padding: "3rem 1.5rem 0",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}
            className="lg:grid-cols-3"
          >
            {/* Details column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: "2rem" }}
              >
                <div style={{ marginBottom: "1.5rem" }}>
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="badge badge-blue"
                    style={{
                      textTransform: "capitalize",
                      marginBottom: "1.25rem",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                    }}
                  >
                    {project.category} Project
                  </motion.span>
                  <h1
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
                      fontWeight: 800,
                      color: "var(--color-text)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      marginBottom: "1.25rem",
                    }}
                  >
                    {project.title}
                  </h1>
                  {project.location && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        color: "var(--color-primary-700)",
                        fontWeight: 700,
                        fontSize: "1.0625rem",
                      }}
                    >
                      <MapPin
                        style={{ width: "1.375rem", height: "1.375rem" }}
                      />{" "}
                      {project.location}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  borderRadius: "20px",
                  padding: "2.5rem",
                  marginBottom: "3rem",
                  boxShadow: "var(--shadow-sm)",
                  lineHeight: 1.85,
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "1.125rem",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {project.description}
                </p>
              </div>

              {/* Features section */}
              {project.features && project.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  style={{ marginBottom: "3rem" }}
                >
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "1.375rem",
                      color: "var(--color-text)",
                      marginBottom: "1.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "12px",
                        background:
                          "var(--color-sky-50)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--color-primary-100)",
                      }}
                    >
                      <Award
                        style={{
                          width: "1.375rem",
                          height: "1.375rem",
                          color: "var(--color-primary-700)",
                        }}
                      />
                    </div>
                    Premium Features & Upgrades
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {project.features.map((f, idx) => (
                      <motion.div
                        key={f}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{
                          padding: "1.25rem",
                          borderRadius: "14px",
                          background: "#fff",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          boxShadow: "var(--shadow-xs)",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.borderColor =
                            "var(--color-primary-200)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.borderColor =
                            "var(--color-border)";
                        }}
                      >
                        <CheckCircle
                          style={{
                            width: "1.125rem",
                            height: "1.125rem",
                            color: "var(--color-accent-500)",
                            flexShrink: 0,
                          }}
                        />
                        {f}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Testimonials */}
              {(reviews as any[]).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  style={{ marginBottom: "3rem" }}
                >
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "1.375rem",
                      color: "var(--color-text)",
                      marginBottom: "1.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "12px",
                        background:
                          "var(--color-sky-50)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--color-secondary-100)",
                      }}
                    >
                      <Star
                        style={{
                          width: "1.375rem",
                          height: "1.375rem",
                          color: "var(--color-secondary-600)",
                          fill: "currentColor",
                        }}
                      />
                    </div>
                    Client Testimonials & Reviews
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    {(reviews as any[]).map((r: any, idx: number) => (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="card"
                        style={{
                          padding: "1.75rem",
                          background: "#fff",
                          borderRadius: "16px",
                          border: "1px solid var(--color-border)",
                          boxShadow: "var(--shadow-sm)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                          e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.125rem",
                            marginBottom: "1rem",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              style={{
                                width: "1.125rem",
                                height: "1.125rem",
                                color:
                                  s <= r.rating
                                    ? "var(--color-amber-500)"
                                    : "var(--color-gray-200)",
                                fill:
                                  s <= r.rating
                                    ? "var(--color-amber-500)"
                                    : "none",
                              }}
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontSize: "1rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          "{r.title}"
                        </p>
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.9375rem",
                            lineHeight: 1.7,
                            marginBottom: "1.5rem",
                            margin: 0,
                          }}
                        >
                          {r.content}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            paddingTop: "1.25rem",
                            borderTop: "1px solid var(--color-gray-100)",
                          }}
                        >
                          <div
                            style={{
                              width: "2.25rem",
                              height: "2.25rem",
                              borderRadius: "50%",
                              background:
                                "var(--color-sky-600)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                            }}
                          >
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p
                              style={{
                                color: "var(--color-text)",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                margin: 0,
                              }}
                            >
                              {r.user?.name}
                            </p>
                            {r.project && (
                              <p
                                style={{
                                  color: "var(--color-text-tertiary)",
                                  fontSize: "0.75rem",
                                  margin: 0,
                                }}
                              >
                                {r.project.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <div
              style={{
                position: "sticky",
                top: "6rem",
                height: "fit-content",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Quick Stats */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "0.9375rem",
                    color: "var(--color-text)",
                    marginBottom: "1.25rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Complete Project Specifications
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  {[
                    { icon: User, label: "Client Name", value: project.client },
                    {
                      icon: Calendar,
                      label: "Completion Date",
                      value: project.completedAt
                        ? format(new Date(project.completedAt), "MMM dd, yyyy")
                        : project.status === "completed"
                          ? "Recently Completed"
                          : "In Progress",
                    },
                    {
                      icon: Clock,
                      label: "Project Duration",
                      value: project.duration,
                    },
                    {
                      icon: Ruler,
                      label: "Total Surface Area",
                      value: project.area,
                    },
                    {
                      icon: Droplets,
                      label: "Maximum Depth",
                      value: project.depth,
                    },
                    {
                      icon: Gauge,
                      label: "Pool Type",
                      value: project.category
                        ? project.category.charAt(0).toUpperCase() +
                          project.category.slice(1)
                        : "Standard",
                    },
                  ]
                    .filter((d) => d.value)
                    .map(({ icon: Icon, label, value }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "2.25rem",
                            height: "2.25rem",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, var(--color-primary-50), var(--color-secondary-50))",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon
                            style={{
                              width: "1rem",
                              height: "1rem",
                              color: "var(--color-primary-700)",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--color-text-tertiary)",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontSize: "0.9375rem",
                              color: "var(--color-text)",
                              fontWeight: 700,
                              margin: 0,
                            }}
                          >
                            {value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{
                  background:
                    "var(--color-sky-800)",
                  borderRadius: "20px",
                  padding: "2rem",
                  color: "#fff",
                  boxShadow: "0 12px 40px rgba(30,58,138,0.25)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative element */}
                <div
                  style={{
                    position: "absolute",
                    top: "-2rem",
                    right: "-2rem",
                    width: "8rem",
                    height: "8rem",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Sparkles style={{ width: "1.25rem", height: "1.25rem" }} />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        opacity: 0.9,
                      }}
                    >
                      Get Started Today
                    </span>
                  </div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      marginBottom: "0.75rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Want Something Similar?
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                      marginBottom: "1.5rem",
                    }}
                  >
                    Let our expert engineers design a custom variation of this
                    pool specifically for your property.
                  </p>
                  <Link
                    to="/quotation"
                    className="btn btn-amber btn-lg"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Request Custom Quote{" "}
                    <ArrowRight
                      style={{ width: "1.125rem", height: "1.125rem" }}
                    />
                  </Link>
                </div>
              </motion.div>

              {/* Leave Review */}
              {isAuthenticated && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setReviewOpen(true)}
                  className="btn btn-secondary btn-lg"
                  style={{
                    width: "100%",
                    gap: "0.625rem",
                    fontWeight: 700,
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  <Star style={{ width: "1.25rem", height: "1.25rem" }} /> Share
                  Your Experience
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightbox && allImages[activeImg] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(0,0,0,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <button
                onClick={() => setLightbox(false)}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              >
                <X style={{ width: "1.5rem", height: "1.5rem" }} />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={allImages[activeImg].url}
                alt={
                  allImages[activeImg].alt ||
                  `${project.title} - Image ${activeImg + 1}`
                }
                style={{
                  maxWidth: "88vw",
                  maxHeight: "82vh",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          projectId={project._id}
          projectTitle={project.title}
        />
      </div>
    </>
  );
}
