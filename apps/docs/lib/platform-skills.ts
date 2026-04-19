import { createHash } from "node:crypto";

export interface PlatformSkill {
  name: string;
  description: string;
  content: string;
}

export const PLATFORM_SKILLS: readonly PlatformSkill[] = [
  {
    content: `---
name: blodemd
description: Scaffold, preview, and deploy beautiful MDX documentation sites with Blode.md. Use when the user wants to create a new docs site, validate their docs config, preview locally, or deploy to Blode.md.
user-invocable: true
argument-hint: <command> [options]
allowed-tools: Bash(npx blodemd *), Bash(blodemd *)
---

# Blode.md

Scaffold, preview, and deploy MDX documentation sites from the terminal. Write locally, ship with one command. Sign in once with GitHub in your browser.

## First run from an agent

ALWAYS check auth before any deploy command:

\`\`\`bash
npx blodemd whoami
\`\`\`

If the output says \`Not logged in\`, ask the user to run \`npx blodemd login\` in their own terminal.

## Workflow

1. \`npx blodemd whoami\` — verify auth
2. \`npx blodemd new [dir] --slug <slug> --template <minimal|starter> -y\` — scaffold
3. \`npx blodemd validate [dir]\` — validate docs.json
4. \`npx blodemd dev --dir <dir> --port 3030\` — local preview
5. \`npx blodemd push [dir] --project <slug>\` — deploy

## docs.json

\`\`\`json
{
  "slug": "my-project",
  "name": "My Project"
}
\`\`\`
`,
    description:
      "Scaffold, preview, and deploy MDX documentation sites with Blode.md.",
    name: "blodemd",
  },
];

const sha256 = (input: string) =>
  createHash("sha256").update(input, "utf8").digest("hex");

export const getPlatformSkillDigest = (skill: PlatformSkill) =>
  sha256(skill.content);
