import { createSign } from 'crypto';

import {
  addMediaAlbumItem,
  findMediaAlbumItemByDriveId,
  getMediaAlbumDriveConfig,
  markMediaAlbumDriveSynced,
} from './media-album-store.js';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';

function parseServiceAccountJson() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

async function getServiceAccountAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: DRIVE_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }),
  );

  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key);
  const jwt = `${unsigned}.${signature.toString('base64url')}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`No se pudo autenticar con Google Drive: ${body.slice(0, 200)}`);
  }

  const json = await response.json();
  if (!json.access_token) {
    throw new Error('Google Drive no devolvió un token de acceso');
  }

  return json.access_token;
}

async function resolveDriveAuth() {
  const serviceAccount = parseServiceAccountJson();
  if (serviceAccount?.client_email && serviceAccount?.private_key) {
    return {
      type: 'bearer',
      token: await getServiceAccountAccessToken(serviceAccount),
    };
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
  if (apiKey) {
    return { type: 'apiKey', apiKey };
  }

  return null;
}

function buildDriveListUrl(folderId, pageToken, auth) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'nextPageToken,files(id,name,mimeType,size)',
    pageSize: '100',
    orderBy: 'modifiedTime desc',
  });

  if (pageToken) params.set('pageToken', pageToken);

  if (auth.type === 'apiKey') {
    params.set('key', auth.apiKey);
    params.set('supportsAllDrives', 'true');
    params.set('includeItemsFromAllDrives', 'true');
  }

  return `${DRIVE_FILES_URL}?${params.toString()}`;
}

function buildDriveDownloadUrl(fileId, auth) {
  const params = new URLSearchParams({ alt: 'media' });
  if (auth.type === 'apiKey') {
    params.set('key', auth.apiKey);
  }
  return `${DRIVE_FILES_URL}/${fileId}?${params.toString()}`;
}

function isDriveImageMime(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

function isDriveVideoMime(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('video/');
}

async function listDriveFiles(folderId, auth) {
  const files = [];
  let pageToken = null;

  do {
    const url = buildDriveListUrl(folderId, pageToken, auth);
    const response = await fetch(url, {
      headers: auth.type === 'bearer' ? { Authorization: `Bearer ${auth.token}` } : undefined,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`No se pudo listar la carpeta de Google Drive: ${body.slice(0, 240)}`);
    }

    const json = await response.json();
    if (Array.isArray(json.files)) {
      files.push(...json.files);
    }
    pageToken = json.nextPageToken ?? null;
  } while (pageToken);

  return files;
}

async function downloadDriveFile(fileId, auth) {
  const response = await fetch(buildDriveDownloadUrl(fileId, auth), {
    headers: auth.type === 'bearer' ? { Authorization: `Bearer ${auth.token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar el archivo ${fileId} (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

/**
 * Importa imágenes y vídeos desde la carpeta configurada en Google Drive.
 * Requiere GOOGLE_DRIVE_API_KEY (carpeta pública) o GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON.
 */
export async function syncMediaAlbumFromGoogleDrive() {
  const config = await getMediaAlbumDriveConfig();
  if (!config.folderId) {
    throw new Error('Configura primero la carpeta de Google Drive en el álbum');
  }

  const auth = await resolveDriveAuth();
  if (!auth) {
    throw new Error(
      'Falta GOOGLE_DRIVE_API_KEY o GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON en el servidor',
    );
  }

  const files = await listDriveFiles(config.folderId, auth);
  const mediaFiles = files.filter(
    (file) => isDriveImageMime(file.mimeType) || isDriveVideoMime(file.mimeType),
  );

  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const file of mediaFiles) {
    try {
      const existing = await findMediaAlbumItemByDriveId(file.id);
      if (existing) {
        skipped += 1;
        continue;
      }

      const buffer = await downloadDriveFile(file.id, auth);
      await addMediaAlbumItem({
        buffer,
        mimeType: file.mimeType,
        name: file.name,
        source: 'google_drive',
        google_drive_file_id: file.id,
        kind: isDriveVideoMime(file.mimeType) ? 'video' : 'image',
      });
      imported += 1;
    } catch (error) {
      errors.push({
        fileId: file.id,
        name: file.name,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await markMediaAlbumDriveSynced();

  return {
    imported,
    skipped,
    total: mediaFiles.length,
    errors,
  };
}
