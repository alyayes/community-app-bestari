import { z } from 'zod';

// ── Auth ──────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  lahanLocation: z.string().optional(),
  sorghumType: z.string().optional(),
  memberSince: z.string().optional()
});

// ── Artikel ───────────────────────────────────────
export const createArtikelSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['Budidaya', 'Inovasi', 'Pengetahuan', 'Panen']),
  image: z.string().optional(),
  summary: z.string().min(1),
  content: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  status: z.enum(['Draft', 'Published']).optional(),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  authorAvatar: z.string().optional(),
  location: z.string().optional(),
  participantsCount: z.number().optional(),
});

export const updateArtikelSchema = createArtikelSchema.partial();

// ── Pengumuman ────────────────────────────────────
export const createPengumumanSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(['PENTING', 'HASIL PANEN', 'INFORMASI ANGGOTA', 'MENDESAK']),
  badgeColor: z.string().optional(),
  postedBy: z.string().optional(),
  postedTime: z.string().optional(),
  summary: z.string().min(5),
  content: z.string().min(5),
  bulletPoints: z.array(z.string()).optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  location: z.string().optional(),
  targetParticipants: z.string().optional(),
  note: z.string().optional(),
  isUrgent: z.boolean().optional().default(false),
});

export const updatePengumumanSchema = createPengumumanSchema.partial();

// ── Agenda ────────────────────────────────────────
export const createAgendaSchema = z.object({
  title: z.string().min(3).max(200),
  date: z.string(),
  dayNumber: z.string().optional(),
  monthAbbr: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['Belum dimulai', 'Selesai']).optional(),
  statusType: z.enum(['success', 'warning', 'neutral', 'info']).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  organizer: z.string().optional(),
  rundown: z.array(z.object({ time: z.string(), activity: z.string() })).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  targetParticipants: z.string().optional(),
  quota: z.object({ registered: z.number(), max: z.number() }).optional(),
  contactPerson: z.object({ name: z.string(), phone: z.string() }).optional(),
});

export const updateAgendaSchema = createAgendaSchema.partial();

// ── Thread / Forum ────────────────────────────────
export const createThreadSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string(),
  content: z.string().min(1),
  summary: z.string().optional(),
  images: z.array(z.string()).optional(),
  groupAvatar: z.string().optional(),
  allowMemberMessages: z.boolean().optional(),
});

export const updateThreadSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  category: z.string().optional(),
  content: z.string().min(3).optional(),
  summary: z.string().optional(),
  images: z.array(z.string()).optional(),
  groupAvatar: z.string().optional(),
  allowMemberMessages: z.boolean().optional(),
  joinedMembers: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().nullable().optional(),
  quotedText: z.string().optional(),
  quotedAuthor: z.string().optional(),
  imageAttachment: z.string().optional(),
  documentAttachment: z.string().optional(),
  documentName: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
});

// ── Banner ──────────────────────────────────────────
export const createBannerSchema = z.object({
  title: z.string().min(3).max(200),
  tag: z.string().optional(),
  desc: z.string().optional(),
  image: z.string().min(1),
  linkUrl: z.string().optional(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

// ── Harga Pasar ─────────────────────────────────────
export const createHargaPasarSchema = z.object({
  item: z.string().min(2).max(150),
  price: z.string().min(1).max(100),
  trend: z.enum(['up', 'down', 'stable']).optional().default('stable'),
  percentage: z.string().optional().default('0.0%'),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateHargaPasarSchema = createHargaPasarSchema.partial();
