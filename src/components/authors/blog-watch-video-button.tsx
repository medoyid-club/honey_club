import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { youtubeWatchUrl } from "@/lib/authors/db";

type Props = {
  videoId: string;
  label: string;
};

export function BlogWatchVideoButton({ videoId, label }: Props) {
  const href = youtubeWatchUrl(videoId);
  if (!href) return null;

  return (
    <div className="flex justify-start pt-2">
      <Button
        nativeButton={false}
        className="honey-glow-sm gap-2"
        render={
          <a href={href} target="_blank" rel="noopener noreferrer" />
        }
      >
        {label}
        <ExternalLink className="size-4" />
      </Button>
    </div>
  );
}
