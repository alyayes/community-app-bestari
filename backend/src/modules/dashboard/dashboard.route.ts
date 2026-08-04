import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { successResponse } from '../../utils/response';

const router = Router();

// Mapping Lahan -> LandPlot frontend
function toLandPlot(l: any) {
  return {
    id: l.id,
    blockName: l.blockName,
    cropVariety: l.cropVariety,
    areaSize: l.areaSize,
    plantingDate: l.plantingDate,
    expectedHarvestDate: l.expectedHarvestDate,
    growthProgress: l.growthProgress,
    status: l.status,
    leaderName: l.leaderName,
    estimatedYieldKg: l.estimatedYieldKg,
  };
}

// Mapping Panen -> HarvestRecord frontend
function toHarvestRecord(p: any) {
  return {
    id: p.id,
    date: p.date,
    blockName: p.blockName,
    cropVariety: p.cropVariety,
    weightKg: p.weightKg,
    quality: p.quality,
    recordedBy: p.recordedBy,
    notes: p.notes || '',
  };
}

// ── GET /api/lahan ─────────────────────────────────
router.get('/lahan', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.lahan.findMany({ orderBy: { createdAt: 'asc' } });
    return successResponse(res, data.map(toLandPlot));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/panen ─────────────────────────────────
router.get('/panen', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.panen.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, data.map(toHarvestRecord));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/panen ────────────────────────────────
router.post('/panen', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await prisma.panen.create({ data: req.body });
    return successResponse(res, toHarvestRecord(record), 'Catatan panen berhasil disimpan', 201);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/stats ───────────────────────
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count({
      where: {
        role: 'USER'
      }
    });
    return successResponse(res, { totalUsers });
  } catch (err) {
    next(err);
  }
});

export default router;
