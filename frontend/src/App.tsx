import React, { useState, useEffect } from 'react';
import { NavItem, InfoArticle, Announcement, AgendaEvent, ForumThread, LandPlot, HarvestRecord, UserProfile, CmsData } from './types';
import {
  CURRENT_USER,
  INITIAL_ARTICLES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_THREADS,
  INITIAL_LAND_PLOTS,
  INITIAL_HARVEST_RECORDS
} from './data/mockData';
import { api, apiLogin, apiRegister, getToken, setToken } from './api/client';

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
import { SemuaNotifikasiModal } from './components/modals/SemuaNotifikasiModal';

type PageMode = 'landing' | 'login' | 'register' | 'app' | 'admin';

export function App() {
  const [pageMode, setPageMode] = useState<PageMode>(() => {
    return (sessionStorage.getItem('bestari_pagemode') as PageMode) || 'landing';
  });
  const [activeNav, setActiveNav] = useState<NavItem>(() => {
    return (sessionStorage.getItem('bestari_activenav') as NavItem) || 'beranda';
  });

  useEffect(() => {
    sessionStorage.setItem('bestari_pagemode', pageMode);
  }, [pageMode]);

  useEffect(() => {
    sessionStorage.setItem('bestari_activenav', activeNav);
  }, [activeNav]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [searchQuery, setSearchQuery] = useState('');

  // Data collections
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [landPlots, setLandPlots] = useState<LandPlot[]>([]);
  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{ totalUsers?: number, totalRawMaterialKg?: number }>({ totalUsers: 48 });
  const [cmsData, setCmsData] = useState<CmsData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Selected State
  const [selectedArticle, setSelectedArticle] = useState<InfoArticle | null>(() => {
    const saved = sessionStorage.getItem('bestari_selectedarticle');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedArticle) {
      sessionStorage.setItem('bestari_selectedarticle', JSON.stringify(selectedArticle));
    } else {
      sessionStorage.removeItem('bestari_selectedarticle');
    }
  }, [selectedArticle]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(() => {
    const saved = sessionStorage.getItem('bestari_selectedannouncement');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedAnnouncement) {
      sessionStorage.setItem('bestari_selectedannouncement', JSON.stringify(selectedAnnouncement));
    } else {
      sessionStorage.removeItem('bestari_selectedannouncement');
    }
  }, [selectedAnnouncement]);

  // Modals & Drawers
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isMulaiPanenOpen, setIsMulaiPanenOpen] = useState(false);
  const [isBantuanOpen, setIsBantuanOpen] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [footerModalInfo, setFooterModalInfo] = useState<'privacy' | 'terms' | 'help' | null>(null);

  // Read state for announcements
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);

  // Deleted notification state
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        const storedRead = localStorage.getItem(`read_announcements_${currentUser.id}`);
        setReadAnnouncementIds(storedRead ? JSON.parse(storedRead) : []);
        const storedDeleted = localStorage.getItem(`deleted_notifications_${currentUser.id}`);
        setDeletedNotificationIds(storedDeleted ? JSON.parse(storedDeleted) : []);
      } catch {
        setReadAnnouncementIds([]);
        setDeletedNotificationIds([]);
      }
    } else {
      setReadAnnouncementIds([]);
      setDeletedNotificationIds([]);
    }
  }, [currentUser?.id]);

  // Visible announcements for notifications
  const visibleAnnouncements = announcements.filter(a => !deletedNotificationIds.includes(a.id));

  // Tandai semua pengumuman sebagai "dibaca" saat user masuk halaman Pengumuman
  useEffect(() => {
    if (activeNav === 'pengumuman' && currentUser && announcements.length > 0) {
      const allIds = announcements.map(a => a.id);
      const newIds = [...new Set([...readAnnouncementIds, ...allIds])];
      if (newIds.length !== readAnnouncementIds.length) {
        setReadAnnouncementIds(newIds);
        localStorage.setItem(`read_announcements_${currentUser.id}`, JSON.stringify(newIds));
      }
    }
  }, [activeNav, currentUser?.id, announcements.length]);

  // Generate Agenda Reminders (1 day before)
  const todayObj = new Date();
  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;

  const agendaReminders = events
    .filter(ev => ev.isRegistered && ev.date === tomorrowStr)
    .map(ev => ({
      id: `agenda_reminder_${ev.id}`,
      title: 'Pengingat: Acara Besok',
      summary: `Jangan lupa, Anda telah terdaftar pada kegiatan "${ev.title}" yang akan dilaksanakan besok pada pukul ${ev.time}.`,
      isRead: readAnnouncementIds.includes(`agenda_reminder_${ev.id}`),
      postedTime: 'Sistem',
      category: 'PENGINGAT'
    }));

  const combinedNotifications = [
    ...agendaReminders,
    ...visibleAnnouncements.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      isRead: readAnnouncementIds.includes(a.id),
      postedTime: a.postedTime,
      category: a.category
    }))
  ].filter(n => !deletedNotificationIds.includes(n.id));

  // Unread counts
  const unreadNotificationsCount = combinedNotifications.filter(n => !n.isRead).length;
  const unreadPengumumanOnlyCount = visibleAnnouncements.filter(a => !readAnnouncementIds.includes(a.id)).length;

  // ── LOAD DATA REAL DARI BACKEND SAAT APP DIBUKA ──
  useEffect(() => {
    const initApp = async () => {
      const token = getToken();
      if (token) {
        // Auto-login jika ada token tersimpan
        try {
          const u = await api<any>('/auth/me');
          if (u) {
            setCurrentUser(u);
            if (pageMode === 'landing' || pageMode === 'login' || pageMode === 'register') {
              if (u.isAdmin || u.role?.toLowerCase().includes('admin')) {
                setPageMode('admin');
              } else {
                setPageMode('app');
              }
            }
          }
        } catch {
          setToken(null);
          if (pageMode === 'app' || pageMode === 'admin') setPageMode('landing');
        }
      } else {
        if (pageMode === 'app' || pageMode === 'admin') setPageMode('landing');
      }

      // Load semua data publik dari backend
      try {
        const [arts, anns, ags, thrs, lahan, panen, stats, cmsRes, membersRes] = await Promise.all([
          api<InfoArticle[]>('/artikel').catch(() => []),
          api<Announcement[]>('/pengumuman').catch(() => []),
          api<AgendaEvent[]>('/agenda').catch(() => []),
          api<ForumThread[]>('/thread').catch(() => []),
          api<LandPlot[]>('/scm/lahan').catch(() => []),
          api<HarvestRecord[]>('/scm/panen').catch(() => []),
          api<{ totalUsers: number, totalRawMaterialKg?: number }>('/dashboard/stats').catch(() => ({ totalUsers: 48 })),
          api<CmsData>('/cms').catch(() => null),
          api<any[]>('/dashboard/members').catch(() => [])
        ]);
        setArticles(arts.length ? arts : []);
        setAnnouncements(anns.length ? anns : []);
        setEvents(ags.length ? ags : []);
        setThreads(thrs.length ? thrs : []);
        setLandPlots(lahan.length ? lahan : []);
        setHarvestRecords(panen.length ? panen : []);
        setMembers(membersRes.length ? membersRes : []);
        if (stats) setDashboardStats(stats);
        if (cmsRes) setCmsData(cmsRes);
      } catch (e) {
        // Fallback ke mock data jika backend mati
        console.warn('[Bestari] Backend tidak terjangkau, pakai mock data:', e);
      }
      setIsInitialLoad(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    // Real-time polling khusus untuk Lahan & Panen (tiap 30 detik)
    const pollSorgumData = async () => {
      try {
        const [lahan, panen] = await Promise.all([
          api<LandPlot[]>('/scm/lahan').catch(() => []),
          api<HarvestRecord[]>('/scm/panen').catch(() => [])
        ]);
        if (lahan.length > 0) setLandPlots(lahan);
        if (panen.length > 0) setHarvestRecords(panen);
      } catch (e) {
        console.error('[Bestari] Polling Sorgum Data gagal:', e);
      }
    };

    const interval = setInterval(pollSorgumData, 30000);
    return () => clearInterval(interval);
  }, []);


  // Page Routing Navigation Handlers
  const handleGoToLanding = () => {
    setPageMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLogin = () => {
    setPageMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(CURRENT_USER);
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

  // ── LOGIN & REGISTER REAL (BACKEND) ──
  const handleApiLogin = async (email: string, password: string): Promise<UserProfile> => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setCurrentUser(data.user);
    return data.user;
  };

  const handleApiRegister = async (payload: { name: string; email: string; password: string; phone?: string }): Promise<UserProfile> => {
    const data = await apiRegister(payload);
    return data.user;
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

    // Mark as read
    if (!readAnnouncementIds.includes(announcement.id)) {
      const newReadIds = [...readAnnouncementIds, announcement.id];
      setReadAnnouncementIds(newReadIds);
      if (currentUser?.id) {
        localStorage.setItem(`read_announcements_${currentUser.id}`, JSON.stringify(newReadIds));
      }
    }

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

  const handleMarkNotificationRead = (id: string) => {
    if (!readAnnouncementIds.includes(id)) {
      const newReadIds = [...readAnnouncementIds, id];
      setReadAnnouncementIds(newReadIds);
      if (currentUser?.id) {
        localStorage.setItem(`read_announcements_${currentUser.id}`, JSON.stringify(newReadIds));
      }
    }
  };

  const handleDeleteNotification = (id: string) => {
    if (!deletedNotificationIds.includes(id)) {
      const newDeletedIds = [...deletedNotificationIds, id];
      setDeletedNotificationIds(newDeletedIds);
      if (currentUser?.id) {
        localStorage.setItem(`deleted_notifications_${currentUser.id}`, JSON.stringify(newDeletedIds));
      }
    }
  };

  const handleClearAllNotifications = () => {
    const agendaReminderIds = events.filter(ev => ev.isRegistered).map(ev => `agenda_reminder_${ev.id}`);
    const allIds = [...agendaReminderIds, ...visibleAnnouncements.map(a => a.id)];
    setDeletedNotificationIds(allIds);
    if (currentUser?.id) {
      localStorage.setItem(`deleted_notifications_${currentUser.id}`, JSON.stringify(allIds));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const agendaReminderIds = events.filter(ev => ev.isRegistered).map(ev => `agenda_reminder_${ev.id}`);
    const allIds = [...agendaReminderIds, ...visibleAnnouncements.map(a => a.id)];
    setReadAnnouncementIds(allIds);
    if (currentUser?.id) {
      localStorage.setItem(`read_announcements_${currentUser.id}`, JSON.stringify(allIds));
    }
  };

  const handleToggleLikeThread = (threadId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const isLiked = t.userLiked;
        // Sync ke backend (best effort)
        api(`/thread/${threadId}/${isLiked ? 'unlike' : 'like'}`, { method: 'POST' }).catch(() => { });
        return {
          ...t,
          userLiked: !isLiked,
          likes: isLiked ? t.likes - 1 : t.likes + 1
        };
      }
      return t;
    }));
  };

  const handleToggleLikeComment = (threadId: string, commentId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          comments: t.comments.map(c => {
            if (c.id === commentId) {
              const isLiked = c.userLiked;
              return {
                ...c,
                userLiked: !isLiked,
                likes: isLiked ? (c.likes - 1) : (c.likes + 1)
              };
            }
            return c;
          })
        };
      }
      return t;
    }));
  };

  const handleAddComment = async (threadId: string, content: string, imageAttachments?: string[], quotedText?: string, quotedAuthor?: string, documentAttachments?: { url: string; name: string }[]) => {
    // Simpan ke backend, fallback ke lokal
    try {
      let newComment = await api<any>(`/thread/${threadId}/comments`, {
        method: 'POST',
        body: { content, imageAttachments, quotedText, quotedAuthor, documentAttachments },
      });
      // Attach fields the backend might have stripped
      newComment = {
        ...newComment,
        imageAttachments: imageAttachments || newComment.imageAttachments,
        documentAttachments: documentAttachments || newComment.documentAttachments,
        quotedCommentText: quotedText || newComment.quotedCommentText,
        quotedCommentAuthor: quotedAuthor || newComment.quotedCommentAuthor,
        createdAt: Date.now(),
      };
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return { ...t, comments: [...t.comments, newComment] };
        }
        return t;
      }));
    } catch (e) {
      const newComment = {
        id: `c_${Date.now()}`,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorRole: currentUser.role,
        timeAgo: 'Baru saja',
        content,
        likes: 0,
        userLiked: false,
        imageAttachments,
        documentAttachments,
        quotedCommentText: quotedText,
        quotedCommentAuthor: quotedAuthor,
        createdAt: Date.now(),
        replies: []
      };
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return { ...t, comments: [...t.comments, newComment] };
        }
        return t;
      }));
    }
  };

  const handleEditComment = async (threadId: string, commentId: string, newContent: string, imageAttachments?: string[], documentAttachments?: { url: string; name: string }[]) => {
    try {
      await api(`/thread/${threadId}/comments/${commentId}`, {
        method: 'PUT',
        body: { content: newContent, imageAttachments, documentAttachments },
      });
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            comments: t.comments.map(c =>
              c.id === commentId ? { ...c, content: newContent, imageAttachments, documentAttachments, isEdited: true } : c
            )
          };
        }
        return t;
      }));
    } catch (e) {
      console.warn('Gagal edit komentar', e);
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            comments: t.comments.map(c =>
              c.id === commentId ? { ...c, content: newContent, imageAttachments, documentAttachments, isEdited: true } : c
            )
          };
        }
        return t;
      }));
    }
  };

  const handleDeleteComment = async (threadId: string, commentId: string) => {
    try {
      await api(`/thread/${threadId}/comments/${commentId}`, { method: 'DELETE' });
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            comments: t.comments.filter(c => c.id !== commentId)
          };
        }
        return t;
      }));
    } catch (e) {
      console.warn('Gagal hapus komentar', e);
      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            comments: t.comments.filter(c => c.id !== commentId)
          };
        }
        return t;
      }));
    }
  };

  const handleDeleteThread = (threadId: string) => {
    // Hapus di backend (best effort)
    api(`/thread/${threadId}`, { method: 'DELETE' }).catch(() => { });
    setThreads(prev => prev.filter(t => t.id !== threadId));
  };

  const handleAddThread = async (newThread: ForumThread) => {
    // Simpan ke backend, fallback ke lokal
    try {
      const created = await api<ForumThread>('/thread', {
        method: 'POST',
        body: {
          title: newThread.title,
          category: newThread.category,
          content: newThread.content,
          summary: newThread.summary,
          images: newThread.images || [],
          groupAvatar: newThread.groupAvatar,
          allowMemberMessages: newThread.allowMemberMessages !== false,
        },
      });
      setThreads(prev => [created, ...prev]);
    } catch (e) {
      console.warn('[Bestari] Gagal buat topik:', e);
      setThreads(prev => [newThread, ...prev]);
    }
  };

  const handleUpdateThread = (updatedThread: ForumThread, syncToBackend: boolean = true) => {
    if (syncToBackend) {
      // Sync ke backend (best effort)
      api(`/thread/${updatedThread.id}`, {
        method: 'PUT',
        body: {
          title: updatedThread.title,
          category: updatedThread.category,
          content: updatedThread.content,
          summary: updatedThread.summary,
          images: updatedThread.images || [],
          groupAvatar: updatedThread.groupAvatar,
          allowMemberMessages: updatedThread.allowMemberMessages !== false,
          joinedMembers: updatedThread.joinedMembers || [],
        },
      }).catch((e) => {
        console.error('Update Thread Error:', e);
      });
    }
    setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
  };

  const handleAddHarvestRecord = async (record: HarvestRecord) => {
    // Simpan ke backend, fallback ke lokal
    try {
      const created = await api<HarvestRecord>('/scm/panen', {
        method: 'POST',
        body: {
          date: record.date,
          blockName: record.blockName,
          cropVariety: record.cropVariety,
          weightKg: record.weightKg,
          quality: record.quality,
          recordedBy: record.recordedBy,
          notes: record.notes,
        },
      });
      setHarvestRecords(prev => [created, ...prev]);
    } catch (e) {
      console.warn('[Bestari] Gagal simpan panen:', e);
      setHarvestRecords(prev => [record, ...prev]);
    }
  };

  const handleAddEvent = async (newEv: AgendaEvent) => {
    // Simpan ke backend, fallback ke lokal
    try {
      const created = await api<AgendaEvent>('/agenda', {
        method: 'POST',
        body: {
          title: newEv.title,
          category: newEv.category,
          date: newEv.date,
          dayNumber: newEv.dayNumber,
          monthAbbr: newEv.monthAbbr,
          time: newEv.time,
          location: newEv.location,
          organizer: newEv.organizer,
          status: newEv.status,
          statusType: newEv.statusType,
          description: newEv.description,
          targetParticipants: newEv.targetParticipants,
          contactPerson: newEv.contactPerson,
          requirements: newEv.requirements,
          benefits: newEv.benefits,
        },
      });
      setEvents(prev => [created, ...prev]);
    } catch (e) {
      console.warn('[Bestari] Gagal buat agenda:', e);
      setEvents(prev => [newEv, ...prev]);
    }
  };

  const handleEditEvent = async (updatedEv: AgendaEvent) => {
    // Hitung status berdasarkan tanggal di sisi klien (tanggal lampau = Selesai)
    const todayStr = new Date().toISOString().split('T')[0];
    const computedStatus = updatedEv.date < todayStr ? 'Selesai' : updatedEv.status;
    const finalEv: AgendaEvent = { ...updatedEv, status: computedStatus as AgendaEvent['status'] };

    // Update lokal DULU agar UI langsung responsif
    setEvents(prev => prev.map(ev => ev.id === finalEv.id ? finalEv : ev));

    // Sync ke backend (best effort)
    try {
      await api<AgendaEvent>(`/agenda/${finalEv.id}`, {
        method: 'PUT',
        body: {
          title: finalEv.title,
          category: finalEv.category,
          date: finalEv.date,
          dayNumber: finalEv.dayNumber,
          monthAbbr: finalEv.monthAbbr,
          time: finalEv.time,
          location: finalEv.location,
          organizer: finalEv.organizer,
          status: finalEv.status,
          statusType: finalEv.statusType,
          description: finalEv.description,
          targetParticipants: finalEv.targetParticipants,
          contactPerson: finalEv.contactPerson,
          requirements: finalEv.requirements,
          benefits: finalEv.benefits,
        },
      });
    } catch (e) {
      console.warn('[Bestari] Gagal update agenda ke backend:', e);
      // State lokal sudah diupdate, tidak perlu rollback
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Hapus di backend (best effort)
    try {
      await api(`/agenda/${eventId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[Bestari] Gagal hapus agenda:', e);
    }
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
  };

  const handleRegisterAgenda = async (eventId: string) => {
    try {
      await api(`/agenda/${eventId}/daftar`, { method: 'POST' });
      // Refresh event untuk update isRegistered
      const ags = await api<AgendaEvent[]>('/agenda');
      if (ags.length) setEvents(ags);
    } catch (e) {
      console.warn('[Bestari] Gagal daftar agenda:', e);
    }
  };

  const handleUnregisterAgenda = async (eventId: string) => {
    try {
      await api(`/agenda/${eventId}/daftar`, { method: 'DELETE' });
      const ags = await api<AgendaEvent[]>('/agenda');
      if (ags.length) setEvents(ags);
    } catch (e) {
      console.warn('[Bestari] Gagal batal daftar agenda:', e);
    }
  };

  // ── CMS: update konten landing/login/register ──
  const handleUpdateCmsData = async (data: CmsData) => {
    setCmsData(data);
    try {
      const updated = await api<CmsData>('/cms', { method: 'PUT', body: data });
      setCmsData(updated);
    } catch (e) {
      console.warn('[Bestari] Gagal simpan CMS:', e);
    }
  };

  const renderAdminReturnBtn = () => {
    const isAdmin = currentUser?.isAdmin || currentUser?.role?.toLowerCase().includes('admin');
    if (!isAdmin) return null;
    return (
      <button
        onClick={() => {
          setPageMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-6 right-6 z-[9999] px-4 py-3 bg-[#2C4219] hover:bg-[#1E2E11] text-white rounded-full shadow-2xl flex items-center gap-2 font-sans font-bold text-sm border-2 border-[#A8B774] transition-all hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2010/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        <span>Kembali ke Admin</span>
      </button>
    );
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2C4219] border-t-transparent"></div>
      </div>
    );
  }

  // Render Page Modes
  if (pageMode === 'landing') {
    return (
      <>
        <LandingView
          currentUser={currentUser}
          cmsData={cmsData}
          onGoToLogin={handleGoToLogin}
          onGoToRegister={handleGoToRegister}
          onEnterApp={handleEnterApp}
          onSelectArticle={handleSelectArticle}
        />
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
        {renderAdminReturnBtn()}
      </>
    );
  }

  if (pageMode === 'login') {
    return (
      <>
        <LoginView
          onGoToLanding={handleGoToLanding}
          onGoToRegister={handleGoToRegister}
          onLoginSuccess={handleLoginSuccess}
          onApiLogin={handleApiLogin}
          cmsData={cmsData}
        />
        {renderAdminReturnBtn()}
      </>
    );
  }

  if (pageMode === 'register') {
    return (
      <>
        <RegisterView
          onGoToLanding={handleGoToLanding}
          onGoToLogin={handleGoToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          onApiRegister={handleApiRegister}
          cmsData={cmsData}
        />
        {renderAdminReturnBtn()}
      </>
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
        members={members}
        cmsData={cmsData}
        dashboardStats={dashboardStats}
        onUpdateCmsData={handleUpdateCmsData}
        onUpdateArticles={(list) => setArticles(list.filter(a => (a as any).status !== 'Draft'))}
        onUpdateAnnouncements={setAnnouncements}
        onUpdateThreads={setThreads}
        onUpdateAgendas={setEvents}
        onLogout={handleLogout}
        onNavigateToPage={(page) => {
          if (page === 'beranda') {
            setPageMode('landing');
          } else if (page === 'login') {
            setPageMode('login');
          } else if (page === 'register') {
            setPageMode('register');
          } else {
            setPageMode('app');
            setActiveNav(page as any);
          }
        }}
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
        onLogout={handleLogout}
        onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
        onOpenBantuan={() => setIsBantuanOpen(true)}
        unreadAnnouncementsCount={unreadPengumumanOnlyCount}
        isOpenMobile={isOpenMobileMenu}
        setIsOpenMobile={setIsOpenMobileMenu}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onGoToLanding={handleGoToLanding}
        onGoToAdmin={() => setPageMode('admin')}
        webName={cmsData?.webName}
        webSubtitle={cmsData?.webSubtitle}
        webLogo={cmsData?.webLogo}
      />

      {/* Main Container Area with offset for Sidebar on desktop */}
      <div className={`${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <Header
          activeNav={activeNav}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileMenu={() => setIsOpenMobileMenu(prev => !prev)}
          unreadCount={unreadNotificationsCount}
          notifications={combinedNotifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onDeleteNotification={handleDeleteNotification}
          onClearAllNotifications={handleClearAllNotifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClickNotification={(id) => {
            handleMarkNotificationRead(id);
            if (id.startsWith('agenda_reminder_')) {
              setActiveNav('agenda');
            } else {
              const ann = announcements.find(a => a.id === id);
              if (ann) {
                handleSelectAnnouncement(ann);
              }
            }
          }}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onClickProfile={() => setActiveNav('profil')}
        />

        {/* Dynamic Screen Render */}
        <main className={`flex-1 w-full flex flex-col min-h-[calc(100vh-80px)] ${activeNav === 'diskusi' ? 'px-3 sm:px-5 py-3' : 'px-4 lg:px-8 pt-6 pb-12'}`}>
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
              cmsData={cmsData}
            />
          )}

          {activeNav === 'agenda' && (
            <AgendaView
              events={events}
              currentUser={currentUser}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onRegisterEvent={handleRegisterAgenda}
              onUnregisterEvent={handleUnregisterAgenda}
              searchQuery={searchQuery}
            />
          )}

          {activeNav === 'informasi' && (
            <InformasiView
              articles={articles}
              selectedArticle={selectedArticle}
              onSelectArticle={handleSelectArticle}
              searchQuery={searchQuery}
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
                searchQuery={searchQuery}
              />
            )
          )}

          {activeNav === 'diskusi' && (
            <DiskusiView
              threads={threads}
              currentUser={currentUser}
              onOpenCreateModal={() => setIsCreateTopicOpen(true)}
              onToggleLikeThread={handleToggleLikeThread}
              onToggleLikeComment={handleToggleLikeComment}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onDeleteThread={handleDeleteThread}
              onUpdateThread={handleUpdateThread}
            />
          )}

          {activeNav === 'dashboard' && (
            <DashboardDesaView
              landPlots={landPlots}
              harvestRecords={harvestRecords}
              members={members}
              onSimpanPanen={() => setIsMulaiPanenOpen(true)}
              totalUsers={dashboardStats.totalUsers || 48}
              totalRawMaterialKg={dashboardStats.totalRawMaterialKg}
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

        {/* Footer User */}
        <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center border-t border-[#E6E1D5] bg-white text-[#2C4219] text-[10px] sm:text-xs font-semibold gap-2 sm:gap-4 whitespace-nowrap overflow-x-auto scrollbar-hide">
          <div className="opacity-80">
            {cmsData?.footerCopyright || '© Community App KWT Melati Sorgum 2026. Seluruh hak cipta dilindungi.'}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setFooterModalInfo('privacy')} className="hover:text-[#5C5246] transition-colors">Kebijakan Privasi</button>
            <span className="text-[#2C4219]/30">|</span>
            <button onClick={() => setFooterModalInfo('terms')} className="hover:text-[#5C5246] transition-colors">Syarat & Ketentuan</button>
            <span className="text-[#2C4219]/30">|</span>
            <button onClick={() => setFooterModalInfo('help')} className="hover:text-[#5C5246] transition-colors">Panduan Komunitas</button>
          </div>
        </footer>
      </div>

      {/* Footer Content Modal */}
      {footerModalInfo && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setFooterModalInfo(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 flex flex-col max-h-[85vh] border border-[#E6E1D5] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h2 className="font-title font-bold text-xl text-[#2C4219]">
                {footerModalInfo === 'privacy' ? 'Kebijakan Privasi' : footerModalInfo === 'terms' ? 'Syarat & Ketentuan' : 'Bantuan'}
              </h2>
              <button onClick={() => setFooterModalInfo(null)} className="p-2 hover:bg-[#FAF6EE] rounded-xl text-[#7A7062] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto overflow-x-hidden break-words whitespace-normal py-4 text-[#433A30] text-sm leading-relaxed prose prose-sm max-w-none">
              {footerModalInfo === 'privacy' ? (
                <div dangerouslySetInnerHTML={{ __html: cmsData?.footerPrivacy || '<p>Belum ada teks kebijakan privasi.</p>' }} />
              ) : footerModalInfo === 'terms' ? (
                <div dangerouslySetInnerHTML={{ __html: cmsData?.footerTerms || '<p>Belum ada teks syarat & ketentuan.</p>' }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: cmsData?.footerHelp || '<p>Belum ada panduan bantuan.</p>' }} />
              )}
            </div>
          </div>
        </div>
      )}

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

      {isNotificationsModalOpen && (
        <SemuaNotifikasiModal
          notifications={combinedNotifications}
          onClose={() => setIsNotificationsModalOpen(false)}
          onMarkRead={handleMarkNotificationRead}
          onDelete={handleDeleteNotification}
          onClearAll={handleClearAllNotifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClickNotification={(id) => {
            handleMarkNotificationRead(id);
            if (id.startsWith('agenda_reminder_')) {
              setActiveNav('agenda');
            } else {
              const ann = announcements.find(a => a.id === id);
              if (ann) {
                handleSelectAnnouncement(ann);
              }
            }
          }}
        />
      )}
      {renderAdminReturnBtn()}
    </div>
  );
}

export default App;
