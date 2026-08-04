import React from 'react';
import { NavItem, UserProfile } from '../types';
import { 
  Home, 
  Calendar, 
  Info, 
  Bell, 
  MessageSquare, 
  BarChart3, 
  Sprout, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  currentUser: UserProfile;
  onOpenMulaiPanen: () => void;
  onOpenBantuan: () => void;
  unreadAnnouncementsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
  onGoToLanding?: () => void;
  onLogout?: () => void;
  onGoToAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  currentUser,
  onOpenMulaiPanen,
  onOpenBantuan,
  unreadAnnouncementsCount,
  isOpenMobile,
  setIsOpenMobile,
  onGoToLanding,
  onLogout,
  onGoToAdmin
}) => {
  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
    { id: 'informasi', label: 'Informasi', icon: <Info className="w-5 h-5" /> },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone className="w-5 h-5" />, badge: unreadAnnouncementsCount },
    { id: 'diskusi', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Data Sorgum', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: NavItem) => {
    setActiveNav(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 h-screen overflow-y-auto z-50 w-64 bg-white border-r border-[#E6E1D5] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out print:hidden
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Logo & App Title */}
        <div className="space-y-6">
          <div 
            onClick={() => onGoToLanding && onGoToLanding()} 
            className="flex items-center gap-3 px-2 pt-2 cursor-pointer group"
            title="Kembali ke Landing Page Utama"
          >
            <div className="w-10 h-10 rounded-full bg-[#2C4219] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-[#A8B774]" />
            </div>
            <div>
              <h1 className="font-title font-bold text-base text-[#2C4219] leading-tight">
                Community App
              </h1>
              <p className="text-[11px] font-extrabold text-[#A8B774] tracking-wider uppercase">
                KWT MELATI SORGUM
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30' 
                      : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#A8B774]' : 'text-[#433A30]/70'}>
                      {item.icon}
                    </span>
                    <span className={isActive ? 'text-white font-bold' : 'font-semibold'}>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-xs font-extrabold
                      ${isActive ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#572E4A] text-white'}
                    `}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-[#E6E1D5]">
          {onGoToAdmin && (currentUser?.isAdmin || currentUser?.role?.toLowerCase().includes('admin')) && (
            <button
              onClick={onGoToAdmin}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold bg-[#2C4219] text-white hover:bg-[#1E2E11] transition-all shadow-xs border border-[#A8B774]/30"
            >
              <ShieldCheck className="w-4 h-4 text-[#A8B774]" />
              <span>Ke Admin Portal</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold text-[#C53030] hover:bg-[#C53030]/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#C53030]" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
