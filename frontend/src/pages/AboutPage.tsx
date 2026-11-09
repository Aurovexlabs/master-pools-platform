import { Link } from "@tanstack/react-router";

import ArrowLink from "../components/public/ArrowLink";
import QuotationCta from "../components/public/QuotationCta";
import SectionHeading from "../components/public/SectionHeading";
import { MetaHead } from "../components/seo/MetaHead";
import {
  StructuredData,
  breadcrumbSchema,
  organizationSchema,
} from "../components/seo/StructuredData";
import OptimizedImage from "../components/ui/Image";
import { COMPANY } from "../data/company";
import { POOL_PHOTOS } from "../data/poolPhotos";
import { SERVICE_GROUPS } from "../data/services";

/** Only facts the company can substantiate. */
const FACTS = [
  { label: "Established", value: String(COMPANY.established) },
  { label: "Operating in", value: COMPANY.coverage },
  { label: "Construction", value: "In-house crews" },
];

const CAPABILITIES = [
  "Excavation, steel, shell, waterproofing, tiling and coping are carried out in-house.",
  "Filtration is sized for the pool volume rather than fitted from a fixed package.",
  "Pumps, filters, heat pumps and chemicals are held at the Harare warehouse.",
  "Renovation and repair are done on existing pools, including those we did not build.",
];

export default function AboutPage() {
  return (
    <>
      <MetaHead
        title="About MasterPools | Swimming pool contractor in Zimbabwe"
        description="MasterPools has built, renovated and maintained swimming pools across Zimbabwe since 2014. Construction, filtration and equipment handled by one contractor."
        canonical={`${COMPANY.siteUrl}/about`}
      />
      <StructuredData schema={organizationSchema} />
      <StructuredData
        schema={breadcrumbSchema([
          { name: "Home", url: `${COMPANY.siteUrl}/` },
          { name: "About", url: `${COMPANY.siteUrl}/about` },
        ])}
      />

      {/* ── Hero over a pool photograph, behind a flat scrim ─────────────── */}
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
        <span className="absolute inset-0 bg-ink-900/78" aria-hidden="true" />

        <div className="container-xl relative py-20 lg:py-24">
          <h1 className="max-w-[760px] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.032em] text-white sm:text-[44px] lg:text-[50px]">
            A Zimbabwean pool contractor, trading since {COMPANY.established}
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.7] text-white/80">
            MasterPools builds new pools, renovates existing ones, supplies
            filtration and heating equipment, and maintains pools for homes,
            lodges and clubs across Zimbabwe.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn btn-primary btn-lg">
              See our work
            </Link>
            <Link
              to="/quotation"
              className="btn btn-lg border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Request a quotation
            </Link>
          </div>
        </div>
      </section>

      {/* ── Verified facts ───────────────────────────────────────────────── */}
      <section className="border-b border-ink-200">
        <div className="container-xl grid gap-x-10 gap-y-6 py-7 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <span className="data-label">{fact.label}</span>
              <span className="mt-1 block font-display text-[17px] font-bold tracking-[-0.012em] text-ink-900">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How the work is carried ──────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-[72px]">
          <div>
            <h2 className="mb-5 max-w-[460px] font-display text-[26px] font-bold leading-[1.14] tracking-[-0.028em] text-ink-900 sm:text-[34px]">
              One contractor from the first trench to commissioning
            </h2>
            <p className="mb-4 max-w-[490px] text-[15px] leading-[1.72] text-ink-600">
              We started in {COMPANY.established} building residential pools in
              Harare. The work has since widened to commercial pools, infinity
              edges, indoor halls and natural ponds, and to the maintenance of
              pools we did not build.
            </p>
            <p className="mb-6 max-w-[490px] text-[15px] leading-[1.72] text-ink-600">
              Excavation, steel, shell, waterproofing, tiling and coping are done
              by our own crews. The plant room is specified by the same team that
              installs it, so nothing in the build is handed between contractors.
            </p>

            <ul>
              {CAPABILITIES.map((item) => (
                <li
                  key={item}
                  className="max-w-[520px] border-t border-ink-200 py-3.5 text-[13.5px] leading-relaxed text-ink-600"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <figure>
            <OptimizedImage
              src="/images/pools/site-coping.jpg"
              alt="Deck coping being laid during swimming pool construction — illustrative photograph, William Adams on Pexels"
              sizes="(max-width: 1024px) 100vw, 540px"
              className="photo h-[300px] bg-ink-100 lg:h-[360px]"
            />
            <figcaption className="mt-2.5 text-[12px] text-ink-400">
              Deck coping laid during a residential build.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Photograph band ──────────────────────────────────────────────── */}
      <section aria-label="Completed swimming pool">
        <OptimizedImage
          src={POOL_PHOTOS.residential.url}
          alt={POOL_PHOTOS.residential.alt}
          sizes="100vw"
          className="photo h-[240px] bg-ink-100 sm:h-[320px] lg:h-[400px]"
        />
      </section>

      {/* ── What we do ───────────────────────────────────────────────────── */}
      <section className="border-y border-ink-200 bg-surface py-16 lg:py-20">
        <div className="container-xl">
          <SectionHeading title="What we do">
            <ArrowLink to="/services" label="All services" />
          </SectionHeading>

          <div className="grid gap-x-[72px] sm:grid-cols-2">
            {SERVICE_GROUPS.map((group) => (
              <div key={group.slug} className="border-t border-ink-200 py-5">
                <h3 className="mb-1.5 font-display text-base font-bold tracking-[-0.012em] text-ink-900">
                  {group.name}
                </h3>
                <p className="max-w-[420px] text-[13.5px] leading-[1.65] text-ink-600">
                  {group.intro}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two centres ──────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="container-xl grid items-center gap-12 lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:gap-[72px]">
          <figure className="order-2 lg:order-1">
            <OptimizedImage
              src="/images/pools/plant-room.jpg"
              alt="Pump, filter and pipework in a plant room — illustrative photograph, Pavel Danilyuk on Pexels"
              sizes="(max-width: 1024px) 100vw, 540px"
              className="photo h-[280px] bg-ink-100 lg:h-[340px]"
            />
          </figure>

          <div className="order-1 lg:order-2">
            <h2 className="mb-5 max-w-[420px] font-display text-[26px] font-bold leading-[1.14] tracking-[-0.028em] text-ink-900 sm:text-[34px]">
              Across Zimbabwe
            </h2>
            <p className="mb-4 max-w-[490px] text-[15px] leading-[1.72] text-ink-600">
              Construction, equipment and maintenance run from Harare. The
              warehouse holds pumps, filters, heat pumps and chemicals, so
              replacements and spares are collected or delivered rather than
              ordered in.
            </p>
            <p className="mb-6 max-w-[490px] text-[15px] leading-[1.72] text-ink-600">
              Work is carried out nationwide. Harare holds the warehouse, plant
              and spares; teams travel to site from there and from Bulawayo, with
              delivery to other centres quoted with the job.
            </p>
            <ArrowLink to="/contact" label="Book a site visit" />
          </div>
        </div>
      </section>

      <QuotationCta
        image={POOL_PHOTOS.closing.url}
        title="Ready to build your swimming pool?"
        body="Send the site address and the work required. We will confirm a site visit and quote the scope."
      />
    </>
  );
}
