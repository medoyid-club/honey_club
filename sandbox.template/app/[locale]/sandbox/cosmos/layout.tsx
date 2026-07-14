import { CosmosDocProvider } from "@/components/admin/cosmos/cosmos-doc-context";

import { CosmosNav } from "./_components/cosmos-nav";

export default function CosmosLayout({ children }: { children: React.ReactNode }) {
  return (
    <CosmosDocProvider prefix="sandbox-cosmos">
      <CosmosNav />
      {children}
    </CosmosDocProvider>
  );
}
