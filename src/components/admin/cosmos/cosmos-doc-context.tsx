"use client";

import { createContext, useContext, type ReactNode } from "react";

const CosmosDocPrefixContext = createContext("admin-cosmos");

export function CosmosDocProvider({
  prefix,
  children,
}: {
  prefix: string;
  children: ReactNode;
}) {
  return (
    <CosmosDocPrefixContext.Provider value={prefix}>{children}</CosmosDocPrefixContext.Provider>
  );
}

export function useCosmosDocPrefix(): string {
  return useContext(CosmosDocPrefixContext);
}
