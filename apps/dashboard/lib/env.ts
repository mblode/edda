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

// Must reference process.env.NEXT_PUBLIC_API_URL as a literal so Next.js
// inlines it into the client bundle. Dynamic access via readTrimmedEnv is
// not replaced at build time and would always be undefined on the client.
export const docsApiBase =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

export const platformRootDomain =
  readTrimmedEnv("PLATFORM_ROOT_DOMAIN") ?? "blode.md";
