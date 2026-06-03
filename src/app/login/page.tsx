import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в личный кабинет Honey Club.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Вход в Honey Club</CardTitle>
          <CardDescription>
            Авторизация появится здесь после подключения Supabase Auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            На этом этапе страница — заглушка. Следующий шаг: подключить вход по
            email и социальным сетям.
          </p>
          <Button className="w-full" render={<Link href="/courses" />}>
            Пока к курсам
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
