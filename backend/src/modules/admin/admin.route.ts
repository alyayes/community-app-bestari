import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { successResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

const router = Router();

// ═══ SEMUA ROUTE ADMIN BUTUH TOKEN + ROLE ADMIN ═══
router.use(authenticate, authorize('ADMIN'));

// ── GET /api/admin/dashboard ──────────────────────
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUser, totalArtikel, totalPengumuman, totalAgenda, totalThread] = await Promise.all([
      prisma.user.count(),
      prisma.artikel.count(),
      prisma.pengumuman.count(),
      prisma.agenda.count(),
      prisma.thread.count(),
    ]);

    return successResponse(res, {
      totalUser,
      totalArtikel,
      totalPengumuman,
      totalAgenda,
      totalThread,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/stats — statistik per bulan utk dashboard ──
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    // 6 bulan terakhir (Mei..Okt atau sesuai data)
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('id-ID', { month: 'short' });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      months.push({ label, start, end });
    }

    const [artikelAll, pengumumanAll, threadAll, agendaAll, userAll] = await Promise.all([
      prisma.artikel.findMany({ select: { createdAt: true } }),
      prisma.pengumuman.findMany({ select: { createdAt: true } }),
      prisma.thread.findMany({ select: { createdAt: true } }),
      prisma.agenda.findMany({ select: { createdAt: true } }),
      prisma.user.findMany({ select: { createdAt: true } }),
    ]);

    const inMonth = (items: { createdAt: Date }[], m: { start: Date; end: Date }) =>
      items.filter(x => x.createdAt >= m.start && x.createdAt < m.end).length;

    const informasiChartData = months.map(m => ({
      bulan: m.label,
      pembacaArtikel: inMonth(artikelAll, m),
      pembacaPengumuman: inMonth(pengumumanAll, m),
    }));

    const partisipasiChartData = months.map(m => ({
      bulan: m.label,
      diskusi: inMonth(threadAll, m),
      agenda: inMonth(agendaAll, m),
      anggotaBaru: inMonth(userAll, m),
    }));

    const totalUser = userAll.length;

    return successResponse(res, {
      totalUser,
      totalArtikel: artikelAll.length,
      totalPengumuman: pengumumanAll.length,
      totalThread: threadAll.length,
      totalAgenda: agendaAll.length,
      informasiChartData,
      partisipasiChartData,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/users ───────────────────────────
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = String(req.query.search || '');
    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    }

    const data = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        phone: true, memberSince: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/users/:id/role ─────────────────
router.put('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    if (!['ADMIN', 'USER'].includes(role)) {
      throw new AppError('Role tidak valid', 400);
    }
    if (id === req.user!.userId && role !== 'ADMIN') {
      throw new AppError('Tidak bisa mengubah role sendiri', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return successResponse(res, user, 'Role berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/users/:id ───────────────────
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    if (id === req.user!.userId) throw new AppError('Tidak bisa menghapus akun sendiri', 400);
    await prisma.user.delete({ where: { id } });
    return successResponse(res, null, 'User berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
