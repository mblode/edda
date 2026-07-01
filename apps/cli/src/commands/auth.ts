import fs from "node:fs/promises";

import { intro, log } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";
import open from "open";

import { resolveAuthToken, resolveTokenStatus } from "../auth-session.js";
import { reportCommandError } from "../command-utils.js";
import {
  BLODE_API_URL_ENV,
  CREDENTIALS_FILE,
  DEFAULT_API_URL,
  DEFAULT_OAUTH_CALLBACK_PATH,
  DEFAULT_OAUTH_CALLBACK_PORT,
  DEFAULT_OAUTH_TIMEOUT_SECONDS,
  OAUTH_CLIENT_ID,
} from "../constants.js";
import { requestJson } from "../http.js";
import { waitForOAuthCode } from "../oauth-callback.js";
import { exchangeAuthorizationCode } from "../oauth-token.js";
import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
} from "../pkce.js";
import { clearStoredCredentials, writeStoredAuthSession } from "../storage.js";
import {
  buildOAuthUrls,
  resolveSupabaseConfig,
  tokenResponseToStoredSession,
} from "../supabase.js";
import { parsePort, parsePositiveInteger } from "../validation.js";

const fetchUserEmail = async (
  apiUrl: string,
  token: string
): Promise<string | null> => {
  try {
    const user = await requestJson<{ email: string }>(
      `${apiUrl}/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } },
      "Failed to fetch user info"
    );
    return user.email;
  } catch {
    return null;
  }
};

export const registerAuthCommands = (program: Command): void => {
  program
    .command("login")
    .description("Authenticate with Blode.md via GitHub in your browser")
    .option(
      "--port <port>",
      "Loopback callback port",
      String(DEFAULT_OAUTH_CALLBACK_PORT)
    )
    .option(
      "--timeout <seconds>",
      "OAuth timeout in seconds",
      String(DEFAULT_OAUTH_TIMEOUT_SECONDS)
    )
    .option("--no-open", "Print URL instead of opening the browser")
    .action(
      async (options: { port: string; timeout: string; open: boolean }) => {
        intro(chalk.bold("blodemd login"));

        try {
          // OAuth 2.1 authorization code flow with PKCE (GitHub via Supabase)
          const config = resolveSupabaseConfig();
          const { authorizeUrl, tokenUrl } = buildOAuthUrls(config);
          const clientId = OAUTH_CLIENT_ID;

          const port = parsePort(options.port);
          const timeoutSeconds = parsePositiveInteger(
            options.timeout,
            "Timeout"
          );
          const redirectUrl = new URL(
            `http://127.0.0.1:${port}${DEFAULT_OAUTH_CALLBACK_PATH}`
          );

          const state = createOAuthState();
          const codeVerifier = createCodeVerifier();
          const codeChallenge = createCodeChallenge(codeVerifier);

          const authUrl = new URL(authorizeUrl);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set("client_id", clientId);
          authUrl.searchParams.set("redirect_uri", redirectUrl.toString());
          authUrl.searchParams.set("code_challenge", codeChallenge);
          authUrl.searchParams.set("code_challenge_method", "S256");
          authUrl.searchParams.set("state", state);
          authUrl.searchParams.set("scope", "openid email profile");
          // Pin provider=github so users go straight to GitHub OAuth without a picker
          authUrl.searchParams.set("provider", "github");

          const callbackPromise = waitForOAuthCode({
            expectedState: state,
            redirectUrl,
            timeoutMs: timeoutSeconds * 1000,
          });

          if (options.open) {
            log.info("Opening browser for authentication...");
            log.info(
              `If the browser doesn't open, visit: ${chalk.cyan(authUrl.toString())}`
            );
            await open(authUrl.toString());
          } else {
            log.info("Open this URL to continue authentication:");
            log.info(chalk.cyan(authUrl.toString()));
          }

          const code = await callbackPromise;

          const tokenResponse = await exchangeAuthorizationCode(
            { clientId, tokenUrl },
            code,
            codeVerifier,
            redirectUrl.toString()
          );

          const storedSession = tokenResponseToStoredSession(tokenResponse);
          await writeStoredAuthSession(storedSession);

          const email =
            storedSession.user?.email ??
            (await fetchUserEmail(
              process.env[BLODE_API_URL_ENV] ?? DEFAULT_API_URL,
              storedSession.accessToken
            ));

          if (email) {
            log.success(`Logged in as ${chalk.cyan(email)}`);
          } else {
            log.success("Logged in successfully.");
          }

          log.info("Done");
        } catch (error: unknown) {
          reportCommandError("Login failed", error);
        }
      }
    );

  program
    .command("logout")
    .description("Remove stored credentials")
    .action(async () => {
      intro(chalk.bold("blodemd logout"));

      try {
        let existing = false;
        try {
          await fs.access(CREDENTIALS_FILE);
          existing = true;
        } catch {
          existing = false;
        }

        await clearStoredCredentials();

        if (existing) {
          log.success("Credentials removed.");
        } else {
          log.info("No stored credentials found.");
        }
        log.info("Done");
      } catch (error: unknown) {
        reportCommandError("Logout failed", error);
      }
    });

  program
    .command("whoami")
    .description("Show current authentication")
    .action(async () => {
      try {
        const resolved = await resolveAuthToken();

        if (!resolved) {
          log.warn('Not logged in. Run "blodemd login" to authenticate.');
          return;
        }

        const status = resolveTokenStatus(resolved);

        const email =
          resolved.user?.email ??
          (await fetchUserEmail(
            process.env[BLODE_API_URL_ENV] ?? DEFAULT_API_URL,
            resolved.token
          ));

        if (email) {
          log.info(`Logged in as ${chalk.cyan(email)}`);
        } else {
          log.info("Logged in (could not fetch user details).");
        }

        if (resolved.expiresAt && status.expired) {
          log.warn(
            'Session has expired. Run "blodemd login" to re-authenticate.'
          );
        }
      } catch (error: unknown) {
        reportCommandError("Whoami failed", error);
      }
    });
};
