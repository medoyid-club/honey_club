"use client";

import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { useFontLab } from "./font-lab-provider";
import { sandboxNavItems } from "./mock-data";

type Props = {
  children: ReactNode;
};

export function SandboxShell({ children }: Props) {
  const { preset, style } = useFontLab();

  return (
    <div className="border-b border-primary/20 bg-primary/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">UI Sandbox</span> — локальная
          песочница, не в git. Активно:{" "}
          <span className="font-medium text-foreground">{preset.label}</span>
        </p>
        <ThemeToggle />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[12rem_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Разделы
            </p>
            {sandboxNavItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 font-sans" style={style}>
          {children}
        </div>
      </div>
    </div>
  );
}
