const TELEGRAM_API = "https://api.telegram.org";

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

async function callTelegram<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${TELEGRAM_API}/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) {
    throw new Error(data.description ?? `Telegram ${method} failed`);
  }
  return data.result as T;
}

export async function publishToClubChannel(params: {
  clubChannelId: string;
  sourceChannelId: string;
  sourceMessageId: number;
  html: string;
  hasMedia: boolean;
}): Promise<number> {
  const { clubChannelId, sourceChannelId, sourceMessageId, html, hasMedia } = params;

  if (hasMedia) {
    const result = await callTelegram<{ message_id: number }>("copyMessage", {
      chat_id: clubChannelId,
      from_chat_id: sourceChannelId,
      message_id: sourceMessageId,
      caption: html,
      parse_mode: "HTML",
    });
    return result.message_id;
  }

  const result = await callTelegram<{ message_id: number }>("sendMessage", {
    chat_id: clubChannelId,
    text: html,
    parse_mode: "HTML",
    disable_web_page_preview: false,
  });
  return result.message_id;
}

export async function setWebhook(url: string, secretToken?: string): Promise<void> {
  await callTelegram("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["channel_post", "edited_channel_post"],
  });
}

export async function deleteWebhook(): Promise<void> {
  await callTelegram("deleteWebhook", {});
}

export async function getWebhookInfo(): Promise<unknown> {
  return callTelegram("getWebhookInfo", {});
}

export async function getUpdates(offset?: number): Promise<unknown> {
  return callTelegram("getUpdates", {
    offset,
    timeout: 30,
    allowed_updates: ["channel_post", "edited_channel_post"],
  });
}
