import { describe, expect, it } from "vitest";

import { getRequestHost, isReservedPath, isRootRuntimeHost } from "./tenancy";
import {
  getCanonicalDocBasePath,
  getCanonicalOrigin,
  getStaticTenantRequestContext,
  getTenantRequestContextFromHeaders,
} from "./tenant-static";

const tenant = {
  customDomains: ["docs.example.com"],
  id: "tenant-id",
  name: "Example",
  primaryDomain: "docs.example.com",
  slug: "example",
  status: "active" as const,
  subdomain: "example",
};

describe("tenancy helpers", () => {
  it("extracts the forwarded host and normalizes it", () => {
    const headerStore = new Headers({
      host: "example.blode.md:3001",
      "x-forwarded-host": "Docs.Example.com:443",
    });

    expect(getRequestHost(headerStore)).toBe("docs.example.com");
  });

  it("treats internal and root static paths as reserved without blocking tenant paths", () => {
    expect(isReservedPath("/_internal/proxy")).toBe(true);
    expect(isReservedPath("/docs.json")).toBe(true);
    expect(isReservedPath("/robots.txt")).toBe(true);
    expect(isReservedPath("/logos/example-mark-dark.svg")).toBe(true);
    expect(isReservedPath("/api/overview")).toBe(true);
    expect(isReservedPath("/oauth/consent")).toBe(true);
    expect(isReservedPath("/app")).toBe(true);
    expect(isReservedPath("/example/sitemap.xml")).toBe(false);
    expect(isReservedPath("/apiary")).toBe(false);
    expect(isReservedPath("/application")).toBe(false);
    expect(isReservedPath("/oauth-guide")).toBe(false);
  });

  it("treats root-level static assets as reserved", () => {
    expect(isReservedPath("/matthew-blode-profile.jpg")).toBe(true);
    expect(isReservedPath("/web-app-manifest-192x192.png")).toBe(true);
    expect(isReservedPath("/glide-variable.woff2")).toBe(true);
    expect(isReservedPath("/file-text.svg")).toBe(true);
    expect(isReservedPath("/some-new-image.webp")).toBe(true);
  });

  it("does not treat nested or extensionless paths as static assets", () => {
    expect(isReservedPath("/my-tenant")).toBe(false);
    expect(isReservedPath("/my-tenant/image.jpg")).toBe(false);
    expect(isReservedPath("/docs/getting-started")).toBe(false);
  });

  it("identifies the runtime root hosts", () => {
    expect(isRootRuntimeHost("blode.md")).toBe(true);
    expect(isRootRuntimeHost("localhost")).toBe(true);
    expect(isRootRuntimeHost("docs.localhost")).toBe(true);
    expect(isRootRuntimeHost("example.blode.md")).toBe(false);
    expect(isRootRuntimeHost("example.localhost")).toBe(false);
  });

  it("treats the configured portless host as a runtime root host", () => {
    const previousPortlessUrl = process.env.PORTLESS_URL;
    process.env.PORTLESS_URL = "http://preview.localhost:3001";

    try {
      expect(isRootRuntimeHost("preview.localhost")).toBe(true);
      expect(isRootRuntimeHost("example.localhost")).toBe(false);
    } finally {
      if (previousPortlessUrl === undefined) {
        delete process.env.PORTLESS_URL;
      } else {
        process.env.PORTLESS_URL = previousPortlessUrl;
      }
    }
  });

  it("builds canonical origin from tenant headers", () => {
    const headerStore = new Headers({
      "x-forwarded-proto": "https",
      "x-tenant-base-path": "/docs",
      "x-tenant-domain": "docs.example.com",
      "x-tenant-strategy": "custom-domain",
    });

    const context = getTenantRequestContextFromHeaders(tenant, headerStore);

    expect(getCanonicalOrigin(tenant, context)).toBe(
      "https://docs.example.com"
    );
  });

  it("preserves custom-domain docs base paths from tenant headers", () => {
    const prefixedTenant = {
      ...tenant,
      customDomains: ["donebear.com"],
      pathPrefix: "/docs",
      primaryDomain: "donebear.com",
    };
    const headerStore = new Headers({
      "x-forwarded-proto": "https",
      "x-tenant-base-path": "/docs",
      "x-tenant-domain": "donebear.com",
      "x-tenant-strategy": "custom-domain",
    });

    const context = getTenantRequestContextFromHeaders(
      prefixedTenant,
      headerStore
    );

    expect(getCanonicalOrigin(prefixedTenant, context)).toBe(
      "https://donebear.com"
    );
    expect(getCanonicalDocBasePath(prefixedTenant, context)).toBe("/docs");
  });

  // The platform docs tenant answers on three URL forms that cannot be
  // redirected without looping the apex proxy, so all three must agree on one
  // canonical.
  it.each([
    ["proxied via the apex", "/docs"],
    ["hit directly on the subdomain", ""],
  ])("canonicalises platform docs at the apex when %s", (_case, basePath) => {
    const docsTenant = {
      ...tenant,
      customDomains: [],
      pathPrefix: undefined,
      primaryDomain: "docs.blode.md",
      slug: "docs",
    };
    const headerStore = new Headers({
      "x-forwarded-proto": "https",
      "x-tenant-base-path": basePath,
      "x-tenant-domain": "docs.blode.md",
      "x-tenant-strategy": "subdomain",
    });

    const context = getTenantRequestContextFromHeaders(docsTenant, headerStore);

    expect(getCanonicalOrigin(docsTenant, context)).toBe("https://blode.md");
    expect(getCanonicalDocBasePath(docsTenant, context)).toBe("/docs");
  });

  it("leaves a customer subdomain canonicalised at its own subdomain", () => {
    const customerTenant = {
      ...tenant,
      customDomains: [],
      pathPrefix: undefined,
      primaryDomain: "acme.blode.md",
      slug: "acme",
    };
    const headerStore = new Headers({
      "x-forwarded-proto": "https",
      "x-tenant-base-path": "",
      "x-tenant-domain": "acme.blode.md",
      "x-tenant-strategy": "subdomain",
    });

    const context = getTenantRequestContextFromHeaders(
      customerTenant,
      headerStore
    );

    expect(getCanonicalOrigin(customerTenant, context)).toBe(
      "https://acme.blode.md"
    );
    expect(getCanonicalDocBasePath(customerTenant, context)).toBe("");
  });

  it("builds canonical origin from static tenant context without request headers", () => {
    const prefixedTenant = {
      ...tenant,
      customDomains: ["donebear.com"],
      pathPrefix: "/docs",
      primaryDomain: "donebear.com",
    };

    const context = getStaticTenantRequestContext(prefixedTenant);

    expect(getCanonicalOrigin(prefixedTenant, context)).toBe(
      "https://donebear.com"
    );
    expect(getCanonicalDocBasePath(prefixedTenant, context)).toBe("/docs");
  });
});
