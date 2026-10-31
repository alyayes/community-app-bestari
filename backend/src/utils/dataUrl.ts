import fs from 'fs';
import path from 'path';
import { config } from '../config';

// Simpan data URL (base64) sebagai file di folder uploads, kembalikan path relatif /uploads/...
// Tujuan: database & respons API tidak lagi membawa foto base64 yang besar (aplikasi jadi ringan).
// Nilai yang bukan data URL dikembalikan apa adanya (URL lama tetap berlaku).

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

const DATA_URL_RE = /^data:([\w/+.-]+);base64,([\s\S]+)$/;

export function isDataUrl(v: unknown): v is string {
  return typeof v === 'string' && v.startsWith('data:') && v.includes(';base64,');
}

export function saveDataUrl<T>(value: T): T | string {
  if (!isDataUrl(value)) return value;
  const m = DATA_URL_RE.exec(value);
  if (!m) return value;
  const ext = MIME_EXT[m[1].toLowerCase()];
  if (!ext) return value; // tipe tidak dikenal: biarkan (tidak mengubah perilaku lama)
  const dir = path.join(process.cwd(), config.upload.dir);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  fs.writeFileSync(path.join(dir, name), Buffer.from(m[2], 'base64'));
  return `/uploads/${name}`;
}

/** Array gambar: tiap data URL disimpan jadi file. */
export function persistImageList(list: unknown): unknown {
  return Array.isArray(list) ? list.map(v => saveDataUrl(v)) : list;
}

/** Array dokumen {url,name}: url data URL disimpan jadi file. */
export function persistDocList(list: unknown): unknown {
  return Array.isArray(list)
    ? list.map(d => (d && typeof d === 'object' && 'url' in d ? { ...(d as any), url: saveDataUrl((d as any).url) } : d))
    : list;
}
