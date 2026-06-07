import type { GoogleAdsPack } from "./types";

export function packToMarkdown(pack: GoogleAdsPack): string {
  const lines: string[] = [
    `# Google Ads pack — ${pack.courseTitle}`,
    "",
    `Generated: ${pack.generatedAt}`,
    `AI copy: ${pack.aiGenerated ? "yes" : "no"}`,
    "",
    "## Landing URLs",
    ...pack.links.map(
      (l) => `- **${l.label}**: ${l.url}\n  - with UTM: ${l.urlWithUtm}`
    ),
    "",
    "## UTM template",
    `\`${pack.utmTemplate}\``,
    "",
    "## Pricing",
    `- Status: ${pack.pricing.status}`,
    `- Current: ${pack.pricing.currentPriceEur ?? "Free"}`,
  ];

  if (pack.pricing.originalPriceEur && pack.pricing.discountPercent) {
    lines.push(
      `- Was: ${pack.pricing.originalPriceEur} (−${pack.pricing.discountPercent}%)`
    );
  }

  lines.push(
    "",
    "## Media",
    `- Cover: ${pack.media.coverUrl ?? "—"}`,
    `- Overview video: ${pack.media.overviewVideoUrl ?? "—"}`,
    ...pack.media.imageNotes.map((n) => `- ${n}`),
    "",
    "## Headlines (RSA, max 30)",
    ...pack.copy.headlines.map((h) => `- ${h}`),
    "",
    "## Long headlines (PMax, max 90)",
    ...pack.copy.longHeadlines.map((h) => `- ${h}`),
    "",
    "## Descriptions (max 90)",
    ...pack.copy.descriptions.map((d) => `- ${d}`),
    "",
    "## Keywords",
    pack.copy.keywords.join(", "),
    "",
    "## Callouts",
    ...pack.copy.callouts.map((c) => `- ${c}`),
    "",
    "## Display paths",
    `- Path 1: ${pack.copy.path1}`,
    `- Path 2: ${pack.copy.path2}`,
    `- Business name: ${pack.copy.businessName}`,
    "",
    "## Conversion events",
    ...pack.conversionEvents.map((e) => `- ${e}`),
    "",
    "## Checklist",
    ...pack.checklist.map((c) => `- [ ] ${c}`)
  );

  return lines.join("\n");
}
