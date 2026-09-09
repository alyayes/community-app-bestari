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
  ArrowRightLeft,
  Download,
  Heart,
  Package,
  Gift
} from 'lucide-react';
import { UserProfile, InfoArticle, Announcement, ForumThread, AgendaEvent, LandPlot, HarvestRecord, CmsData } from '../../../types';
import { DashboardDesaView } from '../DashboardDesaView';
import { ArticleDetailModal } from '../../modals/ArticleDetailModal';
import { api, SERVER_BASE, BASE_URL, getAvatarUrl, handleAvatarError, resolveImageUrl } from '../../../api/client';
import { IndonesianTimePicker, to12HourPeriod } from '../../IndonesianTimePicker';
import { formatEventTimeWithPeriod, autoCapitalizeFirst, isAllLowerCase } from '../../../utils/agendaUtils';
import { CertificateBuilderView } from './CertificateBuilderView';



const Font = Quill.import('formats/font') as any;
const customFonts = ['sans-serif', 'serif', 'monospace', 'arial', 'courier-new', 'georgia', 'trebuchet', 'verdana', 'poppins'];
Font.whitelist = customFonts;
Quill.register(Font, true);

const QUILL_MODULES = {
  toolbar: [
    [{ 'font': customFonts }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'font', 'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction',
  'align',
  'link', 'image'
];

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

type AdminTab = 'dashboard' | 'informasi' | 'agenda' | 'sertifikat' | 'moderation' | 'datasorgum' | 'settings' | 'cms' | 'users';

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getCategoryColor = (category: string) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('BUDIDAYA')) return 'bg-[#2C4219] text-white'; // Forest Green
  if (cat.includes('PANEN')) return 'bg-[#ee7302] text-white'; // Orange
  if (cat.includes('PENGOLAHAN')) return 'bg-[#572E4A] text-white'; // Plum / Wine
  if (cat.includes('LAPANGAN') || cat.includes('INSPEKSI') || cat.includes('RAPAT')) return 'bg-[#b81817] text-white'; // Tomato Red
  if (cat.includes('PELATIHAN') || cat.includes('WORKSHOP')) return 'bg-[#293379] text-white'; // Blue Crate
  if (cat.includes('PEMASARAN') || cat.includes('UMKM')) return 'bg-[#e5a300] text-white'; // Citrus Yellow
  if (cat.includes('KREATIF')) return 'bg-[#572E4A] text-white';
  return 'bg-[#607829] text-white'; // Green Beans
};


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
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  }
];

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
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

  // Agenda items initial mock matching categories
  const DEFAULT_AGENDAS: AgendaEvent[] = [
    {
      id: 'ag_1',
      title: 'Budidaya & Pembibitan Bibit Unggul Sorgum',
      category: 'Budidaya Sorgum',
      date: '06 Okt 2026',
      dayNumber: '06',
      monthAbbr: 'OKT',
      time: '08:00 - 10:30 WIB (Pagi)',
      location: 'Lahan Percobaan Utama',
      organizer: 'Tim Budidaya KWT',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Bimbingan teknik persemaian benih, pemupukan organik dasar, dan pemeliharaan awal tunas bibit sorgum bioguma.'
    },
    {
      id: 'ag_2',
      title: 'Pengolahan & Penepungan Sorgum Bebas Gluten',
      category: 'Pengolahan Sorgum',
      date: '10 Okt 2026',
      dayNumber: '10',
      monthAbbr: 'OKT',
      time: '09:00 - 11:30 WIB (Pagi)',
      location: 'Balai Desa Sukamaju',
      organizer: 'KWT Sari (Dian Permata)',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Pelatihan praktis pembuatan tepung sorgum halus dan pengolahan menjadi produk kue kering bernilai jual tinggi untuk anggota kelompok.'
    },
    {
      id: 'ag_3',
      title: 'Panen Bersama Lahan Blok A',
      category: 'Panen & Pascapanen',
      date: '14 Okt 2026',
      dayNumber: '14',
      monthAbbr: 'OKT',
      time: '06:30 - 09:30 WIB (Pagi)',
      location: 'Lahan Percobaan Utama',
      organizer: 'Pak Budi Santoso',
      status: 'Belum dimulai' as any,
      statusType: 'warning',
      description: 'Gotong royong pemetikan dan penimbangan sorgum varietas Bioguma 1 bersama seluruh anggota kelompok tani.'
    },
    {
      id: 'ag_4',
      title: 'Pemasaran & Digital Branding Olahan Sorgum',
      category: 'Pemasaran',
      date: '22 Okt 2026',
      dayNumber: '22',
      monthAbbr: 'OKT',
      time: '13:00 - 15:00 WIB (Siang)',
      location: 'Balai Pertemuan Desa',
      organizer: 'Pendamping UMKM Desa',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Studi kasus branding produk olahan lokal, strategi penetapan harga, penjualan online, dan pembuatan label pouch makanan kekinian.'
    },
    {
      id: 'ag_5',
      title: 'Pelatihan Keamanan Pangan & Sanitasi',
      category: 'Pelatihan',
      date: '25 Okt 2026',
      dayNumber: '25',
      monthAbbr: 'OKT',
      time: '15:30 - 17:30 WIB (Sore)',
      location: 'Balai Desa Sukamaju',
      organizer: 'Dinas Ketahanan Pangan',
      status: 'Belum dimulai' as any,
      statusType: 'success',
      description: 'Pelatihan sertifikasi hygiene sanitasi bagi pengolah makanan, syarat perizinan P-IRT dan pemenuhan standar mutu pangan nasional.'
    },
    {
      id: 'ag_6',
      title: 'Kegiatan Lapangan & Inspeksi Tanaman',
      category: 'Kegiatan Lapangan',
      date: '28 Okt 2026',
      dayNumber: '28',
      monthAbbr: 'OKT',
      time: '19:30 - 21:00 WIB (Malam)',
      location: 'Lahan Percobaan Blok B & C',
      organizer: 'Pengurus Inti & Koordinator Lapangan',
      status: 'Belum dimulai' as any,
      statusType: 'neutral',
      description: 'Inspeksi berkala hama penyakit tanaman sorgum, pengecekan saluran irigasi tetes, dan kalibrasi sensor kelembaban tanah.'
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
  const [agCategory, setAgCategory] = useState('Budidaya Sorgum');
  const [agDate, setAgDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [agTime, setAgTime] = useState('09:00 - 12:00 WIB');
  const [agStartTime, setAgStartTime] = useState('09:00');
  const [agEndTime, setAgEndTime] = useState('12:00');
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
          { key: 'desc', match: /(?:deskripsi|isi|kegiatan)\s*/i },
          { key: 'requirements', match: /(?:perlengkapan|alat|bawa|syarat)\s*/i },
          { key: 'benefits', match: /(?:benefit|keuntungan|manfaat|fasilitas)\s*/i }
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
              setAgTitle(autoCapitalizeFirst(val));
            } else if (curr.key === 'category') {
              const upper = val.toUpperCase();
              if (upper.includes('BUDIDAYA')) setAgCategory('Budidaya Sorgum');
              else if (upper.includes('PANEN')) setAgCategory('Panen & Pascapanen');
              else if (upper.includes('PENGOLAHAN') || upper.includes('KREATIF')) setAgCategory('Pengolahan Sorgum');
              else if (upper.includes('LAPANGAN') || upper.includes('RAPAT') || upper.includes('INSPEKSI')) setAgCategory('Kegiatan Lapangan');
              else if (upper.includes('PELATIHAN') || upper.includes('WORKSHOP')) setAgCategory('Pelatihan');
              else if (upper.includes('PEMASARAN') || upper.includes('UMKM')) setAgCategory('Pemasaran');
              else setAgCategory('Budidaya Sorgum');
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
              const times = val.match(/(\d{1,2})(?::(\d{2}))?/g);
              if (times && times.length >= 2) {
                const s = times[0].includes(':') ? times[0] : `${times[0].padStart(2, '0')}:00`;
                const e = times[1].includes(':') ? times[1] : `${times[1].padStart(2, '0')}:00`;
                setAgStartTime(s.padStart(5, '0'));
                setAgEndTime(e.padStart(5, '0'));
                setAgTime(`${s.padStart(5, '0')} - ${e.padStart(5, '0')} WIB`);
              } else if (times && times.length === 1) {
                const s = times[0].includes(':') ? times[0] : `${times[0].padStart(2, '0')}:00`;
                setAgStartTime(s.padStart(5, '0'));
                setAgTime(`${s.padStart(5, '0')} WIB`);
              }
            } else if (curr.key === 'desc') {
              setAgDescription(val);
            } else if (curr.key === 'requirements') {
              setAgRequirements(val);
            } else if (curr.key === 'benefits') {
              setAgBenefits(val);
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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; title: string; type: 'artikel' | 'agenda' | 'pengguna' } | null>(null);
  const [previewArticle, setPreviewArticle] = useState<InfoArticle | null>(null);

  // New Article Form
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<'Budidaya' | 'Inovasi' | 'Pengetahuan' | 'Panen'>('Budidaya');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImage, setArtImage] = useState('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200');
  const [artGallery, setArtGallery] = useState<string[]>([]);
  const [artStatus, setArtStatus] = useState<'Draft' | 'Published'>('Published');

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

  const [cmsFooterCopyright, setCmsFooterCopyright] = useState(cmsData?.footerCopyright ?? '');
  const [cmsFooterPrivacy, setCmsFooterPrivacy] = useState(cmsData?.footerPrivacy || '');
  const [cmsFooterTerms, setCmsFooterTerms] = useState(cmsData?.footerTerms || '');
  const [cmsFooterHelp, setCmsFooterHelp] = useState(cmsData?.footerHelp || '');

  useEffect(() => {
    if (cmsData) {
      setCmsFooterCopyright(cmsData.footerCopyright ?? '');
      setCmsFooterPrivacy(cmsData.footerPrivacy || '');
      setCmsFooterTerms(cmsData.footerTerms || '');
      setCmsFooterHelp(cmsData.footerHelp || '');
    }
  }, [cmsData]);

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

  // Normalisasi URL gambar agar tahan ganti domain
  const cmsImgUrl = (u: string) => resolveImageUrl(u);
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
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal menyimpan CMS: ${err.message || 'Error tidak diketahui'}`);
    }
  };

  // Agenda Handlers
  const handleOpenAddAgenda = () => {
    setEditingAgenda(null);
    setAgTitle('');
    setAgCategory('Budidaya Sorgum');
    const d = new Date();
    setAgDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setAgTime('09:00 - 12:00 WIB');
    setAgStartTime('09:00');
    setAgEndTime('12:00');
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
    setAgCategory(ag.category || 'Budidaya Sorgum');
    setAgDate(ag.date);
    const rawTime = ag.time || '';
    setAgTime(rawTime);
    const timeMatches = rawTime.match(/(\d{1,2}:\d{2})/g);
    if (timeMatches && timeMatches.length >= 2) {
      setAgStartTime(timeMatches[0]);
      setAgEndTime(timeMatches[1]);
    } else if (timeMatches && timeMatches.length === 1) {
      setAgStartTime(timeMatches[0]);
      setAgEndTime('');
    } else {
      setAgStartTime('09:00');
      setAgEndTime('12:00');
    }
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
    const trimmedAgTitle = agTitle.trim();
    if (!trimmedAgTitle) return;

    if (isAllLowerCase(trimmedAgTitle)) {
      showToast('Judul agenda tidak boleh huruf kecil semua. Huruf awal setiap kata harus kapital atau huruf besar semua.', 'error');
      return;
    }

    const formattedAgTitle = autoCapitalizeFirst(trimmedAgTitle);

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

    const period = to12HourPeriod(agStartTime).period;
    const computedFinalTime = agStartTime 
      ? (agEndTime ? `${agStartTime} - ${agEndTime} WIB (${period})` : `${agStartTime} WIB (${period})`) 
      : formatEventTimeWithPeriod(agTime);

    if (editingAgenda) {
      const d = new Date(agDate);
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
      const updatedDayNumber = isNaN(d.getTime()) ? agDate.slice(0, 2) : d.getDate().toString().padStart(2, '0');
      const updatedMonthAbbr = isNaN(d.getTime()) ? 'OKT' : monthNames[d.getMonth()];

      const updated = agendaList.map(a =>
        a.id === editingAgenda.id ? {
          ...a,
          title: formattedAgTitle,
          category: agCategory,
          date: agDate,
          dayNumber: updatedDayNumber,
          monthAbbr: updatedMonthAbbr,
          time: computedFinalTime,
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
      showToast(`Agenda "${formattedAgTitle}" berhasil diperbarui!`);
      // Update ke backend (best effort)
      if (!editingAgenda.id.startsWith('ag_1') && !editingAgenda.id.startsWith('ag_2') && !editingAgenda.id.startsWith('ag_3')) {
        api(`/agenda/${editingAgenda.id}`, {
          method: 'PUT',
          body: {
            title: formattedAgTitle,
            category: agCategory,
            date: agDate,
            time: computedFinalTime,
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
        title: formattedAgTitle,
        category: agCategory,
        date: agDate,
        dayNumber: isNaN(d.getTime()) ? agDate.slice(0, 2) : d.getDate().toString().padStart(2, '0'),
        monthAbbr: isNaN(d.getTime()) ? 'OKT' : monthNames[d.getMonth()],
        time: computedFinalTime,
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
      showToast(`Agenda "${formattedAgTitle}" berhasil ditambahkan!`);
      
      api('/agenda', {
        method: 'POST',
        body: {
          title: formattedAgTitle,
          category: agCategory,
          date: agDate,
          time: computedFinalTime,
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

    const catUpper = (ag.category || '').toUpperCase();
    const selUpper = agendaCategoryFilter.toUpperCase();
    const matchesCategory = agendaCategoryFilter === 'Semua' || ag.category === agendaCategoryFilter || (
      catUpper === selUpper ||
      (agendaCategoryFilter === 'Budidaya Sorgum' && catUpper.includes('BUDIDAYA')) ||
      (agendaCategoryFilter === 'Panen & Pascapanen' && catUpper.includes('PANEN')) ||
      (agendaCategoryFilter === 'Pengolahan Sorgum' && (catUpper.includes('PENGOLAHAN') || catUpper.includes('KREATIF'))) ||
      (agendaCategoryFilter === 'Kegiatan Lapangan' && (catUpper.includes('LAPANGAN') || catUpper.includes('INSPEKSI') || catUpper.includes('RAPAT'))) ||
      (agendaCategoryFilter === 'Pelatihan' && (catUpper.includes('PELATIHAN') || catUpper.includes('WORKSHOP'))) ||
      (agendaCategoryFilter === 'Pemasaran' && (catUpper.includes('PEMASARAN') || catUpper.includes('UMKM')))
    );
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
    const trimmedArtTitle = artTitle.trim();
    setArtError('');
    if (!trimmedArtTitle) {
      setArtError('Judul informasi artikel wajib diisi.');
      return;
    }
    if (isAllLowerCase(trimmedArtTitle)) {
      setArtError('Judul informasi tidak boleh huruf kecil semua. Huruf awal setiap kata harus kapital atau huruf besar semua.');
      return;
    }

    const formattedArtTitle = autoCapitalizeFirst(trimmedArtTitle);

    const plainTextContent = artContent.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '').trim();
    if (plainTextContent.length < 10) {
      setArtError('Isi lengkap artikel minimal 10 karakter. Mohon lengkapi artikel Anda.');
      return;
    }

    const payload = {
      title: formattedArtTitle,
      category: artCategory,
      summary: plainTextContent || formattedArtTitle,
      content: artContent ? [artContent] : [formattedArtTitle],
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
        showToast(`Artikel "${formattedArtTitle}" berhasil diperbarui.`);
      } else {
        await api('/artikel', { method: 'POST', body: payload });
        showToast(`Artikel baru "${formattedArtTitle}" berhasil dipublikasikan!`);
      }
      // Reload dari backend — pakai endpoint admin (termasuk Draft)
      const reloaded = await api<InfoArticle[]>('/artikel/admin');
      setAdminArticles(reloaded);
      onUpdateArticles(reloaded);
      setIsArticleModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan artikel');
    }
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

  // Forum Topic Moderation Actions
  const [threadToDeleteModal, setThreadToDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [selectedThreadDetail, setSelectedThreadDetail] = useState<ForumThread | null>(null);
  const [selectedImageDetail, setSelectedImageDetail] = useState<string | null>(null);

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
        pembacaArtikel: articles.filter(a => parseMonth(a.date) === m.month).length
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

      {/* ADMIN SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 bottom-0 h-screen overflow-visible z-50 bg-white border-r border-[#E6E1D5] flex flex-col p-0 transition-all duration-300 ease-in-out print:hidden
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isSidebarAdminCollapsed ? 'md:w-20' : 'md:w-64'}
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
              {/* Nav: Dashboard Admin */}
              <button
                onClick={() => handleTabChange('dashboard')}
                title={isSidebarAdminCollapsed ? 'Dashboard' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'dashboard'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Dashboard</span>}
              </button>

              {/* Nav: Kelola Agenda */}
              <button
                onClick={() => handleTabChange('agenda')}
                title={isSidebarAdminCollapsed ? 'Kelola Agenda' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'agenda'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <Calendar className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Agenda</span>}
              </button>

              {/* Nav: Kelola Sertifikat */}
              <button
                onClick={() => handleTabChange('sertifikat')}
                title={isSidebarAdminCollapsed ? 'Kelola Sertifikat' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'sertifikat'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <Award className={`w-4 h-4 ${activeTab === 'sertifikat' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Sertifikat</span>}
              </button>

              {/* Nav: Kelola Informasi */}
              <button
                onClick={() => handleTabChange('informasi')}
                title={isSidebarAdminCollapsed ? 'Kelola Informasi' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'informasi'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'informasi' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Informasi</span>}
              </button>

              {/* Nav: Kelola Diskusi */}
              <button
                onClick={() => handleTabChange('moderation')}
                title={isSidebarAdminCollapsed ? 'Kelola Diskusi' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'moderation'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <MessageSquare className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Diskusi</span>}
              </button>

              {/* Nav: Kelola Data Sorgum (Integrasi SCM) */}
              <button
                onClick={() => handleTabChange('datasorgum')}
                title={isSidebarAdminCollapsed ? 'Kelola Data Sorgum' : undefined}
                className={`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all hidden md:flex ${activeTab === 'datasorgum'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <Sprout className={`w-4 h-4 ${activeTab === 'datasorgum' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Data Sorgum</span>}
              </button>
              {/* Nav: Kelola Pengguna */}
              <button
                onClick={() => handleTabChange('users')}
                title={isSidebarAdminCollapsed ? 'Kelola Pengguna' : undefined}
                className={`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'users'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } ${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0`} />
                {!isSidebarAdminCollapsed && <span>Kelola Pengguna</span>}
              </button>
              {/* Nav: Kelola Konten (CMS Landing/Login/Register) */}
              <button
                onClick={() => handleTabChange('cms')}
                title={isSidebarAdminCollapsed ? 'Kelola Konten' : undefined}
                className={`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all ${activeTab === 'cms'
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
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pb-16 md:pb-0 ${isSidebarAdminCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        {/* Floating Header for Hamburger (Mobile Only) */}
        <div className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center border-b border-[#E6E1D5] md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 rounded-xl bg-transparent text-[#2C4219] hover:bg-[#E6E1D5] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-title font-bold text-[#2C4219] ml-2 block md:hidden">Admin Portal</span>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto w-full">
          {/* ==================== TAB: KELOLA SERTIFIKAT ==================== */}
          {activeTab === 'sertifikat' && (
            <CertificateBuilderView
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
                                    src={resolveImageUrl(art.image)}
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
                    <p className="font-title font-bold text-2xl text-[#2C4219]">{agendaList.reduce((sum, a) => sum + (a.peserta ? a.peserta.filter(p => !p.userName?.toLowerCase().includes('admin')).length : ((a as any).quota?.registered || 0)), 0)}</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E3EBD3] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#2C4219]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#7A7062]">Agenda Selesai</p>
                    <p className="font-title font-bold text-2xl text-[#2C4219]">{agendaList.filter(a => a.status === 'Selesai').length}</p>
                  </div>
                </div>

                {/* Card 4 - Highlight Kegiatan Terdekat */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6E1D5] shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -right-2 -bottom-2 text-[#2C4219]/10 pointer-events-none">
                    <Sprout className="w-20 h-20" />
                  </div>
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">Kegiatan Terdekat</p>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const nearestAgenda = agendaList
                      .filter(a => a.status !== 'Selesai' && new Date(a.date).getTime() >= today.getTime())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                    return (
                      <div className="mt-1">
                        <p className="font-bold text-sm text-[#2C4219] line-clamp-2">{nearestAgenda?.title || 'Belum ada agenda terdekat'}</p>
                        <p className="text-xs font-semibold text-[#7A7062] mt-0.5">{nearestAgenda?.date || '-'}</p>
                      </div>
                    );
                  })()}
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
                      <option value="Budidaya Sorgum">Budidaya Sorgum</option>
                      <option value="Panen & Pascapanen">Panen & Pascapanen</option>
                      <option value="Pengolahan Sorgum">Pengolahan Sorgum</option>
                      <option value="Kegiatan Lapangan">Kegiatan Lapangan</option>
                      <option value="Pelatihan">Pelatihan</option>
                      <option value="Pemasaran">Pemasaran</option>
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
              {/* Agenda Data List (Responsive) */}
              <div className="flex flex-col gap-4">
                {pagedAgendas.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#E6E1D5] p-8 text-center">
                    <p className="text-[#7A7062] font-semibold">Tidak ada agenda yang ditemukan.</p>
                  </div>
                ) : (
                  pagedAgendas.map((ag) => {
                    let dayNum = ag.dayNumber;
                    let monthAbbr = ag.monthAbbr;
                    
                    if (!dayNum || !monthAbbr) {
                      const dateObj = new Date(ag.date);
                      if (!isNaN(dateObj.getTime())) {
                        dayNum = dateObj.getDate().toString().padStart(2, '0');
                        monthAbbr = dateObj.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
                      } else {
                        const parts = ag.date.split(' ');
                        dayNum = parts[0] || '-';
                        monthAbbr = parts[1] ? parts[1].substring(0, 3).toUpperCase() : '-';
                      }
                    }

                    return (
                      <div key={ag.id} className="bg-white rounded-2xl border border-[#E6E1D5] p-4 flex flex-col md:flex-row gap-4 md:items-center shadow-xs hover:border-[#A8B774] transition-colors">
                        
                        {/* Left: Date Box */}
                        <div className="bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl flex flex-col items-center justify-center p-3 shrink-0 w-16 h-16 md:w-[72px] md:h-[72px]">
                          <span className="text-[10px] md:text-xs font-black text-[#7A7062] uppercase tracking-wider">{monthAbbr}</span>
                          <span className="text-lg md:text-xl font-black text-[#2C4219]">{dayNum}</span>
                        </div>

                        {/* Middle: Info */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black tracking-wider uppercase ${getCategoryColor(ag.category || '')}`}>
                              {ag.category || 'WORKSHOP'}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase tracking-wider ${
                              ag.status === 'Selesai'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-[#E3EBD3] text-[#2C4219]'
                            }`}>
                              {ag.status || 'Belum dimulai'}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-[#2C4219] text-sm md:text-base leading-tight truncate">{ag.title}</h3>
                          
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A7062] truncate">
                             <span>{formatEventTimeWithPeriod(ag.time) || '09:00 - 12:00 WIB (Pagi)'}</span>
                             <span>•</span>
                             <span className="truncate">{ag.location || 'Balai Desa Sukamaju'}</span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 md:gap-3 shrink-0 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E6E1D5] justify-between md:justify-end flex-wrap">
                           {(() => {
                             const pesertaList = (ag.peserta || []).filter(a => !a.userName?.toLowerCase().includes('admin'));
                             const totalPeserta = pesertaList.length;
                             const hadirCount = pesertaList.filter(a => a.attended).length;
                             const tidakHadirCount = totalPeserta - hadirCount;

                             return (
                               <div className="flex items-center gap-1.5">
                                 <button
                                   onClick={() => setValidatingAgenda(ag)}
                                   className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
                                   title="Kelola dan validasi kehadiran peserta"
                                 >
                                   <Users className="w-4 h-4" />
                                   <span>Peserta</span>
                                   <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                                     {totalPeserta}
                                   </span>
                                 </button>

                                 <div className="flex items-center gap-1 text-[10px] font-bold">
                                   <span
                                     className="px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300/70 flex items-center gap-1"
                                     title={`Jumlah hadir: ${hadirCount}`}
                                   >
                                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                                     {hadirCount} Hadir
                                   </span>
                                   <span
                                     className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
                                     title={`Jumlah belum/tidak hadir: ${tidakHadirCount}`}
                                   >
                                     <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                                     {tidakHadirCount} Tidak Hadir
                                   </span>
                                 </div>
                               </div>
                             );
                           })()}
                           <button
                             onClick={() => setViewingAgenda(ag)}
                             className="flex items-center gap-1.5 text-xs font-bold text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] px-2 py-1.5 rounded-lg transition-colors"
                           >
                             <Eye className="w-4 h-4" />
                             <span className="hidden sm:inline">Detail</span>
                           </button>
                           <button
                             onClick={() => handleOpenEditAgenda(ag)}
                             className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                           >
                             <Edit3 className="w-4 h-4" />
                             <span className="hidden sm:inline">Edit</span>
                           </button>
                           <button
                             onClick={() => handleDeleteAgenda(ag.id, ag.title)}
                             className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                             <span className="hidden sm:inline">Hapus</span>
                           </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

                {/* Table Pagination Footer */}
                <div className="bg-[#FAF6EE] rounded-2xl border border-[#E6E1D5] px-5 py-3 flex items-center justify-between text-xs text-[#7A7062] shadow-xs">
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
                      </div>
                    </div>

                    {/* Red Action Button to Delete Topic */}
                    <div className="pt-3 border-t border-[#E6E1D5] flex gap-2">
                      <button
                        onClick={() => setSelectedThreadDetail(thr)}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-[#A8B774] bg-[#F1F5E8] hover:bg-[#E3EBD3] text-[#2C4219] font-title font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-[#435924]" />
                        <span>Detail Diskusi</span>
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thr.id, thr.title)}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-rose-300 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-title font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Hapus Topik</span>
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
                    <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">UTAS DISKUSI</p>
                    <div className="w-8 h-8 rounded-xl bg-[#E3EBD3] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#2C4219]" />
                    </div>
                  </div>
                  <p className="font-title font-black text-3xl text-[#2C4219]">{threads.length}</p>
                  <span className="text-[10px] text-[#2C4219] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2C4219]" /> Forum Komunitas Warga
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
                        <p className="text-[11px] text-[#7A7062] font-semibold">Tren keterbacaan artikel pengetahuan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-[#2C4219]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-[#2C4219]" /> Artikel
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
                        <Bar dataKey="pembacaArtikel" name="Artikel" fill="#2C4219" radius={[4, 4, 0, 0]} barSize={24} />
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
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const upcomingAgendas = agendaList
                          .filter(a => a.status !== 'Selesai' && new Date(a.date).getTime() >= today.getTime())
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 3);

                        if (upcomingAgendas.length === 0) {
                          return <p className="text-xs text-[#7A7062] italic">Tidak ada agenda terdekat yang belum selesai.</p>;
                        }

                        return upcomingAgendas.map((ag) => (
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
                                    {formatEventTimeWithPeriod(ag.time) || 'Waktu TBA'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${ag.status === 'Selesai' ? 'bg-gray-100 text-gray-500' : 'bg-[#E3EBD3] text-[#2C4219]'
                              }`}>
                              {ag.status || 'Belum dimulai'}
                            </span>
                          </div>
                        ));
                      })()}
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
                          <FileText className="w-4 h-4 text-[#A8B774]" />
                        </div>
                        <div>
                          <h3 className="font-title font-bold text-base text-[#2C4219]">Informasi & Artikel Terkini</h3>
                          <p className="text-[11px] text-[#7A7062] font-semibold">Materi edukasi dan publikasi resmi kelompok tani</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('informasi')}
                        className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                      >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {articles.slice(0, 3).map((art) => (
                        <div key={art.id} className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#E6E1D5] space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#E3EBD3] text-[#2C4219]">
                              {art.category || 'ARTIKEL'}
                            </span>
                            <span className="text-[10px] text-[#7A7062] font-semibold">{art.date}</span>
                          </div>
                          <p className="font-bold text-xs text-[#2C4219] line-clamp-1">{art.title}</p>
                          <p className="text-[11px] text-[#5C5246] line-clamp-1 font-medium">{art.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('informasi')}
                    className="w-full py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] hover:bg-[#2C4219] hover:text-white hover:border-[#2C4219] text-xs font-bold text-[#2C4219] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kelola Semua Informasi</span>
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
                    src={getAvatarUrl(currentUser.avatar, currentUser.name)}
                    alt={currentUser.name}
                    onError={(e) => handleAvatarError(e, currentUser.name)}
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
              landPlots={landPlots || []}
              harvestRecords={harvestRecords || []}
              members={members || []}
              totalUsers={dashboardStats?.totalUsers ?? 3}
              totalRawMaterialKg={dashboardStats?.totalRawMaterialKg}
              isAdmin={true}
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
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {([
                  { key: 'identitas', label: 'Identitas Web', icon: Type, desc: 'Logo & Nama' },
                  { key: 'landing', label: 'Halaman Utama', icon: Home, desc: 'Hero & carousel' },
                  { key: 'login', label: 'Halaman Login', icon: LogIn, desc: 'Sambutan & gambar' },
                  { key: 'register', label: 'Halaman Register', icon: UserPlus, desc: 'Ajakan bergabung' },
                  { key: 'footer', label: 'Pengaturan Footer', icon: LayoutGrid, desc: 'Teks & Tautan' }
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

              <div className={`grid grid-cols-1 ${cmsActivePage === 'footer' ? '' : 'lg:grid-cols-2'} gap-6 items-start`}>
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
                                  autoFocus={!url}
                                  onChange={(e) => setCmsLandingImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                  onPaste={(e) => {
                                    const text = e.clipboardData.getData('text');
                                    if (text) setCmsLandingImages(prev => prev.map((u, i) => i === idx ? text : u));
                                  }}
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
                                  autoFocus={!url}
                                  onChange={(e) => setCmsLoginImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                  onPaste={(e) => {
                                    const text = e.clipboardData.getData('text');
                                    if (text) setCmsLoginImages(prev => prev.map((u, i) => i === idx ? text : u));
                                  }}
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
                                  autoFocus={!url}
                                  onChange={(e) => setCmsRegImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                  onPaste={(e) => {
                                    const text = e.clipboardData.getData('text');
                                    if (text) setCmsRegImages(prev => prev.map((u, i) => i === idx ? text : u));
                                  }}
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

                  {cmsActivePage === 'footer' && (
                    <div className="space-y-6">
                      {/* Privacy */}
                      <div>
                        <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> Kebijakan Privasi
                        </label>
                        <div className="bg-white rounded-xl overflow-hidden border border-[#E6E1D5]">
                          <ReactQuill theme="snow" value={cmsFooterPrivacy} onChange={setCmsFooterPrivacy} />
                        </div>
                      </div>
                      {/* Terms */}
                      <div>
                        <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> Syarat & Ketentuan
                        </label>
                        <div className="bg-white rounded-xl overflow-hidden border border-[#E6E1D5]">
                          <ReactQuill theme="snow" value={cmsFooterTerms} onChange={setCmsFooterTerms} />
                        </div>
                      </div>
                      {/* Help */}
                      <div>
                        <label className="block text-xs font-bold text-[#7A7062] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> Bantuan
                        </label>
                        <div className="bg-white rounded-xl overflow-hidden border border-[#E6E1D5]">
                          <ReactQuill theme="snow" value={cmsFooterHelp} onChange={setCmsFooterHelp} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Live Preview */}
                {cmsActivePage !== 'footer' && (
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
                      <div className="rounded-3xl overflow-hidden border border-[#E6E1D5] shadow-lg bg-white p-8 flex flex-col items-center justify-center text-center h-[300px]">
                        {cmsWebLogo ? (
                          <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-20 h-20 object-contain rounded-2xl bg-white p-2 shadow-md border border-white/20" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-[#FAF6EE] flex items-center justify-center border-2 border-dashed border-[#E6E1D5]">
                            <ImageIcon className="w-8 h-8 text-[#D1C9B8]" />
                          </div>
                        )}
                        <h3 className="font-title font-bold text-2xl text-[#2C4219] mt-6">
                          {cmsWebName || 'Nama Website'}
                        </h3>
                        <p className="text-sm font-bold text-[#A8B774] tracking-widest uppercase mt-2">
                          {cmsWebSubtitle || 'TEKS SUBTITLE'}
                        </p>

                        <div className="mt-8 pt-6 border-t border-[#E6E1D5] w-full flex items-center gap-3 justify-center">
                          {cmsWebLogo ? (
                            <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] shrink-0" />
                          )}
                          <div className="flex flex-col items-start min-w-0">
                            <span className="font-title font-bold text-sm text-[#2C4219] truncate">{cmsWebName || 'Nama Website'}</span>
                            <span className="text-[10px] font-bold text-[#A8B774] tracking-widest uppercase truncate">{cmsWebSubtitle || 'TEKS SUBTITLE'}</span>
                          </div>
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
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1E2E11] to-transparent" />
                          <div className="absolute inset-x-6 bottom-6 flex flex-col items-center text-center">
                            <h3 className="font-title font-bold text-white text-3xl leading-tight drop-shadow-md">
                              {cmsLandingTitle || 'Judul Utama'}
                            </h3>
                          </div>
                        </div>
                        <div className="p-6 bg-white shrink-0">
                          <p className="text-sm text-[#433A30]/90 text-center leading-relaxed line-clamp-3">
                            {cmsLandingDesc || 'Deskripsi singkat akan tampil di sini.'}
                          </p>
                          {cmsLandingImages.length > 0 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 justify-center">
                              {cmsLandingImages.map((img, i) => (
                                <div key={i} className="w-16 h-12 shrink-0 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E6E1D5]">
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
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).map((u) => {
                  const isUserAdmin = (u.role || '').toUpperCase() === 'ADMIN' || (u.role || '').toUpperCase() === 'ADMINISTRATOR' || (u.role || '').toLowerCase().includes('admin');
                  return (
                  <div key={u.id} className="bg-white rounded-3xl border border-[#E6E1D5] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col relative">
                    {/* Card Header (Avatar & Name & Status) */}
                    <div className="p-6 pb-5 flex items-start gap-4">
                      <div className="relative shrink-0">
                        {u.avatar ? (
                          <img
                            src={getAvatarUrl(u.avatar, u.name)}
                            alt={u.name}
                            onError={(e) => handleAvatarError(e, u.name)}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#E6E1D5] group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C4219] to-[#433A30] flex items-center justify-center text-white text-lg font-bold shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-[3px] border-white ${u.isActive !== false ? 'bg-[#A8B774]' : 'bg-rose-500'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden pt-1">
                        <p className="font-title font-bold text-[#2C4219] text-base truncate group-hover:text-[#A8B774] transition-colors" title={u.name}>{u.name}</p>
                        <p className="text-[11px] text-[#7A7062] font-semibold truncate mt-0.5" title={u.email}>{u.email}</p>
                        <span className={`inline-block mt-2 px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider ${isUserAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5]'}`}>
                          {isUserAdmin ? 'Admin Portal' : 'Anggota KWT'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="px-6 py-4 flex-1 bg-gradient-to-b from-[#FAF6EE]/50 to-transparent border-t border-[#E6E1D5]/50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs font-semibold text-[#5C5246]">
                          <div className="w-7 h-7 rounded-xl bg-white border border-[#E6E1D5] flex items-center justify-center text-[#7A7062] shadow-xs">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{u.phone || 'Belum ditambahkan'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-[#5C5246]">
                          <div className="w-7 h-7 rounded-xl bg-white border border-[#E6E1D5] flex items-center justify-center text-[#7A7062] shadow-xs">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">Bergabung {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-[#E6E1D5] bg-white flex items-center justify-between gap-2">
                      {/* Active/Inactive Toggle */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive !== false, u.name)}
                          className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 focus:outline-none ${u.isActive !== false ? 'bg-[#2C4219]' : 'bg-[#D1C9B8]'}`}
                          title={u.isActive !== false ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
                        >
                          <div className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-300 ${u.isActive !== false ? 'translate-x-4.5' : ''}`} />
                        </button>
                        <span className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">{u.isActive !== false ? 'Aktif' : 'Non-aktif'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setUserFormData({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', password: '' });
                            setIsUserModalOpen(true);
                          }}
                          className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#A8B774] text-[#7A7062] hover:text-white transition-all duration-300 shadow-xs hover:shadow-md"
                          title="Edit Data & Kata Sandi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isUserAdmin && (
                          <button
                            onClick={() => setDeleteConfirmModal({ id: u.id, title: u.name, type: 'pengguna' })}
                            className="p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-rose-500 text-[#7A7062] hover:text-white transition-all duration-300 shadow-xs hover:shadow-md"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

                {((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-[#E6E1D5] rounded-3xl bg-[#FAF6EE]/50">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#E6E1D5] flex items-center justify-center mx-auto mb-4 text-[#A8B774] shadow-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="font-title font-bold text-lg text-[#2C4219]">Belum ada pengguna</p>
                    <p className="text-xs text-[#7A7062] font-semibold mt-1">Coba sesuaikan kata pencarian Anda.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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

            <div className="pt-4 border-t border-[#E6E1D5] flex flex-wrap items-center justify-end gap-3">
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
          <div className="bg-white rounded-3xl max-w-5xl w-full p-8 space-y-5 border border-[#E6E1D5] shadow-2xl max-h-[90vh] overflow-y-auto">
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

            {artError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold text-sm">Validasi Gagal</p>
                  <p className="font-medium text-xs opacity-90 mt-0.5">{artError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveArticle} className="space-y-5 text-xs font-medium">
              {/* Row 1: Judul, Kategori, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-[#2C4219]">Judul Informasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Teknik Pemupukan Organik Sorgum"
                    value={artTitle}
                    onChange={(e) => setArtTitle(autoCapitalizeFirst(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                  <span className="text-[10px] text-[#7A7062]">Setiap kata otomatis diawali huruf kapital (tidak boleh huruf kecil semua)</span>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Kategori</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Budidaya">Budidaya</option>
                    <option value="Inovasi">Inovasi</option>
                    <option value="Panen">Panen</option>
                    <option value="Pengetahuan">Pengetahuan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Status</label>
                  <select
                    value={artStatus}
                    onChange={(e) => setArtStatus(e.target.value as 'Draft' | 'Published')}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Upload Gambar & Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="relative w-full h-32 sm:h-40 rounded-2xl border border-[#E6E1D5] overflow-hidden group">
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-2 pb-1">
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
              </div>

              {/* Row 3: Isi Lengkap Artikel */}
              <div className="grid grid-cols-1 gap-6 mt-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Isi Lengkap Artikel</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-[#E6E1D5] [&_.ql-toolbar]:bg-[#FAF6EE] [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[#E6E1D5] [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-[#433A30]">
                    <ReactQuill
                      theme="snow"
                      value={artContent}
                      onChange={setArtContent}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Tuliskan isi artikel Anda di sini..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex flex-wrap items-center justify-end gap-3">
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
                      Keyword <b>Judul</b>: [Judul kegiatan]<br />
                      Keyword <b>Kategori</b>: [Kategori kegiatan]<br />
                      Keyword <b>Tanggal</b>: [Tanggal kegiatan]<br />
                      Keyword <b>Waktu</b>: [Waktu/jam kegiatan]<br />
                      Keyword <b>Deskripsi</b>: [Penjelasan singkat kegiatan]<br />
                      Keyword <b>Perlengkapan</b>: [Alat / barang yang dibawa]<br />
                      Keyword <b>Benefit</b>: [Fasilitas / keuntungan yang didapat]
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
                  onChange={(e) => setAgTitle(autoCapitalizeFirst(e.target.value))}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                />
                <span className="text-[10px] text-[#7A7062]">Setiap kata otomatis diawali huruf kapital (tidak boleh huruf kecil semua)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Kategori Agenda *</label>
                  <select
                    value={agCategory}
                    onChange={(e) => setAgCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    <option value="Budidaya Sorgum">Budidaya Sorgum</option>
                    <option value="Panen & Pascapanen">Panen & Pascapanen</option>
                    <option value="Pengolahan Sorgum">Pengolahan Sorgum</option>
                    <option value="Kegiatan Lapangan">Kegiatan Lapangan</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Pemasaran">Pemasaran</option>
                  </select>
                </div>

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
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219]">Waktu Kegiatan *</label>
                <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <label className="text-xs font-bold text-[#7A7062]">Jam Mulai</label>
                    <IndonesianTimePicker
                      value={agStartTime}
                      onChange={(val) => {
                        setAgStartTime(val);
                        const period = to12HourPeriod(val).period;
                        setAgTime(val ? (agEndTime ? `${val} - ${agEndTime} WIB (${period})` : `${val} WIB (${period})`) : '');
                      }}
                    />
                  </div>

                  <div className="pb-3 px-1 text-xs font-bold text-[#7A7062] shrink-0 select-none">
                    s/d
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <label className="text-xs font-bold text-[#7A7062]">Jam Selesai</label>
                    <IndonesianTimePicker
                      value={agEndTime}
                      onChange={(val) => {
                        setAgEndTime(val);
                        const period = to12HourPeriod(agStartTime || val).period;
                        setAgTime(agStartTime ? (val ? `${agStartTime} - ${val} WIB (${period})` : `${agStartTime} WIB (${period})`) : '');
                      }}
                    />
                  </div>

                  <div className="pb-0 shrink-0">
                    <span className="inline-flex items-center justify-center h-11 px-3.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-bold text-[#2C4219]">
                      WIB
                    </span>
                  </div>
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

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Perlengkapan yang Dibawa (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bawa sampel olahan, HP berkamera"
                  value={agRequirements}
                  onChange={(e) => setAgRequirements(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all"
                />
                <span className="text-[10px] text-[#7A7062]">Pisahkan dengan koma jika lebih dari satu</span>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Benefit Peserta (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Stiker gratis, Snack, Sertifikat"
                  value={agBenefits}
                  onChange={(e) => setAgBenefits(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all"
                />
                <span className="text-[10px] text-[#7A7062]">Pisahkan dengan koma jika lebih dari satu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-[#2C4219]">Materi & Tautan Kegiatan <span className="text-[#A19D94] text-[10px] font-normal">(Maks. 2 File)</span></label>
                    <div className="relative mt-1">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const currentTotal = agMateriUrls.length;
                          const allowed = 2 - currentTotal;
                          const files = Array.from(e.target.files || []);
                          const combined = [...agMateriFiles, ...files];
                          if (combined.length > allowed) {
                            showToast('Maksimal hanya bisa mengunggah 2 file materi!', 'error');
                          }
                          if (allowed > 0 && agLinkUrls.length === 0) {
                            setAgMateriFiles(combined.slice(0, allowed));
                          }
                        }}
                        disabled={agMateriUrls.length + agMateriFiles.length >= 2 || agLinkUrls.length > 0}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        title="Pilih File Materi"
                      />
                      <div className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center space-y-2
                        ${agMateriUrls.length + agMateriFiles.length >= 2 || agLinkUrls.length > 0 ? 'bg-[#E6E1D5]/50 border-[#E6E1D5] text-[#A19D94]' : agMateriFiles.length > 0 ? 'bg-[#E5A300]/5 border-[#E5A300] text-[#E5A300]' : 'bg-[#FAF6EE] border-[#E6E1D5] hover:bg-[#F3EFE6] text-[#A19D94]'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${agMateriFiles.length > 0 ? 'bg-[#E5A300]/20' : 'bg-white shadow-sm'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </div>
                        {agLinkUrls.length > 0 ? (
                          <>
                            <span className="text-xs font-bold">Opsi File Dinonaktifkan</span>
                            <span className="text-[10px]">Karena Anda telah menambahkan Link</span>
                          </>
                        ) : agMateriUrls.length + agMateriFiles.length >= 2 ? (
                          <>
                            <span className="text-xs font-bold">Batas Maksimal (2 File)</span>
                            <span className="text-[10px]">Hapus file lama untuk menambah baru</span>
                          </>
                        ) : agMateriFiles.length > 0 ? (
                          <>
                            <span className="text-xs font-bold">{agMateriFiles.length} file baru dipilih</span>
                            <span className="text-[10px] opacity-80">Siap untuk diunggah</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-[#433A30]">Pilih File Materi</span>
                            <span className="text-[10px]">Maks. 2 File PDF/Word</span>
                          </>
                        )}
                      </div>
                    </div>
                    {agMateriFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="text-[10px] font-bold text-[#A19D94]">File Baru Dipilih ({agMateriFiles.length}):</div>
                        {agMateriFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#FAF6EE]/50 border border-[#E5A300] border-dashed p-2 rounded-xl group transition-all hover:bg-white hover:shadow-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-6 h-6 rounded-md bg-[#E5A300]/10 flex items-center justify-center shrink-0">
                                <FileText className="w-3 h-3 text-[#E5A300]" />
                              </div>
                              <span className="text-[10px] font-medium text-[#433A30] truncate max-w-[150px]">{file.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setAgMateriFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 text-[#A19D94] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20 relative"
                              title="Batal unggah file ini"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {agMateriUrls.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="text-[10px] font-bold text-[#A19D94]">File Tersimpan ({agMateriUrls.length}):</div>
                        {agMateriUrls.map((url, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#FAF6EE]/50 border border-[#E6E1D5] p-2 rounded-xl group transition-all hover:bg-white hover:shadow-sm">
                            <a href={resolveImageUrl(url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden hover:opacity-80">
                              <div className="w-6 h-6 rounded-md bg-[#E5A300]/10 flex items-center justify-center shrink-0">
                                <FileText className="w-3 h-3 text-[#E5A300]" />
                              </div>
                              <span className="text-[10px] font-medium text-[#433A30] truncate max-w-[150px]">{url.split('/').pop() || `File ${idx + 1}`}</span>
                            </a>
                            <button 
                              type="button" 
                              onClick={() => setAgMateriUrls(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 text-[#A19D94] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus file ini"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-[#E6E1D5]">
                    <label className="block font-bold text-[#2C4219] text-xs">Atau Tautan Terkait <span className="text-[#A19D94] text-[10px] font-normal">(Maks. 2 Link)</span></label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder={agMateriUrls.length > 0 || agMateriFiles.length > 0 ? "Nonaktif karena ada file materi" : "Contoh: https://youtube.com/..."}
                        value={agLinkInput}
                        onChange={(e) => setAgLinkInput(e.target.value)}
                        disabled={agMateriUrls.length > 0 || agMateriFiles.length > 0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (agLinkInput.trim() && agMateriUrls.length === 0 && agMateriFiles.length === 0) {
                              if (agLinkUrls.length >= 2) {
                                showToast('Maksimal hanya bisa menyematkan 2 tautan materi!', 'error');
                              } else {
                                setAgLinkUrls([...agLinkUrls, agLinkInput.trim()]);
                                setAgLinkInput('');
                              }
                            }
                          }
                        }}
                        className="flex-1 p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        disabled={agMateriUrls.length > 0 || agMateriFiles.length > 0}
                        onClick={() => {
                          if (agLinkInput.trim() && agMateriUrls.length === 0 && agMateriFiles.length === 0) {
                            if (agLinkUrls.length >= 2) {
                              showToast('Maksimal hanya bisa menyematkan 2 tautan materi!', 'error');
                            } else {
                              setAgLinkUrls([...agLinkUrls, agLinkInput.trim()]);
                              setAgLinkInput('');
                            }
                          }
                        }}
                        className="px-4 bg-[#2C4219] text-white rounded-xl font-bold hover:bg-[#1E2E11] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Tambah
                      </button>
                    </div>
                    {agLinkUrls.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {agLinkUrls.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF6EE] border border-[#E6E1D5]">
                            <span className="text-xs text-[#2C4219] font-medium truncate flex-1">{link}</span>
                            <button
                              type="button"
                              onClick={() => setAgLinkUrls(agLinkUrls.filter((_, i) => i !== idx))}
                              className="ml-2 w-6 h-6 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Unggah Dokumentasi <span className="text-[#A19D94] text-[10px] font-normal">(Hanya Gambar)</span></label>
                  <div className="relative mt-1">
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        setAgDokumentasiFiles([...agDokumentasiFiles, ...newFiles]);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Pilih File Dokumentasi"
                    />
                    <div className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center space-y-2
                      ${agDokumentasiFiles.length > 0 ? 'bg-[#A8B774]/10 border-[#A8B774] text-[#2C4219]' : 'bg-[#FAF6EE] border-[#E6E1D5] hover:bg-[#F3EFE6] text-[#A19D94]'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${agDokumentasiFiles.length > 0 ? 'bg-[#A8B774]/30' : 'bg-white shadow-sm'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      {agDokumentasiFiles.length > 0 ? (
                        <>
                          <span className="text-xs font-bold">{agDokumentasiFiles.length} foto baru dipilih</span>
                          <span className="text-[10px] opacity-80">Siap untuk diunggah</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-[#433A30]">Pilih foto dokumentasi</span>
                          <span className="text-[10px]">Kualitas bagus & cerah</span>
                        </>
                      )}
                    </div>
                  </div>
                  {agDokumentasiFiles.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-[10px] font-bold text-[#A19D94]">Foto Baru Dipilih ({agDokumentasiFiles.length}):</div>
                      {agDokumentasiFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#FAF6EE]/50 border border-[#A8B774] border-dashed p-2 rounded-xl group transition-all hover:bg-white hover:shadow-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-6 h-6 rounded-md bg-[#A8B774]/10 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-[#A8B774]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <span className="text-[10px] font-medium text-[#433A30] truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setAgDokumentasiFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-[#A19D94] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20 relative"
                            title="Batal unggah foto ini"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {agDokumentasiUrls.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-[10px] font-bold text-[#A19D94]">Foto Tersimpan ({agDokumentasiUrls.length}):</div>
                      {agDokumentasiUrls.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#FAF6EE]/50 border border-[#E6E1D5] p-2 rounded-xl group transition-all hover:bg-white hover:shadow-sm">
                          <a href={resolveImageUrl(url)} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden hover:opacity-80">
                            <div className="w-6 h-6 rounded-md bg-[#A8B774]/10 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-[#A8B774]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <span className="text-[10px] font-medium text-[#433A30] truncate max-w-[150px]">{url.split('/').pop() || `Foto ${idx + 1}`}</span>
                          </a>
                          <button 
                            type="button" 
                            onClick={() => setAgDokumentasiUrls(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 text-[#A19D94] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus foto ini"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>



              <div className="pt-3 border-t border-[#E6E1D5] flex flex-wrap items-center justify-end gap-3">
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
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E6E1D5] space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6E1D5]">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${getCategoryColor(viewingAgenda.category || '')}`}>
                  {viewingAgenda.category || 'WORKSHOP'}
                </span>
                <h2 className="font-title font-bold text-xl sm:text-2xl text-[#2C4219] mt-2">
                  {viewingAgenda.title}
                </h2>
                <p className="text-xs text-[#433A30]/80 mt-1">
                  Penyelenggara: <strong className="text-[#2C4219]">{viewingAgenda.organizer || 'Admin KWT'}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingAgenda(null)}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] flex items-center justify-center font-bold text-sm transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info Grid */}
            <div className="text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#433A30]/60">Waktu & Tanggal</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5 flex-wrap">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  <span>{viewingAgenda.date}</span>
                  {viewingAgenda.time && (
                    <>
                      <span className="text-[#A19D94]">•</span>
                      <span>{formatEventTimeWithPeriod(viewingAgenda.time)}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* 1. Deskripsi Kegiatan */}
            <div className="space-y-2">
              <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2C4219]" />
                Deskripsi Kegiatan
              </h3>
              <p className="text-xs text-[#433A30] leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D5] whitespace-pre-line">
                {viewingAgenda.description || 'Tidak ada deskripsi rinci untuk agenda ini.'}
              </p>
            </div>

            {/* 2. Perlengkapan yang Dibawa */}
            {viewingAgenda.requirements && viewingAgenda.requirements.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#B45309] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B45309]" />
                  Perlengkapan yang Dibawa
                </h3>
                <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-[#FDE68A] space-y-2">
                  <ul className="space-y-1.5">
                    {viewingAgenda.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#92400E] font-medium leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Benefit / Keuntungan Peserta */}
            {viewingAgenda.benefits && viewingAgenda.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#2C4219]" />
                  Benefit & Keuntungan Peserta
                </h3>
                <div className="bg-[#F4F8EC] p-4 rounded-2xl border border-[#D5E5B8] space-y-2">
                  <ul className="space-y-1.5">
                    {viewingAgenda.benefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2C4219] font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#2C4219] mt-0.5 shrink-0" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Materi & Dokumentasi */}
            <div className="space-y-4 pt-2">
              {viewingAgenda.materiUrls && viewingAgenda.materiUrls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#E5A300]/20 flex items-center justify-center text-[#E5A300]">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    Unduh Materi Kegiatan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingAgenda.materiUrls.map((url, idx) => {
                      const resolvedUrl = resolveImageUrl(url);
                      const isImage = resolvedUrl.toLowerCase().match(/\.(jpeg|jpg|png|webp)$/) != null;

                      if (isImage) {
                        return (
                          <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border-2 border-transparent hover:border-[#E5A300] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 aspect-video sm:aspect-auto sm:h-20 relative bg-[#FAF6EE]">
                            <img src={resolvedUrl} alt={`Materi Gambar ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                              <span className="text-white text-[10px] font-bold flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                Lihat Gambar
                              </span>
                            </div>
                          </a>
                        );
                      }

                      return (
                        <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-white to-[#FAF6EE] p-3 rounded-2xl border border-[#E6E1D5] shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#E5A300] flex items-center gap-3 text-xs font-bold text-[#2C4219] transition-all duration-300">
                          <div className="w-10 h-10 rounded-xl bg-[#E5A300]/10 text-[#E5A300] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px]">Materi Berkas {idx + 1}</span>
                            <span className="text-[10px] text-[#A19D94] font-medium mt-0.5">Ketuk untuk mengunduh</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {viewingAgenda.dokumentasiUrls && viewingAgenda.dokumentasiUrls.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#A8B774]/30 flex items-center justify-center text-[#2C4219]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    Galeri Dokumentasi
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewingAgenda.dokumentasiUrls.map((url, idx) => {
                      const resolvedUrl = resolveImageUrl(url);
                      return (
                        <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border-2 border-transparent hover:border-[#A8B774] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 aspect-[4/3] relative bg-[#FAF6EE]">
                          <img src={resolvedUrl} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                            <span className="text-white text-[10px] font-bold flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                              Lihat Penuh
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewingAgenda.linkUrls && viewingAgenda.linkUrls.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#293379]/20 flex items-center justify-center text-[#293379]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    </div>
                    Tautan Tambahan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingAgenda.linkUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-white to-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#293379] flex items-center gap-3 text-xs font-bold text-[#1E293B] transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl bg-[#293379]/10 text-[#293379] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-[13px] truncate">Tautan {idx + 1}</span>
                          <span className="text-[10px] text-[#64748B] font-medium mt-0.5 truncate">{url}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(!viewingAgenda.materiUrls?.length && !viewingAgenda.dokumentasiUrls?.length && !viewingAgenda.linkUrls?.length) && (
                <div className="bg-[#FAF6EE]/50 p-4 rounded-2xl border border-[#E6E1D5]/50 text-center">
                  <p className="text-[11px] text-[#A19D94] font-medium italic">Belum ada berkas materi, dokumentasi, atau tautan yang diunggah pada agenda ini.</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
              <button
                onClick={() => setViewingAgenda(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#433A30] hover:bg-[#FAF6EE]"
              >
                Tutup Window
              </button>

              <button
                onClick={() => {
                  const ag = viewingAgenda;
                  setViewingAgenda(null);
                  handleOpenEditAgenda(ag);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 bg-[#2C4219] text-white hover:bg-[#1E2E11]"
              >
                <Edit3 className="w-4 h-4" />
                <span>Sunting Agenda</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Validasi Peserta */}
      {validatingAgenda && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
              <div className="flex flex-col">
                <span className="text-[#2C4219] font-black text-sm tracking-wider">
                  Validasi Kehadiran
                </span>
                <span className="text-[#7A7062] text-xs font-semibold">{validatingAgenda.title}</span>
              </div>
              <button
                onClick={() => setValidatingAgenda(null)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(!validatingAgenda.peserta || validatingAgenda.peserta.filter(a => !a.userName.toLowerCase().includes('admin')).length === 0) ? (
                <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#E6E1D5] text-center">
                  <p className="text-sm text-[#7A7062] font-medium italic">Belum ada user yang mendaftar pada agenda ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {validatingAgenda.peserta.filter(a => !a.userName.toLowerCase().includes('admin')).map(attendee => (
                    <div key={attendee.userId} className="flex flex-col gap-3 p-4 rounded-2xl border border-[#E6E1D5] bg-[#FAF6EE]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#2C4219] text-base">{attendee.userName}</p>
                          <p className={`font-semibold flex items-center gap-1.5 text-xs ${
                            attendee.attended ? 'text-[#2C4219]' : 'text-rose-600'
                          }`}>
                            {attendee.attended ? <CheckCircle2 className="w-4 h-4 text-[#A8B774]" /> :
                             <X className="w-4 h-4 text-rose-500" />}
                            {attendee.attended ? 'Hadir' : 'Belum Hadir / Tidak Hadir'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full">
                        {/* Validasi Hadir */}
                        <button
                          onClick={() => {
                            setValidatingAgenda(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                peserta: prev.peserta?.map(a => 
                                  a.userId === attendee.userId ? { ...a, attended: true } : a
                                )
                              };
                            });

                            if (onUpdateAgendas) {
                              const newAgendas = (agendas || []).map(ag => {
                                if (ag.id !== validatingAgenda.id) return ag;
                                return {
                                  ...ag,
                                  peserta: ag.peserta?.map(a => 
                                    a.userId === attendee.userId ? { ...a, attended: true } : a
                                  )
                                };
                              });
                              onUpdateAgendas(newAgendas);
                            }

                            // Call API
                            api(`/agenda/${validatingAgenda.id}/attendance`, {
                              method: 'PUT',
                              body: { userId: attendee.userId, attended: true }
                            }).catch(err => console.error('Failed to validate attendance:', err));
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-bold text-sm shadow-sm ${
                            attendee.attended 
                              ? 'bg-[#A8B774] text-[#2C4219] border-[#A8B774]' 
                              : 'bg-white border-[#E6E1D5] text-[#7A7062] hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                          }`}
                          title="Tandai Hadir"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Hadir</span>
                        </button>

                        {/* Validasi Tidak Hadir */}
                        <button
                          onClick={() => {
                            setValidatingAgenda(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                peserta: prev.peserta?.map(a => 
                                  a.userId === attendee.userId ? { ...a, attended: false } : a
                                )
                              };
                            });

                            if (onUpdateAgendas) {
                              const newAgendas = (agendas || []).map(ag => {
                                if (ag.id !== validatingAgenda.id) return ag;
                                return {
                                  ...ag,
                                  peserta: ag.peserta?.map(a => 
                                    a.userId === attendee.userId ? { ...a, attended: false } : a
                                  )
                                };
                              });
                              onUpdateAgendas(newAgendas);
                            }

                            // Call API
                            api(`/agenda/${validatingAgenda.id}/attendance`, {
                              method: 'PUT',
                              body: { userId: attendee.userId, attended: false }
                            }).catch(err => console.error('Failed to validate attendance:', err));
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-bold text-sm shadow-sm ${
                            !attendee.attended 
                              ? 'bg-rose-500 text-white border-rose-500' 
                              : 'bg-white border-[#E6E1D5] text-[#7A7062] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                          }`}
                          title="Tandai Tidak Hadir"
                        >
                          <X className="w-4 h-4" />
                          <span>Batal Hadir</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E6E1D5] flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setValidatingAgenda(null)}
                className="px-4 py-2 rounded-xl bg-[#2C4219] text-white font-bold text-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Diskusi */}
      {selectedThreadDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E6E1D5] bg-[#FAF6EE]">
              <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219]">Detail Diskusi</h2>
              <button
                onClick={() => setSelectedThreadDetail(null)}
                className="p-2 bg-white text-[#7A7062] hover:text-[#2C4219] border border-[#E6E1D5] hover:bg-[#E3EBD3] rounded-full transition-colors shadow-xs"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedThreadDetail.authorAvatar ? ((selectedThreadDetail.authorAvatar.startsWith('http') || selectedThreadDetail.authorAvatar.startsWith('data:')) ? selectedThreadDetail.authorAvatar : SERVER_BASE + selectedThreadDetail.authorAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedThreadDetail.authorName || 'User')}&background=FAF6EE&color=2C4219`}
                    alt="avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#E6E1D5]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedThreadDetail.authorName || 'User')}&background=FAF6EE&color=2C4219`;
                    }}
                  />
                  <div>
                    <p className="font-bold text-[#2C4219] text-sm sm:text-base">{selectedThreadDetail.authorName}</p>
                    <p className="text-xs text-[#7A7062] font-semibold">{selectedThreadDetail.timeAgo || '12 Okt 2026'}</p>
                  </div>
                </div>
                <h3 className="font-title font-bold text-lg sm:text-2xl text-[#2C4219]">{selectedThreadDetail.title}</h3>
                <div className="text-sm sm:text-base text-[#5C5246] whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedThreadDetail.content || selectedThreadDetail.summary }} />
              </div>

              {/* Komentar / Chat */}
              <div className="pt-6 border-t border-[#E6E1D5]">
                <h4 className="font-title font-bold text-base text-[#2C4219] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Komentar ({selectedThreadDetail.repliesCount || selectedThreadDetail.comments?.length || 0})
                </h4>
                
                {selectedThreadDetail.comments && selectedThreadDetail.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedThreadDetail.comments.map(comment => (
                      <div key={comment.id} className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E6E1D5] space-y-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={comment.authorAvatar ? ((comment.authorAvatar.startsWith('http') || comment.authorAvatar.startsWith('data:')) ? comment.authorAvatar : SERVER_BASE + comment.authorAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'User')}&background=E3EBD3&color=2C4219`}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border border-[#E6E1D5]"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'User')}&background=E3EBD3&color=2C4219`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-[#2C4219] text-xs sm:text-sm">{comment.authorName}</p>
                            <p className="text-[10px] sm:text-xs text-[#7A7062] font-semibold">{comment.timeAgo}</p>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-[#5C5246] whitespace-pre-wrap pl-10 sm:pl-[42px]">
                          <span dangerouslySetInnerHTML={{ __html: comment.content }} />
                          {comment.imageAttachments && comment.imageAttachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {comment.imageAttachments.map((img, i) => (
                                <button key={i} type="button" onClick={() => setSelectedImageDetail(img.startsWith('http') || img.startsWith('data:') ? img : SERVER_BASE + img)} className="block relative group overflow-hidden rounded-lg border border-[#E6E1D5]">
                                  <img src={img.startsWith('http') || img.startsWith('data:') ? img : SERVER_BASE + img} alt="attachment" className="h-20 w-auto object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {comment.documentAttachments && comment.documentAttachments.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {comment.documentAttachments.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-[#E6E1D5] group">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#7A7062]" />
                                    <span className="text-xs font-medium text-[#2C4219] line-clamp-1">{doc.name}</span>
                                  </div>
                                  <a href={doc.url.startsWith('http') || doc.url.startsWith('data:') ? doc.url : SERVER_BASE + doc.url} download target="_blank" rel="noreferrer" className="p-1.5 rounded-md text-[#7A7062] hover:text-[#2C4219] hover:bg-[#FAF6EE] opacity-0 group-hover:opacity-100 transition-all" title="Unduh">
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#E6E1D5] text-center">
                    <p className="text-sm text-[#7A7062] font-medium">Belum ada komentar pada diskusi ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Foto Penuh */}
      {selectedImageDetail && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImageDetail(null)}>
          <button 
            onClick={() => setSelectedImageDetail(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImageDetail} alt="Full detail" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
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
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#E6E1D5]">
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
                    Hapus {deleteConfirmModal.type === 'artikel' ? 'Artikel' : deleteConfirmModal.type === 'pengguna' ? 'Pengguna' : 'Agenda'}
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
                {deleteConfirmModal.type === 'artikel' ? 'Judul Artikel' : deleteConfirmModal.type === 'pengguna' ? 'Nama Pengguna' : 'Judul Agenda'}
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

      {/* Admin Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E1D5] flex md:hidden items-center justify-around pb-safe z-40">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'informasi', label: 'Informasi', icon: <FileText className="w-5 h-5" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-6 h-6" />, isProminent: true },
          { id: 'moderation', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'datasorgum', label: 'Data Sorgum', icon: <Sprout className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as AdminTab)}
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
    </div>
  );
};
