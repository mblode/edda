import { createHash, randomBytes } from "node:crypto";

// Project-scoped deploy keys. Format: `bmd_` + 43 url-safe base64 chars (32
// random bytes). The plaintext is shown to the user exactly once; the server
// stores only its SHA-256 (a fast hash is correct here — the token is
// high-entropy random, not a low-entropy password, and is looked up by hash).
const KEY_PREFIX = "bmd_";
const KEY_PREFIX_DISPLAY_LENGTH = 12;

export const generateApiKey = (): string =>
  `${KEY_PREFIX}${randomBytes(32).toString("base64url")}`;

export const hashApiKey = (key: string): string =>
  createHash("sha256").update(key).digest("hex");

// First 12 chars (`bmd_` + 8) — enough to identify a key in a list without
// revealing it.
export const getApiKeyDisplayPrefix = (key: string): string =>
  key.slice(0, KEY_PREFIX_DISPLAY_LENGTH);

export const isApiKeyToken = (token: string): boolean =>
  token.startsWith(KEY_PREFIX);
