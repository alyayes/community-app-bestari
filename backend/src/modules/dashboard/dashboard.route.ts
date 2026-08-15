import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { successResponse } from '../../utils/response';

const router = Router();

const EXTERNAL_API_BASE = 'https://scm-bestari.kolab.top/api';
const EXTERNAL_API_KEY = process.env.EXTERNAL_SCM_API_KEY || '';

// Mapping Lahan (External) -> LandPlot frontend
function toLandPlot(l: any) {
  let status = 'Vegetatif';
  if (l.statusKesiapan === 'Masa Pertumbuhan') status = 'Generatif';
  else if (l.statusKesiapan === 'Masa Panen') status = 'Siap Panen';
  else if (l.statusKesiapan === 'Bera (Istirahat)') status = 'Pasca Panen';

  let progress = 10;
  if (status === 'Generatif') progress = 50;
  else if (status === 'Siap Panen') progress = 90;
  else if (status === 'Pasca Panen') progress = 100;

  return {
    id: l.id,
    blockName: l.namaLahan || 'Tanpa Nama',
    cropVariety: l.varietasSorgum || '-',
    areaSize: l.luasHektar ? `${l.luasHektar} Ha` : '-',
    plantingDate: l.createdAt?.split('T')[0] || '-',
    expectedHarvestDate: '-',
    growthProgress: progress,
    status: status,
    leaderName: l.pemilikKelompokTani || '-',
    estimatedYieldKg: l.panenLaluTon ? l.panenLaluTon * 1000 : 0,
  };
}

// Mapping Panen (External) -> HarvestRecord frontend
function toHarvestRecord(p: any) {
  let quality = 'Grade A';
  if (p.kualitasGrade?.includes('Premium')) quality = 'Super Premium';
  else if (p.kualitasGrade?.includes('Standar')) quality = 'Grade A';
  else if (p.kualitasGrade?.includes('Pakan')) quality = 'Grade B';

  return {
    id: p.id,
    date: p.tanggalPanen || '-',
    blockName: p.namaLahan || '-',
    cropVariety: p.varietas || '-',
    weightKg: p.jumlahHasilKg || 0,
    quality: quality,
    recordedBy: p.petaniPenanggungJawab || '-',
    notes: p.catatan || '',
  };
}

// ── GET /api/lahan ─────────────────────────────────
router.get('/lahan', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/land?limit=100`, {
      headers: { 'x-api-key': EXTERNAL_API_KEY }
    });
    const result = await response.json();
    if (result.success && result.data) {
      return successResponse(res, result.data.map(toLandPlot));
    }
    return successResponse(res, []);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/panen ─────────────────────────────────
router.get('/panen', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/harvest?limit=100`, {
      headers: { 'x-api-key': EXTERNAL_API_KEY }
    });
    const result = await response.json();
    if (result.success && result.data) {
      return successResponse(res, result.data.map(toHarvestRecord));
    }
    return successResponse(res, []);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/panen ────────────────────────────────
router.post('/panen', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // API Eksternal membutuhkan JWT untuk tulis, kita tolak via API Key
    throw new Error("Penambahan panen sementara dinonaktifkan karena migrasi ke API eksternal (Read-Only).");
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/members ───────────────────────
router.get('/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER', isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        lahanLocation: true,
        sorghumType: true,
        memberSince: true,
        avatar: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, users);
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
