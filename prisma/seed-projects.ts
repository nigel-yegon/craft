// prisma/seed-projects.ts
//
// Populates the portfolio with sample projects.
// Cover images are expected at public/images/projects/<slug>.jpg
// (or .webp). Galleries reference <slug>-1.jpg, <slug>-2.jpg, etc.

import type { PrismaClient } from "./prisma/generated/prisma/client";

type SeedProject = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "ARCHIVED";
  category: "Brand" | "Digital" | "Spaces" | "Campaigns" | "Print";
  clientName: string;
  clientContact?: string;
  clientIndustry?: string;
  costKes?: number;
  durationWeeks?: number;
  startDate?: string;
  endDate?: string;
  processes: string[];
  technologies: string[];
  coverImage?: string;
  galleryImages?: string[];
  featured?: boolean;
  published?: boolean;
};

const SEED_PROJECTS: SeedProject[] = [
  // ─── 1. Tour Kenya / NTSP ────────────────────────────────────────
  {
    slug: "tour-kenya-ntsp",
    title: "Tour Kenya — National Tourism Service Portal",
    summary:
      "A national tourism platform for Kenya, bringing circuits, parks, events, and travel stories into one unified digital experience.",
    description:
      "Tour Kenya (NTSP) is the flagship public-facing portal for the Kenya Tourism Board. We designed and built a national platform that consolidates tourism circuits, national parks, event calendars, and editorial travel content into a single discovery experience.\n\nThe portal connects travelers with verified tour operators, surfaces seasonal highlights, and provides a consistent brand voice for Kenya as a destination. The build prioritised performance, multilingual readiness, and accessibility for international audiences on low-bandwidth connections.\n\nThe visual language centres on Kenya's landscapes — ivory, olive, and warm terracotta — paired with a rigorous editorial grid and cinematic imagery.",
    status: "COMPLETED",
    category: "Digital",
    clientName: "Kenya Tourism Board",
    clientContact: "info@tourkenya.go.ke",
    clientIndustry: "Government / Tourism",
    costKes: 18500000,
    durationWeeks: 52,
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    processes: [
      "Stakeholder interviews across KTB, county tourism boards, and tour operators",
      "Information architecture and content inventory",
      "Design system: typography, colour, iconography, and component library",
      "Editorial and photography direction",
      "Performance-first front-end architecture",
      "Accessibility audit and multilingual readiness",
      "QA, training, and phased rollout",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Vercel",
      "Cloudinary",
    ],
    coverImage: "/images/projects/tour-kenya-ntsp.jpg",
    galleryImages: [
      "/images/projects/tour-kenya-ntsp-1.jpg",
      "/images/projects/tour-kenya-ntsp-2.jpg",
      "/images/projects/tour-kenya-ntsp-3.jpg",
    ],
    featured: true,
    published: true,
  },

  // ─── 2. Eldoret City ─────────────────────────────────────────────
  {
    slug: "eldoret-city-portal",
    title: "City of Eldoret — Official Municipal Portal",
    summary:
      "A citizen-facing municipal platform for permits, land rates, bids, investment briefs, and public participation in the City of Eldoret.",
    description:
      "The City of Eldoret is a new municipality in Uasin Gishu County. We were engaged to design and build its official digital presence — a platform that treats citizens, investors, and city staff as equally important audiences.\n\nThe portal handles the full lifecycle of city services: applying for permits, submitting land rate enquiries, viewing open bids, exploring investment portfolios, and participating in planning consultations. Each service has its own tailored workflow, form design, and SLA.\n\nWe worked closely with county ICT and communications teams to make the platform robust against connectivity variability while keeping the interface warm and civic rather than bureaucratic.",
    status: "IN_PROGRESS",
    category: "Digital",
    clientName: "County Government of Uasin Gishu",
    clientContact: "info@eldoretcity.go.ke",
    clientIndustry: "Government / Municipal",
    costKes: 12500000,
    durationWeeks: 40,
    startDate: "2025-03-01",
    processes: [
      "Service mapping with county departments",
      "Form design and citizen journey modelling",
      "Design system aligned to national gov identity standards",
      "Backend workflow engine for permits and rates",
      "Public participation module",
      "Accessibility audit (WCAG AA)",
      "Training and change management for county staff",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Auth.js",
      "Vercel",
      "Sentry",
    ],
    coverImage: "/images/projects/eldoret-city-portal.jpg",
    galleryImages: [
      "/images/projects/eldoret-city-portal-1.jpg",
      "/images/projects/eldoret-city-portal-2.jpg",
    ],
    featured: true,
    published: true,
  },

  // ─── 3. Baridi ──────────────────────────────────────────────────
  {
    slug: "baridi-brand-identity",
    title: "Baridi — Brand Identity & E-commerce",
    summary:
      "A complete identity and commerce platform for a Kenyan natural cooling brand — from wordmark to web store.",
    description:
      "Baridi is a Kenyan brand focused on natural, sustainable cooling solutions for homes and hospitality. We built the identity from the ground up: naming architecture, wordmark, colour system, packaging, and a full e-commerce platform.\n\nThe visual language leans on cool tones (dusty blue, sage, ivory) and a clean geometric wordmark that survives both small packaging contexts and large-format signage. The commerce platform ships with local payment, delivery tracking, and a lightweight CMS for the team to manage product releases.",
    status: "COMPLETED",
    category: "Brand",
    clientName: "Baridi Ltd",
    clientContact: "hello@baridi.co.ke",
    clientIndustry: "Consumer / Retail",
    costKes: 3800000,
    durationWeeks: 20,
    startDate: "2024-06-01",
    endDate: "2024-10-15",
    processes: [
      "Category audit and competitive positioning",
      "Naming and verbal identity",
      "Visual identity: wordmark, colour, typography",
      "Packaging design and print production",
      "E-commerce platform design and build",
      "Photography direction",
      "Launch campaign assets",
    ],
    technologies: ["Next.js", "Shopify", "Figma", "Tailwind CSS", "Sanity"],
    coverImage: "/images/projects/baridi-brand-identity.jpg",
    galleryImages: [
      "/images/projects/baridi-brand-identity-1.jpg",
      "/images/projects/baridi-brand-identity-2.jpg",
      "/images/projects/baridi-brand-identity-3.jpg",
    ],
    featured: true,
    published: true,
  },

  // ─── 4. Wilcom ──────────────────────────────────────────────────
  {
    slug: "wilcom-corporate-site",
    title: "Wilcom — Corporate Website",
    summary:
      "A corporate digital presence for one of Kenya's leading engineering and construction groups.",
    description:
      "Wilcom is a multi-disciplinary engineering group operating across construction, energy, and infrastructure. We redesigned their corporate website to reflect the scale of their portfolio and the rigour of their delivery.\n\nThe site is organised around capability (what we do), track record (what we've built), and people (who runs it). Each project includes technical facts, timelines, and client attribution. The tone is restrained — polished imagery, generous whitespace, and a strict typographic hierarchy.",
    status: "COMPLETED",
    category: "Digital",
    clientName: "Wilcom Group",
    clientContact: "info@wilcom.co.ke",
    clientIndustry: "Engineering / Construction",
    costKes: 2950000,
    durationWeeks: 16,
    startDate: "2024-09-01",
    endDate: "2024-12-20",
    processes: [
      "Content audit and information architecture",
      "Corporate identity refinement",
      "Photography commissioning",
      "Design and build of the site",
      "Case study framework",
      "Performance and accessibility audit",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Sanity", "Vercel"],
    coverImage: "/images/projects/wilcom-corporate-site.jpg",
    galleryImages: ["/images/projects/wilcom-corporate-site-1.jpg"],
    featured: false,
    published: true,
  },

  // ─── 5. Sarova Hotels ──────────────────────────────────────────
  {
    slug: "sarova-digital-campaign",
    title: "Sarova Hotels — Seasonal Campaign",
    summary:
      "A multi-channel seasonal campaign for a Kenyan hospitality group across print, digital, and in-property.",
    description:
      "Sarova Hotels needed a seasonal campaign that worked across their portfolio of city hotels, lodges, and beach resorts — without diluting each property's character. We designed a modular campaign system: a master identity for the season, plus per-property adaptations for imagery, colour, and typography.\n\nThe campaign ran across OOH, print, social, email, and in-property collateral, with a shared photographic library and copy framework so each property could publish independently while staying coherent.",
    status: "COMPLETED",
    category: "Campaigns",
    clientName: "Sarova Hotels & Resorts",
    clientContact: "marketing@sarovahotels.com",
    clientIndustry: "Hospitality",
    costKes: 4200000,
    durationWeeks: 12,
    startDate: "2025-01-10",
    endDate: "2025-04-05",
    processes: [
      "Campaign concept and messaging architecture",
      "Master identity design",
      "Per-property adaptations",
      "Photography direction and production",
      "Print production",
      "Digital asset kit",
      "Media rollout and reporting",
    ],
    technologies: ["Figma", "Adobe Photoshop", "Adobe InDesign", "After Effects"],
    coverImage: "/images/projects/sarova-digital-campaign.jpg",
    galleryImages: [
      "/images/projects/sarova-digital-campaign-1.jpg",
      "/images/projects/sarova-digital-campaign-2.jpg",
    ],
    featured: false,
    published: true,
  },

  // ─── 6. Java House ─────────────────────────────────────────────
  {
    slug: "java-house-loyalty-redesign",
    title: "Java House — Loyalty Experience Redesign",
    summary:
      "An in-flight redesign of the Java House loyalty app experience — from onboarding through redemption.",
    description:
      "Java House is Kenya's largest coffee chain. We're rebuilding the loyalty experience so rewards feel earned and visible, not buried in a menu.\n\nThe engagement covers the full customer journey: app onboarding, points earning, redemption at the till, and ongoing engagement via notifications. We're working with the Java House product and CX teams on a phased rollout: research → wireframes → design system → high-fidelity → engineering handoff.",
    status: "IN_PROGRESS",
    category: "Digital",
    clientName: "Java House Africa",
    clientContact: "product@javahouseafrica.com",
    clientIndustry: "Food & Beverage",
    costKes: 5600000,
    durationWeeks: 24,
    startDate: "2025-05-01",
    processes: [
      "Customer research and journey mapping",
      "Loyalty mechanic design",
      "Wireframes and interaction design",
      "Design system extension",
      "Engineering handoff and QA",
    ],
    technologies: ["Figma", "React Native", "Storybook", "TypeScript"],
    coverImage: "/images/projects/java-house-loyalty-redesign.jpg",
    featured: false,
    published: true,
  },

  // ─── 7. Kenya Breweries ────────────────────────────────────────
  {
    slug: "kenya-breweries-brand-refresh",
    title: "Kenya Breweries — Portfolio Brand Refresh",
    summary:
      "A disciplined refresh of a flagship Kenyan beverage brand — keeping recognition while sharpening modernity.",
    description:
      "Kenya Breweries engaged us for a careful brand refresh of one of its flagship products. The brief was narrow but hard: modernise the identity for younger audiences without losing the recognition built over decades.\n\nWe worked through multiple rounds of testing, refining the wordmark, label proportions, and colour fidelity. The result shipped across packaging, OOH, and digital.",
    status: "COMPLETED",
    category: "Brand",
    clientName: "Kenya Breweries Limited",
    clientIndustry: "Beverages",
    costKes: 6800000,
    durationWeeks: 28,
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    processes: [
      "Heritage audit and recognition research",
      "Wordmark refinement",
      "Label and packaging system",
      "Colour fidelity testing",
      "Production and pre-press",
      "OOH and digital adaptation",
    ],
    technologies: ["Adobe Illustrator", "Adobe InDesign", "Esko", "Figma"],
    coverImage: "/images/projects/kenya-breweries-brand-refresh.jpg",
    featured: false,
    published: true,
  },

  // ─── 8. Nakumatt Legacy ────────────────────────────────────────
  {
    slug: "nakumatt-legacy-brand-archive",
    title: "Nakumatt Legacy — Brand Archive",
    summary:
      "A digital archive preserving the visual history of one of East Africa's most iconic retail brands.",
    description:
      "The Nakumatt name has a place in Kenyan retail history. We were commissioned by a private foundation to build a careful digital archive of the brand's visual record — packaging, signage, store design, advertising, and internal documents.\n\nThe archive is currently paused pending additional archival material.",
    status: "ARCHIVED",
    category: "Digital",
    clientName: "Kenyan Retail Heritage Foundation",
    clientIndustry: "Culture / Non-profit",
    costKes: 1800000,
    durationWeeks: 10,
    startDate: "2023-06-01",
    endDate: "2023-08-15",
    processes: [
      "Material sourcing and rights clearance",
      "Scanning and restoration",
      "Archive metadata schema",
      "Read-only archive platform",
      "Editorial captions",
    ],
    technologies: ["Next.js", "PostgreSQL", "Cloudinary", "Vercel"],
    coverImage: "/images/projects/nakumatt-legacy-brand-archive.jpg",
    featured: false,
    published: false,
  },

  // ─── 9. Kigali Coffee ──────────────────────────────────────────
  {
    slug: "kigali-coffee-ecommerce",
    title: "Kigali Coffee — E-commerce & Subscription",
    summary:
      "A planned e-commerce platform for a specialty Rwandan coffee cooperative, with a subscription model and origin stories.",
    description:
      "Kigali Coffee is a Rwandan specialty coffee cooperative selling direct to consumers in Kenya, Rwanda, and internationally. We've been engaged to design and build a subscription-led e-commerce platform that tells the story of each origin, farm, and harvest.\n\nThe engagement is in planning. Scope includes a subscription engine, wholesale portal, and a per-lot storytelling module.",
    status: "PLANNED",
    category: "Digital",
    clientName: "Kigali Coffee Cooperative",
    clientIndustry: "Agriculture / Retail",
    durationWeeks: 20,
    startDate: "2026-01-15",
    processes: [
      "Cooperative interviews and origin mapping",
      "Subscription model design",
      "E-commerce platform design",
      "Wholesale portal design",
      "Build and launch",
    ],
    technologies: ["Next.js", "Shopify", "Figma", "Sanity"],
    coverImage: "/images/projects/kigali-coffee-ecommerce.jpg",
    featured: false,
    published: true,
  },

  // ─── 10. Strathmore ────────────────────────────────────────────
  {
    slug: "strathmore-student-hub-signage",
    title: "Strathmore — Student Hub Wayfinding",
    summary:
      "Wayfinding and environmental graphics for a new student hub at Strathmore University.",
    description:
      "Strathmore University commissioned us for the interior environmental design of a new student hub — a building with a library, café, study pods, and event spaces.\n\nOur work covered wayfinding (from campus entry down to individual door plates), interior signage, and a modular poster system for events. The system was designed to remain coherent as the university expands.",
    status: "COMPLETED",
    category: "Spaces",
    clientName: "Strathmore University",
    clientIndustry: "Education",
    costKes: 3400000,
    durationWeeks: 14,
    startDate: "2024-10-01",
    endDate: "2025-01-15",
    processes: [
      "Site survey and user flow mapping",
      "Wayfinding strategy",
      "Interior signage system",
      "Environmental graphics",
      "Production and installation supervision",
    ],
    technologies: ["Figma", "Adobe Illustrator", "AutoCAD"],
    coverImage: "/images/projects/strathmore-student-hub-signage.jpg",
    galleryImages: [
      "/images/projects/strathmore-student-hub-signage-1.jpg",
      "/images/projects/strathmore-student-hub-signage-2.jpg",
    ],
    featured: false,
    published: true,
  },

  // ─── 11. Greenspoon ────────────────────────────────────────────
  {
    slug: "greenspoon-farm-to-table",
    title: "Greenspoon — Farm to Table Campaign",
    summary:
      "A print and digital campaign telling the story of a Kenyan farm-to-table food company.",
    description:
      "Greenspoon delivers organic produce from Kenyan farms to urban homes. We designed a brand campaign that follows a single delivery from farm to doorstep, told through photography, illustrated maps, and a short-film series.\n\nThe campaign ran across print (insert cards), digital (Instagram, YouTube), and in-package materials.",
    status: "COMPLETED",
    category: "Campaigns",
    clientName: "Greenspoon Kenya",
    clientIndustry: "Food / Agriculture",
    costKes: 2100000,
    durationWeeks: 8,
    startDate: "2025-02-01",
    endDate: "2025-03-28",
    processes: [
      "Narrative and messaging",
      "Photography commission",
      "Short film production",
      "Print and digital asset production",
      "Campaign rollout",
    ],
    technologies: ["Figma", "Adobe Photoshop", "Premiere Pro", "Instagram Ads"],
    coverImage: "/images/projects/greenspoon-farm-to-table.jpg",
    galleryImages: [
      "/images/projects/greenspoon-farm-to-table-1.jpg",
      "/images/projects/greenspoon-farm-to-table-2.jpg",
    ],
    featured: false,
    published: true,
  },

  // ─── 12. Craft Labs ────────────────────────────────────────────
  {
    slug: "craft-labs-design-system",
    title: "Craft Labs — Internal Design System",
    summary:
      "An internal design system and component library powering Craft Studios' own products and client work.",
    description:
      "Craft Labs is our internal R&D practice. We're building a shared design system — components, tokens, documentation, and Figma libraries — used across client engagements and internal products.\n\nThe system is currently paused while we focus on client delivery. When it resumes, the goal is a single source of truth for design and engineering across every Craft project.",
    status: "ON_HOLD",
    category: "Digital",
    clientName: "Craft Studios (internal)",
    clientIndustry: "Internal R&D",
    durationWeeks: 16,
    startDate: "2025-06-01",
    processes: [
      "Token architecture",
      "Component inventory",
      "Figma library build",
      "React component library",
      "Documentation site",
    ],
    technologies: ["Figma", "React", "TypeScript", "Storybook", "Tailwind CSS"],
    coverImage: "/images/projects/craft-labs-design-system.jpg",
    featured: false,
    published: false,
  },
];

// ─── Seed function ────────────────────────────────────────────────

export async function seedProjects(prisma: PrismaClient) {
  console.log("🎨 Seeding projects (portfolio)…");

  let created = 0;
  let skipped = 0;

  for (const p of SEED_PROJECTS) {
    const existing = await prisma.project.findUnique({
      where: { slug: p.slug },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.project.create({
      data: {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        description: p.description,
        status: p.status,
        category: p.category,
        clientName: p.clientName,
        clientContact: p.clientContact ?? null,
        clientIndustry: p.clientIndustry ?? null,
        costKes: p.costKes ?? null,
        durationWeeks: p.durationWeeks ?? null,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.endDate ? new Date(p.endDate) : null,
        processes: p.processes,
        technologies: p.technologies,
        coverImage: p.coverImage ?? null,
        galleryImages: p.galleryImages ?? [],
        featured: p.featured ?? false,
        published: p.published ?? false,
      },
    });
    created += 1;
  }

  console.log(`   created ${created}, skipped ${skipped} existing`);
}