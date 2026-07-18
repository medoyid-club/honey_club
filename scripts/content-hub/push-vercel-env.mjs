/**
 * Push Content Hub env vars to Vercel (production + preview).
 *
 * Prerequisites:
 *   npx vercel login
 *   npx vercel link
 *
 * Usage:
 *   node scripts/content-hub/push-vercel-env.mjs
 *
 * Reads .env.local and secrets/youtube/* (or root token.json + client_secret).
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function readYoutubeOAuth() {
  const dirs = [
    path.join(process.cwd(), "secrets", "youtube"),
    process.cwd(),
  ];

  let tokenPath;
  let secretPath;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const token = path.join(dir, "token.json");
    if (fs.existsSync(token)) tokenPath = token;
    const secret = fs
      .readdirSync(dir)
      .find((n) => n.startsWith("client_secret") && n.endsWith(".json"));
    if (secret) secretPath = path.join(dir, secret);
  }

  if (!tokenPath || !secretPath) {
    return {};
  }

  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  const secretRaw = JSON.parse(fs.readFileSync(secretPath, "utf8"));
  const block = secretRaw.installed ?? secretRaw.web;

  return {
    YOUTUBE_CLIENT_ID: block?.client_id ?? "",
    YOUTUBE_CLIENT_SECRET: block?.client_secret ?? "",
    YOUTUBE_REFRESH_TOKEN: token.refresh_token ?? "",
  };
}

function vercelEnvAdd(key, value, environments) {
  for (const env of environments) {
    const result = spawnSync(
      "npx",
      ["vercel", "env", "add", key, env, "--force"],
      {
        input: value,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      }
    );
    if (result.status !== 0) {
      console.error(`Failed ${key} (${env}):`, result.stderr || result.stdout);
      process.exitCode = 1;
    } else {
      console.log(`OK ${key} → ${env}`);
    }
  }
}

const env = loadEnvLocal();
const youtube = readYoutubeOAuth();

const KEYS = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_CLUB_CHANNEL_ID",
  "TELEGRAM_AUTHOR_NATA_CHANNEL_ID",
  "TELEGRAM_AUTHOR_TETIANA_CHANNEL_ID",
  "CONTENT_HUB_NATA_SLUG",
  "CONTENT_HUB_TETIANA_SLUG",
  "CONTENT_HUB_NATA_FACEBOOK_URL",
  "CONTENT_HUB_TETIANA_FACEBOOK_URL",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "YOUTUBE_CLIENT_ID",
  "YOUTUBE_CLIENT_SECRET",
  "YOUTUBE_REFRESH_TOKEN",
];

const merged = { ...env, ...youtube };
const targets = ["production", "preview"];

for (const key of KEYS) {
  const value = merged[key];
  if (!value) {
    console.warn(`Skip ${key} (empty)`);
    continue;
  }
  vercelEnvAdd(key, value, targets);
}

console.log("\nDone. Redeploy production after env update.");
console.log("Then run: node scripts/content-hub/setup-webhook.mjs");
