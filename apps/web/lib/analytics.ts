import posthog from "posthog-js";

export const captureEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!posthog.__loaded) {
    return;
  }
  posthog.capture(event, properties);
};
