"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { BmcBlock, BmcBlockId, BmcItem } from "./business-model";
import { useBmcDoc } from "./business-model-store";
import { DocEditToolbar } from "./doc-edit-toolbar";
import { newItemId } from "./roadmap";

const STATUS_STYLE: Record<string, string> = {
  hypothesis: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  validated: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  deferred: "bg-muted text-muted-foreground",
};

function blockById(blocks: BmcBlock[], id: BmcBlockId): BmcBlock {
  return blocks.find((b) => b.id === id)!;
}

type CellProps = {
  block: BmcBlock;
  gridArea: string;
  selected: boolean;
  onSelect: (id: BmcBlockId) => void;
  moreItemsLabel: (n: number) => string;
};

function CanvasCell({ block, gridArea, selected, onSelect, moreItemsLabel }: CellProps) {
  return (
    <button
      type="button"
      className={`flex min-h-[140px] flex-col rounded-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${selected ? "border-primary bg-primary/10" : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-card/80"}`}
      style={{ gridArea }}
      onClick={() => onSelect(block.id)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {block.title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{block.subtitle}</p>
      <ul className="mt-2 flex-1 space-y-1">
        {block.items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex items-start gap-1.5 text-[11px] leading-snug">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
            <span className="line-clamp-2">{item.text}</span>
          </li>
        ))}
        {block.items.length > 3 && (
          <li className="text-[10px] text-muted-foreground">{moreItemsLabel(block.items.length - 3)}</li>
        )}
      </ul>
    </button>
  );
}

export function BusinessModelCanvas() {
  const t = useTranslations("Cosmos.bmc");
  const [doc, setDoc, resetDoc] = useBmcDoc();
  const [selectedId, setSelectedId] = useState<BmcBlockId>("value");
  const [editing, setEditing] = useState(false);

  const selected = blockById(doc.blocks, selectedId);
  const relatedLinks = doc.links.filter((l) => l.from === selectedId || l.to === selectedId);

  const statusLabel = (status: NonNullable<BmcItem["status"]>) => {
    if (status === "hypothesis") return t("statusHypothesis");
    if (status === "validated") return t("statusValidated");
    return t("statusDeferred");
  };

  function updateItem(blockId: BmcBlockId, itemId: string, patch: Partial<BmcItem>): void {
    setDoc((d) => ({
      ...d,
      blocks: d.blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              items: block.items.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
              ),
            },
      ),
    }));
  }

  function deleteItem(blockId: BmcBlockId, itemId: string): void {
    setDoc((d) => ({
      ...d,
      blocks: d.blocks.map((block) =>
        block.id !== blockId
          ? block
          : { ...block, items: block.items.filter((item) => item.id !== itemId) },
      ),
    }));
  }

  function addItem(blockId: BmcBlockId): void {
    const item: BmcItem = { id: newItemId(), text: t("newItemText"), status: "hypothesis" };
    setDoc((d) => ({
      ...d,
      blocks: d.blocks.map((block) =>
        block.id !== blockId ? block : { ...block, items: [...block.items, item] },
      ),
    }));
    setEditing(true);
  }

  return (
    <div className="space-y-5">
      <DocEditToolbar
        editing={editing}
        onToggleEdit={() => setEditing((v) => !v)}
        onReset={resetDoc}
        editLabel={t("edit")}
        doneLabel={t("doneEdit")}
        resetLabel={t("reset")}
      />

      <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
        {doc.note}
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gridTemplateRows: "auto auto auto",
          gridTemplateAreas: `
            "partners activities value relations segments"
            "partners resources value channels segments"
            "costs costs costs revenue revenue"
          `,
        }}
      >
        {doc.blocks.map((block) => (
          <CanvasCell
            key={block.id}
            block={block}
            gridArea={block.id}
            selected={selectedId === block.id}
            onSelect={setSelectedId}
            moreItemsLabel={(n) => t("moreItems", { count: n })}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {selected.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{selected.subtitle}</p>
            </div>
            {editing && (
              <Button type="button" size="sm" variant="outline" onClick={() => addItem(selectedId)}>
                {t("addItem")}
              </Button>
            )}
          </div>

          <ul className="space-y-3">
            {selected.items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm leading-relaxed">
                {editing ? (
                  <div className="flex w-full flex-col gap-2 rounded-lg border border-border/50 p-2">
                    <Input
                      value={item.text}
                      onChange={(e) => updateItem(selectedId, item.id, { text: e.target.value })}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={item.status ?? "hypothesis"}
                        onChange={(e) =>
                          updateItem(selectedId, item.id, {
                            status: e.target.value as BmcItem["status"],
                          })
                        }
                      >
                        <option value="hypothesis">{t("statusHypothesis")}</option>
                        <option value="validated">{t("statusValidated")}</option>
                        <option value="deferred">{t("statusDeferred")}</option>
                      </select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteItem(selectedId, item.id)}
                      >
                        {t("deleteItem")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.status && (
                      <span
                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${STATUS_STYLE[item.status]}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    )}
                    <span>{item.text}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("blockLinks")}
            </p>
            {relatedLinks.length > 0 ? (
              <ul className="space-y-2 text-muted-foreground">
                {relatedLinks.map((link) => (
                  <li key={`${link.from}-${link.to}`}>
                    <button
                      type="button"
                      className="text-left hover:text-primary"
                      onClick={() => setSelectedId(link.from === selectedId ? link.to : link.from)}
                    >
                      {link.from === selectedId
                        ? `→ ${blockById(doc.blocks, link.to).title}`
                        : `← ${blockById(doc.blocks, link.from).title}`}
                      <span className="block text-xs opacity-70">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{t("pickBlockForLinks")}</p>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-medium uppercase tracking-wide">{t("statusLegend")}</p>
            <ul className="space-y-1.5">
              <li>
                <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${STATUS_STYLE.hypothesis}`}>
                  {t("statusHypothesis")}
                </span>
                {t("legendHypothesis")}
              </li>
              <li>
                <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${STATUS_STYLE.validated}`}>
                  {t("statusValidated")}
                </span>
                {t("legendValidated")}
              </li>
              <li>
                <span className={`mr-2 inline-block rounded px-1.5 py-0.5 ${STATUS_STYLE.deferred}`}>
                  {t("statusDeferred")}
                </span>
                {t("legendDeferred")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        {doc.product} · {doc.version} · {t("updated")} {doc.updated}
      </p>
    </div>
  );
}
