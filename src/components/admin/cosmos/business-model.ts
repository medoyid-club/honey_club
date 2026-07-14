/**
 * Business Model Canvas — RPG «Условный космос».
 * Курсы Honey Club — отдельный продукт; здесь только игровой контур.
 * Метод: Alexander Osterwalder, 9 блоков.
 */

export type BmcBlockId =
  | "partners"
  | "activities"
  | "resources"
  | "value"
  | "segments"
  | "relations"
  | "channels"
  | "costs"
  | "revenue";

export type BmcItem = {
  id: string;
  text: string;
  status?: "hypothesis" | "validated" | "deferred";
};

export type BmcBlock = {
  id: BmcBlockId;
  title: string;
  subtitle: string;
  items: BmcItem[];
};

export type BmcLink = {
  from: BmcBlockId;
  to: BmcBlockId;
  label: string;
};

export type BmcDoc = {
  note: string;
  product: string;
  version: string;
  updated: string;
  blocks: BmcBlock[];
  links: BmcLink[];
};
