/**
 * The service catalogue.
 *
 * There is no Service collection in the backend yet, so this module is the
 * single source of truth for the services index, the per-service detail pages,
 * the homepage directory and the navigation. When an admin-managed Service
 * model is added, replace this import with a query and keep the same shape.
 *
 * Descriptions state scope only — what the work involves. They make no claims
 * about volume of work, turnaround or guarantees.
 */
export interface ServiceEntry {
  slug: string;
  name: string;
  /** One line, used in directory rows and summary cards. */
  scope: string;
  /** One or two sentences, used on the detail page. */
  summary: string;
  /** What the work covers, as short noun phrases. */
  includes: string[];
}

export interface ServiceGroup {
  slug: string;
  name: string;
  intro: string;
  services: ServiceEntry[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    slug: "new-pools",
    name: "New pools",
    intro:
      "Design, excavation, reinforced shell, waterproofing, tiling, coping, plant and commissioning on residential and commercial sites. Filtration is sized for the pool volume rather than fitted from a fixed package.",
    services: [
      {
        slug: "pool-construction",
        name: "Pool construction",
        scope:
          "Design, excavation, reinforced shell, waterproofing, tiling and coping on residential and commercial sites.",
        summary:
          "The full build, from setting out and excavation through to a filled, balanced pool. One crew carries the shell, finishes and plant, so nothing in the sequence is handed between contractors.",
        includes: [
          "Setting out, excavation and spoil removal",
          "Reinforced shell and waterproofing",
          "Marbelite, tiled or fibreglass finish",
          "Coping, plant and commissioning",
        ],
      },
      {
        slug: "pool-installation",
        name: "Pool installation",
        scope: "Plant, plumbing and commissioning by the crew that built the shell.",
        summary:
          "Filtration, heating, lighting and pipework installed and commissioned. The plant is sized for the pool volume, then run and balanced before handover.",
        includes: [
          "Pump, filter and heating installation",
          "Pipework between plant and pool",
          "Electrical supply to the plant room",
          "Commissioning and water balancing",
        ],
      },
      {
        slug: "custom-pool-design",
        name: "Custom pool design",
        scope: "Shape, depth, finish and plant drawn to the site before work starts.",
        summary:
          "The pool drawn to the site: access, levels, drainage and how the deck ties into the house. Design is agreed before a trench is opened.",
        includes: [
          "Site measurement and levels",
          "Shape, depth and entry options",
          "Finish, coping and deck selection",
          "Plant layout and equipment schedule",
        ],
      },
      {
        slug: "infinity-edge-pools",
        name: "Infinity and edge pools",
        scope: "Vanishing-edge pools with a catch tank and balance system.",
        summary:
          "An infinity edge needs a catch tank, a balance pipe and a level sensor working together. We build the edge, the tank and the plant as one system.",
        includes: [
          "Catch tank and balance pipework",
          "Level control and make-up supply",
          "Edge detailing and finish",
          "Separate edge circulation pump",
        ],
      },
    ],
  },
  {
    slug: "renovation-and-repairs",
    name: "Renovation and repairs",
    intro:
      "Work on existing pools, including those we did not build: new surfaces, new detailing, and leak detection on shell, plumbing and fittings.",
    services: [
      {
        slug: "pool-renovation",
        name: "Pool renovation",
        scope: "Re-marbelite, re-tiling and new copings on existing pools.",
        summary:
          "An existing shell brought back into service without being rebuilt: drained, prepared, re-surfaced and re-detailed, with the plant checked while the pool is empty.",
        includes: [
          "Draining and surface preparation",
          "Re-marbelite or re-tiling",
          "New coping and waterline detail",
          "Plant inspection while drained",
        ],
      },
      {
        slug: "pool-repairs",
        name: "Pool repairs",
        scope: "Leak detection on shell, plumbing and fittings.",
        summary:
          "Repairs traced to a cause rather than a guess: the leak is located first, then the shell, pipework or fitting is repaired and the pool re-tested.",
        includes: [
          "Leak location on shell and pipework",
          "Crack and joint repair",
          "Fitting and skimmer replacement",
          "Re-test after repair",
        ],
      },
      {
        slug: "leak-detection",
        name: "Leak detection",
        scope: "Pressure testing and dye testing on shell, pipework and fittings.",
        summary:
          "A pool losing water is tested systematically — pipework under pressure, shell and fittings with dye — so the repair is aimed at the actual leak.",
        includes: [
          "Pressure testing of buried pipework",
          "Dye testing on shell and fittings",
          "Level loss measurement",
          "Written findings before repair",
        ],
      },
      {
        slug: "pool-resurfacing",
        name: "Resurfacing and lining",
        scope: "Marbelite, fibreglass lining and tiled finishes.",
        summary:
          "New interior finishes over a prepared shell. The finish is chosen for how the pool is used and how the water is treated.",
        includes: [
          "Marbelite and plaster finishes",
          "Fibreglass lining",
          "Tiled and mosaic interiors",
          "Waterline and step detailing",
        ],
      },
      {
        slug: "decking-and-paving",
        name: "Decking and paving",
        scope: "Coping, pavers and non-slip surrounds.",
        summary:
          "The surround, laid to fall away from the pool so surface water discharges rather than running back in.",
        includes: [
          "Coping stones and edge profiles",
          "Pavers and non-slip finishes",
          "Falls and drainage away from the pool",
          "Expansion joints",
        ],
      },
      {
        slug: "finishing-and-landscaping",
        name: "Finishing and landscaping",
        scope: "Coping, decking, mosaics and surrounds.",
        summary:
          "The detail around the pool that finishes the job: mosaics, surrounds and the planting or paving that ties the pool into the garden.",
        includes: [
          "Mosaic and feature banding",
          "Surrounds and planters",
          "Planting and garden tie-in",
          "Final clean and handover",
        ],
      },
    ],
  },
  {
    slug: "maintenance-and-cleaning",
    name: "Maintenance and cleaning",
    intro:
      "Scheduled visits for residences, lodges and clubs, with water chemistry balanced and recorded each time.",
    services: [
      {
        slug: "pool-maintenance",
        name: "Pool maintenance",
        scope: "Scheduled cleaning, backwashing and equipment checks.",
        summary:
          "Regular visits that keep the pool swimmable: cleaning, backwashing, chemical balancing and a check on the plant before small faults become repairs.",
        includes: [
          "Brushing, vacuuming and skimming",
          "Filter backwashing",
          "Chemical balancing and dosing",
          "Pump and heater checks",
        ],
      },
      {
        slug: "pool-cleaning",
        name: "Pool cleaning",
        scope: "Weekly or fortnightly service visits.",
        summary:
          "A cleaning visit on a fixed cycle, for pools that are maintained by the owner but need a professional clean and check.",
        includes: [
          "Weekly or fortnightly visits",
          "Floor, wall and waterline cleaning",
          "Basket and skimmer clearing",
          "Filter pressure check",
        ],
      },
      {
        slug: "water-testing",
        name: "Water testing",
        scope: "Water balanced and chemicals recorded on each visit.",
        summary:
          "Water tested for chlorine, pH, alkalinity and stabiliser, corrected, and the readings recorded so the treatment history is visible.",
        includes: [
          "Chlorine, pH and alkalinity testing",
          "Stabiliser and hardness checks",
          "Correction dosing",
          "Recorded readings per visit",
        ],
      },
      {
        slug: "green-pool-recovery",
        name: "Green pool recovery",
        scope: "Clearing algae, balancing chemistry and restoring filtration.",
        summary:
          "A neglected pool brought back: the algae is killed and filtered out, the chemistry rebalanced, and the filter media assessed before the pool is returned to a normal cycle.",
        includes: [
          "Shock treatment and algae removal",
          "Repeated brushing and filtration",
          "Filter media assessment",
          "Chemistry rebalance and handover",
        ],
      },
      {
        slug: "maintenance-contracts",
        name: "Maintenance contracts",
        scope: "Scheduled visits on a fixed cycle, invoiced monthly.",
        summary:
          "A standing arrangement for homes, lodges and clubs: a fixed visit cycle, chemicals and consumables included, and the same technician on the pool.",
        includes: [
          "Fixed visit cycle",
          "Chemicals and consumables included",
          "Equipment checks and reporting",
          "Priority response on faults",
        ],
      },
    ],
  },
  {
    slug: "equipment-and-systems",
    name: "Equipment and systems",
    intro:
      "Pumps, filters, heat pumps, salt chlorination and dosing, supplied from the Harare warehouse and installed by the team that specified them.",
    services: [
      {
        slug: "equipment-installation",
        name: "Equipment installation",
        scope: "Pumps, filters, heat pumps and chlorinators installed.",
        summary:
          "Equipment installed to the manufacturer's requirements, with the plant room left serviceable — isolation valves, unions and access to every component.",
        includes: [
          "Pump and filter installation",
          "Heat pump and chlorinator installation",
          "Isolation valves and unions",
          "Commissioning and handover",
        ],
      },
      {
        slug: "filtration-and-pumps",
        name: "Filtration and pumps",
        scope: "Plant sized for the pool volume, not a fixed package.",
        summary:
          "The pump and filter matched to the volume and turnover the pool needs, rather than sold as a boxed set that may be too small or oversized.",
        includes: [
          "Pool volume and turnover calculation",
          "Pump and filter selection",
          "Sand, cartridge or glass media",
          "Pressure and flow checks",
        ],
      },
      {
        slug: "pool-plumbing",
        name: "Pool plumbing",
        scope: "Pipework, valves and fittings between plant and pool.",
        summary:
          "Pipework between the pool and the plant room, including suction and return lines, valves and the fittings inside the shell.",
        includes: [
          "Suction and return lines",
          "Skimmers, main drains and inlets",
          "Valves and manifolds",
          "Pressure testing before backfill",
        ],
      },
      {
        slug: "heating-and-heat-pumps",
        name: "Heating and heat pumps",
        scope: "Heat pumps, solar heating and covers specified for the volume.",
        summary:
          "Heating sized for the pool volume and the season it needs to hold. A cover is usually part of the answer, since most heat loss is at the surface.",
        includes: [
          "Heat load calculation",
          "Heat pump or solar installation",
          "Bypass and flow requirements",
          "Cover recommendation",
        ],
      },
      {
        slug: "salt-chlorination-and-dosing",
        name: "Salt chlorination and dosing",
        scope: "Salt cells, dosing pumps and controllers installed and calibrated.",
        summary:
          "Sanitation equipment installed and calibrated: salt cells, acid and chlorine dosing pumps, and the controller that keeps the readings in range.",
        includes: [
          "Salt cell and control installation",
          "Dosing pumps and reservoirs",
          "Orp and ph controller calibration",
          "Operator handover",
        ],
      },
      {
        slug: "pool-lighting",
        name: "Pool lighting",
        scope: "Underwater LED lighting and deck lighting circuits.",
        summary:
          "Underwater lighting installed through the shell and wall, with the transformer and switching kept where it can be reached for service.",
        includes: [
          "Underwater led fittings",
          "Niche and conduit installation",
          "Transformers and switching",
          "Deck and feature lighting",
        ],
      },
      {
        slug: "automation-and-controls",
        name: "Automation and controls",
        scope: "Timers, controllers and remote monitoring for plant.",
        summary:
          "Controls that run the plant on a schedule and report faults, so filtration is not left running by hand or switched off entirely.",
        includes: [
          "Pump timers and schedules",
          "Multi-speed control",
          "Level and flow monitoring",
          "Remote alerts",
        ],
      },
    ],
  },
];

/** Groups other than the one that leads the homepage directory. */
export const SECONDARY_SERVICE_GROUPS = SERVICE_GROUPS.slice(1);

export const LEAD_SERVICE_GROUP = SERVICE_GROUPS[0];

export const SERVICE_COUNT = SERVICE_GROUPS.reduce(
  (total, group) => total + group.services.length,
  0,
);

/** Flat lookup for the detail route. */
export const ALL_SERVICES = SERVICE_GROUPS.flatMap((group) =>
  group.services.map((service) => ({ ...service, group })),
);

export const findService = (slug: string) =>
  ALL_SERVICES.find((service) => service.slug === slug);

export const findSiblingServices = (slug: string) => {
  const match = findService(slug);
  if (!match) return [];
  return match.group.services.filter((service) => service.slug !== slug);
};

/** The sequence we work to, shared by the homepage and the detail pages. */
export const SERVICE_PROCESS = [
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

/** Shared answers. Factual, and true of every service above. */
export const SERVICE_FAQS = [
  {
    question: "How is the work quoted?",
    answer:
      "Per site. The quotation itemises materials, labour, equipment and delivery, and is valid for the period printed on it.",
  },
  {
    question: "Which areas do you cover?",
    answer:
      "Nationwide across Zimbabwe. Work is run from Harare and Bulawayo, and delivery to other centres is quoted with the job.",
  },
  {
    question: "Will you work on a pool you did not build?",
    answer:
      "Yes. Renovation, repairs and maintenance are carried out on existing pools regardless of who built them.",
  },
];
