import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, MessageSquare, LayoutDashboard, ShieldCheck, FileText, MessageCircle, X } from 'lucide-react';
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
import { BerandaViewLite } from './components/views/BerandaViewLite';
import { AgendaView } from './components/views/AgendaView';
import { AgendaViewLite } from './components/views/AgendaViewLite';
import { InformasiView } from './components/views/InformasiView';
import { InformasiViewLite } from './components/views/InformasiViewLite';
import { DiskusiView } from './components/views/DiskusiView';
import { DiskusiViewLite } from './components/views/DiskusiViewLite';
import { DashboardDesaView } from './components/views/DashboardDesaView';
import { DashboardDesaViewLite } from './components/views/DashboardDesaViewLite';
import { ProfilView } from './components/views/ProfilView';

// Landing, Login, & Register Pages
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { AdminPortalView } from './components/views/admin/AdminPortalView';
import { AdminPortalViewLite } from './components/views/admin/AdminPortalViewLite';

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
  const [appMode, setAppMode] = useState<'lite' | 'pro'>(() => {
    return (sessionStorage.getItem('bestari_appmode') as 'lite' | 'pro') || 'pro';
  });

  useEffect(() => {
    sessionStorage.setItem('bestari_pagemode', pageMode);
  }, [pageMode]);

  useEffect(() => {
    sessionStorage.setItem('bestari_activenav', activeNav);
  }, [activeNav]);

  useEffect(() => {
    sessionStorage.setItem('bestari_appmode', appMode);
  }, [appMode]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [searchQuery, setSearchQuery] = useState('');

  // Data collections
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>(INITIAL_EVENTS);
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
  // Modals & Drawers
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isMulaiPanenOpen, setIsMulaiPanenOpen] = useState(false);
  const [isBantuanOpen, setIsBantuanOpen] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [footerModalInfo, setFooterModalInfo] = useState<'privacy' | 'terms' | 'help' | null>(null);

  // Read state for notifications
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Deleted notification state
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        const storedRead = localStorage.getItem(`read_notifications_${currentUser.id}`);
        setReadNotificationIds(storedRead ? JSON.parse(storedRead) : []);
        const storedDeleted = localStorage.getItem(`deleted_notifications_${currentUser.id}`);
        setDeletedNotificationIds(storedDeleted ? JSON.parse(storedDeleted) : []);
      } catch {
        setReadNotificationIds([]);
        setDeletedNotificationIds([]);
      }
    } else {
      setReadNotificationIds([]);
      setDeletedNotificationIds([]);
    }
  }, [currentUser?.id]);

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
      isRead: readNotificationIds.includes(`agenda_reminder_${ev.id}`),
      postedTime: 'Sistem',
      category: 'PENGINGAT'
    }));

  const combinedNotifications = [
    ...agendaReminders
  ].filter(n => !deletedNotificationIds.includes(n.id));

  // Unread counts
  const unreadNotificationsCount = combinedNotifications.filter(n => !n.isRead).length;

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
        } catch (err: any) {
          // Hanya hapus token jika benar-benar 401 (token tidak valid/expired)
          // Jangan hapus jika backend sedang restart/gagal koneksi (network error)
          if (err?.status === 401) {
            setToken(null);
            if (pageMode === 'app' || pageMode === 'admin') setPageMode('landing');
          } else {
            console.warn('[Bestari] Backend sedang restart atau tidak terjangkau saat cek auth:', err);
          }
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
          api<LandPlot[]>('/dashboard/lahan').catch(() => []),
          api<HarvestRecord[]>('/dashboard/panen').catch(() => []),
          api<{ totalUsers: number, totalRawMaterialKg?: number }>('/dashboard/stats').catch(() => ({ totalUsers: 48 })),
          api<CmsData>('/cms').catch(() => null),
          api<any[]>('/dashboard/members').catch(() => [])
        ]);
        setArticles(arts.length ? arts : []);
        setAnnouncements(anns.length ? anns : []);
        setEvents(ags.length ? ags : INITIAL_EVENTS);
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
          api<LandPlot[]>('/dashboard/lahan').catch(() => []),
          api<HarvestRecord[]>('/dashboard/panen').catch(() => [])
        ]);
        setLandPlots(lahan);
        setHarvestRecords(panen);
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
    if (targetTab && ['beranda', 'agenda', 'informasi', 'diskusi', 'dashboard'].includes(targetTab)) {
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

  const handleSetActiveNav = (nav: NavItem) => {
    setActiveNav(nav);
  };

  const handleMarkNotificationRead = (id: string) => {
    if (!readNotificationIds.includes(id)) {
      const newReadIds = [...readNotificationIds, id];
      setReadNotificationIds(newReadIds);
      if (currentUser?.id) {
        localStorage.setItem(`read_notifications_${currentUser.id}`, JSON.stringify(newReadIds));
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
    const allIds = combinedNotifications.map(n => n.id);
    setDeletedNotificationIds(allIds);
    if (currentUser?.id) {
      localStorage.setItem(`deleted_notifications_${currentUser.id}`, JSON.stringify(allIds));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const allIds = combinedNotifications.map(n => n.id);
    setReadNotificationIds(allIds);
    if (currentUser?.id) {
      localStorage.setItem(`read_notifications_${currentUser.id}`, JSON.stringify(allIds));
    }
  };

  const handleToggleLikeThread = (threadId: string) => {
    let prevLikedBy: any[] | undefined;
    let prevLikes = 0;
    let prevUserLiked = false;

    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        const isLiked = t.likedBy ? t.likedBy.some((u: any) => (u.userId || u.id) === currentUser?.id) : t.userLiked;
        
        // Simpan state lama untuk rollback
        prevLikedBy = t.likedBy ? [...t.likedBy] : [];
        prevLikes = t.likes;
        prevUserLiked = !!t.userLiked;

        // Sync ke backend (rollback jika gagal)
        api(`/thread/${threadId}/${isLiked ? 'unlike' : 'like'}`, { method: 'POST' }).catch(() => {
          setThreads(prev2 => prev2.map(t2 => t2.id === threadId ? { ...t2, userLiked: prevUserLiked, likes: prevLikes, likedBy: prevLikedBy } : t2));
        });
        
        let newLikedBy = t.likedBy ? [...t.likedBy] : [];
        if (isLiked) {
          newLikedBy = newLikedBy.filter(u => (u.userId || u.id) !== currentUser?.id);
        } else if (currentUser) {
          newLikedBy.push({ userId: currentUser.id, id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar });
        }

        return {
          ...t,
          userLiked: !isLiked,
          likes: Math.max(0, t.likes + (isLiked ? -1 : 1)),
          likedBy: newLikedBy
        };
      }
      return t;
    }));
  };

  const handleToggleLikeComment = (threadId: string, commentId: string) => {
    // Simpan state sebelumnya untuk rollback jika API gagal
    let prevLikedBy: any[] | undefined;
    let prevLikes = 0;
    let prevUserLiked = false;

    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          comments: t.comments.map(c => {
            if (c.id === commentId) {
              const isLiked = c.likedBy ? c.likedBy.some((u: any) => (u.userId || u.id) === currentUser?.id) : c.userLiked;
              
              // Simpan state lama untuk rollback
              prevLikedBy = c.likedBy ? [...c.likedBy] : [];
              prevLikes = c.likes;
              prevUserLiked = !!c.userLiked;

              // Sync ke backend (rollback jika gagal)
              api(`/thread/${threadId}/comments/${commentId}/${isLiked ? 'unlike' : 'like'}`, { method: 'POST' }).catch(() => {
                // Rollback ke state sebelumnya
                setThreads(prev2 => prev2.map(t2 => {
                  if (t2.id === threadId) {
                    return {
                      ...t2,
                      comments: t2.comments.map(c2 => c2.id === commentId ? { ...c2, userLiked: prevUserLiked, likes: prevLikes, likedBy: prevLikedBy } : c2)
                    };
                  }
                  return t2;
                }));
              });

              let newLikedBy = c.likedBy ? [...c.likedBy] : [];
              if (isLiked) {
                newLikedBy = newLikedBy.filter(u => (u.userId || u.id) !== currentUser?.id);
              } else if (currentUser) {
                newLikedBy.push({ userId: currentUser.id, id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar });
              }

              return {
                ...c,
                userLiked: !isLiked,
                likes: Math.max(0, c.likes + (isLiked ? -1 : 1)),
                likedBy: newLikedBy
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
        setCurrentUser={setCurrentUser}
        setAppMode={setAppMode}
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
            }
          }}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onClickProfile={() => setActiveNav('profil')}
        />

        {/* Dynamic Screen Render */}
        <main className={`flex-1 w-full flex flex-col ${activeNav === 'diskusi' ? 'p-0' : 'px-4 lg:px-8 pt-6 pb-24 md:pb-28'}`}>
          {activeNav === 'beranda' && (
            appMode === 'lite' ? (
              <BerandaViewLite
                currentUser={currentUser}
                events={events}
                articles={articles}
                setActiveNav={setActiveNav}
                onSelectArticle={handleSelectArticle}
              />
            ) : (
              <BerandaView
                currentUser={currentUser}
                articles={articles}
                events={events}
                setActiveNav={setActiveNav}
                onSelectArticle={handleSelectArticle}
                onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
                cmsData={cmsData}
              />
            )
          )}

          {activeNav === 'agenda' && (
            appMode === 'lite' ? (
              <AgendaViewLite
                events={events && events.length > 0 ? events : INITIAL_EVENTS}
                currentUser={currentUser}
                onRegisterEvent={handleRegisterAgenda}
                onUnregisterEvent={handleUnregisterAgenda}
              />
            ) : (
              <AgendaView
                appMode={appMode}
                events={events && events.length > 0 ? events : INITIAL_EVENTS}
                currentUser={currentUser}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onRegisterEvent={handleRegisterAgenda}
                onUnregisterEvent={handleUnregisterAgenda}
                searchQuery={searchQuery}
              />
            )
          )}

          {activeNav === 'informasi' && (
            appMode === 'lite' ? (
              <InformasiViewLite
                articles={articles}
                selectedArticle={selectedArticle}
                onSelectArticle={handleSelectArticle}
                searchQuery={searchQuery}
              />
            ) : (
              <InformasiView
                articles={articles}
                selectedArticle={selectedArticle}
                onSelectArticle={handleSelectArticle}
                searchQuery={searchQuery}
              />
            )
          )}

          {activeNav === 'diskusi' && (
            appMode === 'lite' ? (
              <DiskusiViewLite
                threads={threads}
                currentUser={currentUser}
                members={members}
                onOpenCreateModal={() => setIsCreateTopicOpen(true)}
                onAddComment={handleAddComment}
                onToggleLikeThread={handleToggleLikeThread}
                onToggleLikeComment={handleToggleLikeComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onDeleteThread={handleDeleteThread}
                onUpdateThread={handleUpdateThread}
              />
            ) : (
              <DiskusiView
                threads={threads}
                currentUser={currentUser}
                members={members}
                onOpenCreateModal={() => setIsCreateTopicOpen(true)}
                onToggleLikeThread={handleToggleLikeThread}
                onToggleLikeComment={handleToggleLikeComment}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onDeleteThread={handleDeleteThread}
                onUpdateThread={handleUpdateThread}
              />
            )
          )}

          {activeNav === 'dashboard' && (
            appMode === 'lite' ? (
              <DashboardDesaViewLite
                landPlots={landPlots}
                harvestRecords={harvestRecords}
                members={members}
                onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
              />
            ) : (
              <DashboardDesaView
                landPlots={landPlots}
                harvestRecords={harvestRecords}
                members={members}
                onSimpanPanen={() => setIsMulaiPanenOpen(true)}
                totalUsers={dashboardStats.totalUsers || 48}
                totalRawMaterialKg={dashboardStats.totalRawMaterialKg}
                onOpenMulaiPanen={() => setIsMulaiPanenOpen(true)}
              />
            )
          )}

          {activeNav === 'profil' && (
            <ProfilView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              appMode={appMode}
              setAppMode={setAppMode}
            />
          )}

        </main>

        {/* Mobile Bottom Navigation (Visible only on md:hidden) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E1D5] flex md:hidden items-center justify-around pb-safe z-40">
          {[
            { id: 'beranda', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
            { id: 'informasi', label: 'Informasi', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-6 h-6" />, isProminent: true },
            { id: 'diskusi', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
            { id: 'dashboard', label: 'Data Sorgum', icon: <LayoutDashboard className="w-5 h-5" /> },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`flex flex-col items-center justify-center w-full py-2 relative transition-all duration-300 ${isActive && !item.isProminent ? 'text-[#2C4219]' : 'text-[#7A7062] hover:text-[#433A30]'}`}
              >
                {!item.isProminent && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-md transition-all duration-300 bg-[#2C4219] ${isActive ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}></div>
                )}
                {item.isProminent ? (
                  <div className="flex flex-col items-center justify-center -mt-8 group">
                    <div className={`relative w-14 h-14 flex items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-300 active:scale-95 ${isActive ? 'bg-[#2C4219] text-[#A8B774] shadow-[#2C4219]/40 -translate-y-1' : 'bg-[#2C4219] text-white hover:-translate-y-0.5'}`}>
                      {isActive && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#2C4219]"></span>
                      )}
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-black mt-1.5 transition-colors ${isActive ? 'text-[#2C4219]' : 'text-[#7A7062]'}`}>{item.label}</span>
                  </div>
                ) : (
                  <>
                    <div className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                      {item.icon}
                    </div>
                    <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer User (Hidden on Mobile, shown on md up) */}
        <footer className={`fixed bottom-0 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'} left-0 right-0 z-40 hidden md:flex flex-wrap items-center justify-center py-4 px-6 lg:px-12 border-t border-[#E6E1D5] bg-gradient-to-r from-[#FAF6EE] to-[#F3EEE3] text-[#433A30] text-[11px] font-medium gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] transition-all duration-300`}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 shrink-0">
            <button onClick={() => setFooterModalInfo('privacy')} className="flex items-center gap-1.5 text-[#5C5246] hover:text-[#2C4219] hover:underline underline-offset-4 transition-all">
              <ShieldCheck className="w-3.5 h-3.5 opacity-80" /> 
              <span>Kebijakan Privasi</span>
            </button>
            <span className="w-1 h-1 rounded-full bg-[#2C4219]/20"></span>
            <button onClick={() => setFooterModalInfo('terms')} className="flex items-center gap-1.5 text-[#5C5246] hover:text-[#2C4219] hover:underline underline-offset-4 transition-all">
              <FileText className="w-3.5 h-3.5 opacity-80" /> 
              <span>Syarat & Ketentuan</span>
            </button>
            <span className="w-1 h-1 rounded-full bg-[#2C4219]/20"></span>
            <button onClick={() => setFooterModalInfo('help')} className="flex items-center gap-1.5 text-[#5C5246] hover:text-[#2C4219] hover:underline underline-offset-4 transition-all">
              <MessageCircle className="w-3.5 h-3.5 opacity-80" /> 
              <span>Panduan Komunitas</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Footer Content Modal */}
      {footerModalInfo && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setFooterModalInfo(null)}>
          <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-4xl w-full flex flex-col max-h-[85vh] sm:max-h-[90vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#FAF6EE] border-b border-[#E6E1D5] px-6 sm:px-8 py-5 sm:py-6 flex flex-col gap-2 relative overflow-hidden shrink-0">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#E3EAD3] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#E3EAD3] rounded-full blur-2xl opacity-50 pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-[#E6E1D5]">
                    {footerModalInfo === 'privacy' && <ShieldCheck className="w-6 h-6 text-[#2C4219]" />}
                    {footerModalInfo === 'terms' && <FileText className="w-6 h-6 text-[#2C4219]" />}
                    {footerModalInfo === 'help' && <MessageCircle className="w-6 h-6 text-[#2C4219]" />}
                  </div>
                  <div>
                    <h2 className="font-title font-extrabold text-xl sm:text-2xl text-[#2C4219]">
                      {footerModalInfo === 'privacy' ? 'Kebijakan Privasi' : footerModalInfo === 'terms' ? 'Syarat & Ketentuan' : 'Panduan Komunitas'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A7062] font-semibold mt-0.5">
                      KWT Melati Sorgum
                    </p>
                  </div>
                </div>
                <button onClick={() => setFooterModalInfo(null)} className="p-2 sm:p-2.5 bg-white hover:bg-[#F3EEE3] rounded-xl text-[#7A7062] transition-colors border border-[#E6E1D5] shadow-sm active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-6 sm:p-8 bg-white flex-1 custom-scrollbar">
              <div className="prose prose-sm sm:prose-base prose-green max-w-none text-[#433A30] leading-relaxed">
                {footerModalInfo === 'privacy' ? (
                  <div dangerouslySetInnerHTML={{ __html: cmsData?.footerPrivacy || '<p className="text-center text-[#7A7062] italic my-8">Belum ada teks kebijakan privasi.</p>' }} />
                ) : footerModalInfo === 'terms' ? (
                  <div dangerouslySetInnerHTML={{ __html: cmsData?.footerTerms || '<p className="text-center text-[#7A7062] italic my-8">Belum ada teks syarat & ketentuan.</p>' }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: cmsData?.footerHelp || '<p className="text-center text-[#7A7062] italic my-8">Belum ada panduan bantuan.</p>' }} />
                )}
              </div>
            </div>
            
            <div className="bg-[#FAF6EE] border-t border-[#E6E1D5] px-6 sm:px-8 py-4 flex justify-end shrink-0">
              <button onClick={() => setFooterModalInfo(null)} className="px-6 py-2.5 bg-[#2C4219] hover:bg-[#3A5323] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm">
                Mengerti
              </button>
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
              setIsNotificationsModalOpen(false);
            }
          }}
        />
      )}
      {renderAdminReturnBtn()}
    </div>
  );
}

export default App;
