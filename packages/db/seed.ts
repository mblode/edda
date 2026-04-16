/**
 * Seed script for Blode.md.
 * Creates a seed user and sample projects.
 *
 * Usage:
 *   DATABASE_URL=... tsx packages/db/seed.ts
 */
import { DomainDao, ProjectDao, UserDao } from "./src/index.js";

const SEED_USER = {
  authId: "seed-user-00000000-0000-0000-0000-000000000000",
  email: "seed@blode.md",
  name: "Seed User",
};

const PROJECTS = [
  {
    description: "Real-time sync library for local-first applications",
    name: "StrataSync",
    slug: "stratasync",
  },
  {
    description: "Task management CLI and app",
    name: "DoneBear",
    slug: "donebear",
  },
  {
    description: "Universal Markdown toolkit",
    name: "AllMD",
    slug: "allmd",
  },
  {
    description: "Share anything, beautifully",
    name: "Shareful",
    slug: "shareful",
  },
  {
    description: "Drag-and-drop grid layout library",
    name: "DnD Grid",
    slug: "dnd-grid",
  },
  {
    description: "Example documentation site showcasing blode.md features.",
    name: "Example",
    slug: "example",
  },
  {
    description: "Blode.md product documentation.",
    name: "Docs",
    slug: "docs",
  },
] as const;

const CUSTOM_DOMAINS: Record<string, { hostname: string; pathPrefix: string }> =
  {
    allmd: { hostname: "allmd.blode.co", pathPrefix: "/docs" },
  };

const userDao = new UserDao();
const projectDao = new ProjectDao();
const domainDao = new DomainDao();

console.log("Seeding Blode.md...\n");

const user = await userDao.upsertByAuthId(SEED_USER);
console.log(`  [user] ${user.email} (id: ${user.id})\n`);

for (const proj of PROJECTS) {
  const existing = await projectDao.getBySlugUnique(proj.slug);
  if (existing) {
    console.log(`  [skip] ${proj.slug} — already exists (id: ${existing.id})`);
    continue;
  }

  const project = await projectDao.create({
    deploymentName: proj.slug,
    description: proj.description,
    name: proj.name,
    slug: proj.slug,
    userId: user.id,
  });

  const customDomain = CUSTOM_DOMAINS[proj.slug];
  if (customDomain) {
    const existingDomain = await domainDao.getByHostname(customDomain.hostname);
    if (!existingDomain) {
      await domainDao.create({
        hostname: customDomain.hostname,
        pathPrefix: customDomain.pathPrefix,
        projectId: project.id,
        status: "valid_configuration",
      });
      console.log(
        `  [ok]   domain: ${customDomain.hostname}${customDomain.pathPrefix}`
      );
    }
  }

  console.log(`  [ok]   ${proj.slug}`);
  console.log(`         id:  ${project.id}`);
  console.log(`         url: https://${proj.slug}.blode.md\n`);
}

console.log("Done. Users authenticate via GitHub — no API keys needed.");
process.exit(0);
