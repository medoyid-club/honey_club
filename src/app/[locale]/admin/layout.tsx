import { setRequestLocale } from "next-intl/server";

import { requireRole } from "@/lib/auth/roles";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireRole(locale, ["admin"], `/${locale}/admin`);

  return <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>;
}
