import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { authenticate, authorize, AuthPayload } from '../../middleware/auth';
import { config } from '../../config';
import { validate } from '../../middleware/validate';
import { createThreadSchema, updateThreadSchema, createCommentSchema } from '../../utils/validation';
import { successResponse } from '../../utils/response';
import { NotFoundError, AppError } from '../../utils/errors';
import { timeAgo } from '../../utils/format';

const router = Router();

// Mapping ThreadComment -> ForumComment frontend (Flat, no nested replies)
function mapComments(comments: any[], viewerId?: string | null, userAvatarMap?: Map<string, string>): any[] {
  return comments.map(c => {
    const likedByArr = c.likedBy || [];
    const userLiked = viewerId
      ? likedByArr.some((l: any) => l.userId === viewerId)
      : !!c.userLiked;
    // Gunakan avatar dari User jika ada, atau fallback ke authorAvatar yang tersimpan
    const matchedAvatar = userAvatarMap?.get((c.authorName || '').trim().toLowerCase());
    const authorAvatar = matchedAvatar || c.authorAvatar || '';
    return {
      id: c.id,
      authorName: c.authorName,
      authorAvatar,
      authorRole: c.authorRole || '',
      isAuthor: c.isAuthor,
      timeAgo: timeAgo(c.createdAt),
      createdAt: c.createdAt.toISOString(),
      content: c.content,
      quotedCommentText: c.quotedCommentText || null,
      quotedCommentAuthor: c.quotedCommentAuthor || null,
      // Attachment base64 bisa raksasa (PDF 5MB+) — batasi supaya response tidak OOM
      imageAttachments: (() => {
        const arr = (typeof c.imageAttachment === 'string' && c.imageAttachment.startsWith('[')) ? JSON.parse(c.imageAttachment) : (c.imageAttachment ? [c.imageAttachment] : []);
        return arr.filter((a: any) => typeof a === 'string' ? a.length < 500000 : (a.url || '').length < 500000);
      })(),
      documentAttachments: (() => {
        if (typeof c.documentAttachment === 'string' && c.documentAttachment.startsWith('[')) {
          const arr = JSON.parse(c.documentAttachment);
          return arr.filter((d: any) => (d.url || d).length < 500000);
        }
        if (c.documentAttachment && c.documentAttachment.length < 500000) {
          return [{ url: c.documentAttachment, name: c.documentName || 'Document' }];
        }
        return c.documentAttachment && c.documentName ? [{ url: '', name: c.documentName }] : [];
      })(),
      isEdited: c.isEdited || false,
      likes: c.likes,
      userLiked,
      likedBy: likedByArr.map(({ avatar, ...rest }: any) => rest),
      replies: [], // Always empty because we use flat list
    };
  });
}

// Mapping Thread -> ForumThread frontend
function toThread(t: any, comments: any[], viewerId?: string | null, userAvatarMap?: Map<string, string>) {
  const images: string[] = typeof t.images === 'string' ? JSON.parse(t.images) : (t.images || []);
  const joinedMembers: string[] = typeof t.joinedMembers === 'string' ? JSON.parse(t.joinedMembers) : (t.joinedMembers || []);

  const matchedAuthorAvatar = userAvatarMap?.get((t.authorName || '').trim().toLowerCase());
  const authorAvatar = matchedAuthorAvatar || t.authorAvatar || '';
  const groupAvatar = t.groupAvatar || '';

  const likedByArr = t.likedBy || [];
  const userLiked = viewerId
    ? likedByArr.some((l: any) => l.userId === viewerId)
    : !!t.userLiked;

  return {
    id: t.id,
    title: t.title,
    authorName: t.authorName,
    authorAvatar,
    authorRole: t.authorRole || '',
    isTopicStarter: t.isTopicStarter,
    timeAgo: timeAgo(t.createdAt),
    category: t.category,
    categoryBadgeColor: t.categoryBadgeColor || '#2C4219',
    summary: t.summary,
    content: t.content,
    images,
    groupAvatar,
    allowMemberMessages: t.allowMemberMessages,
    joinedMembers,
    likes: t.likes,
    userLiked,
    likedBy: likedByArr.map(({ avatar, ...rest }: any) => rest),
    repliesCount: comments.length,
    comments: mapComments(comments, viewerId, userAvatarMap),
  };
}

// Helper: baca user dari token OPSIONAL (tanpa error). Publik tetap bisa akses.
function getOptionalUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret) as AuthPayload;
    return decoded.userId || null;
  } catch {
    return null;
  }
}

// ── GET /api/thread ────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const viewerId = getOptionalUserId(req);
    const [threads, allUsers] = await Promise.all([
      prisma.thread.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
          comments: { orderBy: { createdAt: 'asc' }, include: { likedBy: true } },
          likedBy: { select: { id: true, threadId: true, userId: true, userName: true } }
        },
      }),
      prisma.user.findMany({ select: { name: true, avatar: true } }),
    ]);

    const userAvatarMap = new Map<string, string>();
    for (const u of allUsers) {
      if (u.name && u.avatar) {
        userAvatarMap.set(u.name.trim().toLowerCase(), u.avatar);
      }
    }

    const data = threads.map(t => toThread(t, t.comments, viewerId, userAvatarMap));
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/thread/:id ────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const viewerId = getOptionalUserId(req);
    const [t, allUsers] = await Promise.all([
      prisma.thread.findUnique({
        where: { id: String(req.params.id) },
        include: { 
          comments: { orderBy: { createdAt: 'asc' }, include: { likedBy: true } },
          likedBy: { select: { id: true, threadId: true, userId: true, userName: true } }
        },
      }),
      prisma.user.findMany({ select: { name: true, avatar: true } }),
    ]);
    if (!t) throw new NotFoundError('Topik');

    const userAvatarMap = new Map<string, string>();
    for (const u of allUsers) {
      if (u.name && u.avatar) {
        userAvatarMap.set(u.name.trim().toLowerCase(), u.avatar);
      }
    }

    return successResponse(res, toThread(t, t.comments, viewerId, userAvatarMap));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread ───────────────────────────────
router.post('/', authenticate, validate(createThreadSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, content, summary, images, groupAvatar, allowMemberMessages } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const authorAvatar = user?.avatar || '';

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
        authorAvatar,
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

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    // Upsert: atomic create-if-not-exists, tidak bisa race condition
    await prisma.threadLike.upsert({
      where: { threadId_userId: { threadId: id, userId: req.user!.userId } },
      update: {},
      create: {
        threadId: id,
        userId: req.user!.userId,
        userName: req.user!.name!,
        avatar: (user?.avatar && user.avatar.length < 500) ? user.avatar : ''
      }
    });

    // Hitung ulang likes dari jumlah baris supaya selalu sinkron
    const realLikes = await prisma.threadLike.count({ where: { threadId: id } });
    await prisma.thread.update({
      where: { id },
      data: { likes: realLikes },
    });

    const updated = await prisma.thread.findUnique({ where: { id }, include: { likedBy: true } });
    return successResponse(res, { likes: updated?.likes, likedBy: (updated?.likedBy || []).map(({ avatar, ...rest }: any) => rest) });
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

    const existingLike = await prisma.threadLike.findUnique({
      where: { threadId_userId: { threadId: id, userId: req.user!.userId } }
    });

    if (existingLike) {
      await prisma.threadLike.delete({
        where: { id: existingLike.id }
      });
    }

    // Hitung ulang likes dari jumlah baris supaya selalu sinkron
    const realLikes = await prisma.threadLike.count({ where: { threadId: id } });
    await prisma.thread.update({
      where: { id },
      data: { likes: realLikes },
    });

    const updated = await prisma.thread.findUnique({ where: { id }, include: { likedBy: true } });
    return successResponse(res, { likes: updated?.likes, likedBy: (updated?.likedBy || []).map(({ avatar, ...rest }: any) => rest) });
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
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const authorAvatar = user?.avatar || '';

    const comment = await prisma.threadComment.create({
      data: {
        threadId: id,
        parentId: req.body.parentId || null,
        authorName: req.user!.name!,
        authorAvatar,
        authorRole: req.user!.role === 'ADMIN' ? 'Administrator' : 'Anggota KWT Melati Sorgum',
        isAuthor: req.user!.name! === existing.authorName,
        content: req.body.content,
        quotedCommentText: req.body.quotedText || null,
        quotedCommentAuthor: req.body.quotedAuthor || null,
        imageAttachment: Array.isArray(req.body.imageAttachments) ? JSON.stringify(req.body.imageAttachments) : null,
        documentAttachment: Array.isArray(req.body.documentAttachments) ? JSON.stringify(req.body.documentAttachments) : null,
        documentName: null,
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
      imageAttachments: (typeof comment.imageAttachment === 'string' && comment.imageAttachment.startsWith('[')) ? JSON.parse(comment.imageAttachment) : (comment.imageAttachment ? [comment.imageAttachment] : []),
      documentAttachments: (typeof comment.documentAttachment === 'string' && comment.documentAttachment.startsWith('[')) ? JSON.parse(comment.documentAttachment) : (comment.documentAttachment ? [{url: comment.documentAttachment, name: comment.documentName || 'Document'}] : []),
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

    const dataToUpdate: any = { content: String(req.body.content ?? ''), isEdited: true };
    if (req.body.imageAttachments !== undefined) {
      dataToUpdate.imageAttachment = Array.isArray(req.body.imageAttachments) ? JSON.stringify(req.body.imageAttachments) : null;
    }
    if (req.body.documentAttachments !== undefined) {
      dataToUpdate.documentAttachment = Array.isArray(req.body.documentAttachments) ? JSON.stringify(req.body.documentAttachments) : null;
    }

    const comment = await prisma.threadComment.update({
      where: { id: String(commentId) },
      data: dataToUpdate
    });

    return successResponse(res, { 
      id: comment.id, 
      content: comment.content, 
      isEdited: comment.isEdited,
      imageAttachments: (typeof comment.imageAttachment === 'string' && comment.imageAttachment.startsWith('[')) ? JSON.parse(comment.imageAttachment) : (comment.imageAttachment ? [comment.imageAttachment] : []),
      documentAttachments: (typeof comment.documentAttachment === 'string' && comment.documentAttachment.startsWith('[')) ? JSON.parse(comment.documentAttachment) : (comment.documentAttachment ? [{url: comment.documentAttachment, name: comment.documentName || 'Document'}] : []),
    });
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

// ── POST /api/thread/:id/comments/:commentId/like ────
router.post('/:id/comments/:commentId/like', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, commentId } = req.params;
    const existing = await prisma.threadComment.findUnique({ where: { id: String(commentId), threadId: String(id) } });
    if (!existing) throw new NotFoundError('Komentar');

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    // Handle potential Prisma race condition manually
    try {
      await prisma.threadCommentLike.upsert({
        where: { commentId_userId: { commentId: String(commentId), userId: req.user!.userId } },
        update: {},
        create: {
          commentId: String(commentId),
          userId: req.user!.userId,
          userName: req.user!.name!,
          avatar: (user?.avatar && user.avatar.length < 500) ? user.avatar : ''
        }
      });
    } catch (e: any) {
      if (e.code !== 'P2002') throw e; // P2002 is Unique constraint failed
    }

    // Hitung ulang likes dari jumlah baris (bukan counter) supaya selalu sinkron
    const realLikes = await prisma.threadCommentLike.count({ where: { commentId: String(commentId) } });
    await prisma.threadComment.update({
      where: { id: String(commentId) },
      data: { likes: realLikes },
    });

    const updated = await prisma.threadComment.findUnique({ where: { id: String(commentId) }, include: { likedBy: true } });
    return successResponse(res, { likes: updated?.likes, likedBy: (updated?.likedBy || []).map(({ avatar, ...rest }: any) => rest) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/thread/:id/comments/:commentId/unlike ──
router.post('/:id/comments/:commentId/unlike', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, commentId } = req.params;
    const existing = await prisma.threadComment.findUnique({ where: { id: String(commentId), threadId: String(id) } });
    if (!existing) throw new NotFoundError('Komentar');

    const existingLike = await prisma.threadCommentLike.findUnique({
      where: { commentId_userId: { commentId: String(commentId), userId: req.user!.userId } }
    });

    if (existingLike) {
      await prisma.threadCommentLike.delete({
        where: { id: existingLike.id }
      });
    }

    // Hitung ulang likes dari jumlah baris supaya selalu sinkron
    const realLikes = await prisma.threadCommentLike.count({ where: { commentId: String(commentId) } });
    await prisma.threadComment.update({
      where: { id: String(commentId) },
      data: { likes: realLikes },
    });

    const updated = await prisma.threadComment.findUnique({ where: { id: String(commentId) }, include: { likedBy: true } });
    return successResponse(res, { likes: updated?.likes, likedBy: (updated?.likedBy || []).map(({ avatar, ...rest }: any) => rest) });
  } catch (err) {
    next(err);
  }
});

export default router;
