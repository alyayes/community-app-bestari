import React, { useState } from 'react';
import { HarvestRecord, UserProfile } from '../../types';
import { Sprout, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface MulaiPanenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAddHarvestRecord: (record: HarvestRecord) => void;
}

export const MulaiPanenModal: React.FC<MulaiPanenModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddHarvestRecord,
}) => {
  const [blockName, setBlockName] = useState('Lahan Blok A (Lahan Utama)');
  const [cropVariety, setCropVariety] = useState('Bioguma Agritan 1');
  const [weightKg, setWeightKg] = useState<number>(1500);
  const [quality, setQuality] = useState<'Super Premium' | 'Grade A' | 'Grade B'>('Super Premium');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const record: HarvestRecord = {
      id: `hr_${Date.now()}`,
      date: todayStr,
      blockName,
      cropVariety,
      weightKg: Number(weightKg),
      quality,
      recordedBy: currentUser.name,
      notes: notes || 'Pencatatan panen rutin kelompok tani.'
    };

    onAddHarvestRecord(record);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-[#E6E1D5] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#2C4219]" />
            <h3 className="font-title font-bold text-base text-[#2C4219]">Input Catatan Panen Sorgum</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#433A30]/70 hover:bg-[#FAF6EE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#A8B774]/30 text-[#2C4219] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#2C4219]" />
            </div>
            <h4 className="font-title font-bold text-lg text-[#2C4219]">Pencatatan Panen Berhasil!</h4>
            <p className="text-xs text-[#433A30]/70">Data telah langsung diperbarui ke dalam Dashboard SCM Desa.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2C4219] mb-1">Pilih Lokasi Blok Lahan</label>
              <select
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-[#433A30] font-medium"
              >
                <option value="Lahan Blok A (Lahan Utama)">Lahan Blok A (Lahan Utama)</option>
                <option value="Lahan Blok B (Sektor Barat)">Lahan Blok B (Sektor Barat)</option>
                <option value="Lahan Blok C (Sektor Timur)">Lahan Blok C (Sektor Timur)</option>
                <option value="Lahan Blok D (Bukit Utara)">Lahan Blok D (Bukit Utara)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2C4219] mb-1">Varietas Sorgum</label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] text-[#433A30]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C4219] mb-1">Total Berat Panen (Kg)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] text-[#433A30] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#2C4219] mb-1">Klasifikasi Mutu / Grade</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Super Premium', 'Grade A', 'Grade B'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setQuality(g)}
                    className={`
                      py-2 rounded-xl text-xs font-bold border transition-all
                      ${quality === g 
                        ? 'bg-[#2C4219] text-white border-[#2C4219]' 
                        : 'bg-[#FAF6EE] text-[#433A30] border-[#E6E1D5]'}
                    `}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#2C4219] mb-1">Catatan Tambahan Petugas</label>
              <textarea
                rows={3}
                placeholder="Tuliskan kadar air, kebersihan biji, atau kondisi cuaca..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E6E1D5] text-[#433A30]"
              />
            </div>

            <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-[#433A30] hover:bg-[#FAF6EE]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A8B774]" />
                <span>Simpan Log Panen</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
