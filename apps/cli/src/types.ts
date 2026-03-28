export interface DeploymentResponse {
  fileCount?: number;
  id: string;
  manifestUrl?: string;
}

export interface StoredSessionUser {
  id: string;
  email: string | null;
}

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  user: StoredSessionUser | null;
  createdAt: string;
}

export interface ApiKeyCredentials {
  type: "api-key";
  apiKey: string;
}

export interface AuthFileData {
  version: 1;
  session?: StoredAuthSession;
  apiKey?: ApiKeyCredentials;
}

export type AuthSource = "flag" | "environment" | "stored";

export interface ResolvedAuthToken {
  token: string;
  source: AuthSource;
  expiresAt: string | null;
  user: StoredSessionUser | null;
}

export interface SupabaseConfig {
  url: string;
}
