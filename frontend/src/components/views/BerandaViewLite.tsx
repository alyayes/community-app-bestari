import React from 'react';
import { NavItem, AgendaEvent, UserProfile, InfoArticle } from '../../types';
import { Calendar, BookOpen, MessageSquare, BarChart3, ShieldCheck, ArrowRight, ImageIcon } from 'lucide-react';
import { getCategoryColor } from './AgendaView';

interface BerandaViewLiteProps {
  currentUser: UserProfile;
  events: AgendaEvent[];
  articles?: InfoArticle[];
  setActiveNav: (nav: NavItem) => void;
  onSelectArticle?: (article: InfoArticle) => void;
  setAppMode?: (mode: 'lite' | 'pro') => void;
}

export const BerandaViewLite: React.FC<BerandaViewLiteProps> = ({
  currentUser,
  events,
  articles = [],
  setActiveNav,
  onSelectArticle,
  setAppMode,
}) => {
  const upcomingEvents = [...events]
    .filter(e => {
      const isPast = e.date && !isNaN(new Date(e.date).getTime()) && new Date(e.date).getTime() < new Date().setHours(0, 0, 0, 0);
      return e.status !== 'Selesai' && !isPast;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Cuma nampilin 3 paling dekat

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Sapaan dan Menu */}
        <div className="space-y-6">
          {/* Sapaan Hangat */}
          <div className="bg-[#2C4219] p-5 lg:p-6 rounded-2xl border-2 border-[#1E2E11] text-center md:text-left shadow-sm">
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
              Selamat Datang, <br /> Ibu {currentUser.name}!
            </h2>
            <p className="text-base lg:text-lg text-[#E2E8D5] font-medium mb-5">
              Semoga hari ini menyenangkan. Tetap semangat berkarya!
            </p>
          </div>

          {/* Section: Kabar & Tips Terbaru */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#E6E1D5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2C4219]" />
                <h3 className="font-title font-bold text-lg text-[#2C4219]">Kabar & Tips Terbaru</h3>
              </div>
              <button
                onClick={() => setActiveNav('informasi')}
                className="text-xs font-semibold text-[#2C4219] hover:text-[#1E2E11] flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {articles.slice(0, 2).map((art) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle && onSelectArticle(art)}
                  className="group cursor-pointer bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] rounded-xl p-3 border border-[#E6E1D5] transition-all duration-200 flex items-start gap-3"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {art.image ? (
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#433A30]/30 bg-[#E6E1D5]/30">
                        <ImageIcon className="w-6 h-6 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <span className="text-[10px] text-[#433A30]/70 font-medium">{art.timeAgo}</span>
                      <h4 className="font-title font-bold text-sm text-[#2C4219] group-hover:text-[#A8B774] transition-colors line-clamp-2 leading-tight">
                        {art.title}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <p className="text-sm text-center text-[#433A30]/60 py-4">Belum ada informasi terbaru.</p>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Agenda */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl border-2 border-[#E6E1D5] space-y-5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b-2 border-[#FAF6EE] pb-3">
            <div className="p-2.5 bg-[#F4F8EC] rounded-xl text-[#2C4219]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-[#2C4219]">Kegiatan Terdekat</h3>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setActiveNav('agenda')}
                  className="bg-[#FAF6EE] p-4 rounded-xl border-2 border-[#E6E1D5] flex items-center gap-4 cursor-pointer hover:bg-white hover:border-[#2C4219]/30 active:scale-95 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${getCategoryColor(ev.category)} shadow-sm group-hover:scale-105 transition-transform`}>
                    <span className="text-xs font-bold leading-none opacity-90">{ev.monthAbbr}</span>
                    <span className="font-black text-xl leading-none mt-1">{ev.dayNumber}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base text-[#2C4219] line-clamp-2 leading-tight group-hover:text-[#607829] transition-colors">{ev.title}</h4>
                    <p className="text-sm text-[#433A30]/80 mt-1 font-medium">{ev.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-[#433A30]/60 py-4">Belum ada kegiatan dalam waktu dekat.</p>
            )}
          </div>

          <button
            onClick={() => setActiveNav('agenda')}
            className="w-full mt-auto bg-[#2C4219] hover:bg-[#1E2E11] text-white py-3 rounded-xl font-bold text-base transition-colors active:scale-95"
          >
            Lihat Semua Agenda
          </button>
        </div>
      </div>
    </div>
  );
};
