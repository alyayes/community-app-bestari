import React, { useState } from 'react';
import { NavItem, InfoArticle, Announcement, AgendaEvent, ForumThread, LandPlot, HarvestRecord, UserProfile } from './types';
import { 
  CURRENT_USER, 
  INITIAL_ARTICLES, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_EVENTS, 
  INITIAL_THREADS, 
  INITIAL_LAND_PLOTS, 
  INITIAL_HARVEST_RECORDS 
} from './data/mockData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BerandaView } from './components/views/BerandaView';
import { AgendaView } from './components/views/AgendaView';
import { InformasiView } from './components/views/InformasiView';
import { PengumumanView } from './components/views/PengumumanView';
import { AnnouncementDetailView } from './components/views/AnnouncementDetailView';
import { DiskusiView } from './components/views/DiskusiView';
import { DashboardDesaView } from './components/views/DashboardDesaView';
import { ProfilView } from './components/views/ProfilView';

// Landing, Login, & Register Pages
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { AdminPortalView } from './components/views/admin/AdminPortalView';

// Modals
import { CreateTopicModal } from './components/modals/CreateTopicModal';
import { MulaiPanenModal } from './components/modals/MulaiPanenModal';
import { BantuanModal } from './components/modals/BantuanModal';
import { ArticleDetailModal } from './components/modals/ArticleDetailModal';

type PageMode = 'landing' | 'login' | 'register' | 'app' | 'admin';

export function App() {
  const [pageMode, setPageMode] = useState<PageMode>('landing');
  const [activeNav, setActiveNav] = useState<NavItem>('beranda');
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [searchQuery, setSearchQuery] = useState('');

  // Data collections
  const [articles, setArticles] = useState<InfoArticle[]>(INITIAL_ARTICLES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [events, setEvents] = useState<AgendaEvent[]>(INITIAL_EVENTS);
  const [threads, setThreads] = useState<ForumThread[]>(INITIAL_THREADS);
  const [landPlots, setLandPlots] = useState<LandPlot[]>(INITIAL_LAND_PLOTS);
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>(INITIAL_HARVEST_RECORDS);

  // Selected State
  const [selectedArticle, setSelectedArticle] = useState<InfoArticle | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Modals & Drawers
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isMulaiPanenOpen, setIsMulaiPanenOpen] = useState(false);
  const [isBantuanOpen, setIsBantuanOpen] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  // Unread announcements count
  const unreadAnnouncementsCount = announcements.filter(a => a.isUrgent).length;

  // Page Routing Navigation Handlers
  const handleGoToLanding = () => {
    setPageMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLogin = () => {
    setPageMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToRegister = () => {
    setPageMode('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterApp = (targetTab?: string) => {
    if (targetTab && ['beranda', 'agenda', 'informasi', 'pengumuman', 'diskusi', 'dashboard'].includes(targetTab)) {
      setActiveNav(targetTab as NavItem);
    }
    setPageMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.isAdmin || user.role.toLowerCase().includes('admin')) {
      setPageMode('admin');
    } else {
      setPageMode('app');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setPageMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Content Action Handlers
  const handleSelectArticle = (article: InfoArticle | null) => {
    setSelectedArticle(article);
    if (article) {
      if (pageMode !== 'app') setPageMode('app');
      setActiveNav('informasi');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    if (pageMode !== 'app') setPageMode('app');
    setActiveNav('pengumuman');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromAnnouncement = () => {
    setSelectedAnnouncement(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetActiveNav = (nav: NavItem) => {
    // Reset announcement detail when switching away from pengumuman tab
    if (nav !== 'pengumuman') {
      setSelectedAnnouncement(null);
    }
    setActiveNav(nav);
  };

  const handleToggleLikeThread = (threadId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const isLiked = t.userLiked;
        return {
          ...t,
          userLiked: !isLiked,
          likes: isLiked ? t.likes - 1 : t.likes + 1
        };
      }
      return t;
    }));
  };

  const handleAddComment = (threadId: string, parentCommentId: string | null, content: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      timeAgo: 'Baru saja',
      content,
      likes: 0,
      userLiked: false,
      replies: []
    };

    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        if (!parentCommentId) {
          return {
            ...t,
            comments: [...t.comments, newComment]
          };
        } else {
          const updateReplies = (commentsList: any[]): any[] => {
            return commentsList.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment]
                };
              } else if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: updateReplies(c.replies)
                };
              }
              return c;
            });
          };

          return {
            ...t,
            comments: updateReplies(t.comments)
          };
        }
      }
      return t;
    }));
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
  };

  const handleAddThread = (newThread: ForumThread) => {
    setThreads(prev => [newThread, ...prev]);
  };

  const handleUpdateThread = (updatedThread: ForumThread) => {
    setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
  };

  const handleAddHarvestRecord = (record: HarvestRecord) => {
    setHarvestRecords(prev => [record, ...prev]);
  };

  const handleAddEvent = (newEv: AgendaEvent) => {
    setEvents(prev => [newEv, ...prev]);
  };

  // Render Page Modes
  if (pageMode === 'landing') {
    return (
      <>
        <LandingView
          currentUser={currentUser}
          onGoToLogin={handleGoToLogin}
          onGoToRegister={handleGoToRegister}
          onEnterApp={handleEnterApp}
          onSelectArticle={handleSelectArticle}
        />
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      </>
    );
  }

  if (pageMode === 'login') {
    return (
      <LoginView
        onGoToLanding={handleGoToLanding}
        onGoToRegister={handleGoToRegister}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (pageMode === 'register') {
    return (
      <RegisterView
        onGoToLanding={handleGoToLanding}
        onGoToLogin={handleGoToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  if (pageMode === 'admin') {
    return (
      <AdminPortalView
        currentUser={currentUser}
        articles={articles}
        announcements={announcements}
        threads={threads}
        agendas={events}
        landPlots={landPlots}
        harvestRecords={harvestRecords}
        onUpdateArticles={setArticles}
        onUpdateAnnouncements={setAnnouncements}
        onUpdateThreads={setThreads}
        onUpdateAgendas={setEvents}
        onLogout={handleGoToLogin}
        onSelectArticle={(art) => {
          setSelectedArticle(art);
          setPageMode('app');
          setActiveNav('informasi');
        }}
      />
    );
  }

  // App Dashboard Mode
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#433A30] flex flex-col font-sans">
      {/* Sidebar Component */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        currentUser={currentUser}
        onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
        onOpenBantuan={() => setIsBantuanOpen(true)}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
        isOpenMobile={isOpenMobileMenu}
        setIsOpenMobile={setIsOpenMobileMenu}
        onGoToLanding={handleGoToLanding}
        onGoToAdmin={() => setPageMode('admin')}
      />

      {/* Main Container Area with offset for Sidebar on desktop */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header
          activeNav={activeNav}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsOpenMobileMenu(prev => !prev)}
          onOpenNotifications={() => { setSelectedAnnouncement(null); setActiveNav('pengumuman'); }}
          unreadCount={unreadAnnouncementsCount}
          onClickProfile={() => setActiveNav('profil')}
        />

        {/* Dynamic Screen Render */}
        <main className={`flex-1 w-full ${activeNav === 'diskusi' ? 'px-3 sm:px-5 py-3 flex flex-col min-h-[calc(100vh-80px)]' : 'px-4 lg:px-8 pt-6 pb-12'}`}>
          {activeNav === 'beranda' && (
            <BerandaView
              currentUser={currentUser}
              articles={articles}
              announcements={announcements}
              events={events}
              setActiveNav={setActiveNav}
              onSelectArticle={handleSelectArticle}
              onSelectAnnouncement={handleSelectAnnouncement}
              onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
            />
          )}

          {activeNav === 'agenda' && (
            <AgendaView
              events={events}
              onAddEvent={handleAddEvent}
            />
          )}

          {activeNav === 'informasi' && (
            <InformasiView
              articles={articles}
              selectedArticle={selectedArticle}
              onSelectArticle={handleSelectArticle}
            />
          )}

          {activeNav === 'pengumuman' && (
            selectedAnnouncement ? (
              <AnnouncementDetailView
                announcement={selectedAnnouncement}
                onBack={handleBackFromAnnouncement}
              />
            ) : (
              <PengumumanView
                announcements={announcements}
                selectedAnnouncement={selectedAnnouncement}
                onSelectAnnouncement={handleSelectAnnouncement}
              />
            )
          )}

          {activeNav === 'diskusi' && (
            <DiskusiView
              threads={threads}
              currentUser={currentUser}
              onOpenCreateModal={() => setIsCreateTopicOpen(true)}
              onToggleLikeThread={handleToggleLikeThread}
              onAddComment={handleAddComment}
              onDeleteThread={handleDeleteThread}
              onUpdateThread={handleUpdateThread}
            />
          )}

          {activeNav === 'dashboard' && (
            <DashboardDesaView
              landPlots={landPlots}
              harvestRecords={harvestRecords}
              onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
            />
          )}

          {activeNav === 'profil' && (
            <ProfilView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateTopicModal
        isOpen={isCreateTopicOpen}
        onClose={() => setIsCreateTopicOpen(false)}
        currentUser={currentUser}
        onSubmit={handleAddThread}
      />

      <MulaiPanenModal
        isOpen={isMulaiPanenOpen}
        onClose={() => setIsMulaiPanenOpen(false)}
        currentUser={currentUser}
        onAddHarvestRecord={handleAddHarvestRecord}
      />

      <BantuanModal
        isOpen={isBantuanOpen}
        onClose={() => setIsBantuanOpen(false)}
      />
    </div>
  );
}

export default App;
