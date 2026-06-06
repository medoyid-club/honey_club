import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FontLabProvider } from "./_components/font-lab-provider";
import {
  sandboxFontStyles,
  sandboxFontVariables,
} from "./_fonts/load-sandbox-fonts";

export const metadata: Metadata = {
  title: "UI Sandbox",
  robots: { index: false, follow: false },
};

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className={sandboxFontVariables} style={sandboxFontStyles}>
      <FontLabProvider>{children}</FontLabProvider>
    </div>
  );
}
