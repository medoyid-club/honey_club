import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  delta?: number;
  className?: string;
  barClassName?: string;
};

export function TraitBar({ label, value, delta, className, barClassName }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{label}</span>
        {delta !== undefined && delta !== 0 ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {delta > 0 ? `+${delta}` : delta}
          </span>
        ) : null}
        <span className="w-7 shrink-0 text-right text-sm font-semibold tabular-nums">{value}</span>
      </div>
      <div className="progress-honey">
        <span className={barClassName} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
