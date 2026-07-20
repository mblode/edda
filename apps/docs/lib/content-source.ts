import type { SiteConfig, Tenant } from "@repo/models";
import type { ContentSource } from "@repo/previewing";
import { createBlobSource, createFsSource } from "@repo/previewing";

import { getTenantDocsPath } from "./content-root";
import { getProjectTag } from "./tenants";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

const resolveAssetUrl = async (
  source: ContentSource,
  value?: string
): Promise<string | undefined> => {
  // External (http[s] or protocol-relative) URLs are used verbatim.
  if (!value || ABSOLUTE_URL_REGEX.test(value) || value.startsWith("//")) {
    return value;
  }

  // Deployment-relative assets (logo, favicon, ogImage, font CSS) may be written
  // with or without a leading slash — the CLI scaffold defaults to "/logo/*.svg"
  // and "/favicon.svg". Strip it so the manifest lookup matches; fall back to the
  // original value when the path isn't a deployment file.
  const resolved = await source.resolveUrl?.(value.replace(/^\//, ""));
  return resolved ?? value;
};

export const getTenantContentSource = (tenant: Tenant): ContentSource => {
  if (tenant.activeDeploymentManifestUrl) {
    return createBlobSource(
      tenant.activeDeploymentManifestUrl,
      getProjectTag(tenant.slug)
    );
  }

  return createFsSource(tenant.docsPath ?? getTenantDocsPath(tenant.slug));
};

export const resolveSiteConfigAssets = async (
  config: SiteConfig,
  source: ContentSource
): Promise<SiteConfig> => {
  const [favicon, fontCssUrl, darkLogo, lightLogo, ogImage] = await Promise.all(
    [
      resolveAssetUrl(source, config.favicon),
      resolveAssetUrl(source, config.fonts?.cssUrl),
      resolveAssetUrl(source, config.logo?.dark),
      resolveAssetUrl(source, config.logo?.light),
      resolveAssetUrl(source, config.metadata?.ogImage),
    ]
  );

  return {
    ...config,
    favicon,
    fonts: config.fonts
      ? {
          ...config.fonts,
          cssUrl: fontCssUrl,
        }
      : config.fonts,
    logo: config.logo
      ? {
          ...config.logo,
          dark: darkLogo,
          light: lightLogo,
        }
      : config.logo,
    metadata: config.metadata
      ? {
          ...config.metadata,
          ogImage,
        }
      : config.metadata,
  };
};
