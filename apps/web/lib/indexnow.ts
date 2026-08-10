import { timingSafeEqual } from "node:crypto";

import { blogPosts } from "@/lib/blog";
import { educationalResources } from "@/lib/educational-resources";
import {
  CANONICAL_PATHS,
  MARKETING_ORIGIN,
  marketingUrl,
} from "@/lib/marketing-site";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_HOST = new URL(MARKETING_ORIGIN).host;

/** IndexNow allows at most 10,000 URLs per request. */
export const INDEXNOW_MAX_URLS = 10_000;

export interface IndexNowSubmitResult {
  error?: string;
  ok: boolean;
  status: number;
  submitted: number;
  urlList: string[];
}

export const getIndexNowKey = (): string | null => {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key || null;
};

export const getIndexNowKeyLocation = (key: string): string =>
  marketingUrl(`/${key}.txt`);

/** Absolute marketing URLs eligible for IndexNow / sitemap-style discovery. */
export const getMarketingIndexableUrls = (): string[] => {
  const paths = [
    ...CANONICAL_PATHS,
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...educationalResources.map((resource) => resource.path),
  ];
  return [...new Set(paths.map((path) => marketingUrl(path)))];
};

export const getIndexNowUrls = (): string[] => getMarketingIndexableUrls();

export const isIndexNowOwnedUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === INDEXNOW_HOST;
  } catch {
    return false;
  }
};

export const authorizeIndexNowSubmit = (
  authorization: string | null,
  secret: string
): boolean => {
  const expected = Buffer.from(`Bearer ${secret}`, "utf8");
  const provided = Buffer.from(authorization ?? "", "utf8");
  if (expected.length !== provided.length) {
    return false;
  }
  return timingSafeEqual(expected, provided);
};

export const submitIndexNow = async (
  urls?: string[]
): Promise<IndexNowSubmitResult> => {
  const key = getIndexNowKey();
  if (!key) {
    return {
      error: "INDEXNOW_KEY is not configured",
      ok: false,
      status: 503,
      submitted: 0,
      urlList: [],
    };
  }

  const rawList = urls && urls.length > 0 ? urls : getIndexNowUrls();
  const urlList = [...new Set(rawList.filter(isIndexNowOwnedUrl))];

  if (urls && urls.length > 0 && urlList.length === 0) {
    return {
      error: `urlList must contain https://${INDEXNOW_HOST}/… URLs`,
      ok: false,
      status: 400,
      submitted: 0,
      urlList: [],
    };
  }

  if (urlList.length === 0) {
    return {
      error: "urlList is empty",
      ok: false,
      status: 400,
      submitted: 0,
      urlList: [],
    };
  }

  if (urlList.length > INDEXNOW_MAX_URLS) {
    return {
      error: `urlList exceeds IndexNow limit of ${INDEXNOW_MAX_URLS}`,
      ok: false,
      status: 400,
      submitted: 0,
      urlList: [],
    };
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key,
      keyLocation: getIndexNowKeyLocation(key),
      urlList,
    }),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      error: detail || `IndexNow API returned ${response.status}`,
      ok: false,
      status: response.status,
      submitted: 0,
      urlList,
    };
  }

  return {
    ok: true,
    status: response.status,
    submitted: urlList.length,
    urlList,
  };
};
