import { posthog } from "posthog-js";

export const captureEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!posthog.__loaded) {
    return;
  }
  posthog.capture(event, properties);
};

/** `site` property on every landing event, shared across the product sites. */
export const ANALYTICS_SITE = "edda";

/**
 * Landing event contract. Existing names (`signup_intent_selected`,
 * `login_intent_selected`, `documentation_command_copied`) stay as they are.
 *
 * blode.co/edda serves the landing HTML without React, so the landing fires
 * these from `public/landing.js` through `window.posthog`. Keep the names and
 * property keys there identical to this list.
 */
export const LANDING_EVENTS = {
  ctaClicked: "cta_clicked",
  demoOpened: "demo_opened",
  faqOpened: "faq_opened",
  installCommandCopied: "install_command_copied",
  sectionViewed: "section_viewed",
} as const;

export const captureCtaClicked = (location: string, label: string): void =>
  captureEvent(LANDING_EVENTS.ctaClicked, {
    label,
    location,
    site: ANALYTICS_SITE,
  });
