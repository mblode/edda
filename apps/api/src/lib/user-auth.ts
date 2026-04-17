import type { UserRecord } from "@repo/db";
import { errors as joseErrors, jwtVerify } from "jose";

import { supabaseJwtSecret, supabaseUrl } from "./config";
import { userDao } from "./db";
import { getBearerToken } from "./header-auth";
import { logWarn } from "./logger";

const isJwt = (token: string): boolean => token.startsWith("eyJ");

const FALLBACK_EMAIL_DOMAIN = "users.blode.invalid";
const USER_CACHE_TTL_MS = 30_000;

const fallbackEmail = (authId: string) => `${authId}@${FALLBACK_EMAIL_DOMAIN}`;

let cachedSecret: Uint8Array | null = null;
const getJwtSecret = (): Uint8Array | null => {
  if (!supabaseJwtSecret) {
    return null;
  }
  if (!cachedSecret) {
    cachedSecret = new TextEncoder().encode(supabaseJwtSecret);
  }
  return cachedSecret;
};

const getExpectedIssuer = (): string | undefined =>
  supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/auth/v1` : undefined;

interface SupabaseAccessTokenClaims {
  sub?: unknown;
  email?: unknown;
  user_metadata?: {
    full_name?: unknown;
    name?: unknown;
  };
}

const asString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

interface UserCacheEntry {
  expiresAt: number;
  record: UserRecord;
}

const userCache = new Map<string, UserCacheEntry>();

const getCachedUser = (authId: string): UserRecord | null => {
  const entry = userCache.get(authId);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt < Date.now()) {
    userCache.delete(authId);
    return null;
  }
  return entry.record;
};

const setCachedUser = (authId: string, record: UserRecord) => {
  userCache.set(authId, {
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
    record,
  });
};

const resolveUserRecord = async (claims: {
  authId: string;
  email: string | null;
  name: string | null;
}): Promise<UserRecord> => {
  const existing = await userDao.getByAuthId(claims.authId);
  if (existing) {
    return existing;
  }
  // Cold path: user signed in before the OAuth callback upsert shipped, or
  // their row was manually deleted. Recreate it so the request can proceed.
  logWarn("Upserting missing user row during API request.", {
    authId: claims.authId,
  });
  return userDao.upsertByAuthId({
    authId: claims.authId,
    email: claims.email ?? fallbackEmail(claims.authId),
    name: claims.name,
  });
};

export const authenticateUser = async (
  headers: Record<string, unknown>
): Promise<UserRecord | null> => {
  const token = getBearerToken(headers);
  if (!token || !isJwt(token)) {
    return null;
  }

  const secret = getJwtSecret();
  if (!secret) {
    logWarn("SUPABASE_JWT_SECRET not configured; rejecting user token.", null);
    return null;
  }

  let claims: SupabaseAccessTokenClaims;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      audience: "authenticated",
      clockTolerance: "5s",
      issuer: getExpectedIssuer(),
    });
    claims = payload as SupabaseAccessTokenClaims;
  } catch (error) {
    if (!(error instanceof joseErrors.JOSEError)) {
      throw error;
    }
    return null;
  }

  const authId = asString(claims.sub);
  if (!authId) {
    return null;
  }

  const cached = getCachedUser(authId);
  if (cached) {
    return cached;
  }

  const email = asString(claims.email)?.trim().toLowerCase() ?? null;
  const name =
    asString(claims.user_metadata?.full_name) ??
    asString(claims.user_metadata?.name);

  const record = await resolveUserRecord({ authId, email, name });
  setCachedUser(authId, record);
  return record;
};
