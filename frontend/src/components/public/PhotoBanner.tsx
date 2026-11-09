import type { ReactNode } from "react";

/**
 * A page header set over a photograph behind a flat overlay.
 * Deliberately a flat colour, never a gradient.
 */
export default function PhotoBanner({
  image,
  imageAlt,
  title,
  intro,
  children,
  align = "center",
}: {
  image: string;
  /** Credit line, where the photograph is evidence rather than decoration. */
  imageAlt?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  align?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-ink-200">
      <img
        src={image}
        alt={imageAlt ?? ""}
        aria-hidden={imageAlt ? undefined : true}
        loading="eager"
        decoding="async"
        style={{ objectPosition: align }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-ink-900/74" aria-hidden="true" />

      <div className="container-xl relative py-14 lg:py-16">
        <h1 className="max-w-[760px] font-display text-[32px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[42px]">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-[560px] text-[14.5px] leading-[1.7] text-white/80">
            {intro}
          </p>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
