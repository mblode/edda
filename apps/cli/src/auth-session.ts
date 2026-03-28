import { BLODE_TOKEN_ENV } from "./constants.js";
import { parseJwtClaims } from "./jwt.js";
import { refreshAccessToken } from "./oauth-token.js";
import {
  clearStoredCredentials,
  readStoredApiKey,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "./storage.js";
import {
  buildOAuthUrls,
  resolveOAuthClientId,
  resolveSupabaseConfig,
  tokenResponseToStoredSession,
} from "./supabase.js";
import type { ResolvedAuthToken, StoredAuthSession } from "./types.js";

const isExpired = (session: StoredAuthSession): boolean => {
  if (!session.expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(session.expiresAt);

  if (Number.isNaN(expiresAtMs)) {
    return false;
  }

  return expiresAtMs <= Date.now();
};

const shouldRefresh = (session: StoredAuthSession): boolean => {
  if (!session.expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(session.expiresAt);

  if (Number.isNaN(expiresAtMs)) {
    return false;
  }

  return expiresAtMs - Date.now() <= 60_000;
};

const tokenFromRaw = (
  token: string,
  source: ResolvedAuthToken["source"]
): ResolvedAuthToken => {
  const claims = parseJwtClaims(token);

  const expiresAt =
    typeof claims?.exp === "number"
      ? new Date(claims.exp * 1000).toISOString()
      : null;

  return {
    expiresAt,
    source,
    token,
    user:
      claims?.sub || claims?.email
        ? { email: claims.email ?? null, id: claims.sub ?? "unknown" }
        : null,
  };
};

export const resolveAuthToken = async (
  optApiKey?: string
): Promise<ResolvedAuthToken | null> => {
  const envToken = (optApiKey ?? process.env[BLODE_TOKEN_ENV])?.trim();

  if (envToken) {
    return tokenFromRaw(envToken, optApiKey ? "flag" : "environment");
  }

  // Check for stored API key first
  const apiKey = await readStoredApiKey();
  if (apiKey) {
    return {
      expiresAt: null,
      source: "stored",
      token: apiKey.apiKey,
      user: null,
    };
  }

  // Check for stored session
  const session = await readStoredAuthSession();

  if (!session) {
    return null;
  }

  if (!(shouldRefresh(session) || isExpired(session))) {
    return {
      expiresAt: session.expiresAt,
      source: "stored",
      token: session.accessToken,
      user: session.user,
    };
  }

  // Try to refresh
  if (session.refreshToken) {
    try {
      const config = resolveSupabaseConfig();
      const { tokenUrl } = buildOAuthUrls(config);
      const clientId = resolveOAuthClientId();
      const tokenResponse = await refreshAccessToken(
        { clientId, tokenUrl },
        session.refreshToken
      );
      const updatedSession = tokenResponseToStoredSession(tokenResponse);
      await writeStoredAuthSession(updatedSession);

      return {
        expiresAt: updatedSession.expiresAt,
        source: "stored",
        token: updatedSession.accessToken,
        user: updatedSession.user,
      };
    } catch {
      // Refresh failed — fall through to expiry check
    }
  }

  if (isExpired(session)) {
    await clearStoredCredentials();
    return null;
  }

  return {
    expiresAt: session.expiresAt,
    source: "stored",
    token: session.accessToken,
    user: session.user,
  };
};

export const resolveTokenStatus = (
  token: ResolvedAuthToken
): {
  expiresInSeconds: number | null;
  expired: boolean;
} => {
  const claims = parseJwtClaims(token.token);

  if (!claims?.exp) {
    return {
      expired: false,
      expiresInSeconds: null,
    };
  }

  const expiresInSeconds = claims.exp - Math.floor(Date.now() / 1000);

  return {
    expired: expiresInSeconds <= 0,
    expiresInSeconds,
  };
};
