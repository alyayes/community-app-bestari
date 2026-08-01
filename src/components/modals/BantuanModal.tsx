import React from 'react';
import { HelpCircle, Phone, Mail, MapPin, X, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';

interface BantuanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BantuanModal: React.FC<BantuanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Bagaimana cara memasukkan hasil panen baru ke sistem SCM?',
      a: 'Klik tombol "Mulai Panen" pada sidebar kiri atau di Dashboard Desa. Isi data lokasi blok, berat dalam Kg, dan klasifikasi mutu, lalu simpan.'
    },
    {
      q: 'Siapa yang dapat menghapus topik di Forum Diskusi?',
      a: 'Sesuai aturan moderasi komunitas, seluruh topik diskusi dapat dihapus oleh pengurus/admin moderasi. Komentar individu disimpan untuk transparansi.'
    },
    {
      q: 'Bagaimana jika saya ingin mengambil jatah subsidi benih?',
      a: 'Tunjukkan kartu identitas anggota KWT di Balai Desa / Sekretariat pada jam kerja sesuai pengumuman resmi.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-[#E6E1D5] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#2C4219]" />
            <h3 className="font-title font-bold text-base text-[#2C4219]">Bantuan & Panduan Penggunaan</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#433A30]/70 hover:bg-[#FAF6EE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h4 className="font-title font-bold text-xs text-[#2C4219] uppercase tracking-wider">Pertanyaan Sering Diajukan (FAQ)</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {faqs.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1 text-xs">
                <p className="font-bold text-[#2C4219]">{f.q}</p>
                <p className="text-[#433A30]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 rounded-xl bg-[#2C4219]/5 border border-[#2C4219]/20 space-y-2 text-xs">
          <h4 className="font-title font-bold text-[#2C4219]">Kontak Sekretariat KWT Sorgum</h4>
          <div className="space-y-1 text-[#433A30]">
            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#2C4219]" /> Balai Desa / Sekretariat KWT RT 04 / RW 02</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#2C4219]" /> +62 812-3456-7890 (Ibu Kartini - Ketua)</p>
            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#2C4219]" /> kwtsorgum.official@gmail.com</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2C4219] text-white font-bold text-xs hover:bg-[#1E2E11]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
