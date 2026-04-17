const readTrimmedEnv = (name: string) => {
  const value = process.env[name];
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  return trimmed;
};

export const docsApiBase =
  readTrimmedEnv("NEXT_PUBLIC_API_URL") ?? "http://localhost:4000";

export const platformAssetPrefix =
  readTrimmedEnv("PLATFORM_ASSET_PREFIX") ?? "";

export const platformRootDomain =
  readTrimmedEnv("PLATFORM_ROOT_DOMAIN") ?? "blode.md";
