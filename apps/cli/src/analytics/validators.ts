import { InvalidArgumentError } from "commander";

const POSTHOG_PROJECT_KEY_REGEX = /^phc_[A-Za-z0-9]{20,}$/;

export const parsePosthogProjectKey = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith("phx_")) {
    throw new InvalidArgumentError(
      "Personal API keys (phx_) are not supported. Use the project API key (phc_)."
    );
  }
  if (!POSTHOG_PROJECT_KEY_REGEX.test(trimmed)) {
    throw new InvalidArgumentError(
      "PostHog project keys start with phc_ followed by 20+ characters."
    );
  }
  return trimmed;
};

export const parsePosthogHost = (value: string): string => {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") {
      throw new InvalidArgumentError("PostHog host must use https://");
    }
  } catch (error) {
    if (error instanceof InvalidArgumentError) {
      throw error;
    }
    throw new InvalidArgumentError("PostHog host must be a valid URL.");
  }
  return trimmed;
};

export const parseProvider = (value: string): "posthog" => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "posthog") {
    return normalized;
  }
  throw new InvalidArgumentError(
    `Unknown provider "${value}". Expected "posthog".`
  );
};
