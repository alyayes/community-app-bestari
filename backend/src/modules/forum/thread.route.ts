import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createThreadSchema, updateThreadSchema, createCommentSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError, AppError } from '../../utils/errors';
import { timeAgo } from '../../utils/format';

const router = Router();

// Mapping ThreadComment -> ForumComment frontend (Flat, no nested replies)
function mapComments(comments: any[]): any[] {
  return comments.map(c => ({
    id: c.id,
    authorName: c.authorName,
    authorAvatar: c.authorAvatar || '',
    authorRole: c.authorRole || '',
    isAuthor: c.isAuthor,
    timeAgo: timeAgo(c.createdAt),
    createdAt: c.createdAt.toISOString(),
    content: c.content,
    quotedCommentText: c.quotedCommentText || null,
    quotedCommentAuthor: c.quotedCommentAuthor || null,
    imageAttachment: c.imageAttachment || null,
    documentAttachment: c.documentAttachment || null,
    documentName: c.documentName || null,
    isEdited: c.isEdited || false,
    likes: c.likes,
    userLiked: c.userLiked,
    replies: [], // Always empty because we use flat list
  }));
}

// Mapping Thread -> ForumThread frontend
function toThread(t: any, comments: any[]) {
  const images: string[] = typeof t.images === 'string' ? JSON.parse(t.images) : (t.images || []);
  const joinedMembers: string[] = typeof t.joinedMembers === 'string' ? JSON.parse(t.joinedMembers) : (t.joinedMembers || []);

  return {
    id: t.id,
    title: t.title,
    authorName: t.authorName,
    authorAvatar: t.authorAvatar || '',
    authorRole: t.authorRole || '',
    isTopicStarter: t.isTopicStarter,
    timeAgo: timeAgo(t.createdAt),
    category: t.category,
    categoryBadgeColor: t.categoryBadgeColor || '#2C4219',
    summary: t.summary,
    content: t.content,
    images,
    groupAvatar: t.groupAvatar || '',
    allowMemberMessages: t.allowMemberMessages,
    joinedMembers,
    likes: t.likes,
    userLiked: t.userLiked,
    repliesCount: comments.length,
    comments: mapComments(comments),
  };
}

// ── GET /api/thread ────────────────────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const threads = await prisma.thread.findMany({
      orderBy: { createdAt: 'desc' },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });

    const data = threads.map(t => toThread(t, t.comments));
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/thread/:id ────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const t = await prisma.thread.findUnique({
      where: { id: String(req.params.id) },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    if (!t) throw new NotFoundError('Topik');
    return successResponse(res, toThread(t, t.comments));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread ───────────────────────────────
router.post('/', authenticate, validate(createThreadSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, content, summary, images, groupAvatar, allowMemberMessages } = req.body;

    const t = await prisma.thread.create({
      data: {
        title,
        category,
        content,
        summary: summary || content.slice(0, 120),
        images: images || [],
        groupAvatar: groupAvatar || null,
        allowMemberMessages: allowMemberMessages ?? true,
        authorName: req.user!.name!,
        authorAvatar: '',
        authorRole: req.user!.role === 'ADMIN' ? 'Administrator' : 'Anggota KWT Melati Sorgum',
        isTopicStarter: true,
        joinedMembers: [req.user!.name!],
        categoryBadgeColor: category.includes('Produksi') ? '#2C4219' : category.includes('Budidaya') ? '#572E4A' : category.includes('Pemasaran') ? '#A8B774' : '#57642A',
      },
    });

    return successResponse(res, toThread(t, []), 'Topik berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/thread/:id ────────────────────────────
router.put('/:id', authenticate, validate(updateThreadSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    // Hanya author / admin yang boleh edit
    if (existing.authorName !== req.user!.name && req.user!.role !== 'ADMIN') {
      throw new AppError('Hanya pembuat topik yang bisa mengedit', 403);
    }

    const t = await prisma.thread.update({ where: { id }, data: req.body });
    return successResponse(res, toThread(t, []), 'Topik berhasil diperbarui');
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/thread/:id ─────────────────────────
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    if (existing.authorName !== req.user!.name && req.user!.role !== 'ADMIN') {
      throw new AppError('Hanya pembuat topik yang bisa menghapus', 403);
    }

    await prisma.thread.delete({ where: { id } });
    return successResponse(res, null, 'Topik berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/like ──────────────────────
router.post('/:id/like', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    const t = await prisma.thread.update({
      where: { id },
      data: { likes: existing.likes + 1, userLiked: true },
    });
    return successResponse(res, { likes: t.likes, userLiked: t.userLiked });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/unlike ────────────────────
router.post('/:id/unlike', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    const t = await prisma.thread.update({
      where: { id },
      data: { likes: Math.max(0, existing.likes - 1), userLiked: false },
    });
    return successResponse(res, { likes: t.likes, userLiked: t.userLiked });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/join ──────────────────────
router.post('/:id/join', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    const joined: string[] = typeof existing.joinedMembers === 'string' ? JSON.parse(existing.joinedMembers) : (existing.joinedMembers || []);
    if (!joined.includes(req.user!.name!)) joined.push(req.user!.name!);

    const t = await prisma.thread.update({ where: { id }, data: { joinedMembers: joined } });
    return successResponse(res, { joinedMembers: t.joinedMembers });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/leave ─────────────────────
router.post('/:id/leave', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    const joined: string[] = typeof existing.joinedMembers === 'string' ? JSON.parse(existing.joinedMembers) : (existing.joinedMembers || []);
    const newJoined = joined.filter(m => m !== req.user!.name!);

    const t = await prisma.thread.update({ where: { id }, data: { joinedMembers: newJoined } });
    return successResponse(res, { joinedMembers: t.joinedMembers });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/kick ──────────────────────
router.post('/:id/kick', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { memberName } = req.body;
    if (!memberName) throw new AppError('Nama anggota harus diisi', 400);

    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    if (existing.authorName !== req.user!.name && req.user!.role !== 'ADMIN') {
      throw new AppError('Hanya pembuat grup yang bisa mengeluarkan anggota', 403);
    }

    const joined: string[] = typeof existing.joinedMembers === 'string' ? JSON.parse(existing.joinedMembers) : (existing.joinedMembers || []);
    const newJoined = joined.filter(m => m !== memberName);

    const t = await prisma.thread.update({ where: { id }, data: { joinedMembers: newJoined } });
    return successResponse(res, { joinedMembers: t.joinedMembers });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/comments ──────────────────
router.post('/:id/comments', authenticate, validate(createCommentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.thread.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Topik');

    const comment = await prisma.threadComment.create({
      data: {
        threadId: id,
        parentId: req.body.parentId || null,
        authorName: req.user!.name!,
        authorAvatar: '',
        authorRole: req.user!.role === 'ADMIN' ? 'Administrator' : 'Anggota KWT Melati Sorgum',
        isAuthor: req.body.parentId ? false : false,
        content: req.body.content,
        quotedCommentText: req.body.quotedText || null,
        quotedCommentAuthor: req.body.quotedAuthor || null,
        imageAttachment: req.body.imageAttachment || null,
        documentAttachment: req.body.documentAttachment || null,
        documentName: req.body.documentName || null,
        likes: 0,
        userLiked: false,
      },
    });

    return successResponse(res, {
      id: comment.id,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar || '',
      authorRole: comment.authorRole || '',
      isAuthor: comment.isAuthor,
      timeAgo: timeAgo(comment.createdAt),
      createdAt: comment.createdAt.toISOString(),
      content: comment.content,
      quotedCommentText: comment.quotedCommentText,
      quotedCommentAuthor: comment.quotedCommentAuthor,
      imageAttachment: comment.imageAttachment,
      documentAttachment: comment.documentAttachment,
      documentName: comment.documentName,
      isEdited: comment.isEdited,
      likes: comment.likes,
      userLiked: comment.userLiked,
      replies: [],
    }, 'Komentar berhasil ditambahkan', 201);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/thread/:id/comments/:commentId ────────
router.put('/:id/comments/:commentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, commentId } = req.params;
    const existing = await prisma.threadComment.findUnique({ where: { id: String(commentId), threadId: String(id) } });
    if (!existing) throw new NotFoundError('Komentar');

    if (existing.authorName !== req.user!.name) {
      throw new AppError('Hanya pembuat pesan yang bisa mengedit', 403);
    }

    const comment = await prisma.threadComment.update({
      where: { id: String(commentId) },
      data: { content: String(req.body.content ?? ''), isEdited: true }
    });

    return successResponse(res, { id: comment.id, content: comment.content, isEdited: comment.isEdited });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/thread/:id/comments/:commentId ─────
router.delete('/:id/comments/:commentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, commentId } = req.params;
    const existing = await prisma.threadComment.findUnique({ where: { id: String(commentId), threadId: String(id) } });
    if (!existing) throw new NotFoundError('Komentar');

    if (existing.authorName !== req.user!.name && req.user!.role !== 'ADMIN') {
      throw new AppError('Tidak ada akses untuk menghapus pesan ini', 403);
    }

    await prisma.threadComment.delete({ where: { id: String(commentId) } });

    return successResponse(res, null, 'Komentar berhasil dihapus');
  } catch (err) {
    next(err);
  }
});

export default router;
