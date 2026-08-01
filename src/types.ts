export type NavItem = 'beranda' | 'agenda' | 'informasi' | 'pengumuman' | 'diskusi' | 'dashboard';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAdmin?: boolean;
  phone?: string;
  lahanLocation?: string;
  sorghumType?: string;
  memberSince?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  country?: string;
  city?: string;
  postalCode?: string;
}

export interface InfoArticle {
  id: string;
  title: string;
  category: 'Budidaya' | 'Inovasi' | 'Pengetahuan' | 'Panen';
  timeAgo: string;
  date: string;
  image: string;
  summary: string;
  content?: string[];
  gallery?: string[];
  author?: {
    name: string;
    role: string;
    avatar: string;
  };
  location?: string;
  participantsCount?: number;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'PENTING' | 'HASIL PANEN' | 'INFORMASI ANGGOTA' | 'MENDESAK';
  badgeColor: string; // hex or tailwind class
  timeAgo: string;
  postedBy: string;
  postedTime: string;
  summary: string;
  content: string;
  bulletPoints?: string[];
  eventDate?: string;
  eventTime?: string;
  location?: string;
  targetParticipants?: string;
  note?: string;
  isUrgent?: boolean;
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // e.g. "2026-07-28"
  dayNumber: string; // e.g. "28"
  monthAbbr: string; // e.g. "OKT" or "JUL"
  time: string;
  location: string;
  status: 'Pendaftaran Dibuka' | 'Wajib Hadir' | 'Menunggu Konfirmasi' | 'Terbuka Umum' | 'Selesai';
  statusType: 'success' | 'warning' | 'neutral' | 'info';
  category: string;
  description: string;
  organizer: string;
  rundown?: { time: string; activity: string }[];
  requirements?: string[];
  benefits?: string[];
  targetParticipants?: string;
  quota?: { registered: number; max: number };
  contactPerson?: { name: string; phone: string };
}

export interface ForumComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  isAuthor?: boolean;
  timeAgo: string;
  content: string;
  likes: number;
  userLiked?: boolean;
  replies?: ForumComment[];
}

export interface ForumThread {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  isTopicStarter?: boolean;
  timeAgo: string;
  category: 'Produksi & Pengolahan' | 'Budidaya Lahan' | 'Pemasaran & UMKM' | 'Informasi Umum';
  categoryBadgeColor: string;
  summary: string;
  content: string;
  images?: string[];
  groupAvatar?: string;
  allowMemberMessages?: boolean;
  joinedMembers?: string[];
  likes: number;
  userLiked?: boolean;
  repliesCount: number;
  comments: ForumComment[];
}

export interface LandPlot {
  id: string;
  blockName: string;
  cropVariety: string;
  areaSize: string; // e.g. "1.2 Ha"
  plantingDate: string;
  expectedHarvestDate: string;
  growthProgress: number; // 0 - 100
  status: 'Vegetatif' | 'Generatif' | 'Siap Panen' | 'Pasca Panen';
  leaderName: string;
  estimatedYieldKg: number;
}

export interface HarvestRecord {
  id: string;
  date: string;
  blockName: string;
  cropVariety: string;
  weightKg: number;
  quality: 'Super Premium' | 'Grade A' | 'Grade B';
  recordedBy: string;
  notes: string;
}
