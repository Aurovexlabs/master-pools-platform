/**
 * Company facts shared across the site.
 *
 * Only what the business confirms belongs here. MasterPools works across
 * Zimbabwe — Harare and Bulawayo are where the team and the stores are based,
 * not the limit of the service area.
 */
export const COMPANY = {
  name: "MasterPools",
  legalName: "MasterPools Construction",
  established: 2014,
  phone: "+263 772 562 125",
  phoneHref: "tel:+263772562125",
  whatsappHref: "https://wa.me/263772562125",
  email: "info@masterspools.co.zw",
  siteUrl: "https://www.masterspools.co.zw",

  /** Where the business is run from. The warehouse and plant are in Harare. */
  bases: ["Harare", "Bulawayo"],
  basesLabel: "Harare and Bulawayo",

  /** Coverage claim used wherever the service area is stated. */
  coverage: "Nationwide across Zimbabwe",
  coverageShort: "Nationwide",

  /** Cities the delivery and quote forms offer. */
  deliveryCities: ["Harare", "Bulawayo", "Mutare", "Gweru"],
} as const;

/** The trust facts, rendered as label/value pairs. */
export const COMPANY_FACTS = [
  { label: "Trading since", value: String(COMPANY.established) },
  { label: "Operating in", value: COMPANY.coverage },
] as const;
