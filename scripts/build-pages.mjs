#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  ["scripts/with-app-env.mjs", "vite", "build", "--mode", "pages"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PROOF_ARCADE_PAGES: "1",
    },
  },
);

if (result.error) {
  console.error("[pages] failed to start Vite build:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
