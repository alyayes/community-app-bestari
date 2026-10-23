import React from 'react';
import { Sparkles, Eraser } from 'lucide-react';

interface AutofillBarProps {
  label: string;          // mis. "informasi nyata seputar sorgum"
  onFill: () => void;
  onClear: () => void;
}

/** Bar "Isi Otomatis" + "Hapus Isian" untuk form admin. Hapus hanya mengosongkan form, tidak menyentuh database. */
export const AutofillBar: React.FC<AutofillBarProps> = ({ label, onFill, onClear }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#E6E1D5] bg-gradient-to-r from-[#FAF6EE] to-[#F0EDE4] p-3">
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div className="p-2 rounded-xl bg-[#2C4219] shrink-0">
        <Sparkles className="w-4 h-4 text-[#A8B774]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#2C4219]">Isi Otomatis</p>
        <p className="text-[11px] text-[#7A7062] truncate">Contoh {label} — cek dulu, lalu klik simpan</p>
      </div>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        type="button"
        onClick={onFill}
        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C4219] text-white text-xs font-bold shadow-sm hover:bg-[#1F3011] active:scale-95 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" /> Isi Otomatis
      </button>
      <button
        type="button"
        onClick={onClear}
        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition-all"
      >
        <Eraser className="w-3.5 h-3.5" /> Hapus Isian
      </button>
    </div>
  </div>
);
