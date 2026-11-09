import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { COMPANY } from "../../data/company";
import { cn } from "../../utils/cn";

/**
 * The closing enquiry band shared by the public pages. Deliberately compact —
 * it asks for the job, it is not a second hero.
 *
 * When `image` is supplied the band sits on a photograph behind a flat overlay.
 * Deliberately a flat colour, never a gradient.
 */
export default function QuotationCta({
  title = "Ready to build your dream swimming pool?",
  body = "Send the site address and the work required. Equipment, delivery and installation are quoted with the job.",
  image,
  imageAlign = "center 70%",
}: {
  title?: string;
  body?: string;
  image?: string;
  /** Crop position of the backdrop, so the water rather than the sky shows. */
  imageAlign?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-ink-200",
        !image && "py-14 lg:py-16",
      )}
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{ objectPosition: imageAlign }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-ink-900/70" aria-hidden="true" />
        </>
      )}

      <div
        className={cn(
          "container-xl grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14",
          image && "relative py-16 lg:py-20",
        )}
      >
        <div>
          <h2
            className={cn(
              "max-w-[520px] font-display text-[26px] font-bold leading-[1.12] tracking-[-0.028em] sm:text-[31px]",
              image ? "text-white" : "text-ink-900",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-3 max-w-[520px] text-[14.5px] leading-relaxed",
              image ? "text-white/75" : "text-ink-600",
            )}
          >
            {body}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/quotation" className="btn btn-primary btn-lg">
            Request a free quotation
          </Link>
          <a
            href={COMPANY.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "btn btn-lg",
              image
                ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                : "btn-secondary",
            )}
          >
            <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            WhatsApp the sales desk
          </a>
        </div>
      </div>
    </section>
  );
}
