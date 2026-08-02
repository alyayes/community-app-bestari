import React from 'react';
import { NavItem, UserProfile } from '../types';
import { Search, Bell, Menu, Calendar as CalendarIcon, User } from 'lucide-react';

interface HeaderProps {
  activeNav: NavItem;
  currentUser: UserProfile;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onToggleMobileMenu: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onClickProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  currentUser,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  onOpenNotifications,
  unreadCount,
  onClickProfile
}) => {
  const titles: Record<NavItem, string> = {
    beranda: 'Beranda Utama',
    agenda: 'Agenda Kegiatan',
    informasi: 'Pusat Informasi & Pengetahuan',
    pengumuman: 'Pengumuman Resmi',
    diskusi: 'Diskusi & Komunitas',
    dashboard: 'Data Sorgum',
    profil: 'Profil Anggota KWT'
  };

  const currentTitle = titles[activeNav];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E6E1D5] px-4 lg:px-8 py-3.5 transition-all w-full">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & View Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#2C4219] hover:bg-[#FAF6EE] transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-title font-bold text-lg md:text-xl text-[#2C4219] leading-tight">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Right Side: Global Search, Date, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">


          {/* Date Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#433A30]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#2C4219]" />
            <span>Selasa, 28 Okt 2026</span>
          </div>

          {/* Notification Icon */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#433A30] hover:text-[#2C4219] hover:border-[#2C4219] transition-colors"
            title="Pengumuman & Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#572E4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Active User Badge Header */}
          <button
            onClick={onClickProfile}
            className="flex items-center gap-2 pl-2 border-l border-[#E6E1D5] hover:opacity-80 active:scale-95 transition-all text-left focus:outline-none cursor-pointer"
            title="Lihat Profil Saya"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#2C4219]/20"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#2C4219] leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-[#433A30]/70 mt-0.5">{currentUser.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
