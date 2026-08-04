import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createArtikelSchema, updateArtikelSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';
import { timeAgo, formatDateID } from '../../utils/format';

const router = Router();

// Mapping Artikel -> InfoArticle frontend
function toArticle(a: any) {
  const content: string[] = typeof a.content === 'string' ? JSON.parse(a.content) : (a.content || []);
  const gallery: string[] = typeof a.gallery === 'string' ? JSON.parse(a.gallery) : (a.gallery || []);
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    timeAgo: timeAgo(a.createdAt),
    date: formatDateID(a.createdAt),
    image: a.image || '',
    summary: a.summary,
    content,
    gallery,
    author: {
      name: a.authorName || '',
      role: a.authorRole || '',
      avatar: a.authorAvatar || '',
    },
    location: a.location || '',
    participantsCount: a.participantsCount || 0,
    status: a.status || 'Published',
  };
}

// ── GET /api/artikel ───────────────────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.artikel.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, data.map(toArticle));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/artikel/:id ───────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await prisma.artikel.findUnique({ where: { id: String(req.params.id) } });
    if (!a) throw new NotFoundError('Artikel');
    return successResponse(res, toArticle(a));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/artikel (ADMIN) ──────────────────────
router.post('/', authenticate, authorize('ADMIN'), validate(createArtikelSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await prisma.artikel.create({ data: req.body });
    return successResponse(res, toArticle(a), 'Artikel berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/artikel/:id (ADMIN) ───────────────────
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateArtikelSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await prisma.artikel.update({ where: { id: String(req.params.id) }, data: req.body });
    return successResponse(res, toArticle(a), 'Artikel berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/artikel/:id (ADMIN) ────────────────
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.artikel.delete({ where: { id: String(req.params.id) } });
    return successResponse(res, null, 'Artikel berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
