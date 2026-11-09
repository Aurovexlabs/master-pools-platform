import { Link } from "@tanstack/react-router";

import type { Project } from "../../types";
import { cn } from "../../utils/cn";
import { projectCategoryLabel } from "../../utils/format";

/**
 * The year a project was finished, falling back through the stored dates.
 * Returns undefined rather than guessing when no date is held.
 */
export function projectYear(project: Project): number | undefined {
  const value = project.completedAt ?? project.publishedAt ?? project.createdAt;
  if (!value) return undefined;
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? undefined : year;
}

/**
 * Caption for a project. Holds stored fields only — title, locality, year,
 * category and whichever specifications were actually recorded. Missing fields
 * disappear instead of rendering a placeholder.
 */
export default function ProjectCaption({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const year = projectYear(project);
  const specs = [
    { label: "Area", value: project.area },
    { label: "Depth", value: project.depth },
  ].filter((spec) => Boolean(spec.value));

  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-6 gap-y-2 pt-3",
        className,
      )}
    >
      <div className="min-w-0">
        <Link
          to="/projects/$id"
          params={{ id: project.slug || project._id }}
          className="font-display text-[17px] font-bold leading-snug tracking-[-0.012em] text-ink-900 hover:text-sky-700"
        >
          {project.title}
        </Link>
        <div className="rule-meta mt-1.5">
          {project.location && <span>{project.location}</span>}
          {year && <span>{year}</span>}
          <span>{projectCategoryLabel(project.category)}</span>
        </div>
      </div>

      {specs.length > 0 && (
        <dl className="flex shrink-0 flex-col gap-1.5 text-right">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-baseline justify-end gap-2.5">
              <dt className="data-label">{spec.label}</dt>
              <dd className="text-[12.5px] tabular-nums text-ink-500">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
