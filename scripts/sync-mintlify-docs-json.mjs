#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_ROOT = path.resolve("apps/docs/content");
const SITE_CONFIG_FILE = "site.json";
const MINTLIFY_CONFIG_FILE = "docs.json";

const readJson = async (filePath) =>
  JSON.parse(await fs.readFile(filePath, "utf8"));

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const pickColors = (colors) => {
  if (!colors?.primary) {
    throw new Error("Mintlify requires colors.primary.");
  }

  const nextColors = { primary: colors.primary };

  if (colors.light) {
    nextColors.light = colors.light;
  }

  if (colors.dark) {
    nextColors.dark = colors.dark;
  }

  return nextColors;
};

const mapLogo = (logo) => {
  if (!logo) {
    return;
  }

  if (typeof logo === "string") {
    return logo;
  }

  const nextLogo = {};

  if (logo.light) {
    nextLogo.light = logo.light;
  }

  if (logo.dark) {
    nextLogo.dark = logo.dark;
  }

  if (logo.href) {
    nextLogo.href = logo.href;
  }

  if (nextLogo.light && nextLogo.dark) {
    return nextLogo;
  }
};

const mapFonts = (fonts) => {
  if (!fonts) {
    return;
  }

  const nextFonts = {};

  if (fonts.body) {
    nextFonts.body = { family: fonts.body };
  }

  if (fonts.heading) {
    nextFonts.heading = { family: fonts.heading };
  }

  return Object.keys(nextFonts).length ? nextFonts : undefined;
};

const mapNavbar = (navigation) => {
  const links = navigation?.global?.links;

  if (!Array.isArray(links) || links.length === 0) {
    return;
  }

  return {
    links: links.map((link) => ({
      href: link.href,
      label: link.label,
    })),
  };
};

const mapNavigationGroup = (group) => {
  const nextGroup = {
    group: group.group,
  };

  if (group.expanded !== undefined) {
    nextGroup.expanded = group.expanded;
  }

  if (group.openapi) {
    nextGroup.openapi = group.openapi;
  }

  if (Array.isArray(group.pages) && group.pages.length > 0) {
    nextGroup.pages = [...group.pages];
  }

  return nextGroup;
};

const getDocsNavigation = (siteConfig) => {
  const docsCollection = siteConfig.collections?.find(
    (collection) => collection.type === "docs"
  );

  return docsCollection?.navigation ?? siteConfig.navigation;
};

const mapNavigation = (siteConfig) => {
  const navigation = getDocsNavigation(siteConfig);

  if (!navigation) {
    throw new Error("Mintlify requires navigation.");
  }

  const nextNavigation = {};

  if (Array.isArray(navigation.groups) && navigation.groups.length > 0) {
    nextNavigation.groups = navigation.groups.map(mapNavigationGroup);
  }

  if (Array.isArray(navigation.pages) && navigation.pages.length > 0) {
    nextNavigation.pages = [...navigation.pages];
  }

  if (Array.isArray(navigation.hidden) && navigation.hidden.length > 0) {
    nextNavigation.hidden = [...navigation.hidden];
  }

  if (!nextNavigation.groups && !nextNavigation.pages) {
    throw new Error("Mintlify navigation must include groups or pages.");
  }

  return nextNavigation;
};

const mapSiteConfigToMintlify = (siteConfig) => {
  const nextConfig = {
    $schema: "https://mintlify.com/docs.json",
    colors: pickColors(siteConfig.colors),
    name: siteConfig.name,
    navigation: mapNavigation(siteConfig),
    theme: siteConfig.theme ?? "mint",
  };

  if (siteConfig.description) {
    nextConfig.description = siteConfig.description;
  }

  const logo = mapLogo(siteConfig.logo);
  if (logo) {
    nextConfig.logo = logo;
  }

  const fonts = mapFonts(siteConfig.fonts);
  if (fonts) {
    nextConfig.fonts = fonts;
  }

  const navbar = mapNavbar(siteConfig.navigation);
  if (navbar) {
    nextConfig.navbar = navbar;
  }

  return nextConfig;
};

const syncMintlifyDocsJson = async () => {
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const tenantRoot = path.join(CONTENT_ROOT, entry.name);
    const siteConfigPath = path.join(tenantRoot, SITE_CONFIG_FILE);

    try {
      await fs.access(siteConfigPath);
    } catch {
      continue;
    }

    const siteConfig = await readJson(siteConfigPath);
    const mintlifyConfig = mapSiteConfigToMintlify(siteConfig);
    const mintlifyConfigPath = path.join(tenantRoot, MINTLIFY_CONFIG_FILE);

    await writeJson(mintlifyConfigPath, mintlifyConfig);
    console.log(`Synced ${path.relative(process.cwd(), mintlifyConfigPath)}`);
  }
};

await syncMintlifyDocsJson();
