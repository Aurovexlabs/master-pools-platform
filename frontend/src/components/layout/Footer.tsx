import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { COMPANY } from "../../data/company";
import { SERVICE_GROUPS } from "../../data/services";
import NewsletterSignup from "../ui/NewsletterSignup";

const SHOP_LINKS = [
  { label: "Pumps", category: "pumps" },
  { label: "Filtration", category: "filtration" },
  { label: "Heat pumps", category: "heating" },
  { label: "Chemicals", category: "chemicals" },
  { label: "Covers", category: "covers" },
];

const COMPANY_LINKS = [
  { to: "/projects", label: "Projects" },
  { to: "/latest", label: "Latest" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-200 bg-white">
      {/* Contact strip */}
      <div className="border-b border-ink-200 bg-surface">
        <div className="container-xl grid gap-x-10 gap-y-6 py-7 sm:grid-cols-3">
          <a href={COMPANY.phoneHref} className="group flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-sky-600">
              <Phone size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>
              <span className="data-label">Sales desk</span>
              <span className="mt-1 block text-[14px] font-semibold text-ink-900 group-hover:text-sky-700">
                {COMPANY.phone}
              </span>
            </span>
          </a>

          <a
            href={COMPANY.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3"
          >
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-sky-600">
              <MessageCircle size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>
              <span className="data-label">WhatsApp</span>
              <span className="mt-1 block text-[14px] font-semibold text-ink-900 group-hover:text-sky-700">
                Message the sales desk
              </span>
            </span>
          </a>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-sky-600">
              <MapPin size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>
              <span className="data-label">Operating in</span>
              <span className="mt-1 block text-[14px] font-semibold text-ink-900">
                {COMPANY.coverage}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-xl grid gap-x-10 gap-y-10 py-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_1.2fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5" aria-label="MasterPools home">
            <img
              src="/images/logo.jpeg"
              alt=""
              width={40}
              height={34}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto rounded-[6px] object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-extrabold tracking-[-0.015em] text-ink-900">
                MASTERPOOLS
              </span>
              <span className="mt-1 text-[8.5px] uppercase tracking-[0.125em] text-ink-500">
                Pool construction &amp; equipment
              </span>
            </span>
          </Link>

          <p className="mt-4 max-w-[290px] text-[13.5px] leading-relaxed text-ink-600">
            Pool construction, renovation, maintenance and equipment supply
            across Zimbabwe, run from {COMPANY.basesLabel}. Trading since{" "}
            {COMPANY.established}.
          </p>

          <a
            href={`mailto:${COMPANY.email}`}
            className="mt-4 inline-flex items-center gap-2 text-[13.5px] text-ink-600 hover:text-sky-700"
          >
            <Mail size={14} className="text-sky-600" aria-hidden="true" />
            {COMPANY.email}
          </a>
        </div>

        <nav aria-label="Services">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-500">
            Services
          </h2>
          <ul className="space-y-2">
            {SERVICE_GROUPS.map((group) => (
              <li key={group.slug}>
                <Link
                  to="/services"
                  hash={group.slug}
                  className="text-[13.5px] text-ink-600 hover:text-sky-700"
                >
                  {group.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/services"
                className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-sky-700"
              >
                All services
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Equipment">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-500">
            Equipment
          </h2>
          <ul className="space-y-2">
            {SHOP_LINKS.map((item) => (
              <li key={item.category}>
                <Link
                  to="/market"
                  search={{ category: item.category }}
                  className="text-[13.5px] text-ink-600 hover:text-sky-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/market"
                className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-sky-700"
              >
                All equipment
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-500">
            Company
          </h2>
          <ul className="space-y-2">
            {COMPANY_LINKS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-[13.5px] text-ink-600 hover:text-sky-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/quotation"
                className="text-[13.5px] text-ink-600 hover:text-sky-700"
              >
                Request a quotation
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-500">
            Requests
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/market/quote"
                className="text-[13.5px] text-ink-600 hover:text-sky-700"
              >
                Quote basket
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-[13.5px] text-ink-600 hover:text-sky-700"
              >
                My account
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-[13.5px] text-ink-600 hover:text-sky-700"
              >
                Book a site visit
              </Link>
            </li>
          </ul>

          <h2 className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-500">
            Stock updates
          </h2>
          <NewsletterSignup />
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="container-xl flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-[12.5px] text-ink-500">
            © {year} {COMPANY.legalName}. Harare, Zimbabwe.
          </p>
          <div className="flex items-center gap-5">
            {[
              { to: "/privacy-policy", label: "Privacy" },
              { to: "/terms-of-service", label: "Terms" },
              { to: "/cookie-policy", label: "Cookies" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to as never}
                className="text-[12.5px] text-ink-500 hover:text-ink-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
