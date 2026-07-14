"use client";

import { useLocale } from "next-intl";

import { useCosmosDocPrefix } from "./cosmos-doc-context";
import { createLocalDocStore } from "./local-doc-store";
import { getRoadmapDefaults } from "./roadmap-defaults";
import type { RoadmapDoc } from "./roadmap";

const stores = new Map<string, ReturnType<typeof createLocalDocStore<RoadmapDoc>>>();

function getStore(prefix: string, locale: string) {
  const key = `${prefix}-roadmap-${locale === "en" ? "en" : "ru"}`;
  if (!stores.has(key)) {
    stores.set(
      key,
      createLocalDocStore(key, () => getRoadmapDefaults(locale)),
    );
  }
  return stores.get(key)!;
}

export function useRoadmapDoc(): [
  RoadmapDoc,
  (updater: (doc: RoadmapDoc) => RoadmapDoc) => void,
  () => void,
] {
  const prefix = useCosmosDocPrefix();
  const locale = useLocale();
  const store = getStore(prefix, locale);
  const [doc, set, reset] = store.useDoc();
  return [doc, set, reset];
}
