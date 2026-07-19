import { Mail } from "lucide-react";

type Props = {
  title: string;
  description: string;
  email: string;
};

export function ContactEmailCard({ title, description, email }: Props) {
  return (
    <a
      href={`mailto:${email}`}
      className="group flex gap-4 rounded-xl border border-foreground/10 bg-card p-5 transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Mail className="size-4" />
      </span>
      <span className="min-w-0 space-y-1">
        <span className="block font-heading text-base font-medium tracking-tight group-hover:text-primary">
          {title}
        </span>
        <span className="block text-sm text-muted-foreground">{description}</span>
        <span className="block pt-1 text-sm font-medium text-primary">{email}</span>
      </span>
    </a>
  );
}
