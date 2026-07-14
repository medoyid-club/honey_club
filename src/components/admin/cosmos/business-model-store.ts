"use client";

import { useLocale } from "next-intl";

import type { BmcDoc } from "./business-model";
import { getBmcDefaults } from "./business-model-defaults";
import { useCosmosDocPrefix } from "./cosmos-doc-context";
import { createLocalDocStore } from "./local-doc-store";

const stores = new Map<string, ReturnType<typeof createLocalDocStore<BmcDoc>>>();

function getStore(prefix: string, locale: string) {
  const key = `${prefix}-bmc-${locale === "en" ? "en" : "ru"}`;
  if (!stores.has(key)) {
    stores.set(key, createLocalDocStore(key, () => getBmcDefaults(locale)));
  }
  return stores.get(key)!;
}

export function useBmcDoc(): [
  BmcDoc,
  (updater: (doc: BmcDoc) => BmcDoc) => void,
  () => void,
] {
  const prefix = useCosmosDocPrefix();
  const locale = useLocale();
  const store = getStore(prefix, locale);
  const [doc, set, reset] = store.useDoc();
  return [doc, set, reset];
}
