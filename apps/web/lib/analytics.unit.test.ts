import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

import { afterEach, describe, expect, it, vi } from "vitest";

import { trackSectionViews } from "./analytics";

type Notify = (entries: unknown[]) => void;

interface FakeSection {
  dataset: { section: string };
  getAttribute: (name: string) => string | null;
  getBoundingClientRect: () => { bottom: number; top: number };
}

const VIEWPORT = 800;

const section = (id: string, top: number): FakeSection => ({
  dataset: { section: id },
  getAttribute: (name) => (name === "data-section" ? id : null),
  getBoundingClientRect: () => ({ bottom: top + 600, top }),
});

/**
 * A stand-in IntersectionObserver that lets a test scroll a section in. A
 * function constructor that returns the instance, so `new` works on it.
 */
const fakeObserver = () => {
  const observed = new Set<unknown>();
  const state: { notify: Notify | null } = { notify: null };
  const FakeIntersectionObserver = function FakeIntersectionObserver(
    notify: Notify
  ) {
    state.notify = notify;
    return {
      disconnect: () => observed.clear(),
      observe: (target: unknown) => observed.add(target),
      unobserve: (target: unknown) => observed.delete(target),
    };
  };
  const show = (target: FakeSection) =>
    state.notify?.([
      {
        intersectionRatio: 0.6,
        intersectionRect: { height: 360 },
        isIntersecting: true,
        rootBounds: { height: VIEWPORT },
        target,
      },
    ]);
  return { FakeIntersectionObserver, observed, show };
};

const BrokenIntersectionObserver = function BrokenIntersectionObserver() {
  throw new Error("unsupported");
};

const asElements = (sections: FakeSection[]) =>
  sections as unknown as Element[];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackSectionViews", () => {
  it("fires once per section, and skips the hero and the first viewport", () => {
    const { FakeIntersectionObserver, observed, show } = fakeObserver();
    vi.stubGlobal("window", {
      IntersectionObserver: FakeIntersectionObserver,
      innerHeight: VIEWPORT,
    });
    const capture = vi.fn();
    const hero = section("hero", 2000);
    const onLoad = section("agent-reader", 400);
    const faq = section("faq", 3000);

    trackSectionViews(asElements([hero, onLoad, faq]), capture);

    expect([...observed]).toEqual([faq]);
    show(faq);
    show(faq);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith("faq");
  });

  it("does nothing without IntersectionObserver", () => {
    vi.stubGlobal("window", { innerHeight: VIEWPORT });
    const capture = vi.fn();
    const cleanup = trackSectionViews(
      asElements([section("faq", 3000)]),
      capture
    );
    expect(capture).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });

  it("never throws, even when the capture or the observer does", () => {
    const { FakeIntersectionObserver, show } = fakeObserver();
    vi.stubGlobal("window", {
      IntersectionObserver: FakeIntersectionObserver,
      innerHeight: VIEWPORT,
    });
    const faq = section("faq", 3000);
    trackSectionViews(asElements([faq]), () => {
      throw new Error("analytics down");
    });
    expect(() => show(faq)).not.toThrow();

    vi.stubGlobal("window", {
      IntersectionObserver: BrokenIntersectionObserver,
      innerHeight: VIEWPORT,
    });
    expect(() => trackSectionViews(asElements([faq]))).not.toThrow();
  });
});

describe("landing.js section_viewed", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "../public/landing.js"), "utf8");

  const run = (sections: FakeSection[], withObserver: boolean) => {
    const { FakeIntersectionObserver, show } = fakeObserver();
    const capture = vi.fn();
    const window: Record<string, unknown> = {
      innerHeight: VIEWPORT,
      posthog: { capture },
    };
    if (withObserver) {
      window.IntersectionObserver = FakeIntersectionObserver;
    }
    const document = {
      addEventListener: () => {
        // Clicks are not under test.
      },
      querySelectorAll: (selector: string) =>
        selector === "[data-section]" ? sections : [],
    };
    const context = createContext({
      IntersectionObserver: window.IntersectionObserver,
      document,
      window,
    });
    runInContext(source, context);
    return { capture, show };
  };

  it("fires once per section with the edda site", () => {
    const faq = section("faq", 3000);
    const { capture, show } = run([section("pricing", 100), faq], true);
    show(faq);
    show(faq);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith("section_viewed", {
      section: "faq",
      site: "edda",
    });
  });

  it("does nothing without IntersectionObserver", () => {
    const { capture } = run([section("faq", 3000)], false);
    expect(capture).not.toHaveBeenCalled();
  });

  it("never throws when posthog does", () => {
    const faq = section("faq", 3000);
    const { capture, show } = run([faq], true);
    capture.mockImplementation(() => {
      throw new Error("analytics down");
    });
    expect(() => show(faq)).not.toThrow();
  });
});
