import React, { useState, useEffect } from 'react';
import { NavItem, InfoArticle, Announcement, AgendaEvent, UserProfile, CmsData } from '../../types';
import { SERVER_BASE } from '../../api/client';
import { 
  ArrowRight, 
  Calendar, 
  Megaphone, 
  BookOpen, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface BerandaViewProps {
  currentUser: UserProfile;
  articles: InfoArticle[];
  announcements: Announcement[];
  events: AgendaEvent[];
  setActiveNav: (nav: NavItem) => void;
  onSelectArticle: (article: InfoArticle) => void;
  onSelectAnnouncement: (announcement: Announcement) => void;
  onOpenMulaiPanen: () => void;
  cmsData?: CmsData | null;
}

const BANNER_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920',
    tag: 'Komunitas Kelompok Wanita Tani Sorgum',
    title: 'Ladang Sorgum Subur Komunitas',
    desc: 'Pantau jadwal panen raya, rekapitulasi stok tepung, dan kabar terbaru dari pengurus desa dalam satu platform terpadu.'
  },
  {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920',
    tag: 'Panen Raya KWT Melati Sorgum',
    title: 'Hasil Budidaya Bioguma Agritan High Yield',
    desc: 'Pengolahan pasca-panen mandiri menjadi produk olahan bernilai tinggi bagi perekonomian warga desa.'
  },
  {
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1920',
    tag: 'Semangat Gotong Royong Desa',
    title: 'Kemandirian Pangan Lokal Berkelanjutan',
    desc: 'Saling bahu membahu mendukung pengolahan tepung sorgum sehat bebas gluten untuk pasar nasional.'
  }
];

export const BerandaView: React.FC<BerandaViewProps> = ({
  currentUser,
  articles,
  announcements,
  events,
  setActiveNav,
  onSelectArticle,
  onSelectAnnouncement,
  onOpenMulaiPanen,
  cmsData,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const activeBannerSlides = cmsData?.landingImages?.length
    ? cmsData.landingImages.map(img => ({
        url: img.url.startsWith('/uploads/') ? `${SERVER_BASE}${img.url}` : img.url,
        title: img.title,
        desc: img.caption
      }))
    : BANNER_SLIDES;

  // Auto transition banner slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeBannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % activeBannerSlides.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + activeBannerSlides.length) % activeBannerSlides.length);
  };

  const latestArticles = articles.slice(0, 4);
  const latestAnnouncements = [...announcements].slice(0, 2); // Assuming ordered by newest
  const upcomingEvents = [...events]
    .filter(e => {
      const isPast = e.date && !isNaN(new Date(e.date).getTime()) && new Date(e.date).getTime() < new Date().setHours(0, 0, 0, 0);
      return e.status !== 'Selesai' && !isPast;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Dynamic Slider Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#2C4219] text-white shadow-md border border-[#2C4219]/10 group min-h-[180px] sm:min-h-[200px] flex items-start pt-6 sm:pt-8 pb-6">
        {/* Background Slide Images with Fade */}
        {activeBannerSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={slide.url || undefined}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E2E11]/95 via-[#2C4219]/80 to-transparent" />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-10 px-6 md:px-8 pt-2 pb-6 flex flex-col items-start justify-start gap-3 w-full">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-title font-bold text-xl md:text-2xl text-white leading-tight drop-shadow-sm">
              Halo, {currentUser.name}!
            </h2>
            <p className="text-sm text-[#E2E8D5] leading-relaxed drop-shadow-xs line-clamp-2">
              Ruang digital untuk saling terhubung, berbagi informasi, mencatat hasil panen, berdiskusi, dan bersama-sama mengembangkan produk olahan lokal.
            </p>
          </div>
        </div>

        {/* Slider Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
          title="Slide Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
          title="Slide Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Informasi Terbaru & Forum Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Informasi & Inovasi Terbaru */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2C4219]" />
                <h3 className="font-title font-bold text-lg text-[#2C4219]">Informasi & Inovasi Tani</h3>
              </div>
              <button
                onClick={() => setActiveNav('informasi')}
                className="text-xs font-semibold text-[#2C4219] hover:text-[#1E2E11] flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="group cursor-pointer bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] rounded-xl p-3.5 border border-[#E6E1D5] transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={art.image || undefined}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2C4219] text-white">
                        {art.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#433A30]/70 font-medium">{art.timeAgo}</span>
                      <h4 className="font-title font-bold text-sm text-[#2C4219] group-hover:text-[#A8B774] transition-colors line-clamp-2 mt-0.5">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#433A30] line-clamp-2 mt-1">
                        {art.summary}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#E6E1D5] flex items-center justify-between text-xs font-semibold text-[#2C4219]">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Pengumuman Urgent & Upcoming Agenda */}
        <div className="space-y-6">
          {/* Urgent Announcements */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#572E4A]" />
                <h3 className="font-title font-bold text-base text-[#2C4219]">Pengumuman Penting</h3>
              </div>
              <button
                onClick={() => setActiveNav('pengumuman')}
                className="text-xs font-semibold text-[#2C4219] hover:underline"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {latestAnnouncements.length === 0 ? (
                <div className="text-center text-xs text-[#433A30]/50 py-4">Belum ada pengumuman</div>
              ) : (
                latestAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => onSelectAnnouncement(ann)}
                    className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] hover:border-[#572E4A] cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: ann.badgeColor }}
                      >
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-[#433A30]/70">{ann.timeAgo}</span>
                    </div>
                    <h4 className="font-title font-bold text-xs text-[#2C4219] line-clamp-2">
                      {ann.title}
                    </h4>
                    <p className="text-[11px] text-[#433A30] line-clamp-2">
                      {ann.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agenda Mendatang Widget */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2C4219]" />
                <h3 className="font-title font-bold text-base text-[#2C4219]">Agenda Terdekat</h3>
              </div>
              <button
                onClick={() => setActiveNav('agenda')}
                className="text-xs font-semibold text-[#2C4219] hover:underline"
              >
                Kalender
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setActiveNav('agenda')}
                  className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center gap-3 cursor-pointer hover:bg-white hover:border-[#2C4219] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2C4219] text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#A8B774] leading-none">{ev.monthAbbr}</span>
                    <span className="font-title font-bold text-base leading-none mt-0.5">{ev.dayNumber}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#2C4219] uppercase tracking-wider">{ev.category}</span>
                    <h4 className="font-title font-bold text-xs text-[#2C4219] truncate">{ev.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#433A30]/70 mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
