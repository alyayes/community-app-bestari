import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import prisma from '../config/database';

// Folder backup: <backend>/backups (berlaku untuk src/ via tsx maupun dist/ hasil build)
export const BACKUP_DIR = path.resolve(__dirname, '../../backups');
const MAX_BACKUPS = 30;

/**
 * Salin seluruh data operasional (artikel, pengumuman, agenda, diskusi beserta relasinya)
 * ke file JSON terkompresi sebelum operasi massal (clear/seed).
 * Melempar error bila gagal, sehingga operasi massal ikut dibatalkan.
 */
export async function backupOperationalData(reason: string, actor?: { userId?: string; name?: string; role?: string }) {
  const [artikel, pengumuman, agenda, agendaPeserta, agendaReminder, thread, threadComment, threadLike, threadCommentLike] =
    await Promise.all([
      prisma.artikel.findMany(),
      prisma.pengumuman.findMany(),
      prisma.agenda.findMany(),
      prisma.agendaPeserta.findMany(),
      prisma.agendaReminder.findMany(),
      prisma.thread.findMany(),
      prisma.threadComment.findMany(),
      prisma.threadLike.findMany(),
      prisma.threadCommentLike.findMany(),
    ]);

  const tables = { artikel, pengumuman, agenda, agendaPeserta, agendaReminder, thread, threadComment, threadLike, threadCommentLike };
  const counts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]));
  const payload = {
    createdAt: new Date().toISOString(),
    reason,
    actor: actor ? { userId: actor.userId, name: actor.name, role: actor.role } : null,
    counts,
    tables,
  };

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `bestari-${reason}-${stamp}.json.gz`);
  const json = JSON.stringify(payload, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
  fs.writeFileSync(file, zlib.gzipSync(json));

  // Rotasi: simpan MAX_BACKUPS file terbaru saja
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('bestari-') && f.endsWith('.json.gz'))
    .map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  for (const old of files.slice(MAX_BACKUPS)) {
    try { fs.unlinkSync(path.join(BACKUP_DIR, old.f)); } catch { /* abaikan */ }
  }

  return { file: path.basename(file), counts };
}
