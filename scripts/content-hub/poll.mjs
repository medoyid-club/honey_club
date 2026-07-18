/**
 * Long polling for local development (when webhook URL is not available).
 *
 * Usage:
 *   node scripts/content-hub/poll.mjs
 *
 * Requires TELEGRAM_BOT_TOKEN in .env.local (loaded via dotenv if present).
 */

import fs from "node:fs";
import path from "node:path";

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
const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set");
  process.exit(1);
}

let offset = 0;

async function telegram(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function forwardUpdate(update) {
  const res = await fetch(`${baseUrl}/api/telegram/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.TELEGRAM_WEBHOOK_SECRET
        ? { "x-telegram-bot-api-secret-token": process.env.TELEGRAM_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(update),
  });
  const text = await res.text();
  console.log(`[poll] update ${update.update_id} → ${res.status}`, text.slice(0, 200));
}

console.log(`Content hub poll → ${baseUrl}/api/telegram/webhook`);

while (true) {
  const data = await telegram("getUpdates", {
    offset,
    timeout: 25,
    allowed_updates: ["channel_post", "edited_channel_post"],
  });

  if (!data.ok) {
    console.error("getUpdates failed:", data.description);
    await new Promise((r) => setTimeout(r, 5000));
    continue;
  }

  for (const update of data.result ?? []) {
    offset = update.update_id + 1;
    if (update.channel_post || update.edited_channel_post) {
      await forwardUpdate(update);
    }
  }
}
