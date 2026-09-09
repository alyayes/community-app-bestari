export const getCategoryColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('BUDIDAYA')) return 'bg-[#2C4219] text-white'; // Forest Green
  if (cat.includes('PANEN')) return 'bg-[#ee7302] text-white'; // Orange
  if (cat.includes('PENGOLAHAN')) return 'bg-[#572E4A] text-white'; // Plum / Wine
  if (cat.includes('LAPANGAN') || cat.includes('INSPEKSI') || cat.includes('RAPAT')) return 'bg-[#b81817] text-white'; // Tomato Red
  if (cat.includes('PELATIHAN') || cat.includes('WORKSHOP')) return 'bg-[#293379] text-white'; // Blue Crate
  if (cat.includes('PEMASARAN') || cat.includes('UMKM')) return 'bg-[#e5a300] text-white'; // Citrus Yellow
  if (cat.includes('KREATIF')) return 'bg-[#572E4A] text-white';
  return 'bg-[#607829] text-white'; // Green Beans
};

export const getCategoryBorderColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('BUDIDAYA')) return 'border-[#2C4219]';
  if (cat.includes('PANEN')) return 'border-[#ee7302]';
  if (cat.includes('PENGOLAHAN')) return 'border-[#572E4A]';
  if (cat.includes('LAPANGAN') || cat.includes('INSPEKSI') || cat.includes('RAPAT')) return 'border-[#b81817]';
  if (cat.includes('PELATIHAN') || cat.includes('WORKSHOP')) return 'border-[#293379]';
  if (cat.includes('PEMASARAN') || cat.includes('UMKM')) return 'border-[#e5a300]';
  if (cat.includes('KREATIF')) return 'border-[#572E4A]';
  return 'border-[#607829]';
};

export const getCategoryHoverBorderColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('BUDIDAYA')) return 'hover:border-[#2C4219]';
  if (cat.includes('PANEN')) return 'hover:border-[#ee7302]';
  if (cat.includes('PENGOLAHAN')) return 'hover:border-[#572E4A]';
  if (cat.includes('LAPANGAN') || cat.includes('INSPEKSI') || cat.includes('RAPAT')) return 'hover:border-[#b81817]';
  if (cat.includes('PELATIHAN') || cat.includes('WORKSHOP')) return 'hover:border-[#293379]';
  if (cat.includes('PEMASARAN') || cat.includes('UMKM')) return 'hover:border-[#e5a300]';
  if (cat.includes('KREATIF')) return 'hover:border-[#572E4A]';
  return 'hover:border-[#607829]';
};

export const getPeriodFromTime = (timeStr?: string): 'Pagi' | 'Siang' | 'Sore' | 'Malam' => {
  if (!timeStr) return 'Pagi';
  const lower = timeStr.toLowerCase();
  if (lower.includes('pagi')) return 'Pagi';
  if (lower.includes('siang')) return 'Siang';
  if (lower.includes('sore')) return 'Sore';
  if (lower.includes('malam') || lower.includes('malem')) return 'Malam';

  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return 'Pagi';

  const hour = parseInt(match[1], 10);
  if (hour >= 11 && hour < 15) return 'Siang';
  if (hour >= 15 && hour < 18) return 'Sore';
  if (hour >= 18 || hour < 5) return 'Malam';
  return 'Pagi';
};

export const formatEventTimeWithPeriod = (timeStr?: string): string => {
  if (!timeStr) return '';
  let trimmed = timeStr.trim();

  // Normalize format lama: hapus "(Pagi)", "(Siang)", "(Sore)", "(Malam)" di akhir string
  trimmed = trimmed.replace(/\s*\((pagi|siang|sore|malam|malem)\)\s*$/i, '').trim();

  // Sudah ada label periode inline tanpa kurung (bukan di akhir sebagai suffix)
  // mis. "08:00 Pagi - 12:00 Siang WIB" → kembalikan apa adanya
  if (/\b(pagi|siang|sore|malam|malem)\b/i.test(trimmed)) {
    // Pastikan ada WIB di akhir
    if (!trimmed.toUpperCase().includes('WIB')) {
      trimmed = trimmed + ' WIB';
    }
    return trimmed;
  }

  // Hapus "WIB" untuk diproses, akan ditambahkan kembali di akhir
  const withoutWIB = trimmed.replace(/\s*WIB\s*/gi, '').trim();

  // Cek apakah rentang waktu (mengandung " - " atau "–")
  const dashMatch = withoutWIB.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    const startRaw = dashMatch[1].trim();
    const endRaw   = dashMatch[2].trim();
    const startPeriod = getPeriodFromTime(startRaw);
    const endPeriod   = getPeriodFromTime(endRaw);

    if (startPeriod === endPeriod) {
      // Periode sama: tampilkan di akhir saja — "08:00 - 10:30 Pagi WIB"
      return `${startRaw} - ${endRaw} ${startPeriod} WIB`;
    } else {
      // Periode beda: tampilkan setelah masing-masing — "08:00 Pagi - 12:00 Siang WIB"
      return `${startRaw} ${startPeriod} - ${endRaw} ${endPeriod} WIB`;
    }
  }

  // Waktu tunggal
  const period = getPeriodFromTime(withoutWIB);
  return `${withoutWIB} ${period} WIB`;
};

/**
 * Mengubah huruf pertama di awal kalimat dan setiap setelah spasi / tanda baca menjadi huruf kapital (Title Case).
 * Menjaga sisa huruf (bisa lowercase atau huruf kapital semua / ALL CAPS).
 */
export const autoCapitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/(?:^|[\s"'([{-])[a-z]/g, (match) => match.toUpperCase());
};

export const autoCapitalizeFirst = autoCapitalizeWords;

/**
 * Mengecek apakah teks berisi alfabet dan semuanya adalah huruf kecil (tidak ada huruf besar sama sekali).
 */
export const isAllLowerCase = (str: string): boolean => {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  return letters.length > 0 && letters === letters.toLowerCase();
};

/**
 * Membersihkan tag HTML, &nbsp;, dan entitas HTML dari teks ringkasan
 */
export const cleanHtmlSummary = (str?: string | null): string => {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .replace(/\.{3,}$/g, '')
    .trim();
};

/**
 * Membersihkan &nbsp; dan karakter spasi non-breaking dari konten HTML artikel
 * agar browser dapat melakukan word wrap secara alami per kata dan tidak memotong suku kata di tengah.
 */
export const cleanArticleHtml = (htmlContent?: string | string[] | null): string => {
  if (!htmlContent) return '';
  const raw = Array.isArray(htmlContent) ? htmlContent.join('\n') : String(htmlContent);
  return raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ');
};




