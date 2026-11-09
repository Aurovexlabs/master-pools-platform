const usd = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1,845.00 */
export const formatUSD = (value: number) => `$${usd.format(Number(value) || 0)}`;

/** 1,845 — for compact places where cents do not help */
export const formatUSDCompact = (value: number) =>
  `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value) || 0)}`;

export const CATEGORY_LABELS: Record<string, string> = {
  pumps: "Pumps",
  filtration: "Filtration",
  heating: "Heating",
  lighting: "Lighting",
  cleaning: "Cleaning",
  chemicals: "Chemicals",
  covers: "Covers",
  "ladders-rails": "Ladders & rails",
  "tiles-finishes": "Tiles & finishes",
  spares: "Spares",
  services: "Services",
};

export const categoryLabel = (value?: string) =>
  (value && CATEGORY_LABELS[value]) || "Equipment";

const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  olympic: "Olympic",
  infinity: "Infinity",
  indoor: "Indoor",
  natural: "Natural",
  custom: "Custom",
};

/** Project categories are a different vocabulary to equipment categories. */
export const projectCategoryLabel = (value?: string) =>
  (value && PROJECT_CATEGORY_LABELS[value]) ||
  (value ? value.charAt(0).toUpperCase() + value.slice(1) : "Project");

/** "In stock" / "Out of stock" never carries colour alone; the number sits beside it. */
export const stockLabel = (stock: number) =>
  stock > 0 ? `${stock} in stock` : "Out of stock";
