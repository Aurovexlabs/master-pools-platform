import type { ReactNode } from "react";

/**
 * Shown where a collection has no records. Never replaced with sample content.
 */
export default function EmptyState({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[10px] border border-dashed border-ink-300 px-6 py-14 text-center">
      <h3 className="max-w-[420px] font-display text-[18px] font-bold tracking-[-0.016em] text-ink-900">
        {title}
      </h3>
      <p className="mt-2 mb-5 max-w-[400px] text-[13.5px] leading-relaxed text-ink-600">
        {body}
      </p>
      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
}
