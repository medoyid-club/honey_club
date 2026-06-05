import Image from "next/image";

import { AuthorSocialLinks } from "@/components/authors/author-social-links";
import { pick, toSocialLinks, type AuthorPageRow } from "@/lib/authors/db";
import type { Locale } from "@/i18n/routing";

type Props = {
  page: AuthorPageRow;
  locale: Locale;
};

export function AuthorSidebar({ page, locale }: Props) {
  const name = page.display_name || page.slug;
  const role = pick(locale, page.headline_ru, page.headline_uk, page.headline_en);
  const slogan = pick(locale, page.slogan_ru, page.slogan_uk, page.slogan_en);
  const photo = page.avatar_url || "/authors/nata-ustimenko.png";
  const social = toSocialLinks(page.socials);

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="sticky top-24 space-y-5 rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
        <div className="flex items-start gap-4 border-b border-foreground/10 pb-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="font-heading text-lg font-semibold leading-tight tracking-tight">
                {name}
              </h2>
              {role && <p className="mt-1 text-sm text-muted-foreground">{role}</p>}
            </div>
            {social.length > 0 && <AuthorSocialLinks links={social} />}
          </div>
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/20 honey-glow-sm">
            <Image
              src={photo}
              alt={name}
              fill
              className="object-cover object-top"
              sizes="96px"
              priority
            />
          </div>
        </div>
        {slogan && (
          <p className="text-sm italic text-primary/90">“{slogan}”</p>
        )}
      </div>
    </aside>
  );
}
