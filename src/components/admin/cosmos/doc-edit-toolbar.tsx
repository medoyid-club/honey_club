"use client";

import { Button } from "@/components/ui/button";

type Props = {
  editing: boolean;
  onToggleEdit: () => void;
  onReset: () => void;
  editLabel: string;
  doneLabel: string;
  resetLabel: string;
};

export function DocEditToolbar({
  editing,
  onToggleEdit,
  onReset,
  editLabel,
  doneLabel,
  resetLabel,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant={editing ? "default" : "outline"} size="sm" onClick={onToggleEdit}>
        {editing ? doneLabel : editLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        {resetLabel}
      </Button>
    </div>
  );
}
