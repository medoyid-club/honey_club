export function slugify(input: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", ґ: "g", д: "d", е: "e", є: "ie", ё: "e",
    ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h",
    ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e",
    ю: "iu", я: "ia",
  };

  const lower = input.trim().toLowerCase();
  let out = "";
  for (const ch of lower) {
    out += translit[ch] ?? ch;
  }

  return (
    out
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}
