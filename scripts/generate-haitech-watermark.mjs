/**
 * Genera public/brand/haitech-watermark.png desde el logo HAITECH (fondo transparente + opacidad).
 * Uso: node scripts/generate-haitech-watermark.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const INPUT_CANDIDATES = [
  path.join(root, 'public', 'Logo Haitech.png'),
  path.join(root, 'public', 'logo.png'),
  path.join(root, 'public', 'logoclaro.png'),
];

const OUTPUT = path.join(root, 'public', 'brand', 'haitech-watermark.png');
const WATERMARK_OPACITY = 0.42;

function resolveInput() {
  for (const candidate of INPUT_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error('No se encontró un logo HAITECH de origen.');
}

async function main() {
  const input = resolveInput();
  const { data, info } = await sharp(input)
    .resize({ width: 520, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    if (brightness < 42) {
      pixels[i + 3] = 0;
      continue;
    }
    pixels[i + 3] = Math.round(pixels[i + 3] * WATERMARK_OPACITY);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT);

  console.log(`✓ Marca de agua generada: ${path.relative(root, OUTPUT)} (desde ${path.basename(input)})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
