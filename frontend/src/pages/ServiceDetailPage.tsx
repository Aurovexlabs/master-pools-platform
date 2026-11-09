import { Link } from "@tanstack/react-router";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";

import EmptyState from "../components/public/EmptyState";
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
import {
  SERVICE_FAQS,
  SERVICE_PROCESS,
  findService,
  findSiblingServices,
} from "../data/services";
import { useProjects } from "../hooks/useApi";

/** Each group opens on a photograph of that kind of work. */
const GROUP_IMAGES: Record<string, string> = {
  "new-pools": POOL_PHOTOS.banner.url,
  "renovation-and-repairs": POOL_PHOTOS.residential.url,
  "maintenance-and-cleaning": POOL_PHOTOS.resort.url,
  "equipment-and-systems": POOL_PHOTOS.commercial.url,
};

export default function ServiceDetailPage({ slug }: { slug: string }) {
  const service = findService(slug);
  const { data } = useProjects({ limit: 3 });
  const relatedProjects = (data?.projects ?? []).slice(0, 2);

  if (!service) {
    return (
      <div className="container-md py-20">
        <EmptyState
          title="That service does not exist"
          body="The address may have changed. The full service directory is still available."
          actions={
            <Link to="/services" className="btn btn-primary btn-md">
              All services
            </Link>
          }
        />
      </div>
    );
  }

  const siblings = findSiblingServices(slug);
  const bannerImage = GROUP_IMAGES[service.group.slug] ?? POOL_PHOTOS.banner.url;

  return (
    <>
      <MetaHead
        title={`${service.name} | MasterPools — ${service.group.name}`}
        description={service.summary}
        canonical={`${COMPANY.siteUrl}/services/${service.slug}`}
      />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: `${COMPANY.siteUrl}/` },
          { name: "Services", url: `${COMPANY.siteUrl}/services` },
          {
            name: service.name,
            url: `${COMPANY.siteUrl}/services/${service.slug}`,
          },
        ])}
      />

      <PhotoBanner
        image={bannerImage}
        title={service.name}
        intro={service.summary}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/quotation" className="btn btn-primary btn-lg">
            Request a free quotation
          </Link>
          <a
            href={COMPANY.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            WhatsApp the sales desk
          </a>
        </div>
      </PhotoBanner>

      <div className="container-xl py-10 lg:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div>
            <h2 className="mb-1 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
              What this covers
            </h2>
            <ul>
              {service.includes.map((item) => (
                <li
                  key={item}
                  className="border-t border-ink-200 py-3.5 text-[14px] leading-relaxed text-ink-600"
                >
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 mb-4 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
              How it runs
            </h2>
            <div className="grid gap-x-12 sm:grid-cols-2">
              {SERVICE_PROCESS.map((step) => (
                <div
                  key={step.step}
                  className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-t border-ink-200 py-4"
                >
                  <span className="pt-0.5 font-display text-[13px] font-bold tabular-nums text-sky-700">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="mb-1 font-display text-[15px] font-bold tracking-[-0.012em] text-ink-900">
                      {step.title}
                    </h3>
                    <p className="max-w-[330px] text-[13px] leading-[1.6] text-ink-600">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-10 mb-1 font-display text-[22px] font-bold tracking-[-0.02em] text-ink-900">
              Questions
            </h2>
            <div>
              {SERVICE_FAQS.map((faq) => (
                <details key={faq.question} className="group border-t border-ink-200 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 max-w-[620px] text-[13.5px] leading-relaxed text-ink-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Aside: quote, group, related work */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-5">
              <span className="data-label">Quotation</span>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">
                {service.name} is quoted per site. Send the address and the work
                required.
              </p>
              <Link
                to="/quotation"
                className="btn btn-primary btn-md mt-4 w-full"
              >
                Request a quotation
              </Link>
              <a
                href={COMPANY.phoneHref}
                className="mt-3 flex items-center gap-2 text-[13px] font-medium text-ink-700 hover:text-sky-700"
              >
                <Phone size={14} className="text-sky-600" aria-hidden="true" />
                {COMPANY.phone}
              </a>
            </div>

            <div>
              <span className="data-label">{service.group.name}</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
                {service.group.intro}
              </p>
              <Link
                to="/services"
                hash={service.group.slug}
                className="textlink mt-2"
              >
                All {service.group.name.toLowerCase()}
              </Link>
            </div>

            {relatedProjects.length > 0 && (
              <div>
                <span className="data-label">Related work</span>
                <ul className="mt-3 space-y-3">
                  {relatedProjects.map((project) => {
                    const cover =
                      project.coverImage?.thumbnail || project.coverImage?.url;
                    return (
                      <li key={project._id}>
                        <Link
                          to="/projects/$id"
                          params={{ id: project.slug || project._id }}
                          className="group flex items-center gap-3"
                        >
                          <span className="h-[52px] w-[68px] shrink-0 overflow-hidden bg-ink-100">
                            {cover && (
                              <OptimizedImage
                                src={cover}
                                alt={project.coverImage?.alt || project.title}
                                sizes="68px"
                                className="photo"
                              />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-display text-[13.5px] font-bold text-ink-900 group-hover:text-sky-700">
                              {project.title}
                            </span>
                            {project.location && (
                              <span className="block truncate text-[12px] text-ink-500">
                                {project.location}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Siblings within the same group */}
        {siblings.length > 0 && (
          <section className="mt-12 border-t border-ink-200 pt-6">
            <h2 className="mb-3 font-display text-[18px] font-bold tracking-[-0.016em] text-ink-900">
              More {service.group.name.toLowerCase()}
            </h2>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {siblings.map((sibling) => (
                <li key={sibling.slug} className="border-t border-ink-200">
                  <Link
                    to="/services/$slug"
                    params={{ slug: sibling.slug }}
                    className="group block py-3"
                  >
                    <span className="block font-display text-[14.5px] font-bold text-ink-900 group-hover:text-sky-700">
                      {sibling.name}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-500">
                      {sibling.scope}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <QuotationCta
        image={POOL_PHOTOS.closing.url}
        title={`Ready to start on ${service.name.toLowerCase()}?`}
        body="Send the site address and the work required. We will confirm a site visit and quote the scope."
      />
    </>
  );
}
