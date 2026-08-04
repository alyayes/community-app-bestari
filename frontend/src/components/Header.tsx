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
  notifications?: Array<{
    id: string;
    title: string;
    summary: string;
    isRead: boolean;
    postedTime: string;
    category?: string;
  }>;
  onMarkNotificationRead?: (id: string) => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onMarkAllRead?: () => void;
  onClickNotification?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  currentUser,
  searchQuery,
  setSearchQuery,
  onToggleMobileMenu,
  onOpenNotifications,
  unreadCount,
  onClickProfile,
  notifications = [],
  onMarkNotificationRead,
  onDeleteNotification,
  onClearAllNotifications,
  onMarkAllRead,
  onClickNotification
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
    <header className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E6E1D5] px-4 lg:px-8 py-3.5 transition-all w-full print:hidden">
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
            <span>
              {new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }).format(new Date())}
            </span>
          </div>

          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white border border-[#E6E1D5] text-[#433A30] hover:text-[#2C4219] hover:border-[#2C4219] transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#572E4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E6E1D5] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                {/* Header */}
                <div className="p-4 border-b border-[#FAF6EE] flex items-center justify-between bg-[#FAF6EE]/50">
                  <h3 className="font-title font-black text-sm text-[#2C4219]">Notifikasi</h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => onMarkAllRead && onMarkAllRead()}
                        className="text-[10px] font-bold text-[#433A30]/60 hover:text-[#2C4219] transition-colors"
                      >
                        Tandai Dibaca
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => onClearAllNotifications && onClearAllNotifications()}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-[#E6E1D5] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#7A7062]">Belum ada notifikasi baru.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#FAF6EE]">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`relative group p-4 flex gap-3 transition-colors hover:bg-[#FAF6EE]/50 ${!notif.isRead ? 'bg-[#E3EAD3]/20' : ''}`}
                        >
                          {!notif.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A8B774]" />
                          )}
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (onClickNotification) onClickNotification(notif.id);
                              setShowNotifications(false);
                            }}
                          >
                            <p className={`text-xs sm:text-sm leading-tight ${notif.isRead ? 'text-[#433A30] font-semibold' : 'text-[#2C4219] font-black'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[10px] sm:text-xs text-[#7A7062] mt-1 line-clamp-2 leading-relaxed">
                              {notif.summary}
                            </p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-[#A8B774] mt-2 uppercase tracking-wide">
                              {notif.postedTime}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onDeleteNotification) onDeleteNotification(notif.id);
                              }}
                              className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                            {!notif.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onMarkNotificationRead) onMarkNotificationRead(notif.id);
                                }}
                                className="text-[#A8B774] hover:text-[#2C4219] p-1 rounded-md hover:bg-[#E3EAD3]/50"
                                title="Tandai Dibaca"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Footer link to announcements page */}
                <div 
                  className="p-3 border-t border-[#FAF6EE] text-center bg-[#FAF6EE]/30 cursor-pointer hover:bg-[#FAF6EE] transition-colors"
                  onClick={() => {
                    if (onOpenNotifications) onOpenNotifications();
                    setShowNotifications(false);
                  }}
                >
                  <span className="text-[10px] font-bold text-[#2C4219] uppercase tracking-wider">Lihat Semua Notifikasi</span>
                </div>
              </div>
            )}
          </div>

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
