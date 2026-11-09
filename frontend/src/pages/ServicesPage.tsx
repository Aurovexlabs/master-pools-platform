import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import ArrowLink from "../components/public/ArrowLink";
import PhotoBanner from "../components/public/PhotoBanner";
import QuotationCta from "../components/public/QuotationCta";
import { MetaHead } from "../components/seo/MetaHead";
import {
  StructuredData,
  breadcrumbSchema,
} from "../components/seo/StructuredData";
import OptimizedImage from "../components/ui/Image";
import { COMPANY } from "../data/company";
import { POOL_PHOTOS } from "../data/poolPhotos";
import { SERVICE_COUNT, SERVICE_GROUPS } from "../data/services";
import { useProjects } from "../hooks/useApi";

const INTRO =
  "MasterPools builds new pools, renovates and repairs existing ones, maintains pools on contract, and supplies and installs filtration and heating equipment across Zimbabwe.";

export default function ServicesPage() {
  const [activeGroup, setActiveGroup] = useState(SERVICE_GROUPS[0].slug);
  const hash = useRouterState({ select: (state) => state.location.hash });

  // The nav and footer link to a group by hash; scroll it clear of the fixed header.
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.replace(/^#/, ""));
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  }, [hash]);

  // Most recent published project, used as supporting evidence beside the directory.
  const { data } = useProjects({ limit: 1 });
  const evidence = data?.projects?.[0];
  const evidenceCover = evidence?.coverImage?.thumbnail || evidence?.coverImage?.url;

  useEffect(() => {
    const sections = SERVICE_GROUPS.map((group) =>
      document.getElementById(group.slug),
    ).filter((node): node is HTMLElement => Boolean(node));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveGroup(visible.target.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MetaHead
        title="Services | MasterPools — pool construction, renovation and maintenance"
        description="Pool construction, installation, custom design, renovation, repairs, maintenance, cleaning, filtration, pumps and plumbing across Zimbabwe."
        canonical={`${COMPANY.siteUrl}/services`}
      />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: `${COMPANY.siteUrl}/` },
          { name: "Services", url: `${COMPANY.siteUrl}/services` },
        ])}
      />

      {/* ── Title region ─────────────────────────────────────────────────── */}
      <PhotoBanner
        image={POOL_PHOTOS.banner.url}
        title="Services"
        intro={INTRO}
        align="center 55%"
      />

      {/* ── Directory ────────────────────────────────────────────────────── */}
      <div className="container-xl py-9 lg:py-12">
        <div className="grid items-start gap-10 lg:grid-cols-[208px_minmax(0,1fr)_264px] lg:gap-11">
          {/* Local navigation — anchors, so the directory is never hidden */}
          <nav aria-label="Service groups" className="lg:sticky lg:top-20">
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
              {SERVICE_GROUPS.map((group) => (
                <li key={group.slug}>
                  <a
                    href={`#${group.slug}`}
                    aria-current={activeGroup === group.slug ? "true" : undefined}
                    className={`block rounded-lg border px-2.5 py-2 text-[13.5px] transition-colors ${
                      activeGroup === group.slug
                        ? "border-sky-100 bg-sky-50 font-semibold text-sky-800"
                        : "border-transparent font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                  >
                    {group.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-4 hidden border-t border-ink-200 pt-4 lg:block">
              <p className="text-[12.5px] leading-relaxed text-ink-500">
                Not sure which service covers the work? Send the site address and
                we will tell you.
              </p>
              <ArrowLink to="/contact" label="Contact us" className="mt-2" />
            </div>
          </nav>

          {/* Service rows */}
          <div>
            {SERVICE_GROUPS.map((group, groupIndex) => (
              <section
                key={group.slug}
                id={group.slug}
                aria-labelledby={`${group.slug}-heading`}
                className={`scroll-mt-24 ${groupIndex === 0 ? "" : "mt-8"}`}
              >
                <h2
                  id={`${group.slug}-heading`}
                  className="scroll-mt-24 border-t border-ink-200 pt-6 font-display text-[20px] font-bold tracking-[-0.018em] text-ink-900 first:border-t-0"
                >
                  {group.name}
                </h2>
                <p className="mt-1.5 mb-1 max-w-[560px] text-[13px] leading-relaxed text-ink-500">
                  {group.intro}
                </p>

                <ul>
                  {group.services.map((service) => (
                    <li key={service.slug} className="border-t border-ink-200 first:border-t-0">
                      <Link
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        aria-label={`View ${service.name}`}
                        className="group flex items-start justify-between gap-6 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block font-display text-[18px] font-bold tracking-[-0.014em] text-ink-900 group-hover:text-sky-700">
                            {service.name}
                          </span>
                          <span className="mt-1 block max-w-[520px] text-[13.5px] leading-relaxed text-ink-600">
                            {service.scope}
                          </span>
                        </span>
                        <span className="mt-1 flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-sky-700">
                          View service
                          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="mt-6 border-t border-ink-200 pt-4 text-[12.5px] text-ink-500">
              {SERVICE_COUNT} services across construction, renovation, maintenance
              and equipment.
            </p>
          </div>

          {/* Supporting evidence and two facts */}
          <aside>
            <figure>
              <OptimizedImage
                src={evidenceCover || POOL_PHOTOS.resort.url}
                alt={
                  evidenceCover
                    ? evidence?.coverImage?.alt || evidence?.title || "Completed pool"
                    : POOL_PHOTOS.resort.alt
                }
                sizes="264px"
                priority
                className="photo h-[420px] bg-ink-100"
              />
              {evidenceCover && evidence && (
                <figcaption className="mt-2.5 text-[12px] text-ink-400">
                  {evidence.title}
                </figcaption>
              )}
            </figure>

            <div className="mt-6 border-t border-ink-200 pt-4">
              <span className="data-label">Equipment stock</span>
              <span className="data-value">Harare warehouse</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                Pumps, filters, heat pumps and chemicals are held in stock and
                collected or delivered.
              </p>
              <ArrowLink to="/market" label="Shop equipment" className="mt-2" />
            </div>

            <div className="mt-6 border-t border-ink-200 pt-4">
              <span className="data-label">Trading since</span>
              <span className="data-value">{COMPANY.established}</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                Work is carried out nationwide, run from {COMPANY.basesLabel}.
              </p>
              <ArrowLink to="/quotation" label="Request a quotation" className="mt-2" />
            </div>
          </aside>
        </div>
      </div>

      <QuotationCta
        image={POOL_PHOTOS.closing.url}
        title="These services are quoted per site"
        body="Send the site address and the work required. Equipment, delivery and installation are quoted with the job."
      />
    </>
  );
}
