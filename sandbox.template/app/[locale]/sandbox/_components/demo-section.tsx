import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DemoSection({
  id,
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 border-b border-border py-10 last:border-b-0", className)}
    >
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type DemoRowProps = {
  label?: string;
  children: ReactNode;
  className?: string;
};

export function DemoRow({ label, children, className }: DemoRowProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

type SwatchProps = {
  name: string;
  className: string;
  token?: string;
};

export function ColorSwatch({ name, className, token }: SwatchProps) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "h-16 w-full min-w-[7rem] rounded-lg border border-border/80 shadow-sm",
          className
        )}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        {token ? <p className="font-mono text-xs text-muted-foreground">{token}</p> : null}
      </div>
    </div>
  );
}
