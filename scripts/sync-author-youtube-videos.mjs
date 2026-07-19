/**
 * Sync author videotekas from @honey_erbe uploads (description/tags mention author).
 *
 * Usage:
 *   node scripts/sync-author-youtube-videos.mjs
 *   node scripts/sync-author-youtube-videos.mjs https://www.medoyid-club.com
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const base =
  process.argv[2]?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const secret = process.env.CRON_SECRET ?? process.env.YOUTUBE_SYNC_SECRET;
if (!secret) {
  console.error("Set CRON_SECRET or YOUTUBE_SYNC_SECRET in .env.local");
  process.exit(1);
}

const response = await fetch(`${base}/api/cron/sync-youtube-videos`, {
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await response.text();
console.log(response.status, body);
process.exit(response.ok ? 0 : 1);
