// Kompres foto di browser sebelum diunggah/dikirim, agar aplikasi tetap ringan.
// - Hanya JPG/PNG/WebP di atas 300 KB; GIF, PDF, dan file kecil dikembalikan apa adanya.
// - Sisi terpanjang dibatasi 1600px, orientasi foto HP (EXIF) dipertahankan oleh browser.
// - Jika hasil tidak lebih kecil atau terjadi error, file asli yang dipakai (perilaku lama tetap).

const COMPRESSIBLE = /^image\/(jpeg|jpg|png|webp)$/i;
const MIN_BYTES = 300 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  try {
    if (!file || !COMPRESSIBLE.test(file.type) || file.size < MIN_BYTES) return file;
    const img = await loadImage(file);
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return file;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const cw = Math.round(w * scale), ch = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // PNG/WebP bisa transparan -> simpan sebagai WebP; JPG tetap JPG
    const keepAlpha = /png|webp/i.test(file.type);
    const outType = keepAlpha ? 'image/webp' : 'image/jpeg';
    if (!keepAlpha) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch); }
    ctx.drawImage(img, 0, 0, cw, ch);

    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, outType, quality));
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${base}.${outType === 'image/webp' ? 'webp' : 'jpg'}`, { type: outType, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function compressImages(files: FileList | File[]): Promise<File[]> {
  return Promise.all(Array.from(files).map(f => compressImage(f)));
}
