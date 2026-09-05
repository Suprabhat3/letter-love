// Fails if a server-only secret is referenced anywhere it could reach a
// browser bundle.
//
// `import "server-only"` already turns a client import of lib/supabase-server
// into a build error, so this is the second line of defence: it catches someone
// reading process.env.SUPABASE_SERVICE_ROLE_KEY directly in a component, which
// nothing else would flag. Run it in CI alongside lint and build.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** Directories whose files can end up in a client bundle. */
const SCANNED = ["components", "app", "lib", "hooks"];

/** Files that are allowed to name these secrets, because they are server-only. */
const ALLOWED = new Set([
  "lib/supabase-server.ts",
  "lib/api.ts",
  "scripts/check-secrets.mjs",
]);

const FORBIDDEN = [/SERVICE_ROLE/, /VIEWER_SALT/, /CRON_SECRET/];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      yield* walk(path);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      yield path;
    }
  }
}

const failures = [];

for (const dir of SCANNED) {
  for await (const path of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, path).replaceAll("\\", "/");
    if (ALLOWED.has(rel)) continue;

    const source = await readFile(path, "utf8");
    // A route handler or a module that declares itself server-only is fine.
    if (/^\s*import\s+["']server-only["']/m.test(source)) continue;

    for (const pattern of FORBIDDEN) {
      if (pattern.test(source)) {
        failures.push(`${rel}: references ${pattern.source}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Server-only secrets referenced outside server code:\n");
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    "\nMove the access into a module that imports \"server-only\".",
  );
  process.exit(1);
}

console.log("check:secrets — no server-only secrets reachable from client code.");
