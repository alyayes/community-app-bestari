import React, { useState } from 'react';
import { AgendaEvent, UserProfile } from '../../types';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp, Lock, FileText, ExternalLink, Package, Gift } from 'lucide-react';
import { getCategoryColor, formatEventTimeWithPeriod } from '../../utils/agendaUtils';

interface AgendaViewLiteProps {
  events: AgendaEvent[];
  currentUser: UserProfile;
  onRegisterEvent?: (eventId: string) => void;
  onUnregisterEvent?: (eventId: string) => void;
}

export const AgendaViewLite: React.FC<AgendaViewLiteProps> = ({
  events,
  currentUser,
  onRegisterEvent,
  onUnregisterEvent
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categoriesList = [
    'Semua',
    'Budidaya Sorgum',
    'Panen & Pascapanen',
    'Pengolahan Sorgum',
    'Kegiatan Lapangan',
    'Pelatihan',
    'Pemasaran'
  ];

  // Filter events by category
  const filteredEvents = events.filter(e => {
    if (selectedCategory === 'Semua') return true;
    const catUpper = (e.category || '').toUpperCase();
    const selUpper = selectedCategory.toUpperCase();
    return (
      catUpper === selUpper ||
      (selectedCategory === 'Budidaya Sorgum' && catUpper.includes('BUDIDAYA')) ||
      (selectedCategory === 'Panen & Pascapanen' && catUpper.includes('PANEN')) ||
      (selectedCategory === 'Pengolahan Sorgum' && (catUpper.includes('PENGOLAHAN') || catUpper.includes('KREATIF'))) ||
      (selectedCategory === 'Kegiatan Lapangan' && (catUpper.includes('LAPANGAN') || catUpper.includes('INSPEKSI') || catUpper.includes('RAPAT'))) ||
      (selectedCategory === 'Pelatihan' && (catUpper.includes('PELATIHAN') || catUpper.includes('WORKSHOP'))) ||
      (selectedCategory === 'Pemasaran' && (catUpper.includes('PEMASARAN') || catUpper.includes('UMKM')))
    );
  });

  // Filter events to only show upcoming and maybe a few past
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeA - timeB;
  });

  const isUserRegistered = (ev: AgendaEvent) => {
    return ev.peserta?.some(p => p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) || Boolean(ev.isRegistered);
  };

  const isUserAttended = (ev: AgendaEvent) => {
    return ev.peserta?.some(p => (p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) && p.attended) || false;
  };

  const isEventPast = (ev: AgendaEvent) => {
    if (ev.status === 'Selesai') return true;
    return Boolean(ev.date && !isNaN(new Date(ev.date).getTime()) && new Date(ev.date).getTime() < new Date().setHours(0, 0, 0, 0));
  };

  const isAdmin = currentUser?.role?.toLowerCase().includes('admin') || Boolean(currentUser?.isAdmin);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full pb-8">
      <div className="mb-4 border-b border-[#E6E1D5] pb-4">
        <h1 className="font-title font-bold text-2xl text-[#2C4219] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#A8B774]" />
          Jadwal Kegiatan
        </h1>
        <p className="text-base text-[#433A30]/80 mt-1 font-medium">Jadwal ngumpul dan kegiatan kelompok tani kita, Bu.</p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? (cat === 'Semua'
                    ? 'bg-[#2C4219] text-white border-[#2C4219] shadow-sm'
                    : `${getCategoryColor(cat)} border-transparent shadow-sm`)
                : 'bg-white text-[#433A30] border-[#E6E1D5] hover:bg-[#FAF6EE]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {sortedEvents.map(ev => {
          const isRegistered = isUserRegistered(ev);
          const isAttended = isUserAttended(ev);
          const isPast = isEventPast(ev);
          const isExpanded = expandedId === ev.id;
          const canAccessMateri = isAdmin || (isPast ? (isRegistered && isAttended) : isRegistered);
          const hasMateri = Boolean((ev.materiUrls && ev.materiUrls.length > 0) || (ev.dokumentasiUrls && ev.dokumentasiUrls.length > 0) || (ev.linkUrls && ev.linkUrls.length > 0));

          return (
            <div 
              key={ev.id} 
              className={`bg-white rounded-2xl border-2 p-5 sm:p-6 transition-all shadow-sm ${isRegistered ? 'border-[#A8B774] bg-[#F4F8EC]/30' : 'border-[#E6E1D5]'}`}
            >
              <div 
                className="flex flex-col sm:flex-row justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#433A30]/80">
                      {ev.date}
                    </span>
                    {ev.category && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getCategoryColor(ev.category)}`}>
                        {ev.category}
                      </span>
                    )}
                    {isRegistered && !isPast && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#A8B774]/20 text-[#2C4219] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ikut
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Selesai
                      </span>
                    )}
                  </div>
                  <h3 className="font-title font-bold text-lg text-[#2C4219] leading-tight">
                    {ev.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-[#433A30]/80">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#2C4219]" />
                      <span>{formatEventTimeWithPeriod(ev.time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#2C4219]" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center sm:justify-end gap-3 sm:w-auto w-full border-t sm:border-0 border-[#E6E1D5] pt-3 sm:pt-0">
                  <div className="text-[#433A30]/50 p-1 sm:block hidden">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#E6E1D5] space-y-3 animate-in slide-in-from-top-2">
                  {/* 1. Rincian Kegiatan */}
                  <div>
                    <h4 className="text-xs font-bold text-[#2C4219] mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2C4219]" />
                      Rincian Kegiatan
                    </h4>
                    <p className="text-sm text-[#433A30]/80 leading-relaxed whitespace-pre-line bg-[#FAF6EE] p-3 rounded-xl border border-[#E6E1D5]/60">
                      {ev.description || 'Tidak ada keterangan tambahan.'}
                    </p>
                  </div>

                  {/* 2. Perlengkapan yang Dibawa */}
                  {ev.requirements && ev.requirements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#B45309] mb-1 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#B45309]" />
                        Perlengkapan yang Dibawa
                      </h4>
                      <div className="bg-[#FFFBEB] p-3 rounded-xl border border-[#FDE68A] space-y-1.5">
                        <ul className="space-y-1">
                          {ev.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#92400E] font-medium leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 3. Benefit / Keuntungan Peserta */}
                  {ev.benefits && ev.benefits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#2C4219] mb-1 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#2C4219]" />
                        Benefit & Keuntungan Peserta
                      </h4>
                      <div className="bg-[#F4F8EC] p-3 rounded-xl border border-[#D5E5B8] space-y-1.5">
                        <ul className="space-y-1">
                          {ev.benefits.map((ben, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#2C4219] font-medium leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4219] mt-0.5 shrink-0" />
                              <span>{ben}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Bagian Berkas & Materi */}
                  {hasMateri && (
                    <div className="pt-2 border-t border-[#E6E1D5]/60">
                      <h4 className="text-xs font-bold text-[#2C4219] mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#A8B774]" /> Berkas & Materi Kegiatan
                      </h4>

                      {canAccessMateri ? (
                        <div className="space-y-2">
                          {ev.materiUrls && ev.materiUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold text-[#2C4219] hover:bg-[#A8B774]/20 transition-all"
                            >
                              <span className="truncate">Unduh Berkas Materi #{idx + 1}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                            </a>
                          ))}
                          {ev.linkUrls && ev.linkUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold text-[#2C4219] hover:bg-[#A8B774]/20 transition-all"
                            >
                              <span className="truncate">{url}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#FAF6EE] p-3 rounded-xl border border-[#E6E1D5] flex items-center gap-2.5 text-xs text-[#5C5246]">
                          <Lock className="w-4 h-4 text-[#2C4219] shrink-0" />
                          <span>
                            {isPast 
                              ? 'Materi hanya dapat diakses oleh peserta yang telah mendaftar dan hadir pada kegiatan ini.'
                              : 'Materi hanya dapat diakses oleh anggota yang terdaftar mengikuti kegiatan ini.'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isPast && (
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      {isRegistered ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onUnregisterEvent?.(ev.id); }}
                          className="w-full sm:w-auto px-6 py-3 bg-[#C53030]/10 text-[#C53030] font-bold text-base rounded-xl hover:bg-[#C53030]/20 transition-all border border-[#C53030]/20"
                        >
                          Batal Ikut
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRegisterEvent?.(ev.id); }}
                          className="w-full sm:w-auto px-6 py-3 bg-[#2C4219] text-white font-bold text-base rounded-xl hover:bg-[#1E2E11] transition-all shadow-md"
                        >
                          Ikut Kegiatan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12 text-[#433A30]/50">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">Belum ada jadwal kegiatan untuk saat ini, Bu.</p>
          </div>
        )}
      </div>
    </div>
  );
};
