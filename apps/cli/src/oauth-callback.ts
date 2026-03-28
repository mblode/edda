import { createServer } from "node:http";

import { CliError, EXIT_CODES } from "./errors.js";

interface OAuthCallbackOptions {
  redirectUrl: URL;
  expectedState: string;
  timeoutMs: number;
}

const successHtml = (): string =>
  '<!doctype html><html><head><meta charset="utf-8"/><title>Blode Docs CLI</title></head><body><h2>Logged in! You can close this tab.</h2></body></html>';

const escapeHtml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const errorHtml = (message: string): string =>
  `<!doctype html><html><head><meta charset="utf-8"/><title>Blode Docs CLI</title></head><body><h2>Login failed</h2><p>${escapeHtml(message)}</p></body></html>`;

export const waitForOAuthCode = async (
  options: OAuthCallbackOptions
): Promise<string> =>
  // oxlint-disable-next-line eslint-plugin-promise/avoid-new -- wrapping callback-based HTTP server
  await new Promise<string>((resolve, reject) => {
    const host = options.redirectUrl.hostname;
    const port = Number(options.redirectUrl.port);
    const { pathname } = options.redirectUrl;

    if (!Number.isInteger(port) || port <= 0) {
      reject(
        new CliError(
          "OAuth redirect URL requires an explicit port",
          EXIT_CODES.ERROR
        )
      );
      return;
    }

    let settled = false;

    const server = createServer(() => {
      /* replaced below */
    });

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;

      server.close(() => {
        reject(
          new CliError(
            "Login timed out. Please try again.",
            EXIT_CODES.CANCELLED
          )
        );
      });
    }, options.timeoutMs);

    const finish = (result: { code?: string; error?: CliError }): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);

      server.close(() => {
        if (result.error) {
          reject(result.error);
          return;
        }

        resolve(result.code ?? "");
      });
    };

    server.removeAllListeners("request");
    server.on("request", (request, response) => {
      if (!request.url) {
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(errorHtml("Missing request URL"));
        finish({
          error: new CliError(
            "OAuth callback is missing a request URL",
            EXIT_CODES.ERROR
          ),
        });
        return;
      }

      const url = new URL(request.url, options.redirectUrl.origin);

      if (url.pathname !== pathname) {
        response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        response.end(errorHtml("Invalid callback path"));
        return;
      }

      const providerError = url.searchParams.get("error");
      if (providerError) {
        const description =
          url.searchParams.get("error_description") ?? providerError;

        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(errorHtml(description));

        finish({
          error: new CliError(
            `OAuth provider returned an error: ${description}`,
            EXIT_CODES.ERROR
          ),
        });
        return;
      }

      const state = url.searchParams.get("state");
      if (state !== options.expectedState) {
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(errorHtml("State verification failed"));

        finish({
          error: new CliError(
            "OAuth state verification failed",
            EXIT_CODES.ERROR
          ),
        });
        return;
      }

      const code = url.searchParams.get("code");
      if (!code) {
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(errorHtml("Authorization code was missing"));

        finish({
          error: new CliError(
            "OAuth callback is missing an authorization code",
            EXIT_CODES.ERROR
          ),
        });
        return;
      }

      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(successHtml());
      finish({ code });
    });

    server.on("error", (error) => {
      finish({
        error: new CliError(
          `Failed to start callback server on ${host}:${port}: ${error.message}`,
          EXIT_CODES.ERROR
        ),
      });
    });

    server.listen(port, host);
  });
