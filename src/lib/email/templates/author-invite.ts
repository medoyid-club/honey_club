type Locale = "ru" | "uk" | "en";

type InviteEmailParams = {
  acceptUrl: string;
  locale: Locale;
  inviterName?: string | null;
};

const COPY: Record<
  Locale,
  {
    subject: string;
    heading: string;
    intro: (inviter: string) => string;
    body: string;
    cta: string;
    expires: string;
    ignore: string;
  }
> = {
  ru: {
    subject: "Приглашение стать автором в Клубе медоедов",
    heading: "Вы приглашены стать автором",
    intro: (inviter) =>
      `${inviter} приглашает вас присоединиться к Клубу медоедов в роли автора.`,
    body: "Как автор вы сможете создавать курсы, вести блог и видеотеку, оформлять свою страницу.",
    cta: "Принять приглашение",
    expires: "Ссылка действительна 14 дней.",
    ignore: "Если вы не ожидали это письмо, просто проигнорируйте его.",
  },
  uk: {
    subject: "Запрошення стати автором у Клубі Медоїдів",
    heading: "Вас запрошено стати автором",
    intro: (inviter) =>
      `${inviter} запрошує вас приєднатися до Клубу Медоїдів у ролі автора.`,
    body: "Як автор ви зможете створювати курси, вести блог і відеотеку, оформлювати свою сторінку.",
    cta: "Прийняти запрошення",
    expires: "Посилання дійсне 14 днів.",
    ignore: "Якщо ви не очікували цей лист, просто проігноруйте його.",
  },
  en: {
    subject: "Invitation to become an author at Medoyid Club",
    heading: "You are invited to become an author",
    intro: (inviter) =>
      `${inviter} invites you to join Medoyid Club as an author.`,
    body: "As an author you can create courses, run a blog and a video library, and customize your page.",
    cta: "Accept invitation",
    expires: "This link is valid for 14 days.",
    ignore: "If you did not expect this email, simply ignore it.",
  },
};

export function authorInviteEmail(params: InviteEmailParams): {
  subject: string;
  html: string;
} {
  const t = COPY[params.locale] ?? COPY.ru;
  const inviter = params.inviterName?.trim() || "Клуб медоедов";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0b0b0c;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#161618;border-radius:16px;overflow:hidden;border:1px solid #2a2a2e;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#E8A317;font-weight:700;">Клуб медоедов</div>
                <h1 style="margin:16px 0 8px;font-size:22px;line-height:1.3;color:#fafafa;">${t.heading}</h1>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c8c8cc;">${t.intro(inviter)}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c8c8cc;">${t.body}</p>
                <a href="${params.acceptUrl}" style="display:inline-block;background:#E8A317;color:#1a1300;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px;">${t.cta}</a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8a8a90;">${t.expires}</p>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#8a8a90;">${t.ignore}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2a2a2e;">
                <p style="margin:0;font-size:12px;color:#6a6a70;word-break:break-all;">${params.acceptUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: t.subject, html };
}
