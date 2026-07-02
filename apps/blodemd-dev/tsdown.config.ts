import { defineConfig } from "tsdown";

export default defineConfig({
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
  entry: { dev: "src/dev.ts" },
  format: ["esm"],
  sourcemap: true,
  target: "node24",
});
