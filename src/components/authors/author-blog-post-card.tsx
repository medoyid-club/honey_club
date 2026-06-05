import { Calendar, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

type Props = {
  slug: string;
  post: {
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    readingMinutes: number;
  };
  labels: {
    read: string;
    minutes: string;
  };
};

export function AuthorBlogPostCard({ slug, post, labels }: Props) {
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group rounded-xl border border-foreground/10 bg-card p-5 transition-colors hover:border-primary/25 hover:bg-primary/[0.03]">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" />
          {date}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {post.readingMinutes} {labels.minutes}
        </span>
        <Badge variant="outline" className="border-primary/25 text-primary">
          {labels.read}
        </Badge>
      </div>
      <h3 className="font-heading text-xl font-medium tracking-tight group-hover:text-primary">
        <Link href={`/authors/${slug}/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
    </article>
  );
}
