import React from 'react';
import { NavItem, AgendaEvent, UserProfile, InfoArticle } from '../../types';
import { Calendar, BookOpen, ChevronRight } from 'lucide-react';
import { getCategoryColor, isEventPast } from '../../utils/agendaUtils';
import { resolveImageUrl } from '../../api/client';

interface BerandaViewLiteProps {
  currentUser: UserProfile;
  events: AgendaEvent[];
  articles: InfoArticle[];
  announcements?: any[];
  setActiveNav: (nav: NavItem) => void;
  onSelectArticle: (article: InfoArticle) => void;
  onSelectAnnouncement?: (announcement: any) => void;
}

export const BerandaViewLite: React.FC<BerandaViewLiteProps> = ({
  currentUser,
  events,
  articles,
  setActiveNav,
  onSelectArticle
}) => {
  const upcomingEvents = [...events]
    .filter(e => !isEventPast(e))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Cuma nampilin 3 paling dekat

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-300 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Kolom Kiri: Sapaan dan Informasi */}
        <div className="space-y-8 lg:col-span-2">
          {/* Sapaan Hangat */}
          <div className="bg-[#2C4219] p-6 lg:p-8 rounded-3xl border-2 border-[#1E2E11] text-center md:text-left shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3A5721] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-50"></div>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight relative z-10">
              Halo Ibu {currentUser.name},<br/>Selamat Datang!
            </h2>
            <p className="text-xl text-[#E2E8D5] font-medium relative z-10">
              Berikut informasi terbaru untuk Anda hari ini:
            </p>
          </div>

          {/* Informasi */}
          {articles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-2xl text-[#2C4219]">Informasi</h3>
                </div>
                <button 
                  onClick={() => setActiveNav('informasi')}
                  className="text-sm font-bold text-[#607829] hover:text-[#2C4219] bg-[#F4F8EC] px-4 py-2 rounded-xl transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.slice(0, 4).map(article => (
                  <div
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="bg-white p-4 rounded-2xl border-2 border-[#E6E1D5] shadow-sm cursor-pointer hover:border-[#607829] hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    {article.image ? (
                      <img src={resolveImageUrl(article.image)} alt={article.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[#FAF6EE] flex items-center justify-center text-[#A19D94] shrink-0 border border-[#E6E1D5]">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#607829] uppercase tracking-wider mb-1 block bg-[#F4F8EC] inline-block px-2 py-0.5 rounded-md">{article.category}</span>
                      <h4 className="font-bold text-[#2C4219] text-base leading-snug line-clamp-2 group-hover:text-[#607829] transition-colors break-words">{article.title}</h4>
                      <p className="text-[11px] text-[#433A30]/60 mt-1 font-medium break-words">{article.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Agenda */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 lg:p-7 rounded-3xl border-2 border-[#E6E1D5] space-y-6 shadow-sm flex flex-col h-full sticky top-24">
            <div className="flex items-center gap-3 border-b-2 border-[#FAF6EE] pb-4">
              <div className="p-3 bg-[#F4F8EC] rounded-xl text-[#2C4219]">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#2C4219]">Kegiatan Terdekat</h3>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setActiveNav('agenda')}
                    className="bg-[#FAF6EE] p-4 rounded-2xl border-2 border-[#E6E1D5] flex items-center gap-4 cursor-pointer hover:bg-white hover:border-[#2C4219]/30 active:scale-95 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${getCategoryColor(ev.category)} shadow-sm group-hover:scale-105 transition-transform`}>
                      <span className="text-xs font-bold leading-none opacity-90">{ev.monthAbbr}</span>
                      <span className="font-black text-xl leading-none mt-1">{ev.dayNumber}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base text-[#2C4219] line-clamp-2 leading-tight group-hover:text-[#607829] transition-colors">{ev.title}</h4>
                      <p className="text-sm text-[#433A30]/80 mt-1 font-medium flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {ev.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-[#433A30]/60 py-4 font-medium">Belum ada jadwal kegiatan terdekat saat ini, Bu.</p>
              )}
            </div>
            
            <button 
              onClick={() => setActiveNav('agenda')}
              className="w-full mt-auto bg-[#2C4219] hover:bg-[#1E2E11] text-white py-3.5 rounded-xl font-bold text-base transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              Lihat Semua Jadwal
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
