import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { getUserProfile, requireUser } from "@/lib/account";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireUser(locale);
  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/account`);
  }

  const profile = await getUserProfile(user.id, user.email);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <AccountSidebar profile={profile} locale={locale} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
