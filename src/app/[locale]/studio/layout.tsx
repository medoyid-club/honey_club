import { setRequestLocale } from "next-intl/server";

import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { getStudioContext } from "@/lib/studio";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function StudioLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page } = await getStudioContext(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <StudioSidebar page={page} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
