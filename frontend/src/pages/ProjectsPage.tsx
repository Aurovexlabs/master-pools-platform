import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Droplets,
  LayoutGrid,
  List,
  MessageCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import EmptyState from "../components/public/EmptyState";
import Pagination from "../components/public/Pagination";
import PhotoBanner from "../components/public/PhotoBanner";
import ProjectCaption from "../components/public/ProjectCaption";
import { POOL_PHOTOS } from "../data/poolPhotos";
import QuotationCta from "../components/public/QuotationCta";
import { MetaHead } from "../components/seo/MetaHead";
import {
  StructuredData,
  breadcrumbSchema,
} from "../components/seo/StructuredData";
import OptimizedImage from "../components/ui/Image";
import { COMPANY } from "../data/company";
import { useProjects } from "../hooks/useApi";
import type { Project } from "../types";

const LIMIT = 8;

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "infinity", label: "Infinity" },
  { value: "olympic", label: "Olympic" },
  { value: "indoor", label: "Indoor" },
  { value: "natural", label: "Natural" },
  { value: "custom", label: "Custom" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "In progress" },
  { value: "upcoming", label: "Upcoming" },
];

const coverOf = (project: Project) =>
  project.coverImage?.thumbnail || project.coverImage?.url || "";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  });

  const params = useMemo(() => new URLSearchParams(searchStr ?? ""), [searchStr]);
  const urlSearch = params.get("search") ?? "";
  const legacyProjectId = params.get("projectId") || params.get("id");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The navbar search writes ?search=; keep the field in step with it.
  useEffect(() => {
    if (!urlSearch) return;
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  // Legacy deep link: /projects?projectId=<slug> opens the project directly.
  useEffect(() => {
    if (!legacyProjectId) return;
    navigate({
      to: "/projects/$id",
      params: { id: legacyProjectId },
      replace: true,
    });
  }, [legacyProjectId, navigate]);

  const { data, isLoading, isError, refetch } = useProjects({
    page,
    limit: LIMIT,
    ...(search && { search }),
    ...(status !== "all" && { status }),
    ...(category !== "all" && { category }),
  });

  const projects = data?.projects ?? [];
  const total = data?.pagination?.total ?? 0;
  const pages = data?.pagination?.pages ?? 0;

  const hasFilters = Boolean(search) || status !== "all" || category !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <MetaHead
        title="Projects | MasterPools — completed swimming pools in Zimbabwe"
        description="Pools built, renovated and maintained by MasterPools across Zimbabwe. Browse the portfolio by category."
        canonical={`${COMPANY.siteUrl}/projects`}
      />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: `${COMPANY.siteUrl}/` },
          { name: "Projects", url: `${COMPANY.siteUrl}/projects` },
        ])}
      />

      {/* ── Title region ─────────────────────────────────────────────────── */}
      <PhotoBanner
        image={POOL_PHOTOS.banner.url}
        title="Projects"
        intro="Pools built and renovated by MasterPools across Zimbabwe."
        align="center 55%"
      />

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="border-y border-ink-200">
        <div className="container-xl flex flex-wrap items-center gap-2 py-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            {CATEGORY_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCategory(option.value);
                  setPage(1);
                }}
                aria-pressed={category === option.value}
                className={`chip chip-lg ${category === option.value ? "chip-on" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[12.5px] tabular-nums text-ink-500 sm:inline">
              {total} {total === 1 ? "project" : "projects"}
            </span>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="project-filters"
              className={`chip chip-lg ${hasFilters ? "border-sky-200 bg-sky-50 text-sky-700" : ""}`}
            >
              <SlidersHorizontal size={14} strokeWidth={2} aria-hidden="true" />
              Filters
              {hasFilters && (
                <span className="ml-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white">
                  {[search, status !== "all", category !== "all"].filter(Boolean).length}
                </span>
              )}
            </button>

            <div
              className="flex items-center gap-0.5 rounded-lg border border-ink-200 p-0.5"
              role="group"
              aria-label="View"
            >
              {[
                { value: "grid" as const, Icon: LayoutGrid, label: "Grid view" },
                { value: "list" as const, Icon: List, label: "List view" },
              ].map(({ value, Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  aria-label={label}
                  aria-pressed={view === value}
                  className={`grid h-8 w-8 place-items-center rounded-[6px] transition-colors ${
                    view === value
                      ? "bg-sky-600 text-white"
                      : "text-ink-500 hover:bg-surface hover:text-ink-900"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div id="project-filters" className="border-t border-ink-200 bg-surface">
            <div className="container-xl flex flex-wrap items-center gap-3 py-3">
              <div className="relative min-w-[220px] flex-1">
                <Search
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, feature or location"
                  aria-label="Search projects"
                  className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-[13.5px] text-ink-900 outline-none focus:border-sky-500"
                />
              </div>

              <label className="flex items-center gap-2 text-[12.5px] text-ink-500">
                Status
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-lg border border-ink-200 bg-white px-3 text-[13.5px] text-ink-900 outline-none focus:border-sky-500"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="chip chip-lg border-ink-200 bg-white"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="container-xl py-8 lg:py-10">
        {isLoading ? (
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <div className="skeleton h-[240px] lg:h-[350px]" />
                <div className="skeleton mt-3 h-4 w-1/2" />
                <div className="skeleton mt-2 h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Projects could not be loaded"
            body="The portfolio is temporarily unavailable. Try again, or request a quotation and we will send photographs of comparable work."
            actions={
              <button
                type="button"
                onClick={() => refetch()}
                className="btn btn-secondary btn-md"
              >
                Try again
              </button>
            }
          />
        ) : projects.length === 0 ? (
          hasFilters ? (
            <EmptyState
              title="No projects match these filters"
              body="Nothing published matches the categories and search you have applied."
              actions={
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary btn-md"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              title="No projects are published yet"
              body="Request a quotation and we will send photographs of comparable work by email or WhatsApp."
              actions={
                <>
                  <Link to="/quotation" className="btn btn-primary btn-md">
                    Request a free quotation
                  </Link>
                  <a
                    href={COMPANY.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-md"
                  >
                    <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
                    WhatsApp the sales desk
                  </a>
                </>
              }
            />
          )
        ) : view === "grid" ? (
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
            {projects.map((project) => (
              <article key={project._id} className="min-w-0">
                <Link
                  to="/projects/$id"
                  params={{ id: project.slug || project._id }}
                  className="block bg-ink-100"
                >
                  {coverOf(project) ? (
                    <OptimizedImage
                      src={coverOf(project)}
                      alt={project.coverImage?.alt || project.title}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="photo h-[240px] lg:h-[350px]"
                    />
                  ) : (
                    <div className="grid h-[240px] place-items-center text-ink-300 lg:h-[350px]">
                      <Droplets size={28} strokeWidth={1.6} aria-hidden="true" />
                    </div>
                  )}
                </Link>
                <ProjectCaption
                  project={project}
                  className="mt-3 border-t border-ink-200"
                />
              </article>
            ))}
          </div>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project._id}>
                <Link
                  to="/projects/$id"
                  params={{ id: project.slug || project._id }}
                  className="group flex items-center gap-5 border-b border-ink-200 py-4"
                >
                  <div className="h-[76px] w-[120px] shrink-0 overflow-hidden bg-ink-100">
                    {coverOf(project) && (
                      <OptimizedImage
                        src={coverOf(project)}
                        alt={project.coverImage?.alt || project.title}
                        sizes="120px"
                        className="photo"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-display text-[16px] font-bold tracking-[-0.012em] text-ink-900 group-hover:text-sky-700">
                      {project.title}
                    </span>
                    <div className="rule-meta mt-1.5">
                      {project.location && <span>{project.location}</span>}
                      {project.area && <span>{project.area}</span>}
                      {project.status && <span className="capitalize">{project.status}</span>}
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="ml-auto shrink-0 text-ink-400 group-hover:text-sky-700"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={page}
          pages={pages}
          total={total}
          limit={LIMIT}
          onPage={changePage}
        />
      </div>

      <QuotationCta />
    </>
  );
}
