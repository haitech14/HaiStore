import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'brands');
const assetsDir =
  'C:/Users/nicol/.cursor/projects/c-Users-nicol-HaiStore/assets';

/**
 * Normaliza logos de marca conservando color: recorta fondo claro/oscuro y exporta PNG.
 * @param {string} input
 * @param {string} output
 * @param {{ darkBackground?: boolean; maxWidth?: number }} [options]
 */
async function processBrandLogoColor(input, output, options = {}) {
  const { darkBackground = false, maxWidth = 320 } = options;

  const { data, info } = await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const brightness = (r + g + b) / 3;

    if (darkBackground) {
      if (brightness < 48) {
        pixels[i + 3] = 0;
      }
      continue;
    }

    if (brightness > 240) {
      pixels[i + 3] = 0;
    }
  }

  mkdirSync(dirname(output), { recursive: true });
  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8 })
    .png()
    .toFile(output);
}

/** @deprecated Solo para filas oscuras del hero; usar processBrandLogoColor en footer claro. */
async function processBrandLogoMonochrome(input, output, options = {}) {
  const { darkBackground = false } = options;
  const { data, info } = await sharp(input)
    .resize({ width: 320, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8ClampedArray(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const brightness = (r + g + b) / 3;

    if (darkBackground) {
      if (brightness < 48) {
        pixels[i + 3] = 0;
      } else {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
      continue;
    }

    if (brightness > 232) {
      pixels[i + 3] = 0;
      continue;
    }

    const alpha = Math.min(255, Math.round(120 + (255 - brightness) * 1.1));
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = alpha;
  }

  mkdirSync(dirname(output), { recursive: true });
  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(output);
}

const colorJobs = [
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Ricoh_logo-6f58ae56-f199-427f-a0f5-56d0c6d265b1.png',
    ),
    output: join(outDir, 'ricoh.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Konica_MInolta_Logo_v2-57a4dc1a-3553-4bce-8d5e-ffebf6560d47.png',
    ),
    output: join(outDir, 'konica-minolta.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Canon-28c2ea27-d453-428a-8398-d4f1aa39285e.png',
    ),
    output: join(outDir, 'canon.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_EPSON_Logo-23529375-24cf-4056-a3f6-d3005533f987.png',
    ),
    output: join(outDir, 'epson.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_HP_logo-f6c48450-ed88-41dc-9c33-d15a76db2d13.png',
    ),
    output: join(outDir, 'hp.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_kyocera_Logo-3de483d4-ded4-4c8d-a2e4-a2e3183fd83c.png',
    ),
    output: join(outDir, 'kyocera.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Lexmark_logo-6ff6b2bf-72ae-4ea0-a1c7-5a0a43f139df.png',
    ),
    output: join(outDir, 'lexmark.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Oki_logo_v2-4e73c583-ae5e-4d5d-85b8-b9e8d4448c4b.png',
    ),
    output: join(outDir, 'oki.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_PANTUM_LOGO-b24a9e00-47dc-4d4f-8d13-24b267147d6b.png',
    ),
    output: join(outDir, 'pantum.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Colortrac_logo-5a8ced66-6333-42b2-98d9-16653c9fa5e2.png',
    ),
    output: join(outDir, 'colortrac.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_images__1_-2d00998f-f1da-46b4-a1f7-8ffc25cfeb94.png',
    ),
    output: join(outDir, 'ramko.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_topjet-c03b1148-616d-4fae-a1ce-883ed0ce2090.png',
    ),
    output: join(outDir, 'topjet.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_DENSITONE-PREMIUM-79a457c4-e11c-442c-a469-169ac1d1e3a7.png',
    ),
    output: join(outDir, 'densitone.png'),
    darkBackground: true,
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_images__2_-19a60a15-09bd-4b17-98e4-735473ebdb79.png',
    ),
    output: join(outDir, 'intercopy.png'),
  },
  {
    input: join(
      assetsDir,
      'c__Users_nicol_AppData_Roaming_Cursor_User_workspaceStorage_dc094e373b9b7e4ab4a5d040a97b79d9_images_Katun_logo-f32a7eb7-d51f-42be-a4e7-42ee139bdb46.png',
    ),
    output: join(outDir, 'katun.png'),
  },
];

for (const job of colorJobs) {
  await processBrandLogoColor(job.input, job.output, {
    darkBackground: job.darkBackground,
  });
  console.log(`OK ${job.output}`);
}

export { processBrandLogoColor, processBrandLogoMonochrome };
