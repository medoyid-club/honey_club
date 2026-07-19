import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const logoPath = join(root, "public/brand/logo.png");
const logo = await readFile(logoPath);

async function brandedIcon(size, logoSize, radius) {
  const background = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3d78a"/>
          <stop offset="100%" stop-color="#c8960c"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
    </svg>`
  );

  const mark = await sharp(logo).resize(logoSize, logoSize, { fit: "contain" }).png().toBuffer();
  const left = Math.round((size - logoSize) / 2);
  const top = Math.round((size - logoSize) / 2);

  return sharp(background)
    .composite([{ input: mark, left, top }])
    .png()
    .toBuffer();
}

const icon32 = await brandedIcon(32, 24, 8);
const icon180 = await brandedIcon(180, 132, 36);

await writeFile(join(root, "public/favicon-32.png"), icon32);
await writeFile(join(root, "public/apple-touch-icon.png"), icon180);
await writeFile(join(root, "public/favicon.ico"), icon32);

console.log("Wrote public/favicon-32.png, public/apple-touch-icon.png, public/favicon.ico");
