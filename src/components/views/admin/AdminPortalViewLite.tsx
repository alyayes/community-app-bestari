import React, { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
  Loader2,
  Phone,
  LayoutGrid,
  Menu,
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowRightLeft
} from 'lucide-react';
import { UserProfile, InfoArticle, Announcement, ForumThread, AgendaEvent, LandPlot, HarvestRecord, CmsData } from '../../../types';
import { DashboardDesaView } from '../DashboardDesaView';
import { ArticleDetailModal } from '../../modals/ArticleDetailModal';
import { api, SERVER_BASE, BASE_URL } from '../../../api/client';
import { CertificateBuilderView } from './CertificateBuilderView';

const Font = Quill.import('formats/font') as any;
const customFonts = ['sans-serif', 'serif', 'monospace', 'arial', 'courier-new', 'georgia', 'trebuchet', 'verdana', 'poppins'];
Font.whitelist = customFonts;
Quill.register(Font, true);

interface AdminPortalViewProps {
  setAppMode?: (mode: 'lite' | 'pro') => void;
  currentUser: UserProfile;
  articles: InfoArticle[];
  announcements: Announcement[];
  threads: ForumThread[];
  agendas?: AgendaEvent[];
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  members: any[];
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


const DEFAULT_USERS_LIST = [
  {
    id: 'usr_01',
    name: 'Alya Permata (Admin)',
    email: 'admin@kwtsorgum.id',
    role: 'ADMIN',
    phone: '0812-3456-7890',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_02',
    name: 'Ibu Hj. Kartini',
    email: 'kartini@kwtsorgum.id',
    role: 'Ketua KWT',
    phone: '0812-7890-4321',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_03',
    name: 'Ibu Siti Rahma',
    email: 'siti.rahma@kwtsorgum.id',
    role: 'Bendahara KWT',
    phone: '0813-9988-7766',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_04',
    name: 'Pak Budi Santoso',
    email: 'budi.santoso@kwtsorgum.id',
    role: 'Petani Sorgum',
    phone: '0857-1234-5678',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_05',
    name: 'Ibu Sri Wahyuni',
    email: 'sri.wahyuni@kwtsorgum.id',
    role: 'Anggota KWT',
    phone: '0821-4455-6677',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_06',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@kwtsorgum.id',
    role: 'Pengolah Hasil Panen',
    phone: '0819-3322-1100',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];

type AdminTab = 'dashboard' | 'informasi' | 'pengumuman' | 'agenda' | 'sertifikat' | 'moderation' | 'datasorgum' | 'settings' | 'cms' | 'users';

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getCategoryColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('KREATIF')) return 'bg-[#e5a300] text-white'; // Citrus Yellow
  if (cat.includes('WORKSHOP')) return 'bg-[#293379] text-white'; // Blue Crate
  if (cat.includes('PANEN')) return 'bg-[#ee7302] text-white'; // Orange
  if (cat.includes('UMKM')) return 'bg-[#a6af32] text-[#2C4219]'; // Lettuce Green (needs dark text for contrast)
  if (cat.includes('RAPAT')) return 'bg-[#b81817] text-white'; // Tomatoe Red
  return 'bg-[#607829] text-white'; // Green Beans
};

export const AdminPortalViewLite: React.FC<AdminPortalViewProps> = ({
  setAppMode,
  currentUser,
  articles,
  announcements,
  threads,
  agendas,
  landPlots,
  harvestRecords,
  members,
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
  const [isSidebarAdminCollapsed, setIsSidebarAdminCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

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

  const handleToggleUserStatus = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await api(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: { isActive: !currentStatus },
      });
      setUsersList((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !currentStatus } : u));
      showToast(`Status ${name} berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status pengguna', 'error');
    }
  };

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
  const [validatingAgenda, setValidatingAgenda] = useState<AgendaEvent | null>(null);

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
  
  // Materials and Documentation
  const [agMateriUrls, setAgMateriUrls] = useState<string[]>([]);
  const [agDokumentasiUrls, setAgDokumentasiUrls] = useState<string[]>([]);
  const [agLinkUrls, setAgLinkUrls] = useState<string[]>([]);
  const [agLinkInput, setAgLinkInput] = useState<string>('');
  const [agMateriFiles, setAgMateriFiles] = useState<File[]>([]);
  const [agDokumentasiFiles, setAgDokumentasiFiles] = useState<File[]>([]);
  const [agCertificateTemplate, setAgCertificateTemplate] = useState<string>('');
  const [agCertificateFile, setAgCertificateFile] = useState<File | null>(null);

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

  const showToast = (msg: string, type?: 'success' | 'error' | 'info') => {
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

  const quillModules = {
    toolbar: [
      [{ 'font': customFonts }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };
  const [artError, setArtError] = useState('');

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

  const [cmsFooterCopyright, setCmsFooterCopyright] = useState(cmsData?.footerCopyright || '© Community App KWT Melati Sorgum 2026. Seluruh hak cipta dilindungi.');
  const [cmsFooterPrivacy, setCmsFooterPrivacy] = useState(cmsData?.footerPrivacy || '');
  const [cmsFooterTerms, setCmsFooterTerms] = useState(cmsData?.footerTerms || '');
  const [cmsFooterHelp, setCmsFooterHelp] = useState(cmsData?.footerHelp || '');

  // CMS: halaman yang sedang diedit (identitas | landing | login | register | footer)
  const [cmsActivePage, setCmsActivePage] = useState<'identitas' | 'landing' | 'login' | 'register' | 'footer'>('identitas');
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
      registerImage: cmsRegImages.find(u => u.trim() !== '') || '',
      footerCopyright: cmsFooterCopyright,
      footerPrivacy: cmsFooterPrivacy,
      footerTerms: cmsFooterTerms,
      footerHelp: cmsFooterHelp
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
    setAgMateriUrls([]);
    setAgMateriFiles([]);
    setAgDokumentasiUrls([]);
    setAgDokumentasiFiles([]);
    setAgLinkUrls([]);
    setAgCertificateTemplate('');
    setAgCertificateFile(null);
    setAgLinkInput('');
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
    setAgBenefits((ag.benefits || []).join(', '));
    setAgMateriUrls(ag.materiUrls || []);
    setAgDokumentasiUrls(ag.dokumentasiUrls || []);
    setAgLinkUrls(ag.linkUrls || []);
    setAgCertificateTemplate(ag.certificateTemplate || '');
    setAgLinkInput('');
    setAgMateriFiles([]);
    setAgDokumentasiFiles([]);
    setIsAgendaModalOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
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

    // Upload files if any
    let uploadedMateri = [...agMateriUrls];
    if (agMateriFiles.length > 0) {
      try {
        const newUrls = await handleCmsUploadMany(agMateriFiles);
        uploadedMateri = [...uploadedMateri, ...newUrls];
      } catch (err) {
        showToast('Gagal mengunggah materi');
      }
    }

    let uploadedDok = [...agDokumentasiUrls];
    if (agDokumentasiFiles.length > 0) {
      try {
        const newUrls = await handleCmsUploadMany(agDokumentasiFiles);
        uploadedDok = [...uploadedDok, ...newUrls];
      } catch (err) {
        showToast('Gagal mengunggah dokumentasi');
      }
    }

    let uploadedCert = agCertificateTemplate;
    if (agCertificateFile) {
      try {
        uploadedCert = await handleCmsUpload(agCertificateFile);
      } catch (err) {
        showToast('Gagal mengunggah templat sertifikat');
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
          benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          materiUrls: uploadedMateri,
          dokumentasiUrls: uploadedDok,
          linkUrls: agLinkUrls,
          certificateTemplate: uploadedCert || undefined
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
            benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            materiUrls: uploadedMateri,
            dokumentasiUrls: uploadedDok,
            linkUrls: agLinkUrls,
            certificateTemplate: uploadedCert
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
        benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        materiUrls: uploadedMateri,
        dokumentasiUrls: uploadedDok,
        linkUrls: agLinkUrls,
        certificateTemplate: uploadedCert
      };
      
      const updated = [...agendaList, newAg];
      setAgendaList(updated);
      if (onUpdateAgendas) onUpdateAgendas(updated);
      showToast(`Agenda "${agTitle}" berhasil ditambahkan!`);
      
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
          benefits: agBenefits ? agBenefits.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          materiUrls: uploadedMateri,
          dokumentasiUrls: uploadedDok,
          linkUrls: agLinkUrls,
          certificateTemplate: uploadedCert
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
    setArtContent('');
    setArtImage('');
    setArtGallery([]);
    setArtError('');
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (art: InfoArticle) => {
    setEditingArticle(art);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtContent(art.content ? (Array.isArray(art.content) ? art.content.join('\n\n') : art.content) : art.summary);
    setArtImage(art.image);
    setArtGallery(art.gallery || []);
    setArtStatus((art as any).status || 'Published');
    setArtError('');
    setIsArticleModalOpen(true);
  };

  const handleDeleteArticle = (id: string, title: string) => {
    setDeleteConfirmModal({ id, title, type: 'artikel' });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) return;

    setArtError('');
    const plainTextContent = artContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '').trim();
    if (plainTextContent.length < 10) {
      setArtError('Isi lengkap artikel minimal 10 karakter. Mohon lengkapi artikel Anda.');
      return;
    }

    const payload = {
      title: artTitle,
      category: artCategory,
      summary: artContent ? artContent.substring(0, 150).replace(/<[^>]+>/g, '') + '...' : artTitle,
      content: artContent ? [artContent] : [artTitle],
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
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col font-sans text-[#2C4219]">

      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#2C4219] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#A8B774]/40 flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-[#A8B774] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ADMIN SIDEBAR (Desktop Only) */}
      <aside className={`
        hidden md:flex fixed top-0 left-0 bottom-0 h-screen overflow-visible z-50 bg-white border-r border-[#E6E1D5] flex-col p-0 transition-all duration-300 ease-in-out print:hidden
        ${isSidebarAdminCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          onClick={() => setIsSidebarAdminCollapsed(!isSidebarAdminCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 z-[60] w-6 h-6 bg-white border border-[#E6E1D5] rounded-full items-center justify-center text-[#2C4219] hover:bg-[#FAF6EE] shadow-sm transition-colors"
        >
          {isSidebarAdminCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Scrollable Internal Container */}
        <div className="flex flex-col h-full w-full overflow-y-auto overflow-x-hidden p-4">

          <div className="space-y-6">
            {/* Admin Portal Brand Header */}
            <div className={`flex items-center gap-3 px-2 py-1 ${isSidebarAdminCollapsed ? 'justify-center px-0' : ''}`}>
              {cmsWebLogo ? (
                <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white shadow-md border border-[#E6E1D5] shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2C4219] text-[#A8B774] flex items-center justify-center font-bold shadow-md shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
              )}
              <div className={`transition-all duration-300 overflow-hidden ${isSidebarAdminCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
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
                {/* Nav 1: Dashboard */}
                <button
                  onClick={() => handleTabChange('dashboard')}
                  title={isSidebarAdminCollapsed ? 'Dashboard' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'dashboard'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Dashboard</span>}
                </button>

                {/* Nav 2: Kelola Agenda */}
                <button
                  onClick={() => handleTabChange('agenda')}
                  title={isSidebarAdminCollapsed ? 'Kelola Agenda' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'agenda'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <Calendar className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Agenda</span>}
                </button>

                {/* Nav 3: Kelola Sertifikat */}
                <button
                  onClick={() => handleTabChange('sertifikat')}
                  title={isSidebarAdminCollapsed ? 'Kelola Sertifikat' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'sertifikat'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <Award className={`w-4 h-4 ${activeTab === 'sertifikat' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Sertifikat</span>}
                </button>

                {/* Nav 4: Kelola Informasi */}
                <button
                  onClick={() => handleTabChange('informasi')}
                  title={isSidebarAdminCollapsed ? 'Kelola Informasi' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'informasi'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'informasi' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Informasi</span>}
                </button>
                
                {/* Nav 5: Kelola Diskusi */}
                <button
                  onClick={() => handleTabChange('moderation')}
                  title={isSidebarAdminCollapsed ? 'Kelola Diskusi' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'moderation'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Diskusi</span>}
                </button>

                {/* Nav 6: Kelola Data Sorgum */}
                <button
                  onClick={() => handleTabChange('datasorgum')}
                  title={isSidebarAdminCollapsed ? 'Kelola Data Sorgum' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'datasorgum'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <Sprout className={`w-4 h-4 ${activeTab === 'datasorgum' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Data Sorgum</span>}
                </button>

                {/* Nav 7: Kelola Pengguna */}
                <button
                  onClick={() => handleTabChange('users')}
                  title={isSidebarAdminCollapsed ? 'Kelola Pengguna' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'users'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Pengguna</span>}
                </button>

                {/* Nav 8: Kelola Konten */}
                <button
                  onClick={() => handleTabChange('cms')}
                  title={isSidebarAdminCollapsed ? 'Kelola Konten' : undefined}
                  className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex ${activeTab === 'cms'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
                >
                  <Layers className={`w-4 h-4 ${activeTab === 'cms' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Konten</span>}
                </button>
              </nav>
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto space-y-2 pt-4 border-t border-[#E6E1D5]">
            {setAppMode && (
              <button
                onClick={() => setAppMode('pro')}
                title={isSidebarAdminCollapsed ? 'Pro Mode' : undefined}
                className={`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold bg-[#E3EBD3] text-[#2C4219] border border-[#A8B774]/40 hover:bg-[#2C4219] hover:text-white transition-all shadow-2xs ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}`}
              >
                <ArrowRightLeft className="w-4 h-4 shrink-0" />
                {!isSidebarAdminCollapsed && <span>Pro Mode</span>}
              </button>
            )}
            <button
              onClick={onLogout}
              title={isSidebarAdminCollapsed ? 'Keluar' : undefined}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold text-[#C53030] hover:bg-[#C53030]/10 transition-colors ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}`}
            >
              <LogOut className="w-4 h-4 text-[#C53030] shrink-0" />
              {!isSidebarAdminCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pb-20 md:pb-0 ${isSidebarAdminCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        {/* Floating Header for Mobile */}
        <div className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[#E6E1D5] md:hidden">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#2C4219] text-[#A8B774] flex items-center justify-center font-bold shadow-sm shrink-0">
                <Sprout className="w-4 h-4" />
             </div>
             <span className="font-title font-bold text-[#2C4219]">Admin Portal Lite</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto w-full">
          {/* ==================== TAB: KELOLA SERTIFIKAT ==================== */}
          {activeTab === 'sertifikat' && (
            <CertificateBuilderView
              isLiteMode={true}
              agendas={agendaList}
              onUpdateAgendas={(updated) => {
                setAgendaList(updated);
                if (onUpdateAgendas) onUpdateAgendas(updated);
              }}
              showToast={showToast}
              handleCmsUpload={handleCmsUpload}
            />
          )}

          {/* ==================== TAB 1: KELOLA INFORMASI ==================== */}
          {activeTab === 'informasi' && (
            <div className="space-y-6">

              {/* Header Title + Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Informasi & Pengumuman
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddArticle}
                    className="px-4 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A8B774]" />
                    <span>Artikel</span>
                  </button>
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
                    className="px-4 py-2.5 rounded-xl bg-[#FAF6EE] text-[#2C4219] border border-[#2C4219]/20 hover:bg-[#F0EADF] font-title font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pengumuman</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar (Simplified) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xs text-[#2C4219]">Daftar Informasi Tersimpan</h3>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Cari judul konten..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#2C4219] focus:outline-none focus:border-[#2C4219] shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Articles Data List (Simplified) */}
              <div className="space-y-3">
                {pagedArticles.length > 0 ? (
                  pagedArticles.map((art) => (
                    <div key={art.id} className="bg-white p-4 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {art.image ? (
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-[#E6E1D5]"
                          />
                        ) : (
                          <div className="w-16 h-12 rounded-xl bg-[#FAF6EE] shrink-0 border border-[#E6E1D5] flex items-center justify-center">
                            <span className="text-[#A8B774] text-[10px] font-bold">No Img</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-[#FAF6EE] text-[#2C4219]">
                              {art.category}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                                (art as any).status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {(art as any).status || 'Published'}
                            </span>
                          </div>
                          <h4 className="font-bold text-[#2C4219] text-sm line-clamp-1">{art.title}</h4>
                          <p className="text-[#7A7062] text-[11px] font-semibold mt-0.5">{art.date || '12 Okt 2026'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => setPreviewArticle(art)}
                          title="Lihat Artikel"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat
                        </button>
                        <button
                          onClick={() => handleOpenEditArticle(art)}
                          title="Sunting Artikel"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id, art.title)}
                          title="Hapus Artikel"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-[#E6E1D5] text-center">
                    <p className="text-[#7A7062] font-semibold text-sm">Tidak ada artikel informasi yang ditemukan.</p>
                  </div>
                )}
              </div>

              {/* Pagination Footer */}
              {totalArticlePages > 1 && (
                <div className="flex items-center justify-between text-xs text-[#7A7062] font-bold">
                  <span>Menampilkan {Math.min(filteredArticles.length, (currentPage - 1) * ARTICLES_PER_PAGE + pagedArticles.length)} dari {filteredArticles.length} artikel</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setArticlePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&lt;</button>
                    <span className="px-3">{currentPage} / {totalArticlePages}</span>
                    <button
                      onClick={() => setArticlePage(Math.min(totalArticlePages, currentPage + 1))}
                      disabled={currentPage === totalArticlePages}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&gt;</button>
                  </div>
                </div>
              )}

            </div>
          )}

              {/* Pengumuman Data List (Simplified) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#E6E1D5]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xs text-[#2C4219]">Daftar Pengumuman</h3>
                </div>
              </div>

              <div className="space-y-3">
                {announcements && announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-4 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 shrink-0 border border-amber-100 flex items-center justify-center">
                          <Pin className="text-amber-600 w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-[#FAF6EE] text-[#2C4219]">
                              Pengumuman
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-amber-100 text-amber-800">
                              {ann.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-[#2C4219] text-sm line-clamp-1">{ann.title}</h4>
                          <p className="text-[#7A7062] text-[11px] font-semibold mt-0.5">{ann.postedTime || 'Hari ini'} • Oleh: {ann.postedBy || 'Admin'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleEditAnnouncement(ann)}
                          title="Sunting Pengumuman"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                          title="Hapus Pengumuman"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-[#E6E1D5] text-center">
                    <p className="text-[#7A7062] font-semibold text-sm">Tidak ada pengumuman yang ditemukan.</p>
                  </div>
                )}
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

              {/* Metric Cards Removed for Lite Mode */}

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E6E1D5] shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xs text-[#2C4219]">Daftar Agenda Tersimpan</h3>
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
                 {/* Agenda Data Table (Simplified) */}
              <div className="space-y-3">
                {pagedAgendas.length > 0 ? (
                  pagedAgendas.map((ag) => (
                    <div key={ag.id} className="bg-white p-4 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2C4219]/30 hover:bg-[#FAF6EE]/30 transition-all">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] shrink-0 border border-[#E6E1D5] flex flex-col items-center justify-center">
                          <span className="text-[9px] font-black tracking-widest text-[#7A7062] uppercase leading-none mb-1">
                            {ag.monthAbbr || ag.date.split('-')[1]}
                          </span>
                          <span className="text-sm font-black text-[#2C4219] leading-none">
                            {ag.dayNumber || ag.date.split('-')[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${getCategoryColor(ag.category || '')}`}>
                              {ag.category || 'WORKSHOP'}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                                ag.status === 'Selesai' ? 'bg-gray-100 text-gray-600' : 'bg-[#E3EBD3] text-[#2C4219]'
                              }`}>
                              {ag.status || 'Belum dimulai'}
                            </span>
                          </div>
                          <h4 className="font-bold text-[#2C4219] text-sm line-clamp-1">{ag.title}</h4>
                          <p className="text-[#7A7062] text-[11px] font-semibold mt-0.5">{ag.time} • {ag.location || 'Lokasi TBA'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => setViewingAgenda(ag)}
                          title="Lihat Detail"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <button
                          onClick={() => handleOpenEditAgenda(ag)}
                          title="Sunting Agenda"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAgenda(ag.id, ag.title)}
                          title="Hapus Agenda"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-[#E6E1D5] text-center">
                    <p className="text-[#7A7062] font-semibold text-sm">Tidak ada agenda yang ditemukan.</p>
                  </div>
                )}
              </div>

              {/* Pagination Footer */}
              {totalAgendaPages > 1 && (
                <div className="flex items-center justify-between text-xs text-[#7A7062] font-bold">
                  <span>Menampilkan {Math.min(filteredAgendas.length, (currentAgendaPage - 1) * AGENDAS_PER_PAGE + pagedAgendas.length)} dari {filteredAgendas.length} agenda</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAgendaPage(Math.max(1, currentAgendaPage - 1))}
                      disabled={currentAgendaPage === 1}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&lt;</button>
                    <span className="px-3">{currentAgendaPage} / {totalAgendaPages}</span>
                    <button
                      onClick={() => setAgendaPage(Math.min(totalAgendaPages, currentAgendaPage + 1))}
                      disabled={currentAgendaPage === totalAgendaPages}
                      className="px-2 py-1 rounded-lg border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] disabled:opacity-40"
                    >&gt;</button>
                  </div>
                </div>
              )}
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

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-[#E6E1D5] grid grid-cols-2 gap-2">
                      <button
                        onClick={() => alert('Fitur lihat detail akan datang')}
                        className="w-full py-2 px-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] hover:bg-[#E6E1D5] text-[#2C4219] font-title font-bold text-[10px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thr.id, thr.title)}
                        className="w-full py-2 px-3 rounded-xl border border-rose-300 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-title font-bold text-[10px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus</span>
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
              {/* Header Greeting Card */}
              <div className="bg-[#2C4219] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8B774]/20 text-[#A8B774] text-xs font-bold border border-[#A8B774]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mode Lite Active</span>
                  </div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#A8B774]">
                    Selamat Datang, {currentUser?.firstName || currentUser?.name || 'Admin'}!
                  </h1>
                  <p className="text-white/80 font-medium text-xs sm:text-sm max-w-lg">
                    Kelola kegiatan desa, informasi publik, diskusi, dan data sorgum dengan tampilan yang ringkas dan mudah dipahami.
                  </p>
                </div>
                <div className="absolute right-4 -bottom-4 opacity-10 pointer-events-none">
                  <Sprout className="w-48 h-48 text-white" />
                </div>
              </div>

              {/* 5 Primary Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div 
                  onClick={() => handleTabChange('users')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-[#2C4219] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2C4219] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Total Pengguna</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{dashboardStats?.totalUsers || members?.length || 0}</p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">Anggota & Admin Komunitas</p>
                </div>

                <div 
                  onClick={() => handleTabChange('agenda')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-amber-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Agenda Mendatang</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{agendas?.length || 0}</p>
                  <p className="text-[10px] text-amber-700 font-medium mt-1">Kegiatan Terjadwal</p>
                </div>

                <div 
                  onClick={() => handleTabChange('informasi')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-blue-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Informasi Aktif</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{adminArticles?.length || articles?.length || 0}</p>
                  <p className="text-[10px] text-blue-700 font-medium mt-1">Artikel & Berita</p>
                </div>

                <div 
                  onClick={() => handleTabChange('moderation')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-purple-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Diskusi Komunitas</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{threads?.length || 0}</p>
                  <p className="text-[10px] text-purple-700 font-medium mt-1">Utas Diskusi Warga</p>
                </div>

                <div 
                  onClick={() => handleTabChange('datasorgum')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-emerald-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Data Sorgum</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">0</p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">Data Tersimpan</p>
                </div>
              </div>

              {/* Quick Action Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Agenda Terbaru */}
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-lg text-[#2C4219]">Agenda Terdekat</h2>
                    </div>
                    <button 
                      onClick={() => handleTabChange('agenda')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agendas && agendas.length > 0 ? (
                      agendas.slice(0, 3).map(ag => (
                        <div key={ag.id} className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#2C4219] text-white flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold uppercase">{ag.monthAbbr || 'OKT'}</span>
                              <span className="text-sm font-black leading-none">{ag.dayNumber || '10'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#2C4219] line-clamp-1">{ag.title}</h4>
                              <p className="text-[11px] text-[#7A7062] flex items-center gap-2 mt-0.5">
                                <span>{ag.time}</span>
                                <span>•</span>
                                <span>{ag.location}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            {ag.category}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7A7062] text-center py-6">Belum ada agenda mendatang.</p>
                    )}
                  </div>
                </div>

                {/* Informasi Terbaru */}
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-lg text-[#2C4219]">Informasi Terbaru</h2>
                    </div>
                    <button 
                      onClick={() => handleTabChange('informasi')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {adminArticles && adminArticles.length > 0 ? (
                      adminArticles.slice(0, 3).map(art => (
                        <div key={art.id} className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A7062]">{art.category}</span>
                            <h4 className="font-bold text-xs text-[#2C4219] line-clamp-1 mt-0.5">{art.title}</h4>
                            <p className="text-[11px] text-[#7A7062] mt-0.5">{art.date}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            art.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {art.status || 'Published'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7A7062] text-center py-6">Belum ada artikel informasi.</p>
                    )}
                  </div>
                </div>

                {/* Diskusi Terkini */}
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-lg text-[#2C4219]">Diskusi Terkini</h2>
                    </div>
                    <button 
                      onClick={() => handleTabChange('moderation')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {threads && threads.length > 0 ? (
                      threads.slice(0, 3).map(thr => (
                        <div key={thr.id} className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A7062]">{thr.category}</span>
                            <h4 className="font-bold text-xs text-[#2C4219] line-clamp-1 mt-0.5">{thr.title}</h4>
                            <p className="text-[11px] text-[#7A7062] mt-0.5">Oleh: {thr.authorName}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            thr.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {thr.status || 'Aktif'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7A7062] text-center py-6">Belum ada aktivitas diskusi.</p>
                    )}
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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">Kelola Data Sorgum</h1>
                </div>
                <button
                  onClick={() => alert('Fitur tambah data akan datang')}
                  className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#A8B774]" />
                  <span>Tambah Data Sorgum</span>
                </button>
              </div>

              <div className="space-y-3">
                {landPlots && landPlots.length > 0 ? (
                  landPlots.map((plot) => (
                    <div key={plot.id} className="bg-white p-4 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-[#FAF6EE] text-[#2C4219]">
                            {plot.name || 'Lahan'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                              plot.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            {plot.status || 'Aktif'}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#2C4219] text-sm">{plot.cropType || 'Sorgum Bioguma'}</h4>
                        <p className="text-[#7A7062] text-[11px] font-semibold mt-0.5">Pemilik: {plot.ownerName} • Luas: {plot.areaM2} m²</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => alert('Detail')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <button
                          onClick={() => alert('Edit')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => alert('Hapus')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-[#E6E1D5] text-center">
                    <p className="text-[#7A7062] font-semibold text-sm">Tidak ada data lahan sorgum.</p>
                  </div>
                )}
              </div>
            </div>
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

              {/* Lite Mode Notice */}
              <div className="bg-[#FAF6EE] p-8 rounded-3xl border border-[#E6E1D5] text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E6E1D5] mx-auto flex items-center justify-center shadow-xs">
                  <Layers className="w-8 h-8 text-[#2C4219]" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-lg text-[#2C4219]">Mode Ringkas (Lite)</h3>
                  <p className="text-sm text-[#7A7062] max-w-md mx-auto mt-2 leading-relaxed">
                    Pengaturan desain halaman dan konten website secara menyeluruh hanya tersedia di <strong>Admin Pro</strong>. Silakan beralih ke Mode Pro melalui profil Anda untuk mengakses fitur ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: KELOLA PENGGUNA ==================== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header Title + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Pengguna Komunitas
                  </h1>
                  <p className="text-xs text-[#7A7062] mt-1">Daftar anggota KWT, pengurus, dan pengguna yang terdaftar di aplikasi.</p>
                </div>

                <button
                  onClick={() => {
                    setUserFormData({ name: '', email: '', role: 'USER', phone: '', password: '' });
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#A8B774]" />
                  <span>Tambah Pengguna Baru</span>
                </button>
              </div>

              {/* Search & Summary Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Cari pengguna berdasarkan nama/email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#2C4219] focus:outline-none focus:border-[#2C4219] shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#7A7062] font-bold self-end sm:self-center">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D5]">
                    Total: <strong className="text-[#2C4219]">{((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).length} Pengguna</strong>
                  </span>
                </div>
              </div>

              {/* Users Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const rawList = (usersList && usersList.length > 0) 
                    ? usersList 
                    : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST);

                  const filtered = rawList.filter(u => {
                    if (!userSearchQuery) return true;
                    const q = userSearchQuery.toLowerCase();
                    return (
                      (u.name || u.firstName || '').toLowerCase().includes(q) ||
                      (u.email || '').toLowerCase().includes(q) ||
                      (u.role || '').toLowerCase().includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#E6E1D5] text-[#7A7062] font-semibold text-xs">
                        Pengguna tidak ditemukan.
                      </div>
                    );
                  }

                  return filtered.map((u) => {
                    const userName = u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Pengguna';
                    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                    const isActive = u.isActive !== false;

                    return (
                      <div key={u.id || u.email} className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col justify-between gap-4 hover:border-[#2C4219] transition-all">
                        <div className="flex items-start gap-3">
                          {u.avatar ? (
                            <img 
                              src={u.avatar} 
                              alt={userName}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#E6E1D5] shrink-0" 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#2C4219] text-[#A8B774] font-title font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {initials}
                            </div>
                          )}

                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-[#2C4219] truncate">{userName}</h4>
                            <p className="text-xs text-[#7A7062] truncate">{u.email}</p>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5]">
                                {u.role || u.position || 'Anggota KWT'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setUserFormData({ 
                                  name: userName, 
                                  email: u.email || '', 
                                  role: u.role || 'USER', 
                                  phone: u.phone || '', 
                                  password: '' 
                                });
                                setEditingUser(u);
                                setIsUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Pengguna"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u.id, isActive, userName)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                isActive ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(u.id, userName)}
                              className="p-1.5 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      </main>

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

      {/* Mobile More Menu */}
      {isMoreMenuOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-[#E6E1D5] md:hidden pt-4 pb-6 px-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-title font-bold text-[#2C4219]">Menu Lainnya</h3>
            <button onClick={() => setIsMoreMenuOpen(false)} className="p-1.5 rounded-full bg-[#FAF6EE] text-[#433A30]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'sertifikat', label: 'Sertifikat', icon: <Award className="w-5 h-5" /> },
              { id: 'datasorgum', label: 'Data Sorgum', icon: <Sprout className="w-5 h-5" /> },
              { id: 'users', label: 'Pengguna', icon: <Users className="w-5 h-5" /> },
              { id: 'cms', label: 'Konten', icon: <Layers className="w-5 h-5" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleTabChange(item.id as AdminTab);
                  setIsMoreMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-2 ${activeTab === item.id ? 'text-[#2C4219]' : 'text-[#7A7062] hover:text-[#433A30]'}`}
              >
                <div className={`p-3 rounded-2xl ${activeTab === item.id ? 'bg-[#2C4219] text-[#A8B774]' : 'bg-[#FAF6EE] text-[#7A7062]'}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-bold text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E1D5] flex md:hidden items-center justify-around pb-safe z-50">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
          { id: 'informasi', label: 'Informasi', icon: <FileText className="w-5 h-5" /> },
          { id: 'moderation', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                handleTabChange(item.id as AdminTab);
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center w-full py-2 relative transition-all duration-300 ${isActive ? 'text-[#2C4219]' : 'text-[#7A7062] hover:text-[#433A30]'}`}
            >
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-md transition-all duration-300 bg-[#2C4219] ${isActive ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}></div>
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          );
        })}
        {/* Tombol Lainnya */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center w-full py-2 relative transition-all duration-300 ${isMoreMenuOpen ? 'text-[#2C4219]' : 'text-[#7A7062] hover:text-[#433A30]'}`}
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-md transition-all duration-300 bg-[#2C4219] ${isMoreMenuOpen ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}></div>
          <div className={`transition-transform duration-300 ${isMoreMenuOpen ? '-translate-y-0.5' : ''}`}>
             <Menu className="w-5 h-5" />
          </div>
          <span className={`text-[9px] font-bold mt-1 transition-all duration-300 ${isMoreMenuOpen ? 'opacity-100' : 'opacity-80'}`}>Lainnya</span>
        </button>
      </div>
    </div>
  );
};
