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

/**
 * Landing sections carry `data-section="<id>"`. The value is the stable
 * `section` property on `section_viewed`, so rename one only on purpose.
 */
export const SECTION_ATTRIBUTE = "data-section";

/** Share of the section, or of the viewport for a tall one, that counts. */
const SECTION_VISIBLE_SHARE = 0.5;
const SECTION_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5];

export const captureSectionViewed = (section: string): void =>
  captureEvent(LANDING_EVENTS.sectionViewed, {
    section,
    site: ANALYTICS_SITE,
  });

const noop = (): void => {
  // Nothing to clean up.
};

/**
 * Sends `section_viewed {site, section}` once per section per page view, the
 * first time half of it (or half the viewport, for a section taller than two
 * viewports) is on screen. Skips the hero and anything already in view when
 * this runs, so the count is sections a reader scrolled to. Returns a cleanup.
 *
 * Does nothing without IntersectionObserver and never throws. `public/landing.js`
 * mirrors this for the React-free blode.co/edda page.
 */
export const trackSectionViews = (
  sections: Iterable<Element>,
  capture: (section: string) => void = captureSectionViewed
): (() => void) => {
  try {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return noop;
    }
    const seen = new Set<string>();
    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          try {
            const id = entry.target.getAttribute(SECTION_ATTRIBUTE);
            const viewport = entry.rootBounds?.height ?? window.innerHeight;
            const visible =
              entry.intersectionRatio >= SECTION_VISIBLE_SHARE ||
              entry.intersectionRect.height >= viewport * SECTION_VISIBLE_SHARE;
            if (!(id && entry.isIntersecting && visible) || seen.has(id)) {
              continue;
            }
            seen.add(id);
            observer.unobserve(entry.target);
            capture(id);
          } catch {
            // One bad entry must not stop the others.
          }
        }
      },
      { threshold: SECTION_THRESHOLDS }
    );
    for (const section of sections) {
      const id = section.getAttribute(SECTION_ATTRIBUTE);
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (id && id !== "hero" && !inView && !seen.has(id)) {
        observer.observe(section);
      }
    }
    return () => {
      try {
        observer.disconnect();
      } catch {
        // Already gone.
      }
    };
  } catch {
    return noop;
  }
};
