import BlogPost from "../models/BlogPost.model.js";
import Product from "../models/Product.model.js";
import Project from "../models/Project.model.js";
import User from "../models/User.model.js";

export const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) return;

    // A known default password must never be created in production.
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "Admin seed skipped: set ADMIN_EMAIL and ADMIN_PASSWORD before deploying.",
        );
        return;
      }
      console.warn(
        "Seeding a development admin with default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD to override.",
      );
    }

    await User.create({
      name: "MasterPools Admin",
      email: process.env.ADMIN_EMAIL || "admin@masterpools.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123456",
      role: "admin",
      isVerified: true,
    });
    console.log("Admin user seeded");
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};

export const seedBlogPost = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) return;

    const existingPost = await BlogPost.findOne({});
    if (existingPost) return;

    await BlogPost.create({
      title: "Welcome to the MasterPools updates hub",
      slug: "welcome-to-the-masterpools-updates-hub",
      excerpt:
        "We are using this space to share project updates, service notes, and company announcements from the team.",
      content:
        "This is the first update on the new Latest page. We will use it to post practical project notes, completed work, service improvements, and important company news.\n\nExpect short, useful updates from the team here. If you are a returning client, this is where you can check what we have been building recently.",
      category: "announcement",
      featured: true,
      isPublished: true,
      publishedAt: new Date(),
      tags: ["announcement", "company news", "updates"],
      createdBy: admin._id,
    });

    console.log("Starter blog post seeded");
  } catch (err) {
    console.error("Blog seed error:", err.message);
  }
};

const SEED_PRODUCTS = [
  {
    title: "Victoria Plus 0.75 kW pool pump",
    sku: "MP-PMP-075",
    brand: "AstralPool",
    category: "pumps",
    shortDescription: "0.75 kW circulation pump for pools up to 45 000 litres.",
    description:
      "Single-phase circulation pump for residential pools up to 45 000 litres. Self-priming body with a large strainer basket, supplied with 50 mm unions and a 1.5 m power lead.",
    highlights: ["0.75 kW motor", "220 V single phase", "50 mm union connections"],
    specs: [
      { label: "Motor", value: "0.75 kW" },
      { label: "Supply", value: "220 V / 50 Hz" },
      { label: "Max flow", value: "17 m³/h" },
      { label: "Connections", value: "50 mm" },
    ],
    price: { amount: 412, currency: "USD" },
    unit: "each",
    stock: 14,
    warrantyMonths: 24,
    images: [
      {
        url: "https://images.pexels.com/photos/7937300/pexels-photo-7937300.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Pool pump and filtration pipework — Pavel Danilyuk on Pexels",
      },
    ],
  },
  {
    title: "Badu Top 12 sand filter",
    sku: "MP-FLT-BT12",
    brand: "Speck",
    category: "filtration",
    shortDescription: "24 inch sand filter vessel rated at 12 m³/h.",
    description:
      "Fibreglass-reinforced sand filter with a six-position multiport valve, pressure gauge and 50 mm plumbing. Takes 100 kg of filter sand, sold separately.",
    highlights: ["12 m³/h flow rate", "24 inch vessel", "Six-position multiport valve"],
    specs: [
      { label: "Flow rate", value: "12 m³/h" },
      { label: "Vessel", value: '24"' },
      { label: "Sand capacity", value: "100 kg" },
      { label: "Valve", value: "6-position" },
    ],
    price: { amount: 286, currency: "USD" },
    unit: "each",
    stock: 6,
    warrantyMonths: 24,
    images: [
      {
        url: "https://images.pexels.com/photos/12726229/pexels-photo-12726229.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Sand filter vessels in a plant room — Alexey Demidov on Pexels",
      },
    ],
  },
  {
    title: "InverX 12 kW inverter heat pump",
    sku: "MP-HTP-IX12",
    brand: "Fairland",
    category: "heating",
    shortDescription: "Inverter heat pump with 12 kW heating output on R32.",
    description:
      "Full inverter heat pump for pools up to 50 000 litres. Runs on R32 refrigerant with a copeland compressor, titanium heat exchanger and a digital controller with a weekly timer.",
    highlights: ["12 kW heating output", "R32 refrigerant", "Titanium heat exchanger"],
    specs: [
      { label: "Heating output", value: "12 kW" },
      { label: "Refrigerant", value: "R32" },
      { label: "Power input", value: "2.4 kW" },
      { label: "Working range", value: "-7 °C to 43 °C" },
    ],
    price: { amount: 1845, currency: "USD" },
    unit: "each",
    stock: 3,
    warrantyMonths: 36,
    installRequired: true,
    images: [
      {
        url: "https://images.pexels.com/photos/38067246/pexels-photo-38067246.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Row of outdoor heat pump units — alpha innotec on Pexels",
      },
    ],
  },
  {
    title: "InverX 17 kW inverter heat pump",
    sku: "MP-HTP-IX17",
    brand: "Fairland",
    category: "heating",
    shortDescription: "Inverter heat pump with 17 kW heating output on R32.",
    description:
      "Larger inverter heat pump for commercial pools and pools over 50 000 litres. Twin-fan housing, R32 refrigerant and a titanium heat exchanger.",
    highlights: ["17 kW heating output", "Twin fan housing", "R32 refrigerant"],
    specs: [
      { label: "Heating output", value: "17 kW" },
      { label: "Refrigerant", value: "R32" },
      { label: "Power input", value: "3.1 kW" },
      { label: "Working range", value: "-7 °C to 43 °C" },
    ],
    price: { amount: 2460, currency: "USD" },
    unit: "each",
    stock: 2,
    warrantyMonths: 36,
    installRequired: true,
    images: [
      {
        url: "https://images.pexels.com/photos/20046693/pexels-photo-20046693.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Outdoor heat pump unit against a wall — alpha innotec on Pexels",
      },
    ],
  },
  {
    title: "Dolphin E30 pool cleaner",
    sku: "MP-CLN-DE30",
    brand: "Maytronics",
    category: "cleaning",
    shortDescription: "Robotic cleaner for walls and floor with a 10 m cable.",
    description:
      "Robotic pool cleaner with dual brushes, a 2 micron filter cartridge and a weekly timer. Suitable for pools up to 12 m in length.",
    highlights: ["Walls and floor cleaning", "10 m swivel cable", "Weekly timer"],
    specs: [
      { label: "Coverage", value: "Up to 12 m pool" },
      { label: "Cable", value: "10 m" },
      { label: "Filter", value: "2 micron cartridge" },
      { label: "Cycle", value: "2.5 hours" },
    ],
    price: { amount: 695, currency: "USD" },
    unit: "each",
    stock: 0,
    warrantyMonths: 12,
    images: [
      {
        url: "https://images.pexels.com/photos/6436202/pexels-photo-6436202.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Robotic pool cleaner on a pool deck — Ehavuz Market on Pexels",
      },
    ],
  },
  {
    title: "Granular chlorine 25 kg drum",
    sku: "MP-CHM-HTH25",
    brand: "HTH",
    category: "chemicals",
    shortDescription: "90% available chlorine granular sanitiser, sold by the drum.",
    description:
      "Calcium hypochlorite granular chlorine for daily sanitation. One drum treats roughly 200 000 litres of pool water at maintenance dose. Sold per 25 kg drum.",
    highlights: ["90% available chlorine", "25 kg drum", "Dissolves without residue"],
    specs: [
      { label: "Available chlorine", value: "90%" },
      { label: "Pack size", value: "25 kg drum" },
      { label: "Dose", value: "5 g per m³" },
      { label: "Storage", value: "Cool, dry, away from acid" },
    ],
    price: { amount: 118, currency: "USD" },
    unit: "25 kg drum",
    stock: 22,
    images: [
      {
        url: "https://images.unsplash.com/photo-1760546607676-76c2bd048112?auto=format&w=900&q=80&fit=crop",
        alt: "Blue chemical drum beside a pool — Kasem Sleem on Unsplash",
      },
    ],
  },
  {
    title: "S/S 316 3-step pool ladder",
    sku: "MP-LDR-3163",
    brand: "Emaux",
    category: "ladders-rails",
    shortDescription: "Three-step 316 stainless ladder with anchor sockets.",
    description:
      "Marine-grade 316 stainless steel ladder with three anti-slip steps, supplied with escutcheons and anchor sockets for a standard deck.",
    highlights: ["316 marine grade", "Three anti-slip steps", "Anchor sockets included"],
    specs: [
      { label: "Material", value: "316 stainless steel" },
      { label: "Steps", value: "3" },
      { label: "Tube", value: "43 mm" },
      { label: "Mounting", value: "Anchor sockets" },
    ],
    price: { amount: 164, currency: "USD" },
    unit: "each",
    stock: 9,
    installRequired: true,
    images: [
      {
        url: "https://images.pexels.com/photos/97047/pexels-photo-97047.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Stainless steel pool ladder rails — Markus Spiske on Pexels",
      },
    ],
  },
  {
    title: "Summer cover with roller reel",
    sku: "MP-CVR-RLR45",
    brand: "MasterPools",
    category: "covers",
    shortDescription: "450 micron cover with a wheeled roller, up to 5 m wide.",
    description:
      "Reinforced 450 micron summer cover that cuts evaporation and debris load. Supplied with an aluminium roller, wheel kit and fixing brackets for pools up to 5 m wide.",
    highlights: ["450 micron reinforced", "Aluminium roller", "Up to 5 m wide"],
    specs: [
      { label: "Thickness", value: "450 micron" },
      { label: "Max width", value: "5 m" },
      { label: "Roller", value: "Aluminium with wheels" },
      { label: "Fixing", value: "Deck brackets" },
    ],
    price: { amount: 342, currency: "USD" },
    unit: "set",
    stock: 4,
    images: [
      {
        url: "https://images.pexels.com/photos/9690097/pexels-photo-9690097.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Worker rolling out a pool cover — William Adams on Pexels",
      },
    ],
  },
];

const SEED_PROJECTS = [
  {
    title: "Borrowdale residence",
    description:
      "A 12 × 5 m marbelite pool with a tiled waterline, cartridge filtration and a paved coping detail that ties into the existing entertainment area. Built alongside the house renovation.",
    shortDescription: "12 × 5 m marbelite pool with tiled waterline in Borrowdale.",
    category: "residential",
    status: "completed",
    location: "Borrowdale, Harare",
    area: "12 × 5 m",
    depth: "1.6 m",
    duration: "14 weeks",
    features: ["Marbelite finish", "Tiled waterline", "Cartridge filtration", "Paved coping"],
    // Seeded photography ships with the frontend so the demo does not depend on
    // an image CDN being reachable. Replace with project photographs as real
    // records are published.
    coverImage: {
      url: "/images/pools/residential-pool.jpg",
      alt: "Completed residential swimming pool with tiled coping",
    },
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2024-11-12"),
  },
  {
    title: "Glen Lorne infinity pool",
    description:
      "An 11 × 4.5 m infinity-edge pool set into a sloping garden. Balanced catch tank, three heat pumps and a salt chlorination system with a remote dosing panel.",
    shortDescription: "11 × 4.5 m infinity-edge pool with heat pumps in Glen Lorne.",
    category: "infinity",
    status: "completed",
    location: "Glen Lorne, Harare",
    area: "11 × 4.5 m",
    depth: "1.5 m",
    duration: "16 weeks",
    features: ["Infinity edge", "Balance tank", "Salt chlorination", "Heat pump"],
    coverImage: {
      url: "/images/pools/infinity-portrait.jpg",
      alt: "Infinity-edge pool with a planted surround",
    },
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2024-06-20"),
  },
  {
    title: "Emerald Hill commercial deck",
    description:
      "A 25 × 12 m commercial pool for a lodge, with a deck-level balance tank, sand filtration plant, LED lighting and a weekly maintenance contract.",
    shortDescription: "25 × 12 m commercial pool and filtration plant in Emerald Hill.",
    category: "commercial",
    status: "completed",
    location: "Emerald Hill, Harare",
    area: "25 × 12 m",
    depth: "1.8 m",
    duration: "22 weeks",
    features: ["Commercial plant room", "LED lighting", "Sand filtration", "Maintenance contract"],
    coverImage: {
      url: "/images/pools/commercial-pool.jpg",
      alt: "Completed commercial pool from the coping edge",
    },
    isFeatured: true,
    isPublished: true,
    completedAt: new Date("2025-02-14"),
  },
];

export const seedProjects = async () => {
  try {
    const existing = await Project.countDocuments({});
    if (existing > 0) return;

    const admin = await User.findOne({ role: "admin" });

    await Project.insertMany(
      SEED_PROJECTS.map((project, index) => ({
        ...project,
        slug: `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
        publishedAt: project.completedAt,
        createdBy: admin?._id,
      })),
    );

    console.log(`Seeded ${SEED_PROJECTS.length} portfolio projects`);
  } catch (err) {
    console.error("Project seed error:", err.message);
  }
};

export const seedProducts = async () => {
  try {
    const existing = await Product.countDocuments({});
    if (existing > 0) return;

    const admin = await User.findOne({ role: "admin" });

    await Product.insertMany(
      SEED_PRODUCTS.map((product, index) => ({
        ...product,
        slug: `${product.sku.toLowerCase()}`,
        isPublished: true,
        publishedAt: new Date(Date.now() - index * 86_400_000),
        isFeatured: index < 4,
        createdBy: admin?._id,
      })),
    );

    console.log(`Seeded ${SEED_PRODUCTS.length} marketplace products`);
  } catch (err) {
    console.error("Product seed error:", err.message);
  }
};
