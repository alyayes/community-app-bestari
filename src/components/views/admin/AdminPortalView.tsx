import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Sprout,
  LayoutDashboard,
  FileText,
  Megaphone,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Pin,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Activity,
  X,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  Calendar,
  MapPin,
  CalendarDays,
  BarChart2,
  AlertTriangle,
  PieChart as PieChartIcon,
  Home,
  LogIn,
  UserPlus,
  Type,
  Image as ImageIcon,
  Save,
  ExternalLink,
  Link,
  Sparkles,
  Upload,
  Mic,
  Square,
  Loader2
} from 'lucide-react';
import { UserProfile, InfoArticle, Announcement, ForumThread, AgendaEvent, LandPlot, HarvestRecord, CmsData } from '../../../types';
import { DashboardDesaView } from '../DashboardDesaView';
import { ArticleDetailModal } from '../../modals/ArticleDetailModal';
import { api, SERVER_BASE, BASE_URL } from '../../../api/client';

interface AdminPortalViewProps {
  currentUser: UserProfile;
  articles: InfoArticle[];
  announcements: Announcement[];
  threads: ForumThread[];
  agendas?: AgendaEvent[];
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  onUpdateArticles: (articles: InfoArticle[]) => void;
  onUpdateAnnouncements: (announcements: Announcement[]) => void;
  onUpdateThreads: (threads: ForumThread[]) => void;
  onUpdateAgendas?: (agendas: AgendaEvent[]) => void;
  onLogout: () => void;
  onSelectArticle: (article: InfoArticle) => void;
  cmsData?: CmsData | null;
  onUpdateCmsData?: (data: CmsData) => void;
  onNavigateToPage?: (page: string) => void;
  dashboardStats?: { totalUsers?: number; totalRawMaterialKg?: number };
}

type AdminTab = 'dashboard' | 'informasi' | 'pengumuman' | 'agenda' | 'moderation' | 'datasorgum' | 'settings' | 'cms' | 'users';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  articles,
  announcements,
  threads,
  agendas,
  landPlots,
  harvestRecords,
  onUpdateArticles,
  onUpdateAnnouncements,
  onUpdateThreads,
  onUpdateAgendas,
  onLogout,
  onSelectArticle,
  cmsData,
  onUpdateCmsData,
  onNavigateToPage,
  dashboardStats
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    return (sessionStorage.getItem('bestari_admintab') as AdminTab) || 'dashboard';
  });

  useEffect(() => {
    sessionStorage.setItem('bestari_admintab', activeTab);
  }, [activeTab]);

  const [subTabInformasi, setSubTabInformasi] = useState<'list' | 'tambah'>('list');
  const [subTabAgenda, setSubTabAgenda] = useState<'list' | 'tambah'>('list');

  // Kelola Pengguna (Users) States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: 'USER', phone: '', password: '' });

  // Load Users when tab is 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      api<any[]>('/admin/users')
        .then(data => setUsersList(data || []))
        .catch(err => console.error(err));
    }
  }, [activeTab]);

  // State artikel admin sendiri (termasuk Draft) — pisah dari state publik App.tsx.
  // TIDAK di-sync dari props setelah mount (agar Draft tidak tertimpa oleh filter Published App.tsx)
  const [adminArticles, setAdminArticles] = useState<InfoArticle[]>(articles);

  // Saat mount: load semua artikel (termasuk Draft) untuk tabel admin.
  // Retry beberapa kali untuk mengatasi race condition dengan auto-login (token belum siap).
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const load = () => {
      api<InfoArticle[]>('/artikel/admin')
        .then(list => { if (!cancelled && list?.length) setAdminArticles(list); })
        .catch(() => {
          attempts += 1;
          if (!cancelled && attempts < 5) setTimeout(load, 800);
        });
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Agenda items initial mock matching screenshot
  const DEFAULT_AGENDAS: AgendaEvent[] = [
    {
      id: 'ag_1',
      title: 'Workshop Pengolahan Tepung Sorgum',
      category: 'WORKSHOP',
      date: '10 Okt 2026',
      dayNumber: '10',
      monthAbbr: 'OKT',
      time: '09:00 - 12:00',
      location: 'Balai Desa Sukamaju',
      organizer: 'KWT Sari',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Pelatihan teknis olahan tepung sorgum bebas gluten untuk produk UMKM.'
    },
    {
      id: 'ag_2',
      title: 'Panen Bersama Lahan Blok A',
      category: 'PANEN BERSAMA',
      date: '14 Okt 2026',
      dayNumber: '14',
      monthAbbr: 'OKT',
      time: '07:00 - 11:00',
      location: 'Lahan Percobaan Utama',
      organizer: 'Pak Slamet',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Kegiatan pemetikan biji sorgum varietas Bioguma secara bergotong royong.'
    },
    {
      id: 'ag_3',
      title: 'Rapat Koordinasi Mingguan',
      category: 'RAPAT',
      date: '21 Okt 2026',
      dayNumber: '21',
      monthAbbr: 'OKT',
      time: '13:00 - 15:00',
      location: 'Belum Ditentukan',
      organizer: 'Admin KWT',
      status: 'Belum dimulai' as any,
      statusType: 'neutral',
      description: 'Pertemuan evaluasi rutin pengurus dan koordinator kelompok tani.'
    }
  ];

  const [agendaList, setAgendaList] = useState<AgendaEvent[]>(agendas && agendas.length > 0 ? agendas : DEFAULT_AGENDAS);

  React.useEffect(() => {
    if (agendas) setAgendaList(agendas.length > 0 ? agendas : DEFAULT_AGENDAS);
  }, [agendas]);
  // Agenda Filter & Search
  const [agendaSearchQuery, setAgendaSearchQuery] = useState('');
  const [agendaCategoryFilter, setAgendaCategoryFilter] = useState('Semua');
  const [agendaStatusFilter, setAgendaStatusFilter] = useState('Semua');

  // Agenda Modal & View States
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaEvent | null>(null);
  const [viewingAgenda, setViewingAgenda] = useState<AgendaEvent | null>(null);

  // Form fields for Agenda
  const [agTitle, setAgTitle] = useState('');
  const [agCategory, setAgCategory] = useState('WORKSHOP');
  const [agDate, setAgDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [agTime, setAgTime] = useState('09:00 - 12:00');
  const [agLocation, setAgLocation] = useState('Balai Desa Sukamaju');
  const [agOrganizer, setAgOrganizer] = useState(currentUser?.name || 'Admin');
  const [agStatus, setAgStatus] = useState('Belum dimulai');
  const [agDescription, setAgDescription] = useState('');
  const [agTargetParticipants, setAgTargetParticipants] = useState('');
  const [agContactName, setAgContactName] = useState('');
  const [agContactPhone, setAgContactPhone] = useState('');
  const [agRequirements, setAgRequirements] = useState('');
  const [agBenefits, setAgBenefits] = useState('');

  // STT Recording State for Agenda
  const [inputModeAgenda, setInputModeAgenda] = useState<'manual' | 'voice'>('manual');
  const [isRecordingAgenda, setIsRecordingAgenda] = useState(false);
  const [isProcessingSTTAgenda, setIsProcessingSTTAgenda] = useState(false);
  const recognitionAgendaRef = React.useRef<any>(null);

  const startRecordingAgenda = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Browser Anda tidak mendukung fitur Asisten Suara. Gunakan Google Chrome atau Edge.");
      return;
    }

    setIsRecordingAgenda(true);
    setIsProcessingSTTAgenda(true);

    const recognition = new SpeechRecognition();
    recognitionAgendaRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      setIsProcessingSTTAgenda(false);
      const text = event.results[0][0].transcript;
      if (text) {
        const cleanText = text.replace(/[,.!?\-]/g, ' ').replace(/\s+/g, ' ').trim();

        const keywords = [
          { key: 'title', match: /(?:judul)\s*/i },
          { key: 'category', match: /(?:kategori)\s*/i },
          { key: 'date', match: /(?:tanggal)\s*/i },
          { key: 'time', match: /(?:waktu|jam)\s*/i },
          { key: 'desc', match: /(?:deskripsi|isi)\s*/i }
        ];

        let foundPositions: { key: string; index: number; length: number }[] = [];
        keywords.forEach(kw => {
          const match = cleanText.match(kw.match);
          if (match && match.index !== undefined) {
            foundPositions.push({ key: kw.key, index: match.index, length: match[0].length });
          }
        });

        if (foundPositions.length === 0) {
          setAgDescription(prev => prev ? `${prev}\n\n${cleanText}` : cleanText);
        } else {
          foundPositions.sort((a, b) => a.index - b.index);

          for (let i = 0; i < foundPositions.length; i++) {
            const curr = foundPositions[i];
            const next = foundPositions[i + 1];

            const start = curr.index + curr.length;
            const end = next ? next.index : cleanText.length;

            const val = cleanText.substring(start, end).trim();
            if (!val) continue;

            if (curr.key === 'title') {
              setAgTitle(val);
            } else if (curr.key === 'category') {
              const upper = val.toUpperCase();
              if (upper.includes('WORKSHOP') || upper.includes('KREATIF')) setAgCategory('WORKSHOP');
              else if (upper.includes('PANEN') || upper.includes('BERSAMA')) setAgCategory('PANEN BERSAMA');
              else if (upper.includes('RAPAT') || upper.includes('RUTIN')) setAgCategory('RAPAT');
              else if (upper.includes('PELATIHAN') || upper.includes('UMKM')) setAgCategory('PELATIHAN');
              else setAgCategory('INSPEKSI'); 
            } else if (curr.key === 'date') {
              // Fix STT numeric spacing issues for dates
              let dateVal = val.toLowerCase();
              const numMap: Record<string, string> = {
                'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4', 'lima': '5',
                'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9', 'sepuluh': '10',
                'sebelas': '11', 'belas': '1', // fallback for 'dua belas' if 'dua' is replaced first
                'dua puluh': '20', 'tiga puluh': '30', 'puluh': '0'
              };
              // Sort keys by length descending to replace longer phrases first
              Object.keys(numMap).sort((a, b) => b.length - a.length).forEach(k => {
                dateVal = dateVal.replace(new RegExp(`\\b${k}\\b`, 'g'), numMap[k]);
              });

              // Handle cases where STT outputs digit + word (e.g., "2 puluh")
              dateVal = dateVal.replace(/(\d)\s*puluh/g, '$10');
              dateVal = dateVal.replace(/(\d)\s*belas/g, '1$1');

              // Run the spacing fixes repeatedly to ensure cascading merges (e.g., "2 0 7" -> "20 7" -> "27")
              for (let i = 0; i < 2; i++) {
                dateVal = dateVal
                  .replace(/\b([123]0)\s+([1-9])\b/g, (m, p1, p2) => String(parseInt(p1) + parseInt(p2)))
                  .replace(/\b([123])\s+([0-9])\b/g, '$1$2');
              }
              
              dateVal = dateVal
                .replace(/\b(2002)\s+(\d)\b/g, '202$2')
                .replace(/\b(200|20)\s+(\d{2})\b/g, '20$2');

              const matchDate = dateVal.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agu|sep|okt|nov|des)[a-z]*(?:\s+(\d{4}))?/i);
              if (matchDate) {
                const day = matchDate[1].padStart(2, '0');
                const mMap: Record<string, string> = {
                  januari: '01', jan: '01', februari: '02', feb: '02',
                  maret: '03', mar: '03', april: '04', apr: '04',
                  mei: '05', juni: '06', jun: '06', juli: '07', jul: '07',
                  agustus: '08', agu: '08', september: '09', sep: '09',
                  oktober: '10', okt: '10', november: '11', nov: '11',
                  desember: '12', des: '12'
                };
                const month = mMap[matchDate[2].toLowerCase().substring(0, 3)] || mMap[matchDate[2].toLowerCase()];
                const year = matchDate[3] || new Date().getFullYear();
                if (month) setAgDate(`${year}-${month}-${day}`);
              } else {
                const isoDate = dateVal.match(/(\d{4})-(\d{2})-(\d{2})/);
                const slashDate = dateVal.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
                if (isoDate) setAgDate(`${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`);
                else if (slashDate) {
                  const year = slashDate[3] || new Date().getFullYear();
                  setAgDate(`${year}-${slashDate[2].padStart(2, '0')}-${slashDate[1].padStart(2, '0')}`);
                }
              }
            } else if (curr.key === 'time') {
              setAgTime(val);
            } else if (curr.key === 'desc') {
              setAgDescription(val);
            }
          }
        }
      } else {
        showToast('Suara tidak terdeteksi. Coba lagi.');
      }
    };

    recognition.onerror = (event: any) => {
      setIsRecordingAgenda(false);
      setIsProcessingSTTAgenda(false);
      if (event.error === 'no-speech') {
        showToast('Tidak ada suara terdeteksi. Silakan coba lagi.');
      } else {
        showToast(`Error pengenalan suara: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecordingAgenda(false);
      setIsProcessingSTTAgenda(false);
    };

    try {
      recognition.start();
    } catch (e: any) {
      setIsRecordingAgenda(false);
      setIsProcessingSTTAgenda(false);
      showToast(e.message || 'Gagal memulai mikrofon.');
    }
  };

  const stopRecordingAgenda = () => {
    if (recognitionAgendaRef.current && isRecordingAgenda) {
      recognitionAgendaRef.current.stop();
      setIsRecordingAgenda(false);
    }
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Pagination artikel admin: 8 item per halaman
  const [articlePage, setArticlePage] = useState(1);
  const ARTICLES_PER_PAGE = 8;

  // Pagination agenda admin: 8 item per halaman
  const [agendaPage, setAgendaPage] = useState(1);
  const AGENDAS_PER_PAGE = 8;

  // Toast / Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Modal States
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<InfoArticle | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; title: string; type: 'artikel' | 'pengumuman' | 'agenda' | 'pengguna' } | null>(null);
  const [previewArticle, setPreviewArticle] = useState<InfoArticle | null>(null);

  // New Article Form
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<'Budidaya' | 'Inovasi' | 'Pengetahuan' | 'Panen'>('Budidaya');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImage, setArtImage] = useState('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200');
  const [artGallery, setArtGallery] = useState<string[]>([]);
  const [artStatus, setArtStatus] = useState<'Draft' | 'Published'>('Published');

  // Announcement Modal State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<'PENTING' | 'HASIL PANEN' | 'INFORMASI ANGGOTA' | 'MENDESAK'>('PENTING');
  const [annSummary, setAnnSummary] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annError, setAnnError] = useState('');

  // Pinned announcements tracking — pakai isUrgent real dari backend
  const [pinnedIds, setPinnedIds] = useState<string[]>(
    (announcements || []).filter(a => (a as any).isUrgent).map(a => a.id)
  );

  // CMS Form States
  const [cmsWebName, setCmsWebName] = useState(cmsData?.webName || 'KWT Sorgum');
  const [cmsWebSubtitle, setCmsWebSubtitle] = useState(cmsData?.webSubtitle || 'KWT MELATI SORGUM');
  const [cmsWebLogo, setCmsWebLogo] = useState(cmsData?.webLogo || '');
  const [cmsLandingTitle, setCmsLandingTitle] = useState(cmsData?.landingTitle || '');
  const [cmsLandingDesc, setCmsLandingDesc] = useState(cmsData?.landingDesc || '');
  // Carousel dinamis: array URL gambar (bisa banyak)
  const [cmsLandingImages, setCmsLandingImages] = useState<string[]>(
    (cmsData?.landingImages || []).map(i => i.url).filter(Boolean)
  );
  const [cmsLoginTitle, setCmsLoginTitle] = useState(cmsData?.loginTitle || '');
  const [cmsLoginDesc, setCmsLoginDesc] = useState(cmsData?.loginDesc || '');
  const [cmsLoginImages, setCmsLoginImages] = useState<string[]>(
    cmsData?.loginImages?.length ? cmsData.loginImages.map(i => i.url) : (cmsData?.loginImage ? [cmsData.loginImage] : [])
  );
  const [cmsRegTitle, setCmsRegTitle] = useState(cmsData?.registerTitle || '');
  const [cmsRegDesc, setCmsRegDesc] = useState(cmsData?.registerDesc || '');
  const [cmsRegImages, setCmsRegImages] = useState<string[]>(
    cmsData?.registerImages?.length ? cmsData.registerImages.map(i => i.url) : (cmsData?.registerImage ? [cmsData.registerImage] : [])
  );
  // CMS: halaman yang sedang diedit (identitas | landing | login | register)
  const [cmsActivePage, setCmsActivePage] = useState<'identitas' | 'landing' | 'login' | 'register'>('identitas');
  // CMS: status upload (loading per tombol)
  const [cmsUploading, setCmsUploading] = useState(false);

  // Upload 1 file -> kembalikan URL /uploads/xxx
  const handleCmsUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api<{ url: string }>('/upload', { method: 'POST', body: formData, isFormData: true });
    return res.url;
  };

  // Upload banyak file -> kembalikan array URL
  const handleCmsUploadMany = async (files: FileList | File[]): Promise<string[]> => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    const res = await api<{ urls: string[] }>('/upload/many', { method: 'POST', body: formData, isFormData: true });
    return res.urls;
  };

  // Normalisasi URL gambar: /uploads/... (relatif) -> URL absolut backend
  const cmsImgUrl = (u: string) =>
    u.startsWith('/uploads/') ? `${SERVER_BASE}${u}` : u;
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CmsData = {
      webName: cmsWebName,
      webSubtitle: cmsWebSubtitle,
      webLogo: cmsWebLogo,
      landingTitle: cmsLandingTitle,
      landingDesc: cmsLandingDesc,
      landingImages: cmsLandingImages.filter(u => u.trim() !== '').map(url => ({ url, title: '', caption: '' })),
      loginTitle: cmsLoginTitle,
      loginDesc: cmsLoginDesc,
      loginImages: cmsLoginImages.filter(u => u.trim() !== '').map(url => ({ url, title: '', caption: '' })),
      loginImage: cmsLoginImages.find(u => u.trim() !== '') || '',
      registerTitle: cmsRegTitle,
      registerDesc: cmsRegDesc,
      registerImages: cmsRegImages.filter(u => u.trim() !== '').map(url => ({ url, title: '', caption: '' })),
      registerImage: cmsRegImages.find(u => u.trim() !== '') || ''
    };

    try {
      await api('/cms', {
        method: 'PUT',
        body: payload
      });
      if (onUpdateCmsData) {
        onUpdateCmsData(payload);
      }
      showToast('Pengaturan CMS berhasil disimpan!');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan CMS.');
    }
  };

  // Agenda Handlers
  const handleOpenAddAgenda = () => {
    setEditingAgenda(null);
    setAgTitle('');
    setAgCategory('WORKSHOP');
    const d = new Date();
    setAgDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setAgTime('09:00 - 12:00');
    setAgLocation('Balai Desa Sukamaju');
    setAgOrganizer(currentUser?.name || 'Admin');
    setAgStatus('Belum dimulai');
    setAgDescription('');
    setAgTargetParticipants('');
    setAgContactName('');
    setAgContactPhone('');
    setAgRequirements('');
    setAgBenefits('');
    setIsAgendaModalOpen(true);
  };

  const handleOpenEditAgenda = (ag: AgendaEvent) => {
    setEditingAgenda(ag);
    setAgTitle(ag.title);
    setAgCategory(ag.category || 'WORKSHOP');
    setAgDate(ag.date);
    setAgTime(ag.time || '');
    setAgLocation(ag.location || '');
    setAgOrganizer(ag.organizer || 'Admin KWT');
    setAgStatus(ag.status || 'Belum dimulai');
    setAgDescription(ag.description || '');
    setAgTargetParticipants((ag as any).targetParticipants || '');
    setAgContactName((ag as any).contactPerson?.name || '');
    setAgContactPhone((ag as any).contactPerson?.phone || '');
    setAgRequirements((ag as any).requirements?.join(', ') || '');
    setAgBenefits((ag as any).benefits?.join(', ') || '');
    setIsAgendaModalOpen(true);
  };

  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agTitle.trim()) return;

    if (agDate) {
      const selectedDate = new Date(agDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(selectedDate.getTime()) && selectedDate < today) {
        setShowDateWarning(true);
        return;
      }
    }

    if (editingAgenda) {
      const d = new Date(agDate);
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      const updatedDayNumber = isNaN(d.getTime()) ? agDate.slice(0, 2) : d.getDate().toString().padStart(2, '0');
      const updatedMonthAbbr = isNaN(d.getTime()) ? 'OKT' : monthNames[d.getMonth()];

      const updated = agendaList.map(a =>
        a.id === editingAgenda.id ? {
          ...a,
          title: agTitle,
          category: agCategory,
          date: agDate,
          dayNumber: updatedDayNumber,
          monthAbbr: updatedMonthAbbr,
          time: agTime,
          location: agLocation,
          organizer: agOrganizer,
          status: agStatus as any,
          description: agDescription,
          targetParticipants: agTargetParticipants,
          contactPerson: { name: agContactName, phone: agContactPhone },
          requirements: agRequirements ? agRequirements.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : []
        } : a
      );
      setAgendaList(updated);
      if (onUpdateAgendas) onUpdateAgendas(updated);
      showToast(`Agenda "${agTitle}" berhasil diperbarui!`);
      // Update ke backend (best effort)
      if (!editingAgenda.id.startsWith('ag_1') && !editingAgenda.id.startsWith('ag_2') && !editingAgenda.id.startsWith('ag_3')) {
        api(`/agenda/${editingAgenda.id}`, {
          method: 'PUT',
          body: {
            title: agTitle,
            category: agCategory,
            date: agDate,
            time: agTime,
            location: agLocation,
            organizer: agOrganizer,
            status: agStatus,
            description: agDescription,
            targetParticipants: agTargetParticipants,
            contactPerson: { name: agContactName, phone: agContactPhone },
            requirements: agRequirements ? agRequirements.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : []
          }
        }).catch(err => console.error('Failed to update agenda on backend:', err));
      }
    } else {
      const d = new Date(agDate);
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      const newAg: AgendaEvent = {
        id: `ag_${Date.now()}`,
        title: agTitle,
        category: agCategory,
        date: agDate,
        dayNumber: isNaN(d.getTime()) ? agDate.slice(0, 2) : d.getDate().toString().padStart(2, '0'),
        monthAbbr: isNaN(d.getTime()) ? 'OKT' : monthNames[d.getMonth()],
        time: agTime,
        location: agLocation,
        organizer: agOrganizer,
        status: agStatus as any,
        statusType: 'success',
        description: agDescription,
        targetParticipants: agTargetParticipants,
        contactPerson: { name: agContactName, phone: agContactPhone },
        requirements: agRequirements ? agRequirements.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : []
      };
      const updated = [newAg, ...agendaList];
      setAgendaList(updated);
      if (onUpdateAgendas) onUpdateAgendas(updated);
      showToast(`Agenda "${agTitle}" berhasil ditambahkan!`);
      // Simpan ke backend (best effort)
      api('/agenda', {
        method: 'POST',
        body: {
          title: agTitle,
          category: agCategory,
          date: agDate,
          time: agTime,
          location: agLocation,
          organizer: agOrganizer,
          status: agStatus,
          description: agDescription,
          targetParticipants: agTargetParticipants,
          contactPerson: { name: agContactName, phone: agContactPhone },
          requirements: agRequirements ? agRequirements.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : []
        }
      }).catch(err => console.error('Failed to create agenda on backend:', err));
    }
    setIsAgendaModalOpen(false);
  };

  const handleDeleteAgenda = (id: string, title: string) => {
    setDeleteConfirmModal({ id, title, type: 'agenda' });
  };

  // Filtered Agendas
  const filteredAgendas = agendaList.map(ag => {
    const isPast = ag.date && !isNaN(new Date(ag.date).getTime()) && new Date(ag.date).getTime() < new Date().setHours(0, 0, 0, 0);
    return isPast ? { ...ag, status: 'Selesai' as any } : ag;
  }).filter(ag => {
    const matchesSearch = ag.title.toLowerCase().includes(agendaSearchQuery.toLowerCase()) ||
      (ag.location && ag.location.toLowerCase().includes(agendaSearchQuery.toLowerCase())) ||
      (ag.organizer && ag.organizer.toLowerCase().includes(agendaSearchQuery.toLowerCase()));

    const matchesCategory = agendaCategoryFilter === 'Semua' || ag.category === agendaCategoryFilter;
    const matchesStatus = agendaStatusFilter === 'Semua' || ag.status === agendaStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination slice untuk tabel agenda
  const totalAgendaPages = Math.max(1, Math.ceil(filteredAgendas.length / AGENDAS_PER_PAGE));
  const currentAgendaPage = Math.min(agendaPage, totalAgendaPages);
  const pagedAgendas = filteredAgendas.slice((currentAgendaPage - 1) * AGENDAS_PER_PAGE, currentAgendaPage * AGENDAS_PER_PAGE);

  // Article Actions
  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArtTitle('');
    setArtCategory('Budidaya');
    setArtStatus('Published');
    setArtSummary('');
    setArtContent('');
    setArtImage('');
    setArtGallery([]);
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: InfoArticle) => {
    setEditingArticle(art);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtSummary(art.summary);
    setArtContent(art.content ? art.content.join('\n\n') : art.summary);
    setArtImage(art.image);
    setArtGallery(art.gallery || []);
    setArtStatus((art as any).status || 'Published');
    setIsArticleModalOpen(true);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    setDeleteConfirmModal({ id, title, type: 'artikel' });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) return;

    const payload = {
      title: artTitle,
      category: artCategory,
      summary: artSummary || artTitle,
      content: artContent ? artContent.split('\n\n') : [artSummary],
      image: artImage,
      gallery: artGallery,
      status: artStatus,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar
    };

    try {
      if (editingArticle) {
        await api(`/artikel/${editingArticle.id}`, { method: 'PUT', body: payload });
        showToast(`Artikel "${artTitle}" berhasil diperbarui.`);
      } else {
        await api('/artikel', { method: 'POST', body: payload });
        showToast(`Artikel baru "${artTitle}" berhasil dipublikasikan!`);
      }
      // Reload dari backend — pakai endpoint admin (termasuk Draft)
      const reloaded = await api<InfoArticle[]>('/artikel/admin');
      setAdminArticles(reloaded);
      onUpdateArticles(reloaded);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan artikel');
    }

    setIsArticleModalOpen(false);
  };

  // Announcement Actions — pin = toggle isUrgent (real ke backend)
  const handleTogglePinAnnouncement = async (id: string) => {
    const isPinned = pinnedIds.includes(id);
    const nextPinned = isPinned ? pinnedIds.filter(pId => pId !== id) : [...pinnedIds, id];
    if (!isPinned && nextPinned.length > 3) {
      alert('Maksimal 3 pengumuman disematkan di atas.');
      return;
    }
    setPinnedIds(nextPinned);
    try {
      await api(`/pengumuman/${id}`, { method: 'PUT', body: { isUrgent: !isPinned } });
      showToast(isPinned ? 'Status pin pengumuman dilepas.' : 'Pengumuman berhasil disematkan di atas!');
    } catch (err) {
      setPinnedIds(pinnedIds);
      showToast('Gagal mengubah pin.');
    }
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    setDeleteConfirmModal({ id, title, type: 'pengumuman' });
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setAnnTitle(ann.title);
    setAnnCategory(ann.category as any);
    setAnnSummary(ann.summary || '');
    setAnnContent(ann.content || ann.summary || '');
    setAnnError('');
    setIsAnnouncementModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteConfirmModal) return;
    const { id, title, type } = deleteConfirmModal;
    if (type === 'artikel') {
      const updated = adminArticles.filter(a => a.id !== id);
      setAdminArticles(updated);
      onUpdateArticles(updated);
      showToast('Artikel "' + title + '" berhasil dihapus.');
      // Hapus dari backend (wajib, agar tidak muncul lagi setelah refresh)
      api(`/artikel/${id}`, { method: 'DELETE' }).catch(err => {
        console.error('Failed to delete artikel on backend:', err);
        showToast('Gagal menghapus artikel di server.');
      });
    } else if (type === 'pengumuman') {
      const updated = announcements.filter(a => a.id !== id);
      onUpdateAnnouncements(updated);
      showToast(`Pengumuman "${title}" berhasil dihapus.`);
      // Hapus dari backend (wajib, agar tidak muncul lagi setelah refresh)
      api(`/pengumuman/${id}`, { method: 'DELETE' }).catch(err => {
        console.error('Failed to delete pengumuman on backend:', err);
        showToast('Gagal menghapus pengumuman di server.');
      });
    } else if (type === 'agenda') {
      const updated = agendaList.filter(a => a.id !== id);
      setAgendaList(updated);
      if (onUpdateAgendas) onUpdateAgendas(updated);
      showToast(`Agenda "${title}" berhasil dihapus.`);
      // Delete dari backend (best effort)
      if (!id.startsWith('ag_1') && !id.startsWith('ag_2') && !id.startsWith('ag_3')) {
        api(`/agenda/${id}`, { method: 'DELETE' }).catch(err => console.error('Failed to delete agenda on backend:', err));
      }
    } else if (type === 'pengguna') {
      const updated = usersList.filter(u => u.id !== id);
      setUsersList(updated);
      showToast(`Pengguna "${title}" berhasil dihapus.`);
      api(`/admin/users/${id}`, { method: 'DELETE' }).catch(err => {
        console.error('Failed to delete user on backend:', err);
        showToast('Gagal menghapus pengguna di server.');
      });
    }
    setDeleteConfirmModal(null);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (annTitle.trim().length < 3) {
      setAnnError('Judul pengumuman minimal 3 karakter.');
      return;
    }

    const finalSummary = annSummary.trim() || annTitle.trim();
    if (finalSummary.length < 5) {
      setAnnError('Ringkasan pengumuman minimal 5 karakter.');
      return;
    }

    const finalContent = annContent.trim() || finalSummary;
    
    const payload = {
      title: annTitle.trim(),
      category: annCategory,
      summary: finalSummary,
      content: finalContent,
      isUrgent: annCategory === 'MENDESAK'
    };

    try {
      if (editingAnnouncement) {
        await api(`/pengumuman/${editingAnnouncement.id}`, { method: 'PUT', body: payload });
        showToast(`Pengumuman "${annTitle}" berhasil diperbarui.`);
      } else {
        await api('/pengumuman', { method: 'POST', body: payload });
        showToast(`Pengumuman "${annTitle}" berhasil dipublikasikan!`);
      }
      
      const reloaded = await api<Announcement[]>('/pengumuman');
      onUpdateAnnouncements(reloaded);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengumuman');
    }

    setIsAnnouncementModalOpen(false);
  };

  // Forum Topic Moderation Actions
  const [threadToDeleteModal, setThreadToDeleteModal] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteThread = (id: string, title: string) => {
    setThreadToDeleteModal({ id, title });
  };

  const confirmDeleteThread = () => {
    if (threadToDeleteModal) {
      const { id, title } = threadToDeleteModal;
      const updated = threads.filter(t => t.id !== id);
      onUpdateThreads(updated);
      showToast(`Utas "${title}" telah dihapus.`);
      
      // Hapus dari backend (agar tidak muncul lagi saat refresh)
      api(`/thread/${id}`, { method: 'DELETE' }).catch(err => {
        console.error('Failed to delete thread on backend:', err);
        showToast('Gagal menghapus diskusi di server.');
      });
      
      setThreadToDeleteModal(null);
    }
  };

  // Filtering data
  const filteredArticles = adminArticles.filter(art => {
    const matchesSearch = (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'Semua' || (art.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'Semua' || ((art as any).status || 'Published') === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Pagination slice untuk tabel artikel
  const totalArticlePages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(articlePage, totalArticlePages);
  const pagedArticles = filteredArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);

  const filteredAnnouncements = (announcements || []).filter(ann => {
    return (ann.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (ann.summary || '').toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const filteredThreads = threads.filter(thr => {
    return (thr.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thr.authorName || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Analytics chart data for Admin Dashboard (Fokus Informasi & Komunitas)
  // ── REAL: fetch dari /api/admin/stats ──
  const [stats, setStats] = useState<{
    totalUser: number;
    informasiChartData: { bulan: string; pembacaArtikel: number; pembacaPengumuman: number }[];
    partisipasiChartData: { bulan: string; diskusi: number; agenda: number; anggotaBaru: number }[];
  } | null>(null);

  useEffect(() => {
    api<{
      totalUser: number;
      informasiChartData: { bulan: string; pembacaArtikel: number; pembacaPengumuman: number }[];
      partisipasiChartData: { bulan: string; diskusi: number; agenda: number; anggotaBaru: number }[];
    }>('/admin/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const generateDynamicChartData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString('id-ID', { month: 'short' }), month: d.getMonth() });
    }

    const parseMonth = (dateStr?: string) => {
      if (!dateStr) return now.getMonth();
      const lower = dateStr.toLowerCase();
      const map: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5, jul: 6, agt: 7, sep: 8, okt: 9, nov: 10, des: 11 };
      for (const [key, val] of Object.entries(map)) {
        if (lower.includes(key)) return val;
      }
      return now.getMonth();
    };

    return {
      info: months.map(m => ({
        bulan: m.label,
        pembacaArtikel: articles.filter(a => parseMonth(a.date) === m.month).length,
        pembacaPengumuman: announcements.filter(a => parseMonth(a.postedTime) === m.month).length
      })),
      part: months.map(m => ({
        bulan: m.label,
        diskusi: threads.filter(t => parseMonth(t.timeAgo) === m.month).length,
        agenda: (agendas || []).filter(a => parseMonth(a.date) === m.month).length,
        anggotaBaru: m.month === now.getMonth() ? 2 : 0
      }))
    };
  };

  const dynData = generateDynamicChartData();

  const informasiChartData = (stats?.informasiChartData?.length ? stats.informasiChartData : dynData.info).map((item, idx) => ({
    ...item,
    diskusi: stats?.partisipasiChartData?.[idx]?.diskusi ?? dynData.part[idx]?.diskusi ?? 0
  }));

  const contentDistributionData = [
    { name: 'Artikel Budidaya', value: articles.filter(a => a.category === 'Budidaya' || a.category === 'Panen').length, color: '#2C4219' },
    { name: 'Inovasi Olahan', value: articles.filter(a => a.category === 'Inovasi' || a.category === 'Pengetahuan').length, color: '#A8B774' },
    { name: 'Pengumuman Resmi', value: announcements.length, color: '#572E4A' },
    { name: 'Diskusi Komunitas', value: threads.length, color: '#433A30' },
  ];

  const partisipasiChartData = stats?.partisipasiChartData?.length
    ? stats.partisipasiChartData
    : dynData.part;

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col md:flex-row font-sans text-[#2C4219]">

      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2C4219] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#A8B774]/40 flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-[#A8B774] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-[#E6E1D5] p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30">
        <div className="space-y-6">
          {/* Admin Portal Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            {cmsWebLogo ? (
              <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white shadow-md border border-[#E6E1D5]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2C4219] text-[#A8B774] flex items-center justify-center font-bold shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="font-title font-black text-base text-[#2C4219] leading-tight line-clamp-1">
                {cmsWebName || 'KWT Sorgum'}
              </h1>
              <span className="text-[10px] font-black text-[#572E4A] tracking-widest uppercase block">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          {/* Admin Nav Menu */}
          <nav className="space-y-2 pt-2">
            {/* Nav: Dashboard Admin */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'dashboard'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Dashboard</span>
            </button>

            {/* Nav: Kelola Agenda */}
            <button
              onClick={() => setActiveTab('agenda')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'agenda'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Agenda</span>
            </button>

            {/* Nav: Kelola Informasi */}
            <button
              onClick={() => setActiveTab('informasi')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'informasi'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'informasi' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Informasi</span>
            </button>

            {/* Nav: Kelola Pengumuman */}
            <button
              onClick={() => setActiveTab('pengumuman')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'pengumuman'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <Megaphone className={`w-4 h-4 ${activeTab === 'pengumuman' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Pengumuman</span>
            </button>

            {/* Nav: Kelola Diskusi */}
            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'moderation'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Diskusi</span>
            </button>

            {/* Nav: Kelola Data Sorgum (Integrasi SCM) */}
            <button
              onClick={() => setActiveTab('datasorgum')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'datasorgum'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <Sprout className={`w-4 h-4 ${activeTab === 'datasorgum' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Data Sorgum</span>
            </button>
            {/* Nav: Kelola Pengguna */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'users'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Pengguna</span>
            </button>
            {/* Nav: Kelola Konten (CMS Landing/Login/Register) */}
            <button
              onClick={() => setActiveTab('cms')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'cms'
                ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'cms' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
              <span>Kelola Konten</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Logout */}
        <div className="pt-6 border-t border-[#E6E1D5]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#C53030] hover:bg-[#C53030]/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#C53030]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto w-full">

        {/* ==================== TAB 1: KELOLA INFORMASI ==================== */}
        {activeTab === 'informasi' && (
          <div className="space-y-6">

            {/* Header Title + Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Informasi
                </h1>
              </div>

              <button
                onClick={handleOpenAddArticle}
                className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#A8B774]" />
                <span>Tambah Informasi Baru</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Filter Kategori */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1D5] text-xs font-bold text-[#2C4219] shadow-2xs focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Panen">Panen</option>
                  <option value="Inovasi">Inovasi</option>
                  <option value="Budidaya">Budidaya</option>
                  <option value="Pengetahuan">Pengetahuan</option>
                </select>

                {/* Filter Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1D5] text-xs font-bold text-[#2C4219] shadow-2xs focus:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Cari judul artikel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#2C4219] focus:outline-none focus:border-[#2C4219] shadow-2xs"
                />
                <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Articles Data Table */}
            <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#7A7062] font-black uppercase text-[10px] tracking-wider border-b border-[#E6E1D5]">
                    <tr>
                      <th className="py-4 px-5">NO</th>
                      <th className="py-4 px-5">THUMBNAIL & JUDUL</th>
                      <th className="py-4 px-5">KATEGORI</th>
                      <th className="py-4 px-5">TANGGAL RILIS</th>
                      <th className="py-4 px-5">PENULIS</th>
                      <th className="py-4 px-5">STATUS</th>
                      <th className="py-4 px-5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D5]/60 font-medium">
                    {pagedArticles.length > 0 ? (
                      pagedArticles.map((art, idx) => (
                        <tr key={art.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-[#7A7062]">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3 max-w-sm">
                              {art.image ? (
                                <img
                                  src={art.image}
                                  alt={art.title}
                                  className="w-14 h-10 rounded-lg object-cover shrink-0 border border-[#E6E1D5]"
                                />
                              ) : (
                                <div className="w-14 h-10 rounded-lg bg-[#FAF6EE] shrink-0 border border-[#E6E1D5] flex items-center justify-center">
                                  <span className="text-[#A8B774] text-[8px] font-bold">No Img</span>
                                </div>
                              )}
                              <span className="font-bold text-[#2C4219] line-clamp-2">
                                {art.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF6EE] text-[#2C4219] font-bold text-[10px]">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-[#5C5246] whitespace-nowrap">
                            {art.date || '12 Okt 2026'}
                          </td>
                          <td className="py-4 px-5 text-[#2C4219] font-bold whitespace-nowrap">
                            {art.author?.name || currentUser.name}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] border ${(art as any).status === 'Draft' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${(art as any).status === 'Draft' ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                              <span>{(art as any).status || 'Published'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setPreviewArticle(art)}
                                title="Lihat Artikel"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Lihat Detail</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditArticle(art)}
                                title="Sunting Artikel"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Sunting</span>
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id, art.title)}
                                title="Hapus Artikel"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#7A7062] font-semibold">
                          Tidak ada artikel informasi yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="p-4 bg-[#FAF6EE]/60 border-t border-[#E6E1D5] flex items-center justify-between text-xs text-[#7A7062] font-bold">
                <span>Menampilkan {Math.min(filteredArticles.length, (currentPage - 1) * ARTICLES_PER_PAGE + pagedArticles.length)} dari {filteredArticles.length} artikel</span>
                {totalArticlePages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setArticlePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&lt;</button>
                    {Array.from({ length: totalArticlePages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setArticlePage(p)}
                        className={`px-3 py-1 rounded-lg ${p === currentPage ? 'bg-[#2C4219] text-white' : 'border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE]'}`}
                      >{p}</button>
                    ))}
                    <button
                      onClick={() => setArticlePage(Math.min(totalArticlePages, currentPage + 1))}
                      disabled={currentPage === totalArticlePages}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&gt;</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: KELOLA PENGUMUMAN ==================== */}
        {activeTab === 'pengumuman' && (
          <div className="space-y-6">

            {/* Header + Add Announcement Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Pengumuman Komunitas
                </h1>
              </div>

              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnTitle('');
                  setAnnCategory('PENTING');
                  setAnnSummary('');
                  setAnnContent('');
                  setAnnError('');
                  setIsAnnouncementModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#A8B774]" />
                <span>Buat Pengumuman Baru</span>
              </button>
            </div>

            {/* Metrics Dashboard Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">TOTAL AKTIF</p>
                <p className="font-title font-black text-2xl text-[#2C4219]">{(announcements || []).length}</p>
                <p className="text-[11px] text-emerald-700 font-bold">{(announcements || []).filter(a => a.category === 'HASIL PANEN' || a.category === 'INFORMASI ANGGOTA').length} info anggota</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">PENGUMUMAN MENDESAK</p>
                <p className="font-title font-black text-2xl text-rose-700">{(announcements || []).filter(a => a.category === 'MENDESAK' || (a as any).isUrgent).length}</p>
                <p className="text-[11px] text-[#7A7062] font-semibold">Perlu perhatian segera</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-2xs space-y-1">
                <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">DISEMATKAN</p>
                <p className="font-title font-black text-2xl text-amber-700">{pinnedIds.length}</p>
                <p className="text-[11px] text-amber-700 font-semibold">Muncul di atas (max 3)</p>
              </div>

              <div className="bg-[#2C4219] text-white p-5 rounded-3xl shadow-md space-y-1">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#A8B774]" />
                  <p className="text-[10px] font-bold text-[#A8B774] uppercase tracking-wider">TOTAL KATEGORI</p>
                </div>
                <p className="font-title font-bold text-base text-white">{new Set((announcements || []).map(a => a.category)).size} Jenis</p>
                <p className="text-[10px] text-gray-300">Dari {(announcements || []).length} pengumuman aktif</p>
              </div>
            </div>

            {/* Announcements Table */}
            <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#7A7062] font-black uppercase text-[10px] tracking-wider border-b border-[#E6E1D5]">
                    <tr>
                      <th className="py-4 px-5">JUDUL PENGUMUMAN</th>
                      <th className="py-4 px-5">KATEGORI</th>
                      <th className="py-4 px-5">TANGGAL DIBUAT</th>
                      <th className="py-4 px-5">STATUS</th>
                      <th className="py-4 px-5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D5]/60 font-medium">
                    {filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((ann) => {
                        const isPinned = pinnedIds.includes(ann.id);
                        return (
                          <tr key={ann.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                            <td className="py-4 px-5">
                              <div>
                                <p className="font-bold text-[#2C4219] text-sm">{ann.title}</p>
                                <p className="text-[11px] text-[#7A7062] font-semibold mt-0.5">Oleh: {ann.postedBy || currentUser.name}</p>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="inline-block px-2.5 py-1 rounded-md bg-[#FAF6EE] text-[#2C4219] font-bold text-[10px]">
                                {ann.category}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-[#5C5246] whitespace-nowrap">
                              {ann.postedTime || 'Hari ini'}
                            </td>
                            <td className="py-4 px-5 whitespace-nowrap">
                              {isPinned ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                                  <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                                  <span>Dipin di Atas</span>
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px]">
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center justify-center gap-3">
                                {/* Pin Button */}
                                <button
                                  onClick={() => handleTogglePinAnnouncement(ann.id)}
                                  title={isPinned ? 'Lepas Pin' : 'Sematkan Pin'}
                                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors text-[10px] font-semibold min-w-[44px] ${
                                    isPinned
                                      ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                      : 'text-[#7A7062] hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200'
                                  }`}
                                >
                                  <Pin className="w-4 h-4" />
                                  <span>{isPinned ? 'Lepas' : 'Pin'}</span>
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleEditAnnouncement(ann)}
                                  title="Edit Pengumuman"
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors text-[10px] font-semibold min-w-[44px] text-[#7A7062] hover:text-[#2C4219] hover:bg-[#E3EAD3] border border-transparent hover:border-[#A8B774]"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                                  title="Hapus Pengumuman"
                                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors text-[10px] font-semibold min-w-[44px] text-[#7A7062] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#7A7062] font-semibold text-xs">
                          Belum ada pengumuman
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 bg-[#FAF6EE] p-6 rounded-3xl border border-[#E6E1D5] flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-[#2C4219] text-sm">Tips Admin: Gunakan 'Pin' secara bijak</h4>
                  <p className="text-[#5C5246] leading-relaxed font-medium">
                    Gunakan fitur Sematkan (Pin) hanya untuk pengumuman yang bersifat mendesak atau jangka panjang. Maksimal 3 pengumuman yang dapat disematkan agar tampilan aplikasi member tetap bersih dan teratur.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-[#E6E1D5] space-y-3 text-xs">
                <h4 className="font-bold text-[#2C4219]">Aktivitas Terkini</h4>
                <div className="space-y-2.5 text-[11px] text-[#5C5246]">
                  {announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2C4219] mt-1 shrink-0" />
                      <div>
                        <strong className="text-[#2C4219]">{ann.postedBy || 'Admin'}</strong> membuat pengumuman baru.
                        <p className="text-[10px] text-[#7A7062]">{ann.postedTime || 'Baru saja'}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A8B774] mt-1 shrink-0" />
                    <div>
                      <strong className="text-[#2C4219]">Sistem Otomatis</strong> menyinkronkan data.
                      <p className="text-[10px] text-[#7A7062]">Hari ini, 08:30 WIB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: KELOLA AGENDA ==================== */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">

            {/* Header + Add Agenda Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Agenda
                </h1>
              </div>

              <button
                onClick={handleOpenAddAgenda}
                className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#A8B774]" />
                <span>Tambah Agenda Baru</span>
              </button>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E3EBD3] flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-[#2C4219]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#7A7062]">Agenda Bulan Ini</p>
                  <p className="font-title font-bold text-2xl text-[#2C4219]">{agendaList.length}</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E3EBD3] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[#2C4219]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#7A7062]">Total Peserta Terdaftar</p>
                  <p className="font-title font-bold text-2xl text-[#2C4219]">{agendaList.reduce((sum, a) => sum + ((a as any).quota?.registered || 0), 0)}</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E3EBD3] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#2C4219]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#7A7062]">Total Kuota</p>
                  <p className="font-title font-bold text-2xl text-[#2C4219]">{agendaList.reduce((sum, a) => sum + ((a as any).quota?.max || 0), 0)}</p>
                </div>
              </div>

              {/* Card 4 - Highlight Kegiatan Terdekat */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-2 -bottom-2 text-[#2C4219]/10 pointer-events-none">
                  <Sprout className="w-20 h-20" />
                </div>
                <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">Kegiatan Terdekat</p>
                <div className="mt-1">
                  <p className="font-bold text-sm text-[#2C4219] line-clamp-2">{agendaList[0]?.title || 'Belum ada agenda'}</p>
                  <p className="text-xs font-semibold text-[#7A7062] mt-0.5">{agendaList[0]?.date || '-'}</p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E6E1D5] shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={agendaCategoryFilter}
                    onChange={(e) => setAgendaCategoryFilter(e.target.value)}
                    className="appearance-none bg-[#FAF6EE] border border-[#E6E1D5] text-[#2C4219] text-xs font-bold px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="PANEN BERSAMA">Panen Bersama</option>
                    <option value="RAPAT">Rapat</option>
                    <option value="PELATIHAN">Pelatihan</option>
                    <option value="INSPEKSI">Inspeksi</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7A7062] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={agendaStatusFilter}
                    onChange={(e) => setAgendaStatusFilter(e.target.value)}
                    className="appearance-none bg-[#FAF6EE] border border-[#E6E1D5] text-[#2C4219] text-xs font-bold px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Belum dimulai">Belum dimulai</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7A7062] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#7A7062] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari judul agenda atau lokasi..."
                  value={agendaSearchQuery}
                  onChange={(e) => setAgendaSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-medium pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-[#2C4219] placeholder:text-[#9E9585]"
                />
              </div>
            </div>

            {/* Agenda Data Table */}
            <div className="bg-white rounded-3xl border border-[#E6E1D5] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF6EE] text-[#7A7062] font-black uppercase text-[10px] tracking-wider border-b border-[#E6E1D5]">
                      <th className="py-3.5 px-4 text-center w-12">NO</th>
                      <th className="py-3.5 px-5">JUDUL AGENDA & KATEGORI</th>
                      <th className="py-3.5 px-5">TANGGAL & WAKTU</th>
                      <th className="py-3.5 px-5">PEMBUAT</th>
                      <th className="py-3.5 px-5 text-center">STATUS</th>
                      <th className="py-3.5 px-5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D5]/60 font-medium text-[#433A30]">
                    {pagedAgendas.map((ag, idx) => {
                      return (
                        <tr key={ag.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                          <td className="py-4 px-4 text-center font-bold text-[#7A7062]">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-5">
                            <div>
                              <p className="font-bold text-[#2C4219] text-sm leading-tight">{ag.title}</p>
                              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${ag.category === 'WORKSHOP' ? 'bg-[#E6E1D5] text-[#2C4219]' :
                                ag.category === 'PANEN BERSAMA' ? 'bg-[#2C4219] text-[#A8B774]' :
                                  'bg-[#F0EBE1] text-[#7A7062]'
                                }`}>
                                {ag.category || 'WORKSHOP'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="space-y-1 text-[#5C5246] font-semibold">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#7A7062]" />
                                <span>{ag.date}</span>
                              </div>
                              {ag.time && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#7A7062]">
                                  <Clock className="w-3.5 h-3.5 text-[#7A7062]" />
                                  <span>{ag.time}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#2C4219] text-[#A8B774] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {ag.organizer ? ag.organizer.slice(0, 2).toUpperCase() : 'KS'}
                              </div>
                              <span className="font-bold text-[#2C4219] text-xs">{ag.organizer || 'Admin KWT'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${ag.status === 'Selesai'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-[#E3EBD3] text-[#2C4219]'
                              }`}>
                              {ag.status || 'Belum dimulai'}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingAgenda(ag)}
                                title="Lihat Detail"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Lihat Detail</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditAgenda(ag)}
                                title="Edit Agenda"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Sunting</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAgenda(ag.id, ag.title)}
                                title="Hapus Agenda"
                                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[#7A7062] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-[9px] font-bold">Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="bg-[#FAF6EE] px-5 py-3 border-t border-[#E6E1D5] flex items-center justify-between text-xs text-[#7A7062]">
                <p className="font-semibold">Menampilkan {Math.min(filteredAgendas.length, (currentAgendaPage - 1) * AGENDAS_PER_PAGE + pagedAgendas.length)} dari {filteredAgendas.length} agenda</p>
                {totalAgendaPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAgendaPage(Math.max(1, currentAgendaPage - 1))}
                      disabled={currentAgendaPage === 1}
                      className="p-1.5 rounded-lg hover:bg-[#E6E1D5] text-[#7A7062] font-bold disabled:opacity-40"
                    >&lt;</button>
                    {Array.from({ length: totalAgendaPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setAgendaPage(p)}
                        className={`w-7 h-7 rounded-lg ${p === currentAgendaPage ? 'bg-[#2C4219] text-white font-bold' : 'hover:bg-[#E6E1D5] text-[#7A7062] font-bold'}`}
                      >{p}</button>
                    ))}
                    <button
                      onClick={() => setAgendaPage(Math.min(totalAgendaPages, currentAgendaPage + 1))}
                      disabled={currentAgendaPage === totalAgendaPages}
                      className="p-1.5 rounded-lg hover:bg-[#E6E1D5] text-[#7A7062] font-bold disabled:opacity-40"
                    >&gt;</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: MODERASI DISKUSI ==================== */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">

            {/* Header Title */}
            <div>
              <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                Kelola Diskusi
              </h1>
            </div>

            {/* Moderation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {filteredThreads.map((thr) => (
                <div key={thr.id} className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Header: Author & Category */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={thr.authorAvatar ? ((thr.authorAvatar.startsWith('http') || thr.authorAvatar.startsWith('data:')) ? thr.authorAvatar : SERVER_BASE + thr.authorAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(thr.authorName || 'User')}&background=FAF6EE&color=2C4219`}
                          alt={thr.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E6E1D5]"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thr.authorName || 'User')}&background=FAF6EE&color=2C4219`;
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2C4219]">{thr.authorName}</p>
                          <p className="text-[10px] text-[#7A7062] font-semibold">{thr.timeAgo || '12 Okt 2026'}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-md bg-[#FAF6EE] text-[#2C4219] font-black text-[10px] uppercase tracking-wider">
                        {thr.category}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="font-title font-bold text-base text-[#2C4219] leading-snug">
                      {thr.title}
                    </h3>
                    <p className="text-xs text-[#5C5246] line-clamp-2 leading-relaxed">
                      {thr.summary}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-[#7A7062] font-bold pt-1">
                      <span>💬 {thr.repliesCount || 0} Balasan</span>
                      <span>❤️ {thr.likes || 0} Suka</span>
                    </div>
                  </div>

                  {/* Red Action Button to Delete Topic */}
                  <div className="pt-3 border-t border-[#E6E1D5]">
                    <button
                      onClick={() => handleDeleteThread(thr.id, thr.title)}
                      className="w-full py-2.5 px-4 rounded-xl border border-rose-300 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-title font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Hapus Topik Diskusi Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>



          </div>
        )}

        {/* ==================== TAB 4: DASHBOARD ADMIN OVERVIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                Dashboard
              </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">TOTAL INFORMASI</p>
                  <div className="w-8 h-8 rounded-xl bg-[#E3EBD3] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#2C4219]" />
                  </div>
                </div>
                <p className="font-title font-black text-3xl text-[#2C4219]">{articles.length}</p>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published & Siap Baca
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">AGENDA BULAN INI</p>
                  <div className="w-8 h-8 rounded-xl bg-[#E3EBD3] flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#2C4219]" />
                  </div>
                </div>
                <p className="font-title font-black text-3xl text-[#2C4219]">{agendaList.length}</p>
                <span className="text-[10px] text-[#2C4219] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2C4219]" /> {agendaList.filter(a => a.status === 'Belum dimulai').length} Belum dimulai
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">PENGUMUMAN AKTIF</p>
                  <div className="w-8 h-8 rounded-xl bg-[#E3EBD3] flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-[#2C4219]" />
                  </div>
                </div>
                <p className="font-title font-black text-3xl text-[#2C4219]">{announcements.length}</p>
                <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {pinnedIds.length} Disematkan (Pinned)
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">ANGGOTA KWT</p>
                  <div className="w-8 h-8 rounded-xl bg-[#E3EBD3] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#2C4219]" />
                  </div>
                </div>
                <p className="font-title font-black text-3xl text-[#2C4219]">{stats?.totalUser ?? 128}</p>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Terverifikasi di Desa
                </span>
              </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Chart 1: Statistik Pembaca & Informasi Komunitas (Area Chart) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6E1D5]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                      <TrendingUp className="w-4 h-4 text-[#A8B774]" />
                    </div>
                    <div>
                      <h3 className="font-title font-bold text-base text-[#2C4219]">Statistik Pembaca & Informasi Komunitas</h3>
                      <p className="text-[11px] text-[#7A7062] font-semibold">Tren keterbacaan artikel pengetahuan dan pengumuman resmi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#2C4219]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#2C4219]" /> Artikel
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#A8B774]" /> Pengumuman
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={informasiChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1D5" />
                      <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7A7062', fontWeight: 600 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7A7062', fontWeight: 600 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#FAF6EE', borderRadius: '12px', border: '1px solid #E6E1D5', fontSize: '12px', fontWeight: 'bold', color: '#2C4219' }}
                        formatter={(value: any) => [`${value} Konten`, '']}
                      />
                      <Bar dataKey="pembacaArtikel" name="Artikel" fill="#2C4219" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="pembacaPengumuman" name="Pengumuman" fill="#A8B774" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Distribusi Konten & Aktivitas Komunitas (Pie/Donut Chart) */}
              <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#E6E1D5]">
                    <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                      <PieChartIcon className="w-4 h-4 text-[#A8B774]" />
                    </div>
                    <div>
                      <h3 className="font-title font-bold text-base text-[#2C4219]">Proporsi Konten & Aktivitas</h3>
                      <p className="text-[11px] text-[#7A7062] font-semibold">Distribusi kategori di sistem</p>
                    </div>
                  </div>

                  <div className="h-48 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {contentDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#FAF6EE', borderRadius: '12px', border: '1px solid #E6E1D5', fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(val: any) => [`${val} Item`, 'Jumlah']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E6E1D5]">
                    {contentDistributionData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-bold text-[#2C4219]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[#5C5246] truncate max-w-[140px]">{item.name}</span>
                        </div>
                        <span className="font-bold shrink-0">{item.value} Item</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Chart 3: Partisipasi Warga & Aktivitas Bulanan (Bar Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6E1D5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                    <BarChart2 className="w-4 h-4 text-[#A8B774]" />
                  </div>
                  <div>
                    <h3 className="font-title font-bold text-base text-[#2C4219]">Grafik Partisipasi & Interaksi Warga</h3>
                    <p className="text-[11px] text-[#433A30]/80 font-semibold">Keaktifan diskusi, kehadiran agenda, dan pendaftaran anggota baru</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-[#2C4219]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#A8B774]" /> Topik Diskusi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#572E4A]" /> Anggota Baru
                  </span>
                </div>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partisipasiChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1D5" />
                    <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#433A30', fontWeight: 600 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#433A30', fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FAF6EE', borderRadius: '12px', border: '1px solid #E6E1D5', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="diskusi" name="Topik Diskusi" fill="#A8B774" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="anggotaBaru" name="Anggota Baru" fill="#572E4A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dashboard Content Overview - 2 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Upcoming Agenda Overview */}
              <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                        <Calendar className="w-4 h-4 text-[#A8B774]" />
                      </div>
                      <div>
                        <h3 className="font-title font-bold text-base text-[#2C4219]">Agenda & Kegiatan Terdekat</h3>
                        <p className="text-[11px] text-[#7A7062] font-semibold">Jadwal kegiatan kelompok tani terkonfirmasi</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('agenda')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agendaList.slice(0, 3).map((ag) => (
                      <div key={ag.id} className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#E6E1D5] flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="bg-[#2C4219] text-[#A8B774] px-2.5 py-1.5 rounded-xl text-center shrink-0 min-w-[48px]">
                            <p className="font-black text-xs leading-none">{ag.dayNumber || '10'}</p>
                            <p className="text-[9px] font-bold uppercase mt-0.5 tracking-wider">{ag.monthAbbr || 'OKT'}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#2C4219] truncate">{ag.title}</p>
                            <div className="flex items-center gap-3 text-[10px] text-[#7A7062] font-semibold mt-1">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {ag.location || 'Lokasi TBA'}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 shrink-0" />
                                {ag.time || 'Waktu TBA'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${ag.status === 'Selesai' ? 'bg-gray-100 text-gray-500' : 'bg-[#E3EBD3] text-[#2C4219]'
                          }`}>
                          {ag.status || 'Belum dimulai'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('agenda')}
                  className="w-full py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] hover:bg-[#2C4219] hover:text-white hover:border-[#2C4219] text-xs font-bold text-[#2C4219] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kelola Semua Agenda</span>
                </button>
              </div>

              {/* Latest Announcements Overview */}
              <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                        <Megaphone className="w-4 h-4 text-[#A8B774]" />
                      </div>
                      <div>
                        <h3 className="font-title font-bold text-base text-[#2C4219]">Pengumuman Terkini</h3>
                        <p className="text-[11px] text-[#7A7062] font-semibold">Informasi resmi dari kepengurusan KWT</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('pengumuman')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#E6E1D5] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${ann.category === 'PENTING' ? 'bg-rose-100 text-rose-700' : 'bg-[#E3EBD3] text-[#2C4219]'
                            }`}>
                            {ann.category || 'INFO'}
                          </span>
                          <span className="text-[10px] text-[#7A7062] font-semibold">{ann.date}</span>
                        </div>
                        <p className="font-bold text-xs text-[#2C4219]">{ann.title}</p>
                        <p className="text-[11px] text-[#5C5246] line-clamp-1 font-medium">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('pengumuman')}
                  className="w-full py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] hover:bg-[#2C4219] hover:text-white hover:border-[#2C4219] text-xs font-bold text-[#2C4219] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kelola Semua Pengumuman</span>
                </button>
              </div>

            </div>

            {/* Bottom Row: Recent Forum Activity & Community Impact Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Forum Discussions Summary */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2C4219] flex items-center justify-center text-white">
                      <MessageSquare className="w-4 h-4 text-[#A8B774]" />
                    </div>
                    <div>
                      <h3 className="font-title font-bold text-base text-[#2C4219]">Aktivitas Forum Komunitas</h3>
                      <p className="text-[11px] text-[#7A7062] font-semibold">Diskusi terbaru dari para anggota KWT Sorgum</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                  >
                    <span>Moderasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {threads.slice(0, 2).map((thr) => (
                    <div key={thr.id} className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E6E1D5] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-[#2C4219] bg-[#E3EBD3] px-2 py-0.5 rounded">
                            {thr.category}
                          </span>
                          <span className="text-[10px] font-semibold text-[#7A7062]">{thr.timeAgo || 'Baru'}</span>
                        </div>
                        <p className="font-bold text-xs text-[#2C4219] line-clamp-1">{thr.title}</p>
                        <p className="text-[11px] text-[#5C5246] line-clamp-2">{thr.summary}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D5]/60 text-[10px] text-[#7A7062] font-bold">
                        <span>Penulis: {thr.authorName}</span>
                        <span>💬 {thr.repliesCount || 0} Balasan</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-[#2C4219] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-[#A8B774]/15 pointer-events-none">
                  <Sprout className="w-32 h-32" />
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sistem Berjalan Optimal
                  </div>
                  <h3 className="font-title font-bold text-lg text-white leading-snug">
                    Ekosistem Sorgum Terintegrasi
                  </h3>
                  <p className="text-xs text-[#E3EBD3] leading-relaxed font-medium">
                    Portal pengurus membantu memantau ketersediaan benih, jadwal panen, serta artikel edukasi secara terpusat untuk kemajuan kelompok tani.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-[11px] text-[#A8B774] font-bold relative z-10">
                  <span>Versi Admin: 2.4.0</span>
                  <span>KWT Sorgum © 2026</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 5: SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                Pengaturan Admin Portal
              </h1>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] space-y-6 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2C4219]"
                />
                <div>
                  <h3 className="font-title font-bold text-base text-[#2C4219]">{currentUser.name}</h3>
                  <p className="text-[#7A7062] font-semibold">{currentUser.role}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#E6E1D5] pt-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#2C4219]">Nama Administrator</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2C4219]">Email / WhatsApp Contact</label>
                  <input
                    type="text"
                    defaultValue="admin@kwtsorgum.id"
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] font-semibold"
                  />
                </div>

                <button
                  onClick={() => showToast('Pengaturan profil berhasil disimpan!')}
                  className="px-5 py-3 rounded-xl bg-[#2C4219] text-white font-title font-bold text-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ==================== TAB 6: DATA SORGUM (SCM INTEGRATION) ==================== */}
        {activeTab === 'datasorgum' && (
          <DashboardDesaView
            landPlots={landPlots}
            harvestRecords={harvestRecords}
            totalUsers={dashboardStats?.totalUsers ?? 3}
            totalRawMaterialKg={dashboardStats?.totalRawMaterialKg}
            onOpenMulaiPanen={() => showToast('Pencatatan panen dapat dilakukan melalui menu pencatatan di dashboard utama.')}
          />
        )}

        {/* ==================== TAB 7: CMS (Kelola Konten) ==================== */}
        {activeTab === 'cms' && (
          <div className="space-y-6 w-full max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Konten
                </h1>
                <p className="text-sm text-[#433A30] font-medium mt-1">
                  Atur teks &amp; gambar halaman utama, login, dan register secara visual.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveCms as any}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
              >
                <Save className="w-4 h-4 text-[#A8B774]" />
                Simpan Semua
              </button>
            </div>

            {/* Page Switcher Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {([
                { key: 'identitas', label: 'Identitas Web', icon: Type, desc: 'Logo & Nama' },
                { key: 'landing', label: 'Halaman Utama', icon: Home, desc: 'Hero & carousel' },
                { key: 'login', label: 'Halaman Login', icon: LogIn, desc: 'Sambutan & gambar' },
                { key: 'register', label: 'Halaman Register', icon: UserPlus, desc: 'Ajakan bergabung' }
              ] as const).map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCmsActivePage(key)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]
                    ${cmsActivePage === key
                      ? 'bg-[#2C4219] text-white border-[#2C4219] shadow-lg shadow-[#2C4219]/20'
                      : 'bg-white text-[#433A30] border-[#E6E1D5] hover:border-[#2C4219]/40 hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${cmsActivePage === key ? 'bg-white/15 text-[#A8B774]' : 'bg-[#FAF6EE] text-[#2C4219] group-hover:bg-[#F0EADF]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-title font-bold text-sm leading-tight">{label}</p>
                      <p className={`text-[11px] mt-0.5 ${cmsActivePage === key ? 'text-[#E2E8D5]/80' : 'text-[#433A30]/60'}`}>{desc}</p>
                    </div>
                    {cmsActivePage === key && (
                      <CheckCircle2 className="w-4 h-4 text-[#A8B774] ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* LEFT: Editor */}
              <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-sm space-y-6">

                {/* ── IDENTITAS WEB EDITOR ── */}
                {cmsActivePage === 'identitas' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                      <Type className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-base text-[#2C4219]">Identitas Website</h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <Type className="w-3.5 h-3.5" /> Nama Website
                      </label>
                      <input
                        type="text"
                        value={cmsWebName}
                        onChange={(e) => setCmsWebName(e.target.value)}
                        placeholder="Contoh: KWT Sorgum"
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <Type className="w-3.5 h-3.5" /> Subtitle / Teks Tambahan
                      </label>
                      <input
                        type="text"
                        value={cmsWebSubtitle}
                        onChange={(e) => setCmsWebSubtitle(e.target.value)}
                        placeholder="Contoh: KWT MELATI SORGUM"
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all"
                      />
                    </div>


                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <ImageIcon className="w-3.5 h-3.5" /> Logo Website
                      </label>

                      {cmsWebLogo && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#A8B774]/60 bg-white mb-2">
                          <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-full h-full object-contain p-2" />
                          <button
                            type="button"
                            onClick={() => setCmsWebLogo('')}
                            title="Hapus gambar"
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {!cmsWebLogo && (
                        <input
                          type="text"
                          value={cmsWebLogo}
                          onChange={(e) => setCmsWebLogo(e.target.value)}
                          placeholder="Atau masukkan URL logo (https://...)"
                          className="w-full p-2.5 rounded-xl border border-[#E6E1D5] text-xs font-medium focus:outline-none focus:border-[#2C4219] bg-[#FAF6EE]/50"
                        />
                      )}

                      <div className="mt-2">
                        <label className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95 ${cmsUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                          <Upload className="w-4 h-4" />
                          {cmsUploading ? 'Mengunggah...' : 'Upload Logo Baru'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setCmsUploading(true);
                              try {
                                const url = await handleCmsUpload(file);
                                setCmsWebLogo(url);
                              } catch (err) {
                                showToast('Gagal upload logo');
                              } finally {
                                setCmsUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LANDING EDITOR ── */}
                {cmsActivePage === 'landing' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                      <Home className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Utama</h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <Type className="w-3.5 h-3.5" /> Judul Utama
                      </label>
                      <input
                        type="text"
                        value={cmsLandingTitle}
                        onChange={(e) => setCmsLandingTitle(e.target.value)}
                        placeholder="Contoh: Bersama Menanam, Bersama Sejahtera"
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all"
                      />
                      <p className="text-[10px] text-[#7A7062]">Gunakan \n untuk baris baru.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <FileText className="w-3.5 h-3.5" /> Deskripsi Pendek
                      </label>
                      <textarea
                        value={cmsLandingDesc}
                        onChange={(e) => setCmsLandingDesc(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <ImageIcon className="w-3.5 h-3.5" /> Gambar Carousel ({cmsLandingImages.length})
                      </label>

                      {/* Grid foto dinamis */}
                      {cmsLandingImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {cmsLandingImages.map((url, idx) => (
                            <div key={idx} className="space-y-1.5 bg-[#FAF6EE] p-2 rounded-xl border border-[#E6E1D5]">
                              <div className="relative h-24 rounded-lg overflow-hidden border border-[#A8B774]/60 bg-white">
                                {url ? (
                                  <img src={cmsImgUrl(url)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#433A30]/40">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px]">Masukkan URL</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCmsLandingImages(prev => prev.filter((_, i) => i !== idx))}
                                  title="Hapus gambar"
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => setCmsLandingImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                placeholder="https://..."
                                className="w-full p-2 rounded-lg border border-[#E6E1D5] text-[10px] font-medium focus:outline-none focus:border-[#2C4219] bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 2 Opsi Upload */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <label className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95 ${cmsUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                          <ImageIcon className="w-5 h-5 mb-0.5" />
                          {cmsUploading ? 'Mengunggah...' : 'Opsi 1: Upload File'}
                          <span className="text-[9px] font-medium text-[#433A30]/60">Pilih gambar dari perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={cmsUploading}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;
                              setCmsUploading(true);
                              try {
                                const urls = await handleCmsUploadMany(files);
                                setCmsLandingImages(prev => [...prev, ...urls]);
                                showToast(`${urls.length} foto berhasil diupload!`);
                              } catch (err) {
                                showToast('Gagal upload foto.');
                              } finally {
                                setCmsUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCmsLandingImages(prev => [...prev, ''])}
                          className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95"
                        >
                          <Link className="w-5 h-5 mb-0.5" />
                          Opsi 2: Gunakan URL
                          <span className="text-[9px] font-medium text-[#433A30]/60">Tempel link gambar dari web</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── LOGIN EDITOR ── */}
                {cmsActivePage === 'login' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                      <LogIn className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Login</h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <Type className="w-3.5 h-3.5" /> Judul Login
                      </label>
                      <input
                        type="text"
                        value={cmsLoginTitle}
                        onChange={(e) => setCmsLoginTitle(e.target.value)}
                        placeholder="Contoh: Selamat Datang\nKembali Ibu!"
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <FileText className="w-3.5 h-3.5" /> Deskripsi Login
                      </label>
                      <textarea
                        value={cmsLoginDesc}
                        onChange={(e) => setCmsLoginDesc(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <ImageIcon className="w-3.5 h-3.5" /> Gambar Background Login ({cmsLoginImages.length})
                      </label>
                      {/* Grid foto dinamis */}
                      {cmsLoginImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {cmsLoginImages.map((url, idx) => (
                            <div key={idx} className="space-y-1.5 bg-[#FAF6EE] p-2 rounded-xl border border-[#E6E1D5]">
                              <div className="relative h-24 rounded-lg overflow-hidden border border-[#A8B774]/60 bg-white">
                                {url ? (
                                  <img src={cmsImgUrl(url)} alt={`Login Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#433A30]/40">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px]">Masukkan URL</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCmsLoginImages(prev => prev.filter((_, i) => i !== idx))}
                                  title="Hapus gambar"
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => setCmsLoginImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                placeholder="https://..."
                                className="w-full p-2 rounded-lg border border-[#E6E1D5] text-[10px] font-medium focus:outline-none focus:border-[#2C4219] bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <label className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95 ${cmsUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                          <ImageIcon className="w-5 h-5 mb-0.5" />
                          {cmsUploading ? 'Mengunggah...' : 'Opsi 1: Upload File'}
                          <span className="text-[9px] font-medium text-[#433A30]/60">Pilih gambar dari perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={cmsUploading}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;
                              setCmsUploading(true);
                              try {
                                const urls = await handleCmsUploadMany(files);
                                setCmsLoginImages(prev => [...prev, ...urls]);
                                showToast(`${urls.length} foto berhasil diupload!`);
                              } catch (err) {
                                showToast('Gagal upload foto.');
                              } finally {
                                setCmsUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCmsLoginImages(prev => [...prev, ''])}
                          className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95"
                        >
                          <Link className="w-5 h-5 mb-0.5" />
                          Opsi 2: Gunakan URL
                          <span className="text-[9px] font-medium text-[#433A30]/60">Tempel link gambar dari web</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REGISTER EDITOR ── */}
                {cmsActivePage === 'register' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                      <UserPlus className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Register</h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <Type className="w-3.5 h-3.5" /> Judul Register
                      </label>
                      <input
                        type="text"
                        value={cmsRegTitle}
                        onChange={(e) => setCmsRegTitle(e.target.value)}
                        placeholder="Contoh: Komunitas Sorgum,\nTumbuh & Maju Bersama"
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <FileText className="w-3.5 h-3.5" /> Deskripsi Register
                      </label>
                      <textarea
                        value={cmsRegDesc}
                        onChange={(e) => setCmsRegDesc(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] focus:ring-2 focus:ring-[#2C4219]/10 transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                        <ImageIcon className="w-3.5 h-3.5" /> Gambar Background Register ({cmsRegImages.length})
                      </label>
                      {/* Grid foto dinamis */}
                      {cmsRegImages.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {cmsRegImages.map((url, idx) => (
                            <div key={idx} className="space-y-1.5 bg-[#FAF6EE] p-2 rounded-xl border border-[#E6E1D5]">
                              <div className="relative h-24 rounded-lg overflow-hidden border border-[#A8B774]/60 bg-white">
                                {url ? (
                                  <img src={cmsImgUrl(url)} alt={`Register Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[#433A30]/40">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px]">Masukkan URL</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCmsRegImages(prev => prev.filter((_, i) => i !== idx))}
                                  title="Hapus gambar"
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => setCmsRegImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                placeholder="https://..."
                                className="w-full p-2 rounded-lg border border-[#E6E1D5] text-[10px] font-medium focus:outline-none focus:border-[#2C4219] bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <label className={`flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95 ${cmsUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                          <ImageIcon className="w-5 h-5 mb-0.5" />
                          {cmsUploading ? 'Mengunggah...' : 'Opsi 1: Upload File'}
                          <span className="text-[9px] font-medium text-[#433A30]/60">Pilih gambar dari perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={cmsUploading}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;
                              setCmsUploading(true);
                              try {
                                const urls = await handleCmsUploadMany(files);
                                setCmsRegImages(prev => [...prev, ...urls]);
                                showToast(`${urls.length} foto berhasil diupload!`);
                              } catch (err) {
                                showToast('Gagal upload foto.');
                              } finally {
                                setCmsUploading(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCmsRegImages(prev => [...prev, ''])}
                          className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] hover:bg-[#F0EADF] hover:border-[#2C4219] transition-all active:scale-95"
                        >
                          <Link className="w-5 h-5 mb-0.5" />
                          Opsi 2: Gunakan URL
                          <span className="text-[9px] font-medium text-[#433A30]/60">Tempel link gambar dari web</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Live Preview */}
              <div className="space-y-3 lg:sticky lg:top-6">
                <div className={`flex items-center px-1 ${cmsActivePage === 'identitas' ? 'justify-end' : 'justify-between'}`}>
                  {cmsActivePage !== 'identitas' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (cmsActivePage === 'landing' && onNavigateToPage) {
                          onNavigateToPage('beranda');
                        } else if (cmsActivePage === 'login' && onNavigateToPage) {
                          onNavigateToPage('login');
                        } else if (cmsActivePage === 'register' && onNavigateToPage) {
                          onNavigateToPage('register');
                        }
                      }}
                      className="text-[11px] font-bold uppercase tracking-wider text-[#2C4219] flex items-center gap-1.5 hover:underline cursor-pointer transition-colors"
                      title="Klik untuk membuka halaman aslinya"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pratinjau Langsung
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                  <span className="text-[10px] font-semibold text-[#A8B774] bg-[#A8B774]/15 px-2 py-0.5 rounded-full">
                    {cmsActivePage === 'identitas' ? 'Identitas Web' : cmsActivePage === 'landing' ? 'Halaman Utama' : cmsActivePage === 'login' ? 'Halaman Login' : 'Halaman Register'}
                  </span>
                </div>

                {/* Identitas Preview */}
                {cmsActivePage === 'identitas' && (
                  <div className="rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-lg bg-white flex flex-col">
                    <div className="bg-[#2C4219] p-6 flex flex-col items-center gap-4">
                      {cmsWebLogo ? (
                        <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-20 h-20 object-contain rounded-2xl bg-white p-2 shadow-md border border-white/20" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                      <h3 className="font-title font-bold text-white text-2xl text-center leading-tight">
                        {cmsWebName || 'Nama Website'}
                      </h3>
                      <p className="text-xs font-bold text-[#A8B774] text-center tracking-widest uppercase">
                        {cmsWebSubtitle || 'TEKS SUBTITLE'}
                      </p>
                    </div>
                    <div className="p-6 space-y-4 bg-[#FAF6EE]">
                      <p className="text-xs font-semibold text-[#433A30]/60 text-center">Logo dan nama website akan tampil di Sidebar, Header, dan halaman login.</p>
                      <div className="bg-white rounded-2xl border border-[#E6E1D5] p-4 flex items-center gap-3 shadow-xs">
                        {cmsWebLogo ? (
                          <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#2C4219]/10 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-[#2C4219]/40" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-title font-bold text-sm text-[#2C4219] truncate">{cmsWebName || 'Nama Website'}</span>
                          <span className="text-[10px] font-bold text-[#A8B774] tracking-widest uppercase truncate">{cmsWebSubtitle || 'TEKS SUBTITLE'}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-[#433A30]/50 font-medium">Contoh tampilan di Sidebar</p>
                    </div>
                  </div>
                )}

                {/* Landing Preview */}
                {cmsActivePage === 'landing' && (
                  <div className="rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-lg bg-white flex flex-col h-[500px]">
                    <div className="relative flex-1 overflow-hidden bg-[#2C4219]">
                      {cmsLandingImages[0] && (
                        <img src={cmsImgUrl(cmsLandingImages[0])} alt="Hero" className="w-full h-full object-cover opacity-60" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1E2E11]/90 via-[#2C4219]/70 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#A8B774] text-[#1E2E11] uppercase tracking-wider">Komunitas KWT</span>
                        <h3 className="font-title font-bold text-white text-3xl leading-tight mt-3">
                          {cmsLandingTitle || 'Judul Utama'}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6 bg-white shrink-0">
                      <p className="text-sm text-[#433A30]/90 leading-relaxed line-clamp-3">
                        {cmsLandingDesc || 'Deskripsi singkat akan tampil di sini.'}
                      </p>
                      {cmsLandingImages.length > 0 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                          {cmsLandingImages.map((img, i) => (
                            <div key={i} className="w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E6E1D5]">
                              <img src={cmsImgUrl(img)} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Login Preview */}
                {cmsActivePage === 'login' && (
                  <div className="rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-lg bg-white flex flex-col h-[500px]">
                    <div className="relative flex-1 overflow-hidden bg-[#2C4219]">
                      {cmsLoginImages[0] && <img src={cmsImgUrl(cmsLoginImages[0])} alt="Login" className="w-full h-full object-cover opacity-50" />}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1E2E11]/40 to-[#1E2E11]/90" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="font-title font-bold text-white text-2xl leading-tight">
                          {cmsLoginTitle || 'Judul Login'}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6 bg-white shrink-0">
                      <p className="text-sm text-[#433A30]/90 leading-relaxed line-clamp-2">
                        {cmsLoginDesc || 'Deskripsi login akan tampil di sini.'}
                      </p>
                      {cmsLoginImages.length > 0 && (
                        <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                          {cmsLoginImages.map((img, i) => (
                            <div key={i} className="w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E6E1D5]">
                              <img src={cmsImgUrl(img)} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="space-y-3 pt-4">
                        <div className="h-11 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center px-4">
                          <span className="text-xs text-[#433A30]/50 font-medium">email@contoh.com</span>
                        </div>
                        <div className="h-11 rounded-xl bg-[#2C4219] flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">Masuk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Register Preview */}
                {cmsActivePage === 'register' && (
                  <div className="rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-lg bg-white flex flex-col h-[500px]">
                    <div className="relative flex-1 overflow-hidden bg-[#2C4219]">
                      {cmsRegImages[0] && <img src={cmsImgUrl(cmsRegImages[0])} alt="Register" className="w-full h-full object-cover opacity-50" />}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1E2E11]/40 to-[#1E2E11]/90" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="font-title font-bold text-white text-2xl leading-tight">
                          {cmsRegTitle || 'Judul Register'}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6 bg-white shrink-0">
                      <p className="text-sm text-[#433A30]/90 leading-relaxed line-clamp-2">
                        {cmsRegDesc || 'Deskripsi register akan tampil di sini.'}
                      </p>
                      {cmsRegImages.length > 0 && (
                        <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                          {cmsRegImages.map((img, i) => (
                            <div key={i} className="w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E6E1D5]">
                              <img src={cmsImgUrl(img)} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="space-y-3 pt-4">
                        <div className="h-11 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center px-4">
                          <span className="text-xs text-[#433A30]/50 font-medium">Nama lengkap</span>
                        </div>
                        <div className="h-11 rounded-xl bg-[#2C4219] flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">Daftar Sekarang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-[#433A30]/50 px-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Pratinjau menyesuaikan teks &amp; gambar yang kamu ketik.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: KELOLA PENGGUNA ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Kelola Pengguna
                </h1>
                <p className="text-xs text-[#7A7062] font-semibold mt-1">Mengelola hak akses, ubah data dan ganti kata sandi pengguna.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  name="user-search-query-disable-autofill"
                  autoComplete="off"
                  data-lpignore="true"
                  placeholder="Cari nama atau email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#2C4219] focus:outline-none focus:border-[#2C4219] shadow-2xs"
                />
                <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6EE] text-[#7A7062] font-black uppercase text-[10px] tracking-wider border-b border-[#E6E1D5]">
                    <tr>
                      <th className="py-4 px-5">PENGGUNA</th>
                      <th className="py-4 px-5">ROLE</th>
                      <th className="py-4 px-5">TELEPON</th>
                      <th className="py-4 px-5">BERGABUNG</th>
                      <th className="py-4 px-5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D5]/60 font-medium">
                    {usersList.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-bold text-[#2C4219] text-sm">{u.name}</p>
                            <p className="text-[11px] text-[#7A7062] font-semibold mt-0.5">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {u.role === 'ADMIN' ? 'Admin Portal' : 'Anggota KWT'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#5C5246]">{u.phone || '-'}</td>
                        <td className="py-4 px-5 text-[#5C5246]">{new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserFormData({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', password: '' });
                                setIsUserModalOpen(true);
                              }}
                              className="w-8 h-8 inline-flex items-center justify-center rounded-xl hover:bg-[#A8B774]/20 text-[#A8B774] transition-colors"
                              title="Edit Pengguna"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => setDeleteConfirmModal({ id: u.id, title: u.name, type: 'pengguna' })}
                                className="w-8 h-8 inline-flex items-center justify-center rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#7A7062]">Belum ada pengguna.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: Edit Pengguna */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-5 border border-[#E6E1D5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h2 className="font-title font-bold text-xl text-[#2C4219]">Edit Pengguna</h2>
              <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-[#FAF6EE] rounded-xl text-[#7A7062] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] focus:outline-none focus:border-[#A8B774] text-sm text-[#2C4219] font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] focus:outline-none focus:border-[#A8B774] text-sm text-[#2C4219] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">No Telepon (Opsional)</label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] focus:outline-none focus:border-[#A8B774] text-sm text-[#2C4219] font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">Password Baru (Opsional)</label>
                <input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  placeholder="Isi jika ingin ganti kata sandi"
                  value={userFormData.password}
                  onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] focus:outline-none focus:border-[#A8B774] text-sm text-[#2C4219] font-semibold placeholder-[#7A7062]/40"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#7A7062] hover:bg-[#FAF6EE] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await api<{ name: string }>(`/admin/users/${editingUser.id}`, {
                      method: 'PUT',
                      body: userFormData
                    });
                    setUsersList(usersList.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
                    setIsUserModalOpen(false);
                    showToast('Data pengguna berhasil diperbarui!');
                  } catch (err: any) {
                    alert(err.message || 'Terjadi kesalahan');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white text-xs font-bold shadow-md transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Informasi */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 space-y-5 border border-[#E6E1D5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h3 className="font-title font-bold text-xl text-[#2C4219]">
                {editingArticle ? 'Sunting Informasi' : 'Tambah Informasi Baru'}
              </h3>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-5 text-xs font-medium">
              {/* Row 1: Judul + Kategori side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-[#2C4219]">Judul Informasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Teknik Pemupukan Organik Sorgum"
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Kategori</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Budidaya">Budidaya</option>
                    <option value="Inovasi">Inovasi</option>
                    <option value="Panen">Panen</option>
                    <option value="Pengetahuan">Pengetahuan</option>
                  </select>
                </div>
              </div>

              {/* Row 1.5: Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Status</label>
                  <select
                    value={artStatus}
                    onChange={(e) => setArtStatus(e.target.value as 'Draft' | 'Published')}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Upload Gambar */}
              <div className="space-y-2">
                <label className="block font-bold text-[#2C4219]">Gambar Header</label>
                {!artImage ? (
                  <label
                    htmlFor="artImageUpload"
                    className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-[#A8B774] bg-[#FAF6EE] hover:bg-[#F0EDE4] cursor-pointer transition-colors"
                  >
                    <svg className="w-8 h-8 text-[#2C4219] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-bold text-[#2C4219]">Klik untuk upload foto header</span>
                    <span className="text-xs text-[#433A30]/60 mt-1">PNG, JPG (maks. 5MB)</span>
                    <input
                      id="artImageUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await handleCmsUpload(file);
                          setArtImage(url);
                          showToast('Foto berhasil diupload');
                        } catch (err: any) {
                          showToast(err.message || 'Gagal upload foto');
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 rounded-2xl border border-[#E6E1D5] overflow-hidden group">
                    {artImage ? (
                      <img src={artImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#FAF6EE] flex items-center justify-center text-[#A8B774] font-bold">
                        Tanpa Foto
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <label htmlFor="artImageUploadChange" className="px-4 py-2 bg-white/90 rounded-xl text-xs font-bold text-[#2C4219] cursor-pointer hover:bg-white transition-colors">
                        Ganti Foto
                        <input
                          id="artImageUploadChange"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await handleCmsUpload(file);
                              setArtImage(url);
                              showToast('Foto berhasil diganti');
                            } catch (err: any) {
                              showToast(err.message || 'Gagal upload foto');
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setArtImage('')}
                        className="px-4 py-2 bg-rose-500/90 rounded-xl text-xs font-bold text-white cursor-pointer hover:bg-rose-500 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2b: Gambar Gallery (multi-upload) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#2C4219]">
                    Gambar Gallery <span className="text-[#433A30]/50 font-normal text-xs ml-1">(Opsional — tampil sebagai slideshow)</span>
                  </label>
                  {artGallery.length > 0 && (
                    <button type="button" onClick={() => setArtGallery([])} className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors">
                      Hapus Semua
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Existing gallery thumbnails */}
                  {artGallery.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-[#E6E1D5] shadow-xs">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setArtGallery(prev => prev.filter((_, i) => i !== idx))}
                          className="w-10 h-10 rounded-full bg-rose-500/90 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload area */}
                  <label
                    htmlFor="artGalleryUpload"
                    className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-[#E6E1D5] bg-[#FAF6EE] hover:bg-[#F0EDE4] cursor-pointer transition-colors"
                  >
                    <svg className="w-8 h-8 text-[#A8B774] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-bold text-[#7A7062] text-center px-2">Tambah Foto</span>
                    <input
                      id="artGalleryUpload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []) as File[];
                        e.target.value = '';
                        for (const file of files) {
                          try {
                            const url = await handleCmsUpload(file);
                            setArtGallery(prev => [...prev, url]);
                            showToast('Foto berhasil ditambahkan ke gallery');
                          } catch (err: any) {
                            showToast(err.message || 'Gagal upload foto');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Row 3: Ringkasan + Isi side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Ringkasan Singkat</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Ringkasan singkat artikel..."
                    value={artSummary}
                    onChange={(e) => setArtSummary(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Isi Lengkap Artikel</label>
                  <textarea
                    rows={5}
                    required
                    placeholder={"Tulis artikel selengkapnya di sini...\n\n(Pisahkan paragraf dengan Enter 2x)"}
                    value={artContent}
                    onChange={(e) => setArtContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E6E1D5] text-[#7A7062] font-bold text-xs hover:bg-[#FAF6EE] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2C4219] text-white font-title font-bold text-xs shadow-md hover:bg-[#1E2E11] transition-colors"
                >
                  {editingArticle ? 'Simpan Perubahan' : 'Publikasikan Informasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Pengumuman Baru */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 border border-[#E6E1D5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h3 className="font-title font-bold text-lg text-[#2C4219]">
                Buat Pengumuman Baru
              </h3>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs font-medium">
              {annError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
                  {annError}
                </div>
              )}
              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Workshop Olahan Tepung Sorgum"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Kategori</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                >
                  <option value="PENTING">PENTING</option>
                  <option value="MENDESAK">MENDESAK</option>
                  <option value="HASIL PANEN">HASIL PANEN</option>
                  <option value="INFORMASI ANGGOTA">INFORMASI ANGGOTA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Ringkasan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Pesan singkat pengumuman..."
                  value={annSummary}
                  onChange={(e) => setAnnSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] text-[#7A7062] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2C4219] text-white font-title font-bold shadow-md hover:bg-[#1E2E11]"
                >
                  Publikasikan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Agenda */}
      {isAgendaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h3 className="font-title font-bold text-lg text-[#2C4219]">
                {editingAgenda ? 'Sunting Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h3>
              <button
                onClick={() => setIsAgendaModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-[#F0EDE4] rounded-xl p-1 mb-2">
              <button
                type="button"
                onClick={() => setInputModeAgenda('manual')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${inputModeAgenda === 'manual' ? 'bg-white text-[#2C4219] shadow-sm border border-[#E6E1D5]' : 'text-[#7A7062] hover:text-[#2C4219] hover:bg-white/50'}`}
              >
                ✍️ Isi Manual
              </button>
              <button
                type="button"
                onClick={() => setInputModeAgenda('voice')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${inputModeAgenda === 'voice' ? 'bg-[#2C4219] text-white shadow-sm' : 'text-[#7A7062] hover:text-[#2C4219] hover:bg-white/50'}`}
              >
                🎙️ Asisten Suara
              </button>
            </div>

            {inputModeAgenda === 'voice' && (
              <div className="bg-[#FAF6EE] border border-[#A8B774] rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#A8B774]/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-[#2C4219]" />
                    <span className="font-bold text-[#2C4219] text-sm">Asisten Suara Pintar</span>
                  </div>

                  <button
                    type="button"
                    onClick={isRecordingAgenda ? stopRecordingAgenda : startRecordingAgenda}
                    disabled={isProcessingSTTAgenda}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${isRecordingAgenda
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse shadow-rose-100'
                      : isProcessingSTTAgenda
                        ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                        : 'bg-[#2C4219] text-white hover:bg-[#1E2E11] hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isProcessingSTTAgenda ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses Suara...
                      </>
                    ) : isRecordingAgenda ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        Berhenti Merekam
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Mulai Bicara Sekarang
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 relative z-10">
                  <p className="text-xs text-[#5C5246] leading-relaxed">
                    Cukup berbicara untuk mengisi formulir secara otomatis. <br />
                    <b>Caranya:</b> Tekan tombol mikrofon di atas, lalu sebutkan kata kunci (Keyword) dan isi sendiri datanya:
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 border border-[#E6E1D5]/50 space-y-1">
                    <p className="text-[11px] text-[#433A30] font-medium leading-relaxed">
                      Keyword <b>Judul</b>: [Isi sendiri]<br/>
                      Keyword <b>Kategori</b>: [Isi sendiri]<br/>
                      Keyword <b>Tanggal</b>: [Isi sendiri]<br/>
                      Keyword <b>Waktu</b>: [Isi sendiri]<br/>
                      Keyword <b>Deskripsi</b>: [Isi sendiri]
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveAgenda} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Judul Agenda & Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Workshop Pengolahan Tepung Sorgum"
                  value={agTitle}
                  onChange={(e) => setAgTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Kategori Agenda *</label>
                  <select
                    value={agCategory}
                    onChange={(e) => setAgCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="PANEN BERSAMA">PANEN BERSAMA</option>
                    <option value="RAPAT">RAPAT</option>
                    <option value="PELATIHAN">PELATIHAN</option>
                    <option value="INSPEKSI">INSPEKSI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Tanggal Kegiatan *</label>
                  <input
                    type="date"
                    required
                    value={agDate}
                    onChange={(e) => setAgDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Waktu Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00 - 12:00"
                    value={agTime}
                    onChange={(e) => setAgTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Deskripsi Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat kegiatan..."
                  value={agDescription}
                  onChange={(e) => setAgDescription(e.target.value)}
                  className={`w-full p-3 rounded-xl border ${isRecordingAgenda ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/30' : 'border-[#E6E1D5] bg-[#FAF6EE]'} text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all`}
                />
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAgendaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] text-[#7A7062] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2C4219] text-white font-title font-bold shadow-md hover:bg-[#1E2E11]"
                >
                  {editingAgenda ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Agenda */}
      {viewingAgenda && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
              <span className="px-2.5 py-1 rounded bg-[#E6E1D5] text-[#2C4219] font-black text-[10px] tracking-wider uppercase">
                {viewingAgenda.category || 'WORKSHOP'}
              </span>
              <button
                onClick={() => setViewingAgenda(null)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-title font-bold text-xl text-[#2C4219]">
                {viewingAgenda.title}
              </h3>

              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E6E1D5] space-y-2 text-xs text-[#5C5246]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2C4219]" />
                  <span className="font-bold">Tanggal:</span> {viewingAgenda.date}
                </div>
                {viewingAgenda.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2C4219]" />
                    <span className="font-bold">Waktu:</span> {viewingAgenda.time}
                  </div>
                )}
              </div>

              {viewingAgenda.description && (
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-[#2C4219]">Deskripsi Agenda:</p>
                  <p className="text-[#5C5246] leading-relaxed">{viewingAgenda.description}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const ag = viewingAgenda;
                  setViewingAgenda(null);
                  handleOpenEditAgenda(ag);
                }}
                className="px-4 py-2 rounded-xl bg-[#2C4219] text-white font-bold text-xs"
              >
                Sunting Agenda
              </button>
              <button
                onClick={() => setViewingAgenda(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-[#7A7062] font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Utas */}
      {threadToDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">

            {/* Header with Title and Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-base text-[#2C4219]">
                    Hapus Utas Diskusi
                  </h3>
                  <p className="text-xs text-[#7A7062]">
                    Tindakan moderasi ini bersifat permanen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThreadToDeleteModal(null)}
                className="p-1 rounded-lg hover:bg-[#FAF6EE] text-[#7A7062] transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thread Details Box */}
            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E6E1D5] space-y-1">
              <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Topik Diskusi</p>
              <p className="font-bold text-xs text-[#2C4219] line-clamp-2">
                "{threadToDeleteModal.title}"
              </p>
              <p className="text-[11px] text-rose-700 font-medium pt-2 border-t border-[#E6E1D5]">
                Seluruh komentar dan balasan di dalam utas ini akan ikut terhapus.
              </p>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E6E1D5]">
              <button
                onClick={() => setThreadToDeleteModal(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#5C5246] font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteThread}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Utas</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========== MODAL: Preview Artikel (tampil di dalam admin) ========== */}
      <ArticleDetailModal
        article={previewArticle}
        onClose={() => setPreviewArticle(null)}
      />

      {/* ========== MODAL: Konfirmasi Hapus (Artikel / Pengumuman / Agenda) ========== */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-base text-[#2C4219]">
                    Hapus {deleteConfirmModal.type === 'artikel' ? 'Artikel' : deleteConfirmModal.type === 'pengumuman' ? 'Pengumuman' : deleteConfirmModal.type === 'pengguna' ? 'Pengguna' : 'Agenda'}
                  </h3>
                  <p className="text-xs text-[#7A7062]">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="p-1 rounded-lg hover:bg-[#FAF6EE] text-[#7A7062] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detail item */}
            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E6E1D5] space-y-1">
              <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">
                {deleteConfirmModal.type === 'artikel' ? 'Judul Artikel' : deleteConfirmModal.type === 'pengumuman' ? 'Judul Pengumuman' : deleteConfirmModal.type === 'pengguna' ? 'Nama Pengguna' : 'Judul Agenda'}
              </p>
              <p className="font-bold text-xs text-[#2C4219] line-clamp-2">
                "{deleteConfirmModal.title}"
              </p>
              <p className="text-[11px] text-rose-700 font-medium pt-2 border-t border-[#E6E1D5]">
                Data yang dihapus tidak bisa dikembalikan.
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="w-full py-2.5 rounded-xl border-2 border-[#2C4219] text-[#2C4219] font-bold text-xs hover:bg-[#2C4219]/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Date Warning Modal */}
      {showDateWarning && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-title font-bold text-xl text-[#2C4219] mb-2">Tanggal Tidak Valid</h3>
            <p className="text-sm text-[#7A7062] mb-6 leading-relaxed">
              Anda tidak dapat {editingAgenda ? 'mengubah' : 'menambahkan'} agenda dengan tanggal di masa lalu. Silakan pilih hari ini atau tanggal di masa mendatang.
            </p>
            <button
              onClick={() => setShowDateWarning(false)}
              className="w-full py-3 px-4 bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
