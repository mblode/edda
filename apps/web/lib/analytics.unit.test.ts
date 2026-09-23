import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

type Notify = (entries: unknown[]) => void;

interface FakeSection {
  dataset: { section: string };
  getBoundingClientRect: () => { bottom: number; top: number };
}

const VIEWPORT = 800;

const section = (id: string, top: number): FakeSection => ({
  dataset: { section: id },
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

describe("landing.js section_viewed", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, "../public/landing.js"), "utf8");

  const run = (sections: FakeSection[], withObserver: boolean) => {
    const { FakeIntersectionObserver, observed, show } = fakeObserver();
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
    return { capture, observed, show };
  };

  it("fires once per section, skipping the hero and the first viewport", () => {
    const faq = section("faq", 3000);
    const { capture, observed, show } = run(
      [section("hero", 2000), section("pricing", 100), faq],
      true
    );
    expect([...observed]).toEqual([faq]);
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
