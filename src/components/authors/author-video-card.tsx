import { ExternalLink, Play } from "lucide-react";

type Props = {
  video: {
    id: string;
    title: string;
    publishedAt: string | null;
    watchUrl: string | null;
  };
  categoryLabel: string;
  channelUrl: string | null;
  labels: {
    watch: string;
    channel: string;
  };
};

export function AuthorVideoCard({ video, categoryLabel, channelUrl, labels }: Props) {
  const date = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  const href = video.watchUrl ?? channelUrl ?? "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-foreground/10 bg-card transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
    >
      <div className="relative flex aspect-video items-center justify-center bg-muted/50">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-105 group-hover:honey-glow-sm">
          <Play className="size-6 fill-current" />
        </div>
        {categoryLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-primary">
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium leading-snug group-hover:text-primary">{video.title}</h3>
        {date && <p className="text-xs text-muted-foreground">{date}</p>}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
          {video.watchUrl ? labels.watch : labels.channel}
          <ExternalLink className="size-3.5" />
        </span>
      </div>
    </a>
  );
}
