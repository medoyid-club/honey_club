"use client";

import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  iconClassName?: string;
};

export function AuthorImage({
  src,
  alt,
  className,
  sizes,
  priority,
  fill = true,
  iconClassName,
}: Props) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50 text-muted-foreground",
          className
        )}
        aria-hidden={!alt}
      >
        <User className={cn("size-8 opacity-40", iconClassName)} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn("object-cover object-top", className)}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("http")}
    />
  );
}
