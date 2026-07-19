export const EMAIL_DOMAIN = "medoyid-club.com";

export const EMAIL_DISPLAY_NAME = "Клуб медоедов";

/** Gmail inbox that receives all Cloudflare Email Routing forwards. */
export const EMAIL_ROUTING_DESTINATION = "medoyid.club@gmail.com";

export type EmailRole =
  | "admin"
  | "hello"
  | "info"
  | "courses"
  | "support"
  | "partners"
  | "media"
  | "security"
  | "legal"
  | "noreply";

export const EMAIL_ADDRESSES: Record<EmailRole, string> = {
  admin: `admin@${EMAIL_DOMAIN}`,
  hello: `hello@${EMAIL_DOMAIN}`,
  info: `info@${EMAIL_DOMAIN}`,
  courses: `courses@${EMAIL_DOMAIN}`,
  support: `support@${EMAIL_DOMAIN}`,
  partners: `partners@${EMAIL_DOMAIN}`,
  media: `media@${EMAIL_DOMAIN}`,
  security: `security@${EMAIL_DOMAIN}`,
  legal: `legal@${EMAIL_DOMAIN}`,
  noreply: `noreply@${EMAIL_DOMAIN}`,
};

export type AuthorEmailKey = "nata" | "tetiana";

export type AuthorEmailConfig = {
  key: AuthorEmailKey;
  /** Author page slug — matches CONTENT_HUB_*_SLUG in .env */
  slug: string;
  local: string;
  displayName: string;
};

/** Inbound author aliases — one routing rule per local in Cloudflare. */
export const AUTHOR_EMAILS: AuthorEmailConfig[] = [
  {
    key: "nata",
    slug: "nata-ustymenko",
    local: "nata-ustymenko",
    displayName: "Ната Устименко",
  },
  {
    key: "tetiana",
    slug: "tetiana-gukalo",
    local: "tetiana-gukalo",
    displayName: "Тетяна Гукало",
  },
];

export const AUTHOR_EMAIL_ADDRESSES: Record<AuthorEmailKey, string> = Object.fromEntries(
  AUTHOR_EMAILS.map((a) => [a.key, `${a.local}@${EMAIL_DOMAIN}`])
) as Record<AuthorEmailKey, string>;

/** All inbound aliases to configure in Cloudflare Email Routing. */
export const INBOUND_EMAIL_ALIASES = [
  ...Object.values(EMAIL_ADDRESSES),
  ...Object.values(AUTHOR_EMAIL_ADDRESSES),
];

export function formatEmailFrom(role: EmailRole, displayName = EMAIL_DISPLAY_NAME): string {
  return `${displayName} <${EMAIL_ADDRESSES[role]}>`;
}

export function formatAuthorEmailFrom(key: AuthorEmailKey): string {
  const author = AUTHOR_EMAILS.find((a) => a.key === key);
  if (!author) {
    throw new Error(`Unknown author email key: ${key}`);
  }
  return `${author.displayName} <${AUTHOR_EMAIL_ADDRESSES[key]}>`;
}

export function authorEmailBySlug(slug: string): string | null {
  const author = AUTHOR_EMAILS.find((a) => a.slug === slug);
  return author ? `${author.local}@${EMAIL_DOMAIN}` : null;
}

export const CLUB_SERVICE_EMAIL_ROLES = ["support", "media", "partners"] as const satisfies readonly EmailRole[];

export type ClubServiceEmailRole = (typeof CLUB_SERVICE_EMAIL_ROLES)[number];
