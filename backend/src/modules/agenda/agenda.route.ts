import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createAgendaSchema, updateAgendaSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';

const router = Router();

const MONTHS_ID = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

export function cleanUploadUrl(u: any): string {
  if (!u || typeof u !== 'string') return u;
  const idx = u.indexOf('/uploads/');
  if (idx !== -1) {
    return u.substring(idx);
  }
  return u;
}

function toAgenda(a: any, opts: { userId?: string } = {}) {
  const rundown = typeof a.rundown === 'string' ? JSON.parse(a.rundown) : (a.rundown || []);
  const requirements = typeof a.requirements === 'string' ? JSON.parse(a.requirements) : (a.requirements || []);
  const benefits = typeof a.benefits === 'string' ? JSON.parse(a.benefits) : (a.benefits || []);
  const rawMateri = typeof a.materiUrls === 'string' ? JSON.parse(a.materiUrls) : (a.materiUrls || []);
  const rawDok = typeof a.dokumentasiUrls === 'string' ? JSON.parse(a.dokumentasiUrls) : (a.dokumentasiUrls || []);
  const materiUrls = Array.isArray(rawMateri) ? rawMateri.map(cleanUploadUrl) : [];
  const dokumentasiUrls = Array.isArray(rawDok) ? rawDok.map(cleanUploadUrl) : [];
  const linkUrls = typeof a.linkUrls === 'string' ? JSON.parse(a.linkUrls) : (a.linkUrls || []);

  const d = new Date(a.date + 'T00:00:00');
  const dayNumber = a.dayNumber || String(d.getDate()).padStart(2, '0');
  const monthAbbr = a.monthAbbr || MONTHS_ID[d.getMonth()];

  // Auto-status: jika tanggal agenda sudah lewat (bukan hari ini) → otomatis Selesai
  let status = a.status || 'Belum dimulai';
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (a.date && a.date < todayStr) {
    status = 'Selesai';
  }

  const peserta = Array.isArray(a.peserta) ? a.peserta : [];
  const reminders = Array.isArray(a.reminders) ? a.reminders : [];
  const userId = opts.userId;

  return {
    id: a.id,
    title: a.title,
    date: a.date,
    dayNumber,
    monthAbbr,
    time: a.time || '',
    location: a.location || '',
    status: status,
    statusType: a.statusType || 'success',
    category: a.category || '',
    description: a.description || '',
    organizer: a.organizer || '',
    rundown,
    requirements,
    benefits,
    materiUrls,
    dokumentasiUrls,
    linkUrls,
    certificateTemplate: a.certificateTemplate || null,
    targetParticipants: a.targetParticipants || '',
    quota: {
      registered: a.quotaRegistered ?? peserta.length,
      max: a.quotaMax || 0,
    },
    contactPerson: {
      name: a.contactName || '',
      phone: a.contactPhone || '',
    },
    creatorId: a.creatorId,
    isRegistered: userId ? peserta.some((p: any) => p.userId === userId) : false,
    isReminded: userId ? reminders.some((r: any) => r.userId === userId) : false,
    peserta: peserta.map((p: any) => ({
      userId: p.userId,
      userName: p.userName,
      attended: p.attended || false
    }))
  };
}

// ── GET /api/agenda ────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId = req.query.userId as string | undefined;
    
    // Auto detect user from token if not provided in query
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch (e) {
        // Ignore invalid token for public route
      }
    }

    // Auto-update status to 'Selesai' for past agendas based on date and time
    const activeAgendas = await prisma.agenda.findMany({
      where: { status: { not: 'Selesai' } }
    });

    if (activeAgendas.length > 0) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const a of activeAgendas) {
        if (!a.date) continue;
        let isPast = false;
        
        if (a.date < todayStr) {
          isPast = true;
        } else if (a.date === todayStr) {
          let endTime = "23:59";
          if (a.time && a.time.includes('-')) {
             const parts = a.time.split('-');
             if (parts.length > 1) endTime = parts[1].trim();
          } else if (a.time) {
             endTime = a.time.trim();
          }
          
          endTime = endTime.replace(/\./g, ':');
          if (endTime < currentTimeStr) {
            isPast = true;
          }
        }

        if (isPast) {
          await prisma.agenda.update({
            where: { id: a.id },
            data: { status: 'Selesai' }
          });
        }
      }
    }

    const data = await prisma.agenda.findMany({
      orderBy: { date: 'asc' },
      include: { peserta: true, reminders: true },
    });
    return successResponse(res, data.map(a => toAgenda(a, { userId })));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/agenda/:id ────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const a = await prisma.agenda.findUnique({
      where: { id: String(req.params.id) },
      include: { peserta: true, reminders: true },
    });
    if (!a) throw new NotFoundError('Agenda');
    return successResponse(res, toAgenda(a));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/agenda/:id/daftar (USER) ─────────────
router.post('/:id/daftar', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agendaId = String(req.params.id);
    const agenda = await prisma.agenda.findUnique({ where: { id: agendaId }, include: { peserta: true } });
    if (!agenda) throw new NotFoundError('Agenda');

    const quotaMax = agenda.quotaMax || 0;
    if (quotaMax > 0 && agenda.peserta.length >= quotaMax) {
      return res.status(400).json({ success: false, message: 'Kuota kegiatan sudah penuh' });
    }

    await prisma.agendaPeserta.upsert({
      where: { agendaId_userId: { agendaId, userId: req.user!.userId } },
      update: {},
      create: { agendaId, userId: req.user!.userId, userName: req.user!.name || 'Anggota' },
    });

    return successResponse(res, { registered: true }, 'Pendaftaran berhasil');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/agenda/:id/daftar (USER) ───────────
router.delete('/:id/daftar', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agendaId = String(req.params.id);
    await prisma.agendaPeserta.deleteMany({
      where: { agendaId, userId: req.user!.userId },
    });
    return successResponse(res, { registered: false }, 'Pendaftaran dibatalkan');
  } catch (err) {
    next(err);
  }
});

// ── POST /api/agenda/:id/reminder (USER) ───────────
router.post('/:id/reminder', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agendaId = String(req.params.id);
    const agenda = await prisma.agenda.findUnique({ where: { id: agendaId } });
    if (!agenda) throw new NotFoundError('Agenda');

    await prisma.agendaReminder.upsert({
      where: { agendaId_userId: { agendaId, userId: req.user!.userId } },
      update: {},
      create: { agendaId, userId: req.user!.userId },
    });

    return successResponse(res, { reminded: true }, 'Pengingat dipasang');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/agenda/:id/reminder (USER) ─────────
router.delete('/:id/reminder', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agendaId = String(req.params.id);
    await prisma.agendaReminder.deleteMany({
      where: { agendaId, userId: req.user!.userId },
    });
    return successResponse(res, { reminded: false }, 'Pengingat dihapus');
  } catch (err) {
    next(err);
  }
});

// ── POST /api/agenda (USER LOGIN) ──────────────────
router.post('/', authenticate, validate(createAgendaSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quota, contactPerson, materiUrls, dokumentasiUrls, ...rest } = req.body;
    const a = await prisma.agenda.create({
      data: {
        ...rest,
        materiUrls: Array.isArray(materiUrls) ? materiUrls.map(cleanUploadUrl) : materiUrls,
        dokumentasiUrls: Array.isArray(dokumentasiUrls) ? dokumentasiUrls.map(cleanUploadUrl) : dokumentasiUrls,
        quotaRegistered: quota?.registered || 0,
        quotaMax: quota?.max || 0,
        contactName: contactPerson?.name || '',
        contactPhone: contactPerson?.phone || '',
        creatorId: req.user!.userId,
      },
    });

    // Auto-register the creator to the agenda
    await prisma.agendaPeserta.create({
      data: {
        agendaId: a.id,
        userId: req.user!.userId,
        userName: req.user!.name || 'Anggota',
      }
    });

    // Re-fetch to include peserta for toAgenda mapping
    const fullA = await prisma.agenda.findUnique({
      where: { id: a.id },
      include: { peserta: true, reminders: true }
    });

    return successResponse(res, toAgenda(fullA, { userId: req.user!.userId }), 'Agenda berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/agenda/:id ────────────────────
router.put('/:id', authenticate, validate(updateAgendaSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.agenda.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new NotFoundError('Agenda');
    
    // Allow if ADMIN or creator
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== existing.creatorId) {
      throw new UnauthorizedError('Anda tidak memiliki izin untuk mengedit agenda ini');
    }

    const { quota, contactPerson, materiUrls, dokumentasiUrls, ...rest } = req.body;
    const a = await prisma.agenda.update({
      where: { id: String(req.params.id) },
      data: {
        ...rest,
        materiUrls: Array.isArray(materiUrls) ? materiUrls.map(cleanUploadUrl) : (materiUrls !== undefined ? materiUrls : undefined),
        dokumentasiUrls: Array.isArray(dokumentasiUrls) ? dokumentasiUrls.map(cleanUploadUrl) : (dokumentasiUrls !== undefined ? dokumentasiUrls : undefined),
        quotaRegistered: quota?.registered ?? undefined,
        quotaMax: quota?.max ?? undefined,
        contactName: contactPerson?.name ?? undefined,
        contactPhone: contactPerson?.phone ?? undefined,
      },
    });
    return successResponse(res, toAgenda(a), 'Agenda berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/agenda/:id/attendance ─────────────
router.put('/:id/attendance', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agendaId = String(req.params.id);
    const { userId, status, validated, attended } = req.body;

    const existing = await prisma.agendaPeserta.findUnique({
      where: { agendaId_userId: { agendaId, userId } }
    });

    if (!existing) throw new NotFoundError('Peserta tidak ditemukan');

    await prisma.agendaPeserta.update({
      where: { agendaId_userId: { agendaId, userId } },
      data: { 
        status: status !== undefined ? String(status) : undefined, 
        validated: validated !== undefined ? Boolean(validated) : undefined,
        attended: attended !== undefined ? Boolean(attended) : undefined
      },
    });

    return successResponse(res, { success: true }, 'Validasi kehadiran berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/agenda/:id ─────────────────
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.agenda.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new NotFoundError('Agenda');
    
    // Allow if ADMIN or creator
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== existing.creatorId) {
      throw new UnauthorizedError('Anda tidak memiliki izin untuk menghapus agenda ini');
    }

    await prisma.agenda.delete({ where: { id: String(req.params.id) } });
    return successResponse(res, null, 'Agenda berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
