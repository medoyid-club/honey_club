import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showTagline?: boolean;
};

export function SiteLogo({ className, showTagline = false }: Props) {
  const t = useTranslations("Brand");

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 font-heading transition-opacity hover:opacity-90",
        className
      )}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 honey-glow-sm transition-shadow group-hover:honey-glow">
        <Image
          src="/brand/logo.png"
          alt=""
          width={28}
          height={28}
          className="size-7 object-contain dark:brightness-0 dark:invert"
          priority
        />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-tight tracking-tight sm:text-lg">
          {t("name")}
        </span>
        {showTagline && (
          <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
            {t("tagline")}
          </span>
        )}
      </span>
    </Link>
  );
}
