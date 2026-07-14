import type { Metadata } from "next";

import { AdminCosmosNav } from "@/components/admin/cosmos/admin-cosmos-nav";
import { CosmosDocProvider } from "@/components/admin/cosmos/cosmos-doc-context";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminCosmosLayout({ children }: { children: React.ReactNode }) {
  return (
    <CosmosDocProvider prefix="admin-cosmos">
      <div className="space-y-6">
        <AdminCosmosNav />
        {children}
      </div>
    </CosmosDocProvider>
  );
}
