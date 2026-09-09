import React, { useState } from 'react';
import { AgendaEvent, UserProfile } from '../../types';
import { Calendar, Clock, CheckCircle2, ChevronDown, Lock, FileText, ExternalLink, Package, Gift, X } from 'lucide-react';
import { getCategoryColor, getCategoryHoverBorderColor, formatEventTimeWithPeriod, isEventPast } from '../../utils/agendaUtils';
import { resolveImageUrl } from '../../api/client';

/** Hapus semua tag HTML dari string — untuk deskripsi yang tersimpan dalam format rich-text */
const stripHtml = (html: string): string => (html || '').replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').trim();

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Mendatang' | 'Selesai'>('Semua');
  const [detailEvent, setDetailEvent] = useState<AgendaEvent | null>(null);

  const categoriesList = [
    'Semua',
    'Budidaya Sorgum',
    'Panen & Pascapanen',
    'Pengolahan Sorgum',
    'Kegiatan Lapangan',
    'Pelatihan',
    'Pemasaran'
  ];

  const isUserRegistered = (ev: AgendaEvent) =>
    ev.peserta?.some(p => p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) || Boolean(ev.isRegistered);

  const isUserAttended = (ev: AgendaEvent) =>
    ev.peserta?.some(p => (p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) && p.attended) || false;

  const isAdmin = currentUser?.role?.toLowerCase().includes('admin') || Boolean(currentUser?.isAdmin);

  const toggleRegistration = (ev: AgendaEvent) => {
    if (isUserRegistered(ev)) {
      onUnregisterEvent?.(ev.id);
    } else {
      onRegisterEvent?.(ev.id);
    }
  };

  // Filter by category
  const byCategory = events.filter(e => {
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

  // Filter by status
  const filteredEvents = byCategory.filter(e => {
    if (statusFilter === 'Mendatang') return !isEventPast(e);
    if (statusFilter === 'Selesai') return isEventPast(e);
    return true;
  }).sort((a, b) => {
    const tA = a.date ? new Date(a.date).getTime() : 0;
    const tB = b.date ? new Date(b.date).getTime() : 0;
    return tA - tB;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full pb-24 md:pb-8">
      {/* Page Header */}
      <div className="mb-4 border-b border-[#E6E1D5] pb-4">
        <h1 className="font-title font-bold text-2xl text-[#2C4219] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#A8B774]" />
          Jadwal Kegiatan
        </h1>
      </div>

      {/* Filters: 2-column dropdown */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none bg-white border-2 border-[#E6E1D5] text-[#2C4219] font-bold text-xs py-3 pl-4 pr-10 rounded-xl shadow-xs focus:outline-none focus:border-[#607829] transition-colors cursor-pointer"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat === 'Semua' ? 'Semua Kategori' : cat}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2C4219]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full appearance-none bg-white border-2 border-[#E6E1D5] text-[#2C4219] font-bold text-xs py-3 pl-4 pr-10 rounded-xl shadow-xs focus:outline-none focus:border-[#607829] transition-colors cursor-pointer"
          >
            <option value="Semua">Semua Waktu</option>
            <option value="Mendatang">Mendatang</option>
            <option value="Selesai">Selesai</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2C4219]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => {
          const isRegistered = isUserRegistered(ev);
          const isPast = isEventPast(ev);
          const cleanDesc = stripHtml(ev.description || '');

          return (
            <div
              key={ev.id}
              className={`bg-white p-5 rounded-2xl border transition-all flex flex-col border-[#E6E1D5] ${getCategoryHoverBorderColor(ev.category)} hover:border-2 hover:shadow-md`}
            >
              {/* Top content — grows to fill card height */}
              <div className="flex-1 space-y-3">
                {/* Category badge + date */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${getCategoryColor(ev.category)}`}>
                    {ev.category}
                  </span>
                  <span className="text-xs text-[#433A30]/70 font-semibold whitespace-nowrap">
                    {`${ev.dayNumber || ''} ${ev.monthAbbr || ''} ${ev.date?.split('-')[0] || '2026'}`.trim()}
                  </span>
                </div>

                {/* Title — 2 baris max agar semua card tingginya mirip */}
                <h3 className="font-title font-bold text-base text-[#2C4219] line-clamp-2 leading-snug">
                  {ev.title}
                </h3>

                {/* Description preview — plain text, 2 baris */}
                <p className="text-xs text-[#433A30]/80 leading-relaxed line-clamp-2">
                  {cleanDesc}
                </p>

                {/* Waktu */}
                <div className="pt-2 border-t border-[#E6E1D5]">
                  <p className="flex items-center gap-2 text-xs text-[#433A30]/80">
                    <Clock className="w-3.5 h-3.5 text-[#2C4219] shrink-0" />
                    <span>{formatEventTimeWithPeriod(ev.time)}</span>
                  </p>
                </div>
              </div>

              {/* Footer: Rincian + Daftar button */}
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#E6E1D5]">
                <button
                  type="button"
                  onClick={() => setDetailEvent(ev)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C4219] hover:underline whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2C4219]" />
                  <span>Rincian Kegiatan</span>
                </button>

                {!isAdmin && (
                  isPast ? (
                    isRegistered ? (
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs flex items-center gap-1 cursor-default border border-emerald-400 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Telah Diikuti</span>
                      </div>
                    ) : (
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E6E1D5]/50 text-[#7A7062] flex items-center gap-1 cursor-default whitespace-nowrap">
                        <span>Selesai</span>
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleRegistration(ev)}
                      className={`inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap ${
                        isRegistered ? 'bg-[#A8B774] text-[#2C4219] hover:bg-[#92A360]' : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#2C4219]" />
                          <span>Terdaftar</span>
                        </>
                      ) : (
                        <span>Daftar</span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-[#433A30]/50">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">Belum ada jadwal kegiatan untuk saat ini, Bu.</p>
        </div>
      )}

      {/* Detail Modal — same as pro */}
      {detailEvent && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E6E1D5] space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6E1D5]">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${getCategoryColor(detailEvent.category)}`}>
                  {detailEvent.category}
                </span>
                <h2 className="font-title font-bold text-xl sm:text-2xl text-[#2C4219] mt-2">
                  {detailEvent.title}
                </h2>
                {detailEvent.organizer && (
                  <p className="text-xs text-[#433A30]/80 mt-1">
                    Penyelenggara: <strong className="text-[#2C4219]">{detailEvent.organizer}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => setDetailEvent(null)}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Waktu & Tanggal */}
            <div className="text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#433A30]/60">Waktu & Tanggal</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5 flex-wrap">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  <span>{detailEvent.date}</span>
                  <span className="text-[#A19D94]">•</span>
                  <span>{formatEventTimeWithPeriod(detailEvent.time)}</span>
                </p>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2C4219]" />
                Deskripsi Kegiatan
              </h3>
              <p className="text-xs text-[#433A30] leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D5] whitespace-pre-line break-words">
                {detailEvent.description || 'Tidak ada keterangan tambahan.'}
              </p>
            </div>

            {/* Perlengkapan */}
            {detailEvent.requirements && detailEvent.requirements.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#B45309] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B45309]" />
                  Perlengkapan yang Dibawa
                </h3>
                <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-[#FDE68A]">
                  <ul className="space-y-1.5">
                    {detailEvent.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#92400E] font-medium leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Benefit */}
            {detailEvent.benefits && detailEvent.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#2C4219]" />
                  Benefit & Keuntungan Peserta
                </h3>
                <div className="bg-[#F4F8EC] p-4 rounded-2xl border border-[#D5E5B8]">
                  <ul className="space-y-1.5">
                    {detailEvent.benefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2C4219] font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#2C4219] mt-0.5 shrink-0" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Materi & Berkas */}
            {(() => {
              const hasMateri = Boolean(
                (detailEvent.materiUrls && detailEvent.materiUrls.length > 0) ||
                (detailEvent.dokumentasiUrls && detailEvent.dokumentasiUrls.length > 0) ||
                (detailEvent.linkUrls && detailEvent.linkUrls.length > 0)
              );
              if (!hasMateri) return null;

              const isPast = isEventPast(detailEvent);
              const isRegistered = isUserRegistered(detailEvent);
              const isAttended = isUserAttended(detailEvent);
              const canAccess = isAdmin || (isPast ? (isRegistered && isAttended) : isRegistered);

              return (
                <div className="space-y-2 pt-2 border-t border-[#E6E1D5]">
                  <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#A8B774]" />
                    Berkas & Materi Kegiatan
                  </h3>
                  {canAccess ? (
                    <div className="space-y-3">
                      {detailEvent.materiUrls && detailEvent.materiUrls.length > 0 && (
                        <div className="space-y-2">
                          {detailEvent.materiUrls.map((url, idx) => {
                            const resolvedUrl = resolveImageUrl(url);
                            return (
                              <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold text-[#2C4219] hover:bg-[#A8B774]/20 transition-all">
                                <span className="truncate">Unduh Berkas Materi #{idx + 1}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                              </a>
                            );
                          })}
                        </div>
                      )}
                      {detailEvent.linkUrls && detailEvent.linkUrls.length > 0 && (
                        <div className="space-y-2">
                          {detailEvent.linkUrls.map((url, idx) => (
                            <a key={idx} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold text-[#2C4219] hover:bg-[#A8B774]/20 transition-all">
                              <span className="truncate">{url}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                            </a>
                          ))}
                        </div>
                      )}
                      {detailEvent.dokumentasiUrls && detailEvent.dokumentasiUrls.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[#E6E1D5]">
                          <div className="text-[11px] font-bold text-[#2C4219]">Galeri Dokumentasi:</div>
                          <div className="grid grid-cols-2 gap-2">
                            {detailEvent.dokumentasiUrls.map((url, idx) => {
                              const resolvedUrl = resolveImageUrl(url);
                              return (
                                <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer"
                                  className="group block rounded-xl border border-[#E6E1D5] overflow-hidden aspect-[4/3] relative bg-[#FAF6EE] hover:border-[#A8B774] transition-all">
                                  <img src={resolvedUrl} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
              );
            })()}

            {/* Daftar / Batal Daftar Button */}
            {!isAdmin && !isEventPast(detailEvent) && (
              <div className="pt-2 border-t border-[#E6E1D5]">
                {isUserRegistered(detailEvent) ? (
                  <button
                    type="button"
                    onClick={() => { onUnregisterEvent?.(detailEvent.id); setDetailEvent(null); }}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs sm:text-sm border border-red-200 hover:bg-red-100 transition-all shadow-2xs active:scale-95"
                  >
                    Batal Ikut Kegiatan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onRegisterEvent?.(detailEvent.id); setDetailEvent(null); }}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2C4219] text-white font-bold text-xs sm:text-sm hover:bg-[#1E2E11] transition-all shadow-sm active:scale-95"
                  >
                    Ikut Kegiatan Ini
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
