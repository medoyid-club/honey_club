/**
 * Register Telegram webhook for production.
 *
 * Usage:
 *   node scripts/content-hub/setup-webhook.mjs
 *   node scripts/content-hub/setup-webhook.mjs https://www.medoyid-club.com
 *   node scripts/content-hub/setup-webhook.mjs delete
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const token = process.env.TELEGRAM_BOT_TOKEN;
const cliArg = process.argv[2];
const action = cliArg === "delete" ? "delete" : "set";
const baseUrlFromCli =
  cliArg && cliArg !== "delete" && cliArg.startsWith("http") ? cliArg : undefined;
const baseUrl = baseUrlFromCli ?? process.env.NEXT_PUBLIC_BASE_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? crypto.randomBytes(16).toString("hex");

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set");
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
}

if (action === "delete") {
  await call("deleteWebhook", {});
  process.exit(0);
}

if (!baseUrl || baseUrl.includes("localhost")) {
  console.error(
    "Set NEXT_PUBLIC_BASE_URL in .env.local or pass URL as argument:\n" +
      "  node scripts/content-hub/setup-webhook.mjs https://www.medoyid-club.com"
  );
  process.exit(1);
}

const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;
await call("setWebhook", {
  url: webhookUrl,
  secret_token: secret,
  allowed_updates: ["channel_post", "edited_channel_post"],
});

if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
  console.log("\nAdd to .env.local:\nTELEGRAM_WEBHOOK_SECRET=" + secret);
}

console.log("\nWebhook URL:", webhookUrl);
