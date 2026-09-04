import React from 'react';
import { NavItem, AgendaEvent, UserProfile } from '../../types';
import { Calendar, BookOpen, MessageSquare, BarChart3, ShieldCheck } from 'lucide-react';
import { getCategoryColor } from './AgendaView';

interface BerandaViewLiteProps {
  currentUser: UserProfile;
  events: AgendaEvent[];
  setActiveNav: (nav: NavItem) => void;
}

export const BerandaViewLite: React.FC<BerandaViewLiteProps> = ({
  currentUser,
  events,
  setActiveNav,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Kolom Kiri: Sapaan dan Menu */}
        <div className="space-y-6">
          {/* Sapaan Hangat */}
          <div className="bg-[#2C4219] p-6 lg:p-8 rounded-3xl border-2 border-[#1E2E11] text-center md:text-left shadow-sm">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
              Selamat Datang, <br/> Ibu {currentUser.name}!
            </h2>
            <p className="text-xl lg:text-2xl text-[#E2E8D5] font-medium">
              Semoga hari ini menyenangkan. Silakan pilih menu di bawah ini:
            </p>
          </div>

          {/* Menu Utama (Shortcut) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <button 
              onClick={() => setActiveNav('agenda')}
              className="bg-white p-5 sm:p-8 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center text-center gap-3 sm:gap-4 hover:bg-[#F4F8EC] active:scale-95 transition-all shadow-md hover:border-[#607829]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-black text-[#2C4219] text-lg sm:text-xl leading-tight">Jadwal<br/>Kegiatan</span>
            </button>

            <button 
              onClick={() => setActiveNav('informasi')}
              className="bg-white p-5 sm:p-8 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center text-center gap-3 sm:gap-4 hover:bg-[#F4F8EC] active:scale-95 transition-all shadow-md hover:border-[#607829]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-black text-[#2C4219] text-lg sm:text-xl leading-tight">Kabar &<br/>Tips</span>
            </button>

            <button 
              onClick={() => setActiveNav('diskusi')}
              className="bg-white p-5 sm:p-8 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center text-center gap-3 sm:gap-4 hover:bg-[#F4F8EC] active:scale-95 transition-all shadow-md hover:border-[#607829]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-black text-[#2C4219] text-lg sm:text-xl leading-tight">Grup<br/>Ngobrol</span>
            </button>

            <button 
              onClick={() => setActiveNav('dashboard')}
              className="bg-white p-5 sm:p-8 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center text-center gap-3 sm:gap-4 hover:bg-[#F4F8EC] active:scale-95 transition-all shadow-md hover:border-[#607829]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-1">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="font-black text-[#2C4219] text-lg sm:text-xl leading-tight">Catatan<br/>Panen</span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Agenda */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border-2 border-[#E6E1D5] space-y-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 border-b-2 border-[#FAF6EE] pb-4">
            <div className="p-3 bg-[#F4F8EC] rounded-xl text-[#2C4219]">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl text-[#2C4219]">Kegiatan Terdekat</h3>
          </div>

        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setActiveNav('agenda')}
                className="bg-[#FAF6EE] p-5 rounded-2xl border-2 border-[#E6E1D5] flex items-center gap-5 cursor-pointer hover:bg-white hover:border-[#2C4219]/30 active:scale-95 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${getCategoryColor(ev.category)} shadow-sm group-hover:scale-105 transition-transform`}>
                  <span className="text-sm font-bold leading-none opacity-90">{ev.monthAbbr}</span>
                  <span className="font-black text-2xl leading-none mt-1">{ev.dayNumber}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xl text-[#2C4219] line-clamp-2 leading-tight group-hover:text-[#607829] transition-colors">{ev.title}</h4>
                  <p className="text-lg text-[#433A30]/80 mt-1 font-medium">{ev.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg text-[#433A30]/60 py-4">Belum ada kegiatan dalam waktu dekat.</p>
          )}
        </div>
        
          <button 
            onClick={() => setActiveNav('agenda')}
            className="w-full mt-auto bg-[#2C4219] hover:bg-[#1E2E11] text-white py-4 rounded-2xl font-bold text-lg transition-colors active:scale-95"
          >
            Lihat Semua Agenda
          </button>
        </div>
      </div>
    </div>
  );
};
