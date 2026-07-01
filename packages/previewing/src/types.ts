import type {
  ContentType,
  DocsOpenApiSource,
  FrontmatterByType,
  PageMode,
  SiteConfig,
} from "@repo/models";
import type { OpenApiOperation, OpenApiSpec } from "@repo/prebuild";

export type SiteConfigResult =
  | { ok: true; config: SiteConfig; warnings: string[] }
  | { ok: false; errors: string[] };

export type ContentEntry =
  | {
      kind: "entry";
      slug: string;
      title: string;
      description?: string;
      hidden?: boolean;
      type: ContentType;
      collectionId: string;
      sourcePath: string;
      relativePath: string;
      frontmatter: FrontmatterByType[ContentType];
    }
  | {
      kind: "index";
      slug: string;
      title: string;
      description?: string;
      type: ContentType;
      collectionId: string;
    };

export interface ContentIndex {
  entries: ContentEntry[];
  bySlug: Map<string, ContentEntry>;
  byCollection: Map<string, ContentEntry[]>;
  errors: string[];
}

export interface PageMetadata {
  title?: string;
  sidebarTitle?: string;
  icon?: string;
  iconType?: string;
  tag?: string;
  hidden?: boolean;
  deprecated?: boolean;
  url?: string;
  mode?: PageMode;
  noindex?: boolean;
  hideFooterPagination?: boolean;
  hideApiMarker?: boolean;
  keywords?: string[];
}

export interface SearchIndexItem {
  href?: string;
  title: string;
  path: string;
}

export interface TocItem {
  id: string;
  level: number;
  title: string;
}

export interface UtilityPage {
  content: string;
  description?: string;
  slug: string;
  title: string;
}

export interface UtilitySegment {
  pageSlugs: string[];
  slug: string;
  title: string;
}

export interface UtilityIndex {
  description?: string;
  name: string;
  pages: UtilityPage[];
  segments?: UtilitySegment[];
  slug?: string;
}

export interface UtilityArtifact {
  content: string;
  contentType: string;
  path: string;
}

export interface PrebuiltOpenApiEntry {
  identifier: string;
  operation: OpenApiOperation;
  slug: string;
  source: DocsOpenApiSource;
  sourceKey: string;
  spec: OpenApiSpec;
}
