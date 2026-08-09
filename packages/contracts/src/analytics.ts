import { z } from "zod";

const POSTHOG_PROJECT_KEY_REGEX = /^phc_[A-Za-z0-9]{20,}$/;

export const ProjectAnalyticsPosthogSchema = z.object({
  host: z.string().url().optional(),
  projectKey: z
    .string()
    .regex(
      POSTHOG_PROJECT_KEY_REGEX,
      "PostHog project keys start with phc_. Personal API keys (phx_) are not supported."
    ),
});
export type ProjectAnalyticsPosthog = z.infer<
  typeof ProjectAnalyticsPosthogSchema
>;

export const ProjectAnalyticsSchema = z.object({
  posthog: ProjectAnalyticsPosthogSchema.optional(),
});
export type ProjectAnalytics = z.infer<typeof ProjectAnalyticsSchema>;
