import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Portfolio pagination. The range reads as stored counts ("1–8 of 24"); the
 * controls only appear when there is more than one page.
 */
export default function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const numbers: (number | "gap")[] = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i += 1) numbers.push(i);
  } else {
    numbers.push(1);
    if (page > 3) numbers.push("gap");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i += 1) {
      numbers.push(i);
    }
    if (page < pages - 2) numbers.push("gap");
    numbers.push(pages);
  }

  const stepClass =
    "grid h-9 w-9 place-items-center rounded-[7px] border text-[12.5px] font-medium transition-colors";
  const idleClass =
    "border-ink-200 bg-white text-ink-600 hover:bg-surface hover:text-ink-900";

  return (
    <nav
      aria-label="Projects pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-4"
    >
      <p className="text-[12.5px] tabular-nums text-ink-500">
        {start}&ndash;{end} of {total}
      </p>

      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className={`${stepClass} ${idleClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>

          {numbers.map((value, index) =>
            value === "gap" ? (
              <span
                key={`gap-${index}`}
                className="grid h-9 w-6 place-items-center text-[12.5px] text-ink-400"
                aria-hidden="true"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => onPage(value)}
                aria-label={`Page ${value}`}
                aria-current={value === page ? "page" : undefined}
                className={`${stepClass} ${
                  value === page
                    ? "border-sky-600 bg-sky-600 font-semibold text-white"
                    : idleClass
                }`}
              >
                {value}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            aria-label="Next page"
            className={`${stepClass} ${idleClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
