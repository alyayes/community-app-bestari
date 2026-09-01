import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { successResponse } from '../../utils/response';

const router = Router();

// ==========================================
// PUBLIC (or Authed) ROUTES for SCM
// ==========================================

// Get all Lahan
router.get('/lahan', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.lahan.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// Get all Panen
router.get('/panen', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.panen.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN ROUTES for SCM
// ==========================================
router.use(authenticate, authorize('ADMIN'));

// Lahan Admin Routes
router.post('/lahan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blockName, cropVariety, areaSize, plantingDate, expectedHarvestDate, growthProgress, status, leaderName, estimatedYieldKg } = req.body;
    
    const lahan = await prisma.lahan.create({
      data: {
        blockName,
        cropVariety,
        areaSize,
        plantingDate,
        expectedHarvestDate,
        growthProgress: Number(growthProgress) || 0,
        status,
        leaderName,
        estimatedYieldKg: Number(estimatedYieldKg) || 0
      }
    });
    return successResponse(res, lahan, 'Lahan berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
});

router.put('/lahan/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { blockName, cropVariety, areaSize, plantingDate, expectedHarvestDate, growthProgress, status, leaderName, estimatedYieldKg } = req.body;
    
    const lahan = await prisma.lahan.update({
      where: { id },
      data: {
        blockName,
        cropVariety,
        areaSize,
        plantingDate,
        expectedHarvestDate,
        growthProgress: Number(growthProgress) || 0,
        status,
        leaderName,
        estimatedYieldKg: Number(estimatedYieldKg) || 0
      }
    });
    return successResponse(res, lahan, 'Lahan berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

router.delete('/lahan/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.lahan.delete({ where: { id } });
    return successResponse(res, null, 'Lahan berhasil dihapus');
  } catch (err) {
    next(err);
  }
});


// Panen Admin Routes
router.post('/panen', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, blockName, cropVariety, weightKg, quality, recordedBy, notes } = req.body;
    
    const panen = await prisma.panen.create({
      data: {
        date,
        blockName,
        cropVariety,
        weightKg: Number(weightKg) || 0,
        quality,
        recordedBy,
        notes: notes || ''
      }
    });
    return successResponse(res, panen, 'Panen berhasil ditambahkan');
  } catch (err) {
    next(err);
  }
});

router.put('/panen/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, blockName, cropVariety, weightKg, quality, recordedBy, notes } = req.body;
    
    const panen = await prisma.panen.update({
      where: { id },
      data: {
        date,
        blockName,
        cropVariety,
        weightKg: Number(weightKg) || 0,
        quality,
        recordedBy,
        notes: notes || ''
      }
    });
    return successResponse(res, panen, 'Panen berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

router.delete('/panen/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.panen.delete({ where: { id } });
    return successResponse(res, null, 'Panen berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
