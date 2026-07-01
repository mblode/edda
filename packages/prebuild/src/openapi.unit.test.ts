import { describe, expect, it } from "vitest";

import { parseOpenApiSpec } from "./openapi.js";

describe("parseOpenApiSpec", () => {
  it("parses a well-formed JSON spec", () => {
    const spec = parseOpenApiSpec(
      JSON.stringify({ openapi: "3.0.0", paths: { "/ping": {} } }),
      "spec.json"
    );

    expect(spec.openapi).toBe("3.0.0");
    expect(spec.paths).toEqual({ "/ping": {} });
  });

  it("accepts a spec without a paths section", () => {
    const spec = parseOpenApiSpec(
      JSON.stringify({ openapi: "3.0.0" }),
      "spec.json"
    );

    expect(spec.paths).toBeUndefined();
  });

  it("rejects a document that parses to a scalar", () => {
    expect(() => parseOpenApiSpec("42", "spec.json")).toThrow(
      /must be an object/
    );
  });

  it("rejects a document that parses to an array", () => {
    expect(() => parseOpenApiSpec("[]", "spec.json")).toThrow(
      /must be an object/
    );
  });

  it("rejects a non-record paths section", () => {
    expect(() =>
      parseOpenApiSpec(JSON.stringify({ paths: "nope" }), "spec.json")
    ).toThrow(/invalid "paths" section/);
  });
});
