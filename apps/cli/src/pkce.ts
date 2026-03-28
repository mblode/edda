import { createHash, randomBytes } from "node:crypto";

export const createOAuthState = (): string => randomBytes(24).toString("hex");

export const createCodeVerifier = (): string =>
  randomBytes(64).toString("base64url");

export const createCodeChallenge = (verifier: string): string =>
  createHash("sha256").update(verifier).digest().toString("base64url");
