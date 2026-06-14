import sharp from 'sharp';
import path from 'node:path';

const src = process.argv[2];
const baseName = process.argv[3] ?? 'hero-ricoh-banner';
const heroDir = path.join(process.cwd(), 'public', 'hero');
const base = path.join(heroDir, baseName);

if (!src) {
  console.error('Uso: node scripts/import-hero-banner.mjs <ruta-imagen> [nombre-base]');
  process.exit(1);
}

const input = sharp(src);
const { width, height } = await input.metadata();

await input.clone().png({ compressionLevel: 9 }).toFile(`${base}.png`);
await input
  .clone()
  .resize(width * 2, height * 2, { kernel: sharp.kernel.lanczos3 })
  .sharpen({ sigma: 0.5 })
  .png({ compressionLevel: 9 })
  .toFile(`${base}@2x.png`);
await sharp(`${base}.png`).webp({ quality: 92, effort: 6 }).toFile(`${base}.webp`);
await sharp(`${base}@2x.png`).webp({ quality: 92, effort: 6 }).toFile(`${base}@2x.webp`);

console.log(`Importado ${baseName}: ${width}x${height}`);
