import React, { useState, useEffect } from 'react';
import {
  Sprout,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile, CmsData } from '../../types';

interface LandingViewProps {
  currentUser: UserProfile;
  cmsData?: CmsData | null;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onEnterApp: (targetTab?: string) => void;
}

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920',
    title: 'Senja Keemasan di Ladang Sorgum Desa',
    caption: 'Mendukung Ketahanan Pangan Nasional Melalui Komunitas Petani Wanita'
  },
  {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920',
    title: 'Budidaya Sorgum Bioguma Agritan',
    caption: 'Hasil Tanaman Berkualitas Tinggi dengan Penerapan Teknologi Ramah Lingkungan'
  },
  {
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1920',
    title: 'Gotong Royong Panen Raya KWT',
    caption: 'Semangat Kebersamaan Ibu-Ibu Tani Membangun Ekonomi Kemandirian Desa'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({
  cmsData,
  onGoToLogin,
  onGoToRegister,
  onEnterApp
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const activeHeroImages = cmsData?.landingImages?.length ? cmsData.landingImages : HERO_IMAGES;
  // Normalisasi URL gambar: /uploads/... (relatif) -> URL absolut backend
  const imgUrl = (u: string) =>
    u.startsWith('/uploads/') ? `http://localhost:8000${u}` : u;

  // Auto transition hero images every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % activeHeroImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeHeroImages.length]);

  // Track window scroll for parallax effect & sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      setIsScrolled(currentScroll > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#2C4219] text-white font-sans overflow-x-hidden selection:bg-[#A8B774] selection:text-[#2C4219]">
      {/* 1. STICKY NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-[#2C4219]/95 text-white backdrop-blur-md shadow-xl py-3.5'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white py-5'
          }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo Brand (Left Aligned) */}
          <div
            onClick={() => onEnterApp('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#A8B774] text-[#2C4219] flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform border border-amber-300/30">
              <Sprout className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="font-title font-extrabold text-lg sm:text-xl tracking-tight block leading-none text-white">
                Community App
              </span>
              <span className="text-[11px] text-[#A8B774] font-extrabold tracking-widest uppercase block mt-1">
                KWT MELATI SORGUM
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION ONLY */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden text-white pt-16 pb-12">
        {/* Parallax Background Images */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          {activeHeroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={imgUrl(img.url)}
                alt={img.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Deep Gradient Overlay to Guarantee Perfect Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2E11] via-[#1E2E11]/80 to-black/60" />
            </div>
          ))}
        </div>

        {/* Floating Morning Dew Particles Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <style>{`
            @keyframes floatDew1 {
              0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
              33% { transform: translate(25px, -45px) scale(1.15); opacity: 0.7; }
              66% { transform: translate(-15px, -20px) scale(0.9); opacity: 0.5; }
              100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            }
            @keyframes floatDew2 {
              0% { transform: translate(0, 0) scale(0.95); opacity: 0.2; }
              50% { transform: translate(-35px, 30px) scale(1.25); opacity: 0.6; }
              100% { transform: translate(0, 0) scale(0.95); opacity: 0.2; }
            }
            @keyframes floatDew3 {
              0% { transform: translate(0, 0) scale(1.1); opacity: 0.4; }
              40% { transform: translate(30px, -25px) scale(0.8); opacity: 0.8; }
              75% { transform: translate(-20px, 35px) scale(1.2); opacity: 0.5; }
              100% { transform: translate(0, 0) scale(1.1); opacity: 0.4; }
            }
            .animate-dew-1 { animation: floatDew1 14s ease-in-out infinite; }
            .animate-dew-2 { animation: floatDew2 20s ease-in-out infinite; }
            .animate-dew-3 { animation: floatDew3 25s ease-in-out infinite; }
          `}</style>

          <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 rounded-full bg-yellow-200/50 blur-[1.5px] animate-dew-1" />
          <div className="absolute top-1/3 right-1/4 w-5 h-5 rounded-full bg-amber-300/40 blur-[2px] animate-dew-2" />
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-white/60 blur-[1px] animate-dew-3" />
          <div className="absolute top-1/2 left-[12%] w-4 h-4 rounded-full bg-yellow-300/30 blur-[2.5px] animate-dew-2" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-amber-100/50 blur-[1.5px] animate-dew-1" style={{ animationDelay: '-5s' }} />
          <div className="absolute top-1/5 right-[15%] w-6 h-6 rounded-full bg-[#A8B774]/30 blur-[3px] animate-dew-3" style={{ animationDelay: '-2s' }} />
          <div className="absolute bottom-1/5 left-[18%] w-2 h-2 rounded-full bg-white/70 blur-[0.5px] animate-dew-1" style={{ animationDelay: '-7s' }} />
          <div className="absolute top-1/2 right-[8%] w-3 h-3 rounded-full bg-yellow-200/40 blur-[1px] animate-dew-2" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Center Hero Text Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 my-auto pt-10">

          {/* MAIN HEADLINE */}
          <h1 className="font-title font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight drop-shadow-lg">
            {cmsData?.landingTitle ? (
              <span dangerouslySetInnerHTML={{ __html: cmsData.landingTitle.replace('\\n', '<br className="hidden sm:inline" />') }} />
            ) : (
              <>
                Bersama Menanam, <br className="hidden sm:inline" />
                <span className="text-[#A8B774] underline decoration-[#A8B774]/50 decoration-wavy underline-offset-8">
                  Bersama Sejahtera
                </span>
              </>
            )}
          </h1>

          {/* SUBHEADLINE */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-gray-100 font-medium leading-relaxed drop-shadow-md">
            {cmsData?.landingDesc || 'KWT Melati Sorgum menghubungkan ibu-ibu petani sorgum dalam satu wadah digital: kelola hasil panen, agendakan kegiatan gotong royong, dan perluas jangkauan pasar olahan pangan lokal.'}
          </p>

          {/* TWO ENLARGED CTA BUTTONS WITH MICRO-INTERACTIONS */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onGoToRegister}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-[#A8B774]"
            >
              <UserPlus className="w-6 h-6 text-[#A8B774]" />
              <span>Daftar Sekarang</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white/20 hover:bg-white/30 text-white font-title font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 backdrop-blur-md border-2 border-white/60 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <LogIn className="w-6 h-6 text-[#A8B774]" />
              <span>Masuk Akun</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
