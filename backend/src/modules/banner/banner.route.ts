import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createBannerSchema, updateBannerSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// Mapping Banner -> response frontend
function toBanner(b: any) {
  return {
    id: b.id,
    title: b.title,
    tag: b.tag || '',
    desc: b.desc || '',
    image: b.image,
    linkUrl: b.linkUrl || '',
    order: b.order,
    isActive: b.isActive,
  };
}

// ── GET /api/banner ─────────────────────────────────
// Hanya banner aktif, urut berdasarkan `order` lalu terbaru
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, data.map(toBanner));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/banner/all (ADMIN — termasuk non-aktif) ─
router.get('/all', authenticate, authorize('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.banner.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    return successResponse(res, data.map(toBanner));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/banner/:id ─────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await prisma.banner.findUnique({ where: { id: String(req.params.id) } });
    if (!b) throw new NotFoundError('Banner');
    return successResponse(res, toBanner(b));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/banner (ADMIN) ────────────────────────
router.post('/', authenticate, authorize('ADMIN'), validate(createBannerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await prisma.banner.create({ data: req.body });
    return successResponse(res, toBanner(b), 'Banner berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/banner/:id (ADMIN) ─────────────────────
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateBannerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const b = await prisma.banner.update({ where: { id: String(req.params.id) }, data: req.body });
    return successResponse(res, toBanner(b), 'Banner berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/banner/:id (ADMIN) ──────────────────
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.banner.delete({ where: { id: String(req.params.id) } });
    return successResponse(res, null, 'Banner berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
