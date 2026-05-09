/**
 * Generates one PNG + SVG QR per location into ./qrs/.
 *
 * Edit the SOURCES list below with your real spots and run:
 *   pnpm run qr             (uses default base URL)
 *   BASE_URL=https://allons.app pnpm run qr
 *
 * Each QR encodes:
 *   {BASE_URL}/?src={slug}
 *
 * The slug is what shows up in the `source` column of the `waitlist` table,
 * so you can later run:
 *   select * from waitlist_by_source;
 *
 * Tips:
 * - Keep slugs short, lowercase, no spaces. They appear in the URL.
 * - Use the same slug across reprints for a location so analytics stay clean.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import QRCode from "qrcode";

interface Source {
  slug: string;          // goes into ?src=
  label?: string;        // human label, only used in filename
}

const SOURCES: Source[] = [
  { slug: "la20", label: "La 20 Cervecería" },
  { slug: "diunsa", label: "Diunsa" },
  { slug: "multiplaza", label: "Mall Multiplaza" },
  // Add more here as you scout locations.
];

const BASE_URL = process.env.BASE_URL ?? "https://allons.app";
const OUT_DIR = path.resolve(process.cwd(), "qrs");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const summary: { slug: string; url: string; png: string; svg: string }[] = [];

  for (const src of SOURCES) {
    const url = `${BASE_URL}/?src=${encodeURIComponent(src.slug)}`;
    const safeName = src.slug.replace(/[^a-z0-9-_]/gi, "");

    const pngPath = path.join(OUT_DIR, `${safeName}.png`);
    const svgPath = path.join(OUT_DIR, `${safeName}.svg`);

    await QRCode.toFile(pngPath, url, {
      width: 1024,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });

    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    await fs.writeFile(svgPath, svg, "utf8");

    summary.push({ slug: src.slug, url, png: pngPath, svg: svgPath });
    console.log(`✓ ${src.label ?? src.slug}  →  ${url}`);
  }

  const indexPath = path.join(OUT_DIR, "index.json");
  await fs.writeFile(indexPath, JSON.stringify(summary, null, 2));
  console.log(`\nGenerated ${summary.length} QR codes in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
