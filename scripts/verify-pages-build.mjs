#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "dist", "client");
const required = [
  "index.html",
  "lab/index.html",
  "manifest.webmanifest",
  "__grok/icon-180.png",
];

for (const rel of required) {
  const full = join(out, rel);
  if (!existsSync(full)) {
    console.error(`[pages] missing required output: ${rel}`);
    process.exit(1);
  }
}

const html = readFileSync(join(out, "index.html"), "utf8");
for (const needle of ["/ProofArcade/", "Proof Arcade"]) {
  if (!html.includes(needle)) {
    console.error(`[pages] index.html is missing expected marker: ${needle}`);
    process.exit(1);
  }
}

if (/\b(?:src|href)=["']\/(?!ProofArcade\/)/.test(html)) {
  console.error("[pages] found a root-absolute asset/navigation URL outside /ProofArcade/");
  process.exit(1);
}

console.log("[pages] static build verified: dist/client root + lab + project-relative assets");
