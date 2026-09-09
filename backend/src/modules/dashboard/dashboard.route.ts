import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { successResponse } from '../../utils/response';

const router = Router();

// Pastikan data dashboard SCM selalu real-time (tanpa HTTP cache)
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const EXTERNAL_API_BASE = process.env.EXTERNAL_SCM_API_BASE || 'https://scm.livinglabs.id/api';
const EXTERNAL_API_KEY = process.env.EXTERNAL_SCM_API_KEY || 'sk-0d54af2d5009f7a7fc106c1ed229e5f87a3783fd6cead55f';

// Mapping Lahan (External SCM) -> LandPlot frontend
function toLandPlot(l: any) {
  let status = 'Vegetatif';
  if (l.statusKesiapan === 'Masa Pertumbuhan') status = 'Generatif';
  else if (l.statusKesiapan === 'Masa Panen' || l.statusKesiapan === 'Siap Panen') status = 'Siap Panen';
  else if (l.statusKesiapan === 'Bera (Istirahat)' || l.statusKesiapan === 'Pasca Panen') status = 'Pasca Panen';
  else if (l.statusKesiapan === 'Siap Tanam') status = 'Vegetatif';

  let progress = 15;
  if (status === 'Generatif') progress = 50;
  else if (status === 'Siap Panen') progress = 90;
  else if (status === 'Pasca Panen') progress = 100;
  else if (l.statusKesiapan === 'Siap Tanam') progress = 10;

  return {
    id: String(l.id),
    blockName: l.namaLahan || 'Tanpa Nama',
    cropVariety: l.varietasSorgum || 'Merah',
    areaSize: l.luasHektar ? `${l.luasHektar} Ha` : (l.luasLahan ? `${l.luasLahan} Ha` : '-'),
    plantingDate: l.createdAt?.split('T')[0] || '-',
    expectedHarvestDate: '-',
    growthProgress: progress,
    status: status,
    leaderName: l.pemilikKelompokTani || l.petugas || '-',
    estimatedYieldKg: l.panenLaluTon ? Math.round(l.panenLaluTon * 1000) : (l.jumlahLubang ? Math.round(l.jumlahLubang * 0.1) : 0),
  };
}

// Mapping Panen (External SCM) -> HarvestRecord frontend
function toHarvestRecord(p: any) {
  let quality = 'Grade A';
  if (p.kualitasGrade?.includes('Super') || p.kualitasGrade?.includes('Premium')) quality = 'Super Premium';
  else if (p.kualitasGrade?.includes('Standar') || p.kualitasGrade?.includes('Grade A')) quality = 'Grade A';
  else if (p.kualitasGrade?.includes('Pakan') || p.kualitasGrade?.includes('Grade B')) quality = 'Grade B';

  return {
    id: String(p.id),
    date: p.tanggalPanen || p.createdAt?.split('T')[0] || '-',
    blockName: p.namaLahan || p.lahan?.namaLahan || 'Blok Lahan',
    cropVariety: p.varietas || p.planting?.varietas || 'Merah',
    weightKg: Number(p.jumlahHasilKg) || Number(p.sudahMasukKg) || 0,
    quality: quality,
    recordedBy: p.petaniPenanggungJawab || p.planting?.petugas || '-',
    notes: p.catatan || (p.kodePanen ? `Kode: ${p.kodePanen}` : ''),
  };
}

// Helper: fetch JSON secara aman dari external SCM API (hindari parse HTML saat 404/500/offline)
async function safeFetchJson(url: string, headers: Record<string, string> = {}): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

// ── GET /api/lahan ─────────────────────────────────
router.get('/lahan', async (_req: Request, res: Response) => {
  const result = await safeFetchJson(`${EXTERNAL_API_BASE}/land?limit=100`, {
    'x-api-key': EXTERNAL_API_KEY
  });
  if (result && result.success && Array.isArray(result.data)) {
    return successResponse(res, result.data.map(toLandPlot));
  }
  return successResponse(res, []);
});

// ── GET /api/panen ─────────────────────────────────
router.get('/panen', async (_req: Request, res: Response) => {
  const result = await safeFetchJson(`${EXTERNAL_API_BASE}/harvest?limit=100`, {
    'x-api-key': EXTERNAL_API_KEY
  });
  if (result && result.success && Array.isArray(result.data)) {
    return successResponse(res, result.data.map(toHarvestRecord));
  }
  return successResponse(res, []);
});

// ── PROXY ENDPOINTS untuk data SCM tambahan ───────────

// Helper: generic proxy fetch from external SCM API
async function fetchSCM(endpoint: string, limit = 100) {
  const result = await safeFetchJson(`${EXTERNAL_API_BASE}/${endpoint}?limit=${limit}`, {
    'x-api-key': EXTERNAL_API_KEY
  });
  return (result && result.success && Array.isArray(result.data)) ? result.data : [];
}

// GET /api/dashboard/equipment (Peralatan)
router.get('/equipment', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('equipment');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/production (Produksi)
router.get('/production', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('production');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/certificates (Sertifikat)
router.get('/certificates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('certificates');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/packaging (Kemasan)
router.get('/packaging', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('packaging');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/logistics (Logistik)
router.get('/logistics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('logistics');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/varieties (Varietas)
router.get('/varieties', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('varieties');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/plantings (Penanaman)
router.get('/plantings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('plantings');
    return successResponse(res, data);
  } catch (err) { next(err); }
});

// GET /api/dashboard/warehouse (Gudang)
router.get('/warehouse', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchSCM('warehouse');
    return successResponse(res, data);
  } catch (err) { next(err); }
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
