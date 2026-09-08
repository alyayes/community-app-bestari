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
  const trimmed = timeStr.trim();
  if (/\b(pagi|siang|sore|malam|malem)\b/i.test(trimmed)) {
    return trimmed;
  }
  const period = getPeriodFromTime(trimmed);
  if (trimmed.includes('WIB')) {
    return `${trimmed} (${period})`;
  }
  return `${trimmed} WIB (${period})`;
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


