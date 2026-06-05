import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { AuthorNav } from "@/components/authors/author-nav";
import { AuthorSidebar } from "@/components/authors/author-sidebar";
import type { Locale } from "@/i18n/routing";
import { getPublishedAuthorPageBySlug } from "@/lib/authors/db";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

export default async function AuthorLayout({ children, params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="space-y-4 lg:w-72">
          <AuthorSidebar page={page} locale={locale as Locale} />
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          <AuthorNav slug={slug} />
          {children}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const page = await getPublishedAuthorPageBySlug(slug);
  if (!page) return {};
  return { title: page.display_name || slug };
}
