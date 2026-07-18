import { type NextRequest, NextResponse } from "next/server";

import { runContentHubPipeline } from "@/lib/content-hub/pipeline";

export const runtime = "nodejs";

type TelegramUpdate = {
  update_id: number;
  channel_post?: Parameters<typeof runContentHubPipeline>[1];
  edited_channel_post?: Parameters<typeof runContentHubPipeline>[1];
};

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.channel_post ?? update.edited_channel_post;
  if (!message) {
    return NextResponse.json({ ok: true, skipped: "no_channel_post" });
  }

  const chatId = String(
    (message as { chat?: { id?: number | string } }).chat?.id ?? ""
  );
  if (!chatId) {
    return NextResponse.json({ ok: true, skipped: "no_chat_id" });
  }

  try {
    const result = await runContentHubPipeline(chatId, message);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[telegram/webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
