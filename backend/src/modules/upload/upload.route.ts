import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../../middleware/upload';
import { authenticate, authorize } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// Bangun URL absolut dari request (protocol + host + path)
const absUrl = (req: Request, filename: string) =>
  `${req.protocol}://${req.get('host')}/uploads/${filename}`;

// ── POST /api/upload (ADMIN) — 1 file ──────────────
router.post('/', authenticate, authorize('ADMIN'), upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }
    const url = absUrl(req, req.file.filename);
    return successResponse(res, { url, filename: req.file.filename }, 'Upload berhasil', 201);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/upload/many (ADMIN) — banyak file ────
router.post('/many', authenticate, authorize('ADMIN'), upload.array('files', 10), (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }
    const urls = files.map(f => absUrl(req, f.filename));
    return successResponse(res, { urls }, `${files.length} file berhasil diupload`, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
