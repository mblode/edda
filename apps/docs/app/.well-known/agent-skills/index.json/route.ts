import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";
import { getPlatformSkillDigest, PLATFORM_SKILLS } from "@/lib/platform-skills";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;

  const body = {
    $schema: "https://agentskills.io/schemas/skills-index-v0.2.0.json",
    skills: PLATFORM_SKILLS.map((skill) => ({
      description: skill.description,
      name: skill.name,
      sha256: getPlatformSkillDigest(skill),
      type: "claude-skill",
      url: `${origin}/.well-known/agent-skills/${skill.name}/SKILL.md`,
    })),
  };

  return NextResponse.json(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
