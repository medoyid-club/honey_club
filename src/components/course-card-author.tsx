import Image from "next/image";

import { Link } from "@/i18n/navigation";

type Props = {
  name: string;
  slug: string | null;
  avatarUrl: string | null;
  label: string;
};

export function CourseCardAuthor({ name, slug, avatarUrl, label }: Props) {
  const photo = avatarUrl || "/authors/nata-ustimenko.png";

  const row = (
    <span className="flex items-center gap-2">
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-primary/15">
        <Image
          src={photo}
          alt=""
          fill
          className="object-cover object-top"
          sizes="32px"
          unoptimized
        />
      </span>
      <span className="min-w-0 truncate font-medium text-foreground">{name}</span>
    </span>
  );

  return (
    <p className={label ? "flex items-center gap-1.5 text-sm text-muted-foreground" : undefined}>
      {label ? <span className="shrink-0">{label}:</span> : null}
      {slug ? (
        <Link
          href={`/authors/${slug}`}
          className="min-w-0 transition-colors hover:text-primary"
        >
          {row}
        </Link>
      ) : (
        row
      )}
    </p>
  );
}
