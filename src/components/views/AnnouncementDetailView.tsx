import React, { useState } from 'react';
import { Announcement } from '../../types';
import {
  ArrowLeft,
  Bell,
  Calendar,
  MapPin,
  AlertTriangle,
  Megaphone,
  Wheat,
  Users,
  Clock,
  User,
  CheckCircle2,
  ClipboardList,
  XCircle,
} from 'lucide-react';

interface AnnouncementDetailViewProps {
  announcement: Announcement;
  onBack: () => void;
}

const categoryIcon = (cat: string) => {
  if (cat === 'PENTING') return <Bell className="w-4 h-4" />;
  if (cat === 'HASIL PANEN') return <Wheat className="w-4 h-4" />;
  if (cat === 'INFORMASI ANGGOTA') return <Users className="w-4 h-4" />;
  return <Megaphone className="w-4 h-4" />;
};

export const AnnouncementDetailView: React.FC<AnnouncementDetailViewProps> = ({
  announcement: ann,
  onBack,
}) => {
  const [registered, setRegistered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasEvent = !!ann.eventDate;

  const handleRegister = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setRegistered(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleCancelRegistration = () => {
    setRegistered(false);
  };

  return (
    <div className="pb-16 animate-fadeInUp">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#2C4219] hover:text-[#3d5a23] transition-colors mb-6 group"
      >
        <span className="w-8 h-8 rounded-full bg-white border border-[#E6E1D5] flex items-center justify-center shadow-xs group-hover:shadow-sm group-hover:border-[#A8B774] transition-all">
          <ArrowLeft className="w-4 h-4" />
        </span>
        Kembali ke Pengumuman
      </button>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-[#2C4219] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeInUp">
          <CheckCircle2 className="w-5 h-5 text-[#A8B774] shrink-0" />
          <div>
            <p className="font-bold text-sm">Pendaftaran Berhasil!</p>
            <p className="text-xs text-white/70">Anda telah terdaftar sebagai peserta.</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-[#E6E1D5]">
          {/* Badge & Time */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: ann.badgeColor }}
            >
              {categoryIcon(ann.category)}
              {ann.category}
            </span>
            <span className="text-xs text-[#433A30]/50 font-medium">{ann.timeAgo}</span>
          </div>

          {/* Title */}
          <h1 className="font-title font-extrabold text-xl sm:text-2xl text-[#2C4219] leading-snug mb-3">
            {ann.title}
          </h1>

          {/* Summary */}
          <p className="text-sm text-[#433A30]/70 leading-relaxed">
            {ann.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E6E1D5]/60">
            <span className="flex items-center gap-1.5 text-xs text-[#433A30]/60">
              <User className="w-3.5 h-3.5" />
              <span>Oleh: <span className="font-semibold text-[#433A30]/80">{ann.postedBy}</span></span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#433A30]/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Diterbitkan: {ann.postedTime}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Full Content */}
          <p className="text-sm text-[#433A30] leading-relaxed">
            {ann.content}
          </p>

          {/* Bullet Points */}
          {ann.bulletPoints && ann.bulletPoints.length > 0 && (
            <div className="bg-[#FAF6EE] rounded-2xl p-5 space-y-3">
              <p className="font-bold text-[#2C4219] text-sm">Poin Penting:</p>
              <ul className="space-y-2.5 mt-1">
                {ann.bulletPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#433A30]">
                    <span className="w-2 h-2 rounded-full bg-[#2C4219] shrink-0 mt-1.5" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Date & Location */}
          {ann.eventDate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#2C4219]/5 rounded-2xl p-4 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#2C4219] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#2C4219]/60 uppercase tracking-wide">Tanggal</p>
                  <p className="text-sm font-bold text-[#2C4219] mt-0.5">{ann.eventDate}</p>
                  {ann.eventTime && <p className="text-xs text-[#433A30]/70 mt-0.5">{ann.eventTime}</p>}
                </div>
              </div>
              {ann.location && (
                <div className="bg-[#2C4219]/5 rounded-2xl p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2C4219] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-[#2C4219]/60 uppercase tracking-wide">Lokasi</p>
                    <p className="text-sm font-bold text-[#2C4219] mt-0.5">{ann.location}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target Participants */}
          {ann.targetParticipants && (
            <div className="flex items-start gap-3 bg-[#2C4219]/5 rounded-2xl p-4">
              <Users className="w-5 h-5 text-[#2C4219] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-[#2C4219]/60 uppercase tracking-wide">Target Peserta</p>
                <p className="text-sm font-semibold text-[#2C4219] mt-0.5">{ann.targetParticipants}</p>
              </div>
            </div>
          )}

          {/* Warning Note */}
          {ann.note && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan:</strong> {ann.note}
              </p>
            </div>
          )}

          {/* ── REGISTRATION SECTION ── */}
          {hasEvent && (
            <div className="border-t border-[#E6E1D5] pt-5 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-[#2C4219]" />
                <h2 className="font-title font-extrabold text-base text-[#2C4219]">Pendaftaran Peserta</h2>
              </div>

              {registered ? (
                /* Already registered */
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 text-sm">Anda Telah Terdaftar</p>
                      <p className="text-xs text-green-700/80 mt-0.5">
                        Harap hadir tepat waktu sesuai jadwal yang tertera.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelRegistration}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-white rounded-xl px-3 py-2 transition-all shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                    Batalkan Pendaftaran
                  </button>
                </div>
              ) : showConfirm ? (
                /* Confirmation dialog */
                <div className="bg-[#FAF6EE] border border-[#E6E1D5] rounded-2xl p-5 space-y-4">
                  <p className="text-sm font-semibold text-[#2C4219]">Konfirmasi Pendaftaran</p>
                  <p className="text-sm text-[#433A30]/70 leading-relaxed">
                    Anda akan mendaftar sebagai peserta kegiatan{' '}
                    <strong className="text-[#2C4219]">{ann.title}</strong> pada{' '}
                    <strong className="text-[#2C4219]">{ann.eventDate}</strong>
                    {ann.location && (
                      <> di <strong className="text-[#2C4219]">{ann.location}</strong></>
                    )}.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirm}
                      className="flex-1 bg-[#2C4219] hover:bg-[#3d5a23] text-white text-sm font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Ya, Daftarkan Saya
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 bg-white border border-[#E6E1D5] hover:border-[#A8B774] text-[#433A30] text-sm font-bold py-3 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                /* Register button */
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF6EE] rounded-2xl p-5">
                  <div>
                    <p className="text-sm font-semibold text-[#2C4219]">Belum terdaftar sebagai peserta</p>
                    <p className="text-xs text-[#433A30]/60 mt-0.5">
                      Klik tombol untuk mendaftar dan konfirmasi kehadiran Anda.
                    </p>
                  </div>
                  <button
                    onClick={handleRegister}
                    className="shrink-0 flex items-center gap-2 bg-[#2C4219] hover:bg-[#3d5a23] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Daftar Sekarang
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
