export type AuthorYoutubeMatch = {
  slug: string;
  hints: string[];
};

export const AUTHOR_YOUTUBE_MATCHES: AuthorYoutubeMatch[] = [
  {
    slug: "nata-ustymenko",
    hints: [
      "ната",
      "nata",
      "устименко",
      "ustimenko",
      "ustymenko",
      "philosophy by nata",
      "#nataustimenko",
    ],
  },
  {
    slug: "tetiana-gukalo",
    hints: ["тетяна", "tetiana", "tetianagukalo", "гукало", "gukalo", "#tetianagukalo"],
  },
];

export function videoMatchesAuthor(
  authorSlug: string,
  params: { title: string; description: string; tags: string[] }
): boolean {
  const match = AUTHOR_YOUTUBE_MATCHES.find((a) => a.slug === authorSlug);
  if (!match) return false;

  const haystack = `${params.title}\n${params.description}\n${params.tags.join(" ")}`.toLowerCase();
  return match.hints.some((hint) => haystack.includes(hint.toLowerCase()));
}
