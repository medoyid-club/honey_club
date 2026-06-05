import { useTranslations } from "next-intl";

import { SiteLogo } from "@/components/site-logo";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("Footer");

  const columns = [
    {
      title: t("platform"),
      links: [
        { href: "/courses", label: t("linkCourses") },
        { href: "/#about", label: t("linkAbout") },
        { href: "/authors", label: t("linkAuthors") },
      ],
    },
    {
      title: t("support"),
      links: [
        { href: "/faq", label: t("linkFaq") },
        { href: "/contacts", label: t("linkContacts") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/privacy", label: t("linkPrivacy") },
        { href: "/terms", label: t("linkTerms") },
      ],
    },
  ];

  return (
    <footer className="border-t border-foreground/10 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <SiteLogo showTagline />
          <p className="text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <h3 className="font-heading text-sm font-medium">{column.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-foreground/10 py-6">
        <p className="mx-auto w-full max-w-6xl px-4 text-xs text-muted-foreground">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
