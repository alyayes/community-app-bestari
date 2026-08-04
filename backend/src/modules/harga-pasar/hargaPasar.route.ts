import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createHargaPasarSchema, updateHargaPasarSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// Mapping HargaPasar -> response frontend
function toHarga(h: any) {
  return {
    id: h.id,
    item: h.item,
    price: h.price,
    trend: h.trend,
    percentage: h.percentage,
    order: h.order,
    isActive: h.isActive,
  };
}

// ── GET /api/harga-pasar ────────────────────────────
// Hanya item aktif, urut berdasarkan `order`
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.hargaPasar.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, data.map(toHarga));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/harga-pasar/all (ADMIN) ────────────────
router.get('/all', authenticate, authorize('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.hargaPasar.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    return successResponse(res, data.map(toHarga));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/harga-pasar/:id ────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await prisma.hargaPasar.findUnique({ where: { id: String(req.params.id) } });
    if (!h) throw new NotFoundError('Harga pasar');
    return successResponse(res, toHarga(h));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/harga-pasar (ADMIN) ───────────────────
router.post('/', authenticate, authorize('ADMIN'), validate(createHargaPasarSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await prisma.hargaPasar.create({ data: req.body });
    return successResponse(res, toHarga(h), 'Harga pasar berhasil ditambahkan', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/harga-pasar/:id (ADMIN) ────────────────
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateHargaPasarSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const h = await prisma.hargaPasar.update({ where: { id: String(req.params.id) }, data: req.body });
    return successResponse(res, toHarga(h), 'Harga pasar berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/harga-pasar/:id (ADMIN) ─────────────
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.hargaPasar.delete({ where: { id: String(req.params.id) } });
    return successResponse(res, null, 'Harga pasar berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
