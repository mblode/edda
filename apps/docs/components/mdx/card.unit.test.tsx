import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./card";

describe("Card", () => {
  it("renders string icon props as SVG icons instead of literal text", () => {
    const markup = renderToStaticMarkup(
      <Card icon="puzzle" title="Quickstart">
        Ship docs fast.
      </Card>
    );

    expect(markup).toContain("<svg");
    expect(markup).not.toContain(">puzzle<");
  });
});
