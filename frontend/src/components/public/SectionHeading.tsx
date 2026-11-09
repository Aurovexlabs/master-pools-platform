import type { ReactNode } from "react";

/**
 * Section heading with an optional supporting line and a trailing action slot.
 * Headings start with the heading itself — there is no decorative kicker above.
 */
export default function SectionHeading({
  title,
  intro,
  children,
  className,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 sm:mb-10 " +
        (className ?? "")
      }
    >
      <div className="min-w-0">
        <h2 className="font-display text-[26px] font-bold leading-[1.14] tracking-[-0.028em] text-ink-900 sm:text-[34px]">
          {title}
        </h2>
        {intro && (
          <p className="mt-2.5 max-w-[520px] text-[14.5px] leading-relaxed text-ink-600">
            {intro}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      )}
    </div>
  );
}
