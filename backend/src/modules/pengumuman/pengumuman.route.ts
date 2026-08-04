import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createPengumumanSchema, updatePengumumanSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';
import { timeAgo, formatTimeWIB } from '../../utils/format';

const router = Router();

// Mapping Pengumuman -> Announcement frontend
function toAnnouncement(p: any) {
  const bulletPoints: string[] = typeof p.bulletPoints === 'string' ? JSON.parse(p.bulletPoints) : (p.bulletPoints || []);
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    badgeColor: p.badgeColor || '#2C4219',
    timeAgo: timeAgo(p.createdAt),
    postedBy: p.postedBy || 'Admin',
    postedTime: p.postedTime || formatTimeWIB(p.createdAt),
    summary: p.summary,
    content: p.content,
    bulletPoints,
    eventDate: p.eventDate || '',
    eventTime: p.eventTime || '',
    location: p.location || '',
    targetParticipants: p.targetParticipants || '',
    note: p.note || '',
    isUrgent: p.isUrgent,
  };
}

// ── GET /api/pengumuman ────────────────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.pengumuman.findMany({
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, data.map(toAnnouncement));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/pengumuman/:id ────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await prisma.pengumuman.findUnique({ where: { id: String(req.params.id) } });
    if (!p) throw new NotFoundError('Pengumuman');
    return successResponse(res, toAnnouncement(p));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pengumuman (ADMIN) ───────────────────
router.post('/', authenticate, authorize('ADMIN'), validate(createPengumumanSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await prisma.pengumuman.create({
      data: { ...req.body, postedBy: req.user!.name || 'Admin' },
    });
    return successResponse(res, toAnnouncement(p), 'Pengumuman berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/pengumuman/:id (ADMIN) ────────────────
router.put('/:id', authenticate, authorize('ADMIN'), validate(updatePengumumanSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await prisma.pengumuman.update({ where: { id: String(req.params.id) }, data: req.body });
    return successResponse(res, toAnnouncement(p), 'Pengumuman berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/pengumuman/:id (ADMIN) ─────────────
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.pengumuman.delete({ where: { id: String(req.params.id) } });
    return successResponse(res, null, 'Pengumuman berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
