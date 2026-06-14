/**
 * Regenera variantes responsive del banner hero desde la mejor fuente disponible (@2x).
 * Uso: node scripts/generate-hero-banner-variants.mjs [nombre-base]
 * Ejemplo: node scripts/generate-hero-banner-variants.mjs hero-ricoh-banner
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const HERO_DIR = path.join(process.cwd(), 'public', 'hero');
const baseName = process.argv[2] ?? 'hero-ricoh-banner';
const masterPath = path.join(HERO_DIR, `${baseName}@2x.png`);

if (!fs.existsSync(masterPath)) {
  console.error(`No se encontró master: ${masterPath}`);
  process.exit(1);
}

const master = sharp(masterPath);
const { width: masterWidth, height: masterHeight } = await master.metadata();
const aspect = masterWidth / masterHeight;

const scales = [
  { suffix: '', width: Math.round(masterWidth / 2) },
  { suffix: '@2x', width: masterWidth },
  { suffix: '@3x', width: Math.round(masterWidth * 1.5) },
  { suffix: '@4x', width: masterWidth * 2 },
  { suffix: '@5x', width: Math.round(masterWidth * 2.5) },
  { suffix: '@6x', width: masterWidth * 3 },
];

async function upscaleBuffer(input, targetWidth, targetHeight) {
  let buffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  let { width: currentWidth, height: currentHeight } = await sharp(buffer).metadata();

  while (currentWidth < targetWidth) {
    const nextWidth = Math.min(currentWidth * 2, targetWidth);
    const nextHeight = Math.round((nextWidth / currentWidth) * currentHeight);
    buffer = await sharp(buffer)
      .resize(nextWidth, nextHeight, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 6 })
      .toBuffer();
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  return sharp(buffer).resize(targetWidth, targetHeight, {
    fit: 'fill',
    kernel: sharp.kernel.lanczos3,
  });
}

function sharpenForScale(pipeline, targetWidth) {
  if (targetWidth > masterWidth * 1.5) {
    return pipeline.sharpen({ sigma: 0.55, m1: 1.15, m2: 0.28, x1: 2, y2: 10, y3: 20 });
  }
  if (targetWidth > masterWidth) {
    return pipeline.sharpen({ sigma: 0.42, m1: 1.05, m2: 0.32, x1: 2, y2: 10, y3: 20 });
  }
  return pipeline.sharpen({ sigma: 0.28, m1: 1.0, m2: 0.35 });
}

function webpQualityForWidth(width) {
  if (width >= masterWidth * 2) return 97;
  if (width >= masterWidth) return 96;
  return 94;
}

async function resizePipeline(input, targetWidth) {
  const targetHeight = Math.round(targetWidth / aspect);
  let buffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  const { width: currentWidth } = await sharp(buffer).metadata();

  if (targetWidth <= currentWidth) {
    return sharp(buffer)
      .resize(targetWidth, targetHeight, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.2, m1: 1.0, m2: 0.4 });
  }

  const upscaled = await upscaleBuffer(buffer, targetWidth, targetHeight);
  return sharpenForScale(upscaled, targetWidth);
}

const masterBuffer = fs.readFileSync(masterPath);

for (const { suffix, width } of scales) {
  const pngOut = path.join(HERO_DIR, `${baseName}${suffix}.png`);
  const webpOut = path.join(HERO_DIR, `${baseName}${suffix}.webp`);

  const pipeline = await resizePipeline(masterBuffer, width);
  const webpQuality = webpQualityForWidth(width);

  await pipeline
    .clone()
    .webp({ quality: webpQuality, effort: 6, smartSubsample: true, nearLossless: webpQuality >= 97 })
    .toFile(webpOut);

  if (width <= masterWidth * 2) {
    await pipeline.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(pngOut);
  }

  const meta = await sharp(webpOut).metadata();
  console.log(`✓ ${baseName}${suffix} → ${meta.width}x${meta.height}`);
}

console.log(`Listo: variantes de ${baseName} regeneradas desde ${masterWidth}x${masterHeight}.`);
