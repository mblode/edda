import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { BLODEMD_SKILL_CONTENT, sha256Hex } from "./agent-skills";

const skillPath = path.resolve(
  import.meta.dirname,
  "../../../skills/blodemd/SKILL.md"
);

describe("agent-skills", () => {
  it("serves the same SKILL.md that ships in skills/blodemd", () => {
    const source = fs.readFileSync(skillPath, "utf8");
    expect(BLODEMD_SKILL_CONTENT).toBe(source);
  });

  it("hashes the served content deterministically", () => {
    expect(sha256Hex(BLODEMD_SKILL_CONTENT)).toMatch(/^[0-9a-f]{64}$/);
    expect(sha256Hex(BLODEMD_SKILL_CONTENT)).toBe(
      sha256Hex(BLODEMD_SKILL_CONTENT)
    );
  });
});
