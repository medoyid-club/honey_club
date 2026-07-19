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
    coverUrl?: string | null;
  };
  labels: {
    read: string;
    minutes: string;
  };
  /** When true, title links to the post (list view). When false, plain heading (detail view). */
  linkTitle?: boolean;
};

export function AuthorBlogPostCard({ slug, post, labels, linkTitle = true }: Props) {
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group overflow-hidden rounded-xl border border-foreground/10 bg-card transition-colors hover:border-primary/25 hover:bg-primary/[0.03]">
      {post.coverUrl ? (
        <div className="aspect-[2/1] w-full overflow-hidden bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <div className="p-5">
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
          {linkTitle ? (
            <Link href={`/authors/${slug}/blog/${post.slug}`}>{post.title}</Link>
          ) : (
            post.title
          )}
        </h3>
        {post.excerpt ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
