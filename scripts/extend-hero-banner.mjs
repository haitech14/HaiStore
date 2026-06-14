/**
 * Extiende el banner hero horizontalmente sin reescalar el contenido original.
 * Uso: node scripts/extend-hero-banner.mjs [nombre-base] [ancho-1x]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const HERO_DIR = path.join(process.cwd(), 'public', 'hero');
const baseName = process.argv[2] ?? 'hero-ricoh-banner';
const target1xWidth = Number.parseInt(process.argv[3] ?? '1920', 10);

async function extendHorizontal(inputPath, outputPath, targetWidth) {
  const { width, height } = await sharp(inputPath).metadata();

  if (width >= targetWidth) {
    if (inputPath !== outputPath) {
      fs.copyFileSync(inputPath, outputPath);
    }
    console.log(`  ${path.basename(outputPath)} ya es ${width}px, sin cambios.`);
    return width;
  }

  const left = Math.floor((targetWidth - width) / 2);
  const tempPath = `${outputPath}.tmp.png`;

  await sharp({
    create: {
      width: targetWidth,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: inputPath, left, top: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tempPath);

  fs.renameSync(tempPath, outputPath);

  console.log(`  ${path.basename(inputPath)} ${width}px → ${targetWidth}px (+${targetWidth - width}px)`);
  return targetWidth;
}

const base1x = path.join(HERO_DIR, `${baseName}.png`);
const base2x = path.join(HERO_DIR, `${baseName}@2x.png`);
const target2xWidth = target1xWidth * 2;

if (!fs.existsSync(base1x)) {
  console.error(`No se encontró: ${base1x}`);
  process.exit(1);
}

console.log(`Extendiendo ${baseName} a ${target1xWidth}px (1x) / ${target2xWidth}px (2x)...`);
await extendHorizontal(base1x, base1x, target1xWidth);

if (fs.existsSync(base2x)) {
  await extendHorizontal(base2x, base2x, target2xWidth);
}

const meta = await sharp(base1x).metadata();
console.log(`Listo: ${baseName} → ${meta.width}x${meta.height}`);
