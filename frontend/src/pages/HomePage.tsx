import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import ArrowLink from "../components/public/ArrowLink";
import ProjectCaption from "../components/public/ProjectCaption";
import QuotationCta from "../components/public/QuotationCta";
import SectionHeading from "../components/public/SectionHeading";
import VideoShowcase from "../components/public/VideoShowcase";
import { MetaHead } from "../components/seo/MetaHead";
import {
  StructuredData,
  organizationSchema,
} from "../components/seo/StructuredData";
import OptimizedImage from "../components/ui/Image";
import { COMPANY } from "../data/company";
import { POOL_PHOTOS } from "../data/poolPhotos";
import {
  LEAD_SERVICE_GROUP,
  SECONDARY_SERVICE_GROUPS,
} from "../data/services";
import { useFeaturedProjects, useProjects, useVideos } from "../hooks/useApi";
import type { Project } from "../types";
import { projectCategoryLabel } from "../utils/format";

/** Verified capabilities only. Anything the company cannot substantiate is absent. */
const CAPABILITIES = [
  {
    title: "One contractor for the whole build",
    body: "Excavation, steel, shell, waterproofing, tiling and coping are carried out in-house.",
  },
  {
    title: "Filtration sized to the pool",
    body: "Pump and filter are selected for the pool volume, not supplied as a fixed package.",
  },
  {
    title: "Equipment held in Harare",
    body: "Pumps, filters, heat pumps and chemicals are stocked at the warehouse and installed by our team.",
  },
  {
    title: "Renovation on pools we did not build",
    body: "Leak detection, re-marbelite and re-tiling are done on existing shells.",
  },
  {
    title: "Working across Zimbabwe",
    body: "Construction, equipment and maintenance are run from Harare and Bulawayo, with crews travelling to site nationwide.",
  },
  {
    title: "Maintenance contracts",
    body: "Scheduled cleaning, backwashing, water testing and chemical balancing on a fixed visit cycle.",
  },
];

/** Where the work happens, and what is held in stock. */
const COVERAGE = [
  {
    label: "Coverage",
    value: COMPANY.coverage,
    body: "Residential and commercial sites, from a single pool to lodge and club installations.",
  },
  {
    label: "Base",
    value: "Harare warehouse and plant",
    body: "Pumps, filters, heat pumps and chemicals are held in stock for collection or delivery.",
  },
  {
    label: "Second team",
    value: "Bulawayo",
    body: "Builds and maintenance are run from Bulawayo alongside the Harare operation.",
  },
  {
    label: "Delivery",
    value: "Quoted with the job",
    body: "Materials travel with the crew to other centres, with delivery included in the quotation.",
  },
];

const FAQS = [
  {
    question: "How long does a new pool take?",
    answer:
      "Residential builds run between 14 and 17 weeks on site, depending on size and finish. Commercial pools, indoor halls and infinity edges take longer. The programme is agreed with the quotation.",
  },
  {
    question: "What does a quotation cover?",
    answer:
      "Excavation, reinforced shell, waterproofing, tiling, coping, plant and commissioning. Delivery and installation of equipment are quoted with the job, not separately.",
  },
  {
    question: "Can I buy equipment without building a pool?",
    answer:
      "Yes. Pumps, filters, heat pumps, salt chlorination, chemicals, covers and ladders are held at the Harare warehouse. Collect at the warehouse or ask for delivery.",
  },
  {
    question: "Do you work outside Harare and Bulawayo?",
    answer:
      "Yes. Work is carried out nationwide. Materials travel with the crew and delivery is quoted with the job.",
  },
  {
    question: "Will you repair a pool you did not build?",
    answer:
      "Yes. Leak detection, re-marbelite, re-tiling, new copings and decking are done on existing pools without rebuilding the shell.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Initial consultation",
    body: "Site, budget and how the pool will be used, discussed before anything is drawn.",
  },
  {
    step: "02",
    title: "Site assessment",
    body: "Access, ground conditions, existing services and where water will discharge.",
  },
  {
    step: "03",
    title: "Design and planning",
    body: "Shape, depth, finish and plant agreed and drawn before work starts.",
  },
  {
    step: "04",
    title: "Quotation and approval",
    body: "Itemised scope and programme, agreed in writing before the crew mobilises.",
  },
  {
    step: "05",
    title: "Construction and installation",
    body: "Excavation through to shell, waterproofing, tiling and coping.",
  },
  {
    step: "06",
    title: "Testing and handover",
    body: "Plant commissioned, water balanced and the pool walked through with you.",
  },
  {
    step: "07",
    title: "Ongoing maintenance",
    body: "Scheduled cleaning, chemical balancing and equipment checks if required.",
  },
];

const coverOf = (project?: Project) =>
  project?.coverImage?.thumbnail || project?.coverImage?.url || "";

export default function HomePage() {
  // Published records only. Featured projects lead when any are flagged,
  // otherwise the most recent published ones are used.
  const { data: featured } = useFeaturedProjects();
  const { data: recent } = useProjects({ limit: 4 });
  const { data: videos, isLoading: videosLoading } = useVideos();

  const projects: Project[] = featured?.length
    ? featured
    : (recent?.projects ?? []);

  const galleryLead = projects[1];
  const galleryMinis = projects.slice(2, 4);

  return (
    <>
      <MetaHead
        title="MasterPools | Swimming pool construction across Zimbabwe"
        description="Pool construction, renovation, maintenance and equipment supply across Zimbabwe. MasterPools has been building pools since 2014, run from Harare and Bulawayo."
        canonical={`${COMPANY.siteUrl}/`}
      />
      <StructuredData schema={organizationSchema} />

      {/* ── Hero: the company statement set on a pool, behind a flat scrim ── */}
      <section className="relative overflow-hidden">
        <img
          src={POOL_PHOTOS.hero.url}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{ objectPosition: "center 58%" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 bg-ink-900/64" aria-hidden="true" />

        <div className="container-xl relative py-16 lg:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <h1 className="max-w-[860px] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.032em] text-white sm:text-[42px] lg:text-[50px] lg:leading-[1.06]">
              Building exceptional swimming pools.{" "}
              <span className="text-sky-300">
                Creating lasting experiences.
              </span>
            </h1>

            <div className="lg:pt-2">
              <p className="mb-6 max-w-[340px] text-[14.5px] leading-relaxed text-white/80">
                From custom swimming pool construction to professional installation
                and ongoing maintenance, MasterPools delivers exceptional aquatic
                spaces designed to transform your property.
              </p>
              <div className="flex flex-col items-start gap-4">
                <Link to="/quotation" className="btn btn-primary btn-lg">
                  Request a free quotation
                </Link>
                <ArrowLink
                  to="/projects"
                  label="Explore our projects"
                  className="text-white/85 hover:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company introduction ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-[72px]">
          <div>
            <h2 className="mb-5 max-w-[440px] font-display text-[26px] font-bold leading-[1.14] tracking-[-0.028em] text-ink-900 sm:text-[34px]">
              A Zimbabwean pool contractor, trading since {COMPANY.established}
            </h2>
            <p className="mb-4 max-w-[480px] text-[15px] leading-[1.72] text-ink-600">
              MasterPools builds new pools, renovates existing ones, supplies
              filtration and heating equipment, and maintains pools for homes,
              lodges and clubs.
            </p>
            <p className="mb-4 max-w-[480px] text-[15px] leading-[1.72] text-ink-600">
              Excavation, steel, shell, waterproofing, tiling and coping are done
              in-house by our own crews, so one contractor carries the job from the
              first trench to commissioning.
            </p>
            <p className="max-w-[480px] text-[15px] leading-[1.72] text-ink-600">
              The equipment that goes into the plant room is held in our Harare
              warehouse and installed by the same team that specified it.
            </p>
          </div>

          <figure>
            <OptimizedImage
              src="/images/pools/site-coping.jpg"
              alt="Deck coping being laid during swimming pool construction — illustrative photograph, William Adams on Pexels"
              sizes="(max-width: 1024px) 100vw, 540px"
              className="photo h-[300px] bg-ink-100 lg:h-[340px]"
            />
          </figure>
        </div>
      </section>

      {/* ── Services directory ───────────────────────────────────────────── */}
      <section className="border-y border-sky-100 bg-sky-50 py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading title="Services">
            <ArrowLink to="/services" label="All services" />
          </SectionHeading>

          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
            <div>
              <h3 className="mb-3 font-display text-[24px] font-bold tracking-[-0.022em] text-ink-900 sm:text-[26px]">
                {LEAD_SERVICE_GROUP.name}
              </h3>
              <p className="mb-5 max-w-[400px] text-[14.5px] leading-[1.7] text-ink-600">
                {LEAD_SERVICE_GROUP.intro}
              </p>
              <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {LEAD_SERVICE_GROUP.services.map((service) => (
                  <li
                    key={service.slug}
                    className="border-b border-sky-200 py-2.5 text-[13.5px] text-ink-700"
                  >
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="hover:text-sky-700"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ArrowLink
                to="/services"
                label="Scope and site requirements"
                className="mt-4"
              />

              <figure className="mt-7">
                <OptimizedImage
                  src="/images/pools/plant-room.jpg"
                  alt="Pump, filter and pipework in a plant room — illustrative photograph, Pavel Danilyuk on Pexels"
                  sizes="(max-width: 1024px) 100vw, 460px"
                  className="photo h-[186px] bg-ink-100"
                />
              </figure>
            </div>

            <div>
              {SECONDARY_SERVICE_GROUPS.map((group) => (
                <div
                  key={group.slug}
                  className="border-t border-sky-200 py-5 first:border-t-0 first:pt-0"
                >
                  <h4 className="mb-1.5 font-display text-[18px] font-bold tracking-[-0.015em] text-ink-900">
                    {group.name}
                  </h4>
                  <p className="mb-2 max-w-[460px] text-[13.5px] leading-[1.65] text-ink-600">
                    {group.intro}
                  </p>
                  <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                    {group.services.map((service) => (
                      <li
                        key={service.slug}
                        className="py-1.5 text-[13.5px] text-ink-600"
                      >
                        <Link
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className="hover:text-sky-700"
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {group.slug === "equipment-and-systems" && (
                    <ArrowLink to="/market" label="Shop equipment" className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Completed projects ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading title="Completed projects">
            <ArrowLink to="/projects" label="All projects" />
          </SectionHeading>

          {galleryLead && coverOf(galleryLead) ? (
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-[52px]">
              <article>
                <Link
                  to="/projects/$id"
                  params={{ id: galleryLead.slug || galleryLead._id }}
                  className="block"
                >
                  <OptimizedImage
                    src={coverOf(galleryLead)}
                    alt={galleryLead.coverImage?.alt || galleryLead.title}
                    sizes="(max-width: 1024px) 100vw, 760px"
                    className="photo h-[300px] bg-ink-100 lg:h-[404px]"
                  />
                </Link>
                <ProjectCaption project={galleryLead} className="pt-3.5" />
              </article>

              <div className="flex h-full flex-col">
                {galleryMinis.map((project, index) => (
                  <Link
                    key={project._id}
                    to="/projects/$id"
                    params={{ id: project.slug || project._id }}
                    className={`group flex flex-1 items-center gap-4 py-4 ${
                      index === 0 ? "pt-0" : "border-t border-ink-200"
                    }`}
                  >
                    <div className="h-[118px] w-[148px] shrink-0 overflow-hidden bg-ink-100">
                      {coverOf(project) && (
                        <OptimizedImage
                          src={coverOf(project)}
                          alt={project.coverImage?.alt || project.title}
                          sizes="148px"
                          className="photo"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-1 font-display text-[15.5px] font-bold tracking-[-0.012em] text-ink-900 group-hover:text-sky-700">
                        {project.title}
                      </h3>
                      <div className="rule-meta">
                        {project.location && <span>{project.location}</span>}
                        <span>{projectCategoryLabel(project.category)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink-200 pt-4">
              <p className="text-[13.5px] text-ink-600">
                No completed projects are published yet.
              </p>
              <ArrowLink to="/services" label="See services" />
            </div>
          )}
        </div>
      </section>

      {/* ── Published job videos ─────────────────────────────────────────── */}
      <VideoShowcase videos={videos ?? []} isLoading={videosLoading} />

      {/* ── Verified capabilities ────────────────────────────────────────── */}
      <section className="border-y border-ink-200 bg-surface py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading title="Why MasterPools" />
          <div className="grid gap-x-[72px] sm:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <div key={item.title} className="border-t border-ink-200 py-5">
                <h3 className="mb-1.5 font-display text-base font-bold tracking-[-0.012em] text-ink-900">
                  {item.title}
                </h3>
                <p className="max-w-[400px] text-[13.5px] leading-[1.65] text-ink-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading
            title="How we work"
            intro="Seven stages from the first call to the pool entering service, and the maintenance that follows it."
          />
          <div className="grid gap-x-[72px] sm:grid-cols-2">
            {PROCESS.map((item) => (
              <div
                key={item.step}
                className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 border-t border-ink-200 py-5"
              >
                <span className="pt-0.5 font-display text-[13px] font-bold tabular-nums text-sky-700">
                  {item.step}
                </span>
                <div>
                  <h3 className="mb-1.5 font-display text-[15.5px] font-bold tracking-[-0.012em] text-ink-900">
                    {item.title}
                  </h3>
                  <p className="max-w-[330px] text-[13.5px] leading-[1.6] text-ink-600">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coverage ─────────────────────────────────────────────────────── */}
      <section className="border-y border-ink-200 bg-surface py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading
            title="Where we work"
            intro="MasterPools works across Zimbabwe. The teams, warehouse and plant are based in Harare and Bulawayo, and materials travel with the crew to site."
          />
          <div className="grid gap-x-[72px] sm:grid-cols-2">
            {COVERAGE.map((item) => (
              <div key={item.label} className="border-t border-ink-200 py-5">
                <span className="data-label">{item.label}</span>
                <p className="mt-1.5 font-display text-[16.5px] font-bold tracking-[-0.012em] text-ink-900">
                  {item.value}
                </p>
                <p className="mt-1.5 max-w-[380px] text-[13.5px] leading-[1.65] text-ink-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading
            title="Questions"
            intro="The answers that come up most before a quotation."
          />
          <div>
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-ink-200 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 max-w-[640px] text-[13.5px] leading-relaxed text-ink-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <QuotationCta image={POOL_PHOTOS.closing.url} />
    </>
  );
}
