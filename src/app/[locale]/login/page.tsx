import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("title") };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error, tab } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Login");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm defaultTab={tab ?? "login"} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
