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
const EXTERNAL_API_KEY = process.env.EXTERNAL_SCM_API_KEY || '';

// Mapping Lahan (External SCM) -> LandPlot frontend.
// `pl` = penanaman terbaru di lahan tsb (SCM /plantings) -> sumber varietas, tgl tanam, estimasi panen.
function toLandPlot(l: any, pl?: any) {
  // Status asli SCM: status tanam (Ditanam/Tumbuh/Siap Panen/Gagal/Dipanen) bila ada penanaman,
  // selain itu status kesiapan lahan (Siap Tanam/Masa Pertumbuhan/Masa Panen/Bera (Istirahat)).
  const status = pl?.statusTanam || l.statusKesiapan || '-';

  const plantingDate = pl?.tanggalTanam || '-';
  const expectedHarvestDate = pl?.estimasiPanen || '-';

  // Progress dari rentang tanam -> estimasi panen (SCM); tanpa penanaman = 0.
  let progress = 0;
  const t0 = Date.parse(plantingDate), t1 = Date.parse(expectedHarvestDate);
  if (!isNaN(t0) && !isNaN(t1) && t1 > t0) {
    progress = Math.max(0, Math.min(100, Math.round(((Date.now() - t0) / (t1 - t0)) * 100)));
  }
  if (pl?.statusTanam === 'Dipanen') progress = 100;

  return {
    id: String(l.id),
    blockName: l.namaLahan || 'Tanpa Nama',
    cropVariety: pl?.varietas || l.varietasSorgum || '-',
    areaSize: l.luasHektar != null ? `${l.luasHektar} Ha` : '-',
    plantingDate,
    expectedHarvestDate,
    growthProgress: progress,
    status,
    leaderName: pl?.petugas || l.pemilikKelompokTani || '-',
    estimatedYieldKg: l.panenLaluTon ? Math.round(l.panenLaluTon * 1000) : 0,
  };
}

// Mapping Panen (External SCM) -> HarvestRecord frontend
function toHarvestRecord(p: any) {
  return {
    id: String(p.id),
    date: p.tanggalPanen || p.createdAt?.split('T')[0] || '-',
    blockName: p.namaLahan || p.lahan?.namaLahan || '-',
    cropVariety: p.varietas || p.planting?.varietas || '-',
    weightKg: Number(p.jumlahHasilKg) || 0,
    quality: p.kualitasGrade || '-', // asli SCM: Grade A (Premium) / Grade B (Standar) / Grade C (Pakan)
    recordedBy: p.petaniPenanggungJawab || p.planting?.petugas || '-',
    notes: p.catatan || (p.kodePanen ? `Kode: ${p.kodePanen}` : ''),
  };
}

// Mapping Batch Produksi (External SCM /production) -> ProductionBatch frontend
function toProduction(b: any) {
  const inputKg = Number(b.bahanDigunakan) || 0;
  const outputQty = Number(b.jumlahHasil) || 0;
  const unit = String(b.satuan || '').trim();
  const isKg = /^kg$/i.test(unit);
  return {
    id: String(b.id),
    batchCode: b.kodeBatch || '-',
    date: b.tanggalProduksi || '-',
    blockName: b.lahan?.namaLahan || '-',
    cropVariety: b.planting?.varietas || '-',
    inputKg,
    outputQty,
    unit,
    rendemen: isKg && inputKg > 0 ? `${((outputQty / inputKg) * 100).toFixed(1)}%` : '-',
    productType: b.namaProduk || '-',
    status: b.statusQC || '-', // Lolos QC / Pending QC / Revisi Batch
  };
}

// Helper: fetch JSON secara aman dari external SCM API (hindari parse HTML saat 404/500/offline)
async function safeFetchJson(url: string, headers: Record<string, string> = {}): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

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
  const headers = { 'x-api-key': EXTERNAL_API_KEY };
  const [result, plantings] = await Promise.all([
    safeFetchJson(`${EXTERNAL_API_BASE}/land?limit=100`, headers),
    safeFetchJson(`${EXTERNAL_API_BASE}/plantings?limit=100`, headers),
  ]);
  if (result && result.success && Array.isArray(result.data)) {
    // penanaman terbaru per lahanId
    const latest = new Map<string, any>();
    for (const p of (plantings?.data || [])) {
      const k = String(p.lahanId);
      const cur = latest.get(k);
      if (!cur || String(p.tanggalTanam) > String(cur.tanggalTanam)) latest.set(k, p);
    }
    return successResponse(res, result.data.map((l: any) => toLandPlot(l, latest.get(String(l.id)))));
  }
  console.error('[SCM] /land gagal:', result?.message || 'tidak ada respons');
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
  console.error('[SCM] /harvest gagal:', result?.message || 'tidak ada respons');
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
    return successResponse(res, data.map(toProduction));
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
