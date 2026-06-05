import type { ComponentType } from "react";
import { Mail } from "lucide-react";

import type { AuthorSocialLink, AuthorSocialPlatform } from "@/lib/authors/types";
import { cn } from "@/lib/utils";

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.5 8.5V6.8c0-.7.5-1.3 1.2-1.3h1.8V2h-2.5c-2.7 0-4.5 1.7-4.5 4.5v1.9H7v3.5h2.5V22h4V12h3.3l.7-3.5H13.5z" />
    </svg>
  );
}

function MonoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path
        d="M8 12h8M12 8v8"
        stroke="var(--background)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const iconMap: Record<
  AuthorSocialPlatform,
  ComponentType<{ className?: string }>
> = {
  youtube: YoutubeIcon,
  telegram: TelegramIcon,
  facebook: FacebookIcon,
  instagram: Mail,
  email: Mail,
  mono: MonoIcon,
};

type Props = {
  links: AuthorSocialLink[];
  className?: string;
};

export function AuthorSocialLinks({ links, className }: Props) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const Icon = iconMap[link.platform];

        return (
          <li key={link.platform}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
            >
              <Icon className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
