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

function toAgenda(a: any, opts: { userId?: string } = {}) {
  const rundown = typeof a.rundown === 'string' ? JSON.parse(a.rundown) : (a.rundown || []);
  const requirements = typeof a.requirements === 'string' ? JSON.parse(a.requirements) : (a.requirements || []);
  const benefits = typeof a.benefits === 'string' ? JSON.parse(a.benefits) : (a.benefits || []);

  const d = new Date(a.date + 'T00:00:00');
  const dayNumber = a.dayNumber || String(d.getDate()).padStart(2, '0');
  const monthAbbr = a.monthAbbr || MONTHS_ID[d.getMonth()];

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
    status: a.status || 'Pendaftaran Dibuka',
    statusType: a.statusType || 'success',
    category: a.category || '',
    description: a.description || '',
    organizer: a.organizer || '',
    rundown,
    requirements,
    benefits,
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
    const { quota, contactPerson, ...rest } = req.body;
    const a = await prisma.agenda.create({
      data: {
        ...rest,
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

    const { quota, contactPerson, ...rest } = req.body;
    const a = await prisma.agenda.update({
      where: { id: String(req.params.id) },
      data: {
        ...rest,
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
