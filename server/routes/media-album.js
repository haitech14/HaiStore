import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { syncMediaAlbumFromGoogleDrive } from '../lib/google-drive-media-sync.js';
import {
  addMediaAlbumItem,
  deleteMediaAlbumItem,
  getMediaAlbumDriveConfig,
  listMediaAlbumItems,
  updateMediaAlbumDriveConfig,
} from '../lib/media-album-store.js';

export const mediaAlbumRouter = Router();

mediaAlbumRouter.get('/', requireAdmin, async (req, res, next) => {
  try {
    const kind = typeof req.query.kind === 'string' ? req.query.kind : undefined;
    const items = await listMediaAlbumItems({ kind });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

mediaAlbumRouter.get('/drive', requireAdmin, async (_req, res, next) => {
  try {
    const config = await getMediaAlbumDriveConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
});

mediaAlbumRouter.put('/drive', requireAdmin, async (req, res, next) => {
  try {
    const config = await updateMediaAlbumDriveConfig({
      folderUrl: req.body?.folderUrl,
      folderId: req.body?.folderId,
    });
    res.json(config);
  } catch (error) {
    next(error);
  }
});

mediaAlbumRouter.post('/drive/sync', requireAdmin, async (_req, res, next) => {
  try {
    const result = await syncMediaAlbumFromGoogleDrive();
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

mediaAlbumRouter.post('/upload', requireAdmin, async (req, res, next) => {
  try {
    const { dataUrl, name, kind } = req.body ?? {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Falta dataUrl de la imagen o vídeo' });
    }

    const item = await addMediaAlbumItem({
      dataUrl,
      name: typeof name === 'string' ? name : 'Subida',
      source: 'upload',
      kind,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

mediaAlbumRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteMediaAlbumItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Elemento del álbum no encontrado' });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
