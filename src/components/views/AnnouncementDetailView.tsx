import React from 'react';
import { Announcement } from '../../types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertTriangle,
  Megaphone,
  Wheat,
  Users,
  Clock,
  User,
} from 'lucide-react';

interface AnnouncementDetailViewProps {
  announcement: Announcement;
  onBack: () => void;
}

const categoryIcon = (cat: string) => {
  if (cat === 'PENTING' || cat === 'MENDESAK') return <Megaphone className="w-4 h-4" />;
  if (cat === 'HASIL PANEN') return <Wheat className="w-4 h-4" />;
  if (cat === 'INFORMASI ANGGOTA') return <Users className="w-4 h-4" />;
  return <Megaphone className="w-4 h-4" />;
};

export const getBadgeColor = (cat: string) => {
  if (cat === 'MENDESAK') return '#dc2626';
  if (cat === 'PENTING') return '#ea580c';
  if (cat === 'HASIL PANEN') return '#2C4219';
  if (cat === 'INFORMASI ANGGOTA') return '#572E4A';
  return '#7A7062';
};

export const AnnouncementDetailView: React.FC<AnnouncementDetailViewProps> = ({
  announcement: ann,
  onBack,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">

      {/* Breadcrumb / Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#433A30]/60 hover:text-[#2C4219] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Pengumuman
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-xs overflow-hidden">
        
        {/* Card Header (Title & Meta) */}
        <div className="bg-[#FAF6EE] p-6 sm:p-8 border-b border-[#E6E1D5]">
          
          {/* Badge & Time */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: getBadgeColor(ann.category) }}
            >
              {categoryIcon(ann.category)}
              {ann.category}
            </span>
            <span className="text-xs text-[#433A30]/50 font-medium">{ann.timeAgo}</span>
          </div>

          {/* Title */}
          <h1 className="font-title font-bold text-xl sm:text-2xl text-[#2C4219] leading-snug mb-3">
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
        </div>
      </div>
    </div>
  );
};
