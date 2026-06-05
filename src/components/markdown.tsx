import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="font-heading text-2xl font-semibold tracking-tight" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mt-6 font-heading text-xl font-semibold tracking-tight" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mt-4 font-heading text-lg font-semibold" {...props} />
          ),
          p: ({ ...props }) => <p className="text-foreground/90" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc space-y-1 pl-6 text-foreground/90" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal space-y-1 pl-6 text-foreground/90" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-primary underline underline-offset-4" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground"
              {...props}
            />
          ),
          code: ({ ...props }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
