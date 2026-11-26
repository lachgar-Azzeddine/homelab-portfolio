// Compress the text files in dist/ once, at build time. nginx serves the .gz
// copy as it is (gzip_static), so a request costs no compression work: small
// pages without spending CPU on every visit.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync, constants } from "node:zlib";

const TEXT = /\.(html|css|js|mjs|json|xml|svg|txt)$/;
let files = 0, before = 0, after = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { walk(path); continue; }
    if (!TEXT.test(name)) continue;
    const raw = readFileSync(path);
    if (raw.length < 256) continue;
    const gz = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION });
    if (gz.length >= raw.length) continue;
    writeFileSync(`${path}.gz`, gz);
    files++; before += raw.length; after += gz.length;
  }
}

walk("dist");
console.log(`precompressed ${files} files: ${(before / 1024).toFixed(0)} KiB -> ${(after / 1024).toFixed(0)} KiB`);
