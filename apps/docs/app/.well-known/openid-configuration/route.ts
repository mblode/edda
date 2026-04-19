import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;

  const metadata = {
    authorization_endpoint: `${origin}/oauth/consent`,
    claims_supported: ["sub", "iss", "email", "email_verified", "name"],
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    id_token_signing_alg_values_supported: ["HS256", "RS256"],
    issuer: origin,
    jwks_uri: `${origin}/.well-known/jwks.json`,
    response_types_supported: ["code"],
    scopes_supported: ["openid", "profile", "email"],
    service_documentation: `${origin}/docs/api/overview`,
    subject_types_supported: ["public"],
    token_endpoint: `${origin}/oauth/callback`,
    token_endpoint_auth_methods_supported: ["none"],
  };

  return NextResponse.json(metadata, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
