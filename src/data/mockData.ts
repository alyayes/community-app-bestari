import { UserProfile, InfoArticle, Announcement, AgendaEvent, ForumThread, LandPlot, HarvestRecord } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_01',
  name: 'Ibu Hj. Kartini',
  role: 'Anggota KWT Melati Sorgum',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  phone: '0812-7890-4321',
  lahanLocation: '',
  sorghumType: '',
  memberSince: 'Maret 2024',
  firstName: 'Hj. Kartini',
  lastName: 'Suharto',
  dob: '',
  email: 'kartini@kwt-melatisorgum.id',
  country: '',
  city: '',
  postalCode: ''
};

export const KWT_LEADER: UserProfile = {
  id: 'usr_00',
  name: 'Ibu Kartini',
  role: 'Ketua Kelompok',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrKGR-E18_9rN4ZvMn3Kq2Zh7zqu_IBCMTVJcDQiwKOrteZDr_s-MfqltXynca6kWz9IaxHqLNj_L5aLw2FoAC2SZdGHK0VrLoupDdB68JHRfBJCvG6Sq1THhfb_16wFwFX5Z5-TtX59BpWc3kFgU6xNklgMsVjAtmT9sjZ2b_DllBI1Cru0ruvPOFwU7E3ej0PV-v6uUTdTN_GkUWEsuo41QIwoKMsjHxdgFBJWvqVR32bDHvDQY9'
};

export const ADMIN_USER: UserProfile = {
  id: 'usr_admin',
  name: 'Alya Permata',
  role: 'Administrator',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  isAdmin: true
};

export const INITIAL_ARTICLES: InfoArticle[] = [
  {
    id: 'art_1',
    title: 'Panen Sorgum Bersama',
    category: 'Panen' as any,
    timeAgo: '2 Hari Lalu',
    date: 'Sabtu, 19 Oktober 2026',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    summary: 'Panen Sorgum Bersama adalah agenda rutin Kelompok Wanita Tani (KWT) yang bertujuan untuk merayakan hasil kerja keras anggota dalam kurun waktu satu musim tanam. Kegiatan ini bukan sekadar memetik hasil bumi, melainkan simbol ketahanan pangan mandiri bagi desa kita.',
    content: [
      'Panen Sorgum Bersama adalah agenda rutin Kelompok Wanita Tani (KWT) yang bertujuan untuk merayakan hasil kerja keras anggota dalam kurun waktu satu musim tanam. Kegiatan ini bukan sekadar memetik hasil bumi, melainkan simbol ketahanan pangan mandiri bagi desa kita.',
      'Tahun ini, kita memfokuskan pada varietas sorgum unggulan yang memiliki nilai gizi tinggi dan daya tahan cuaca yang lebih baik. Hasil panen akan didistribusikan untuk kebutuhan konsumsi lokal serta diproses menjadi tepung sorgum berkualitas tinggi untuk dipasarkan melalui unit usaha kreatif KWT.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    location: 'Lahan Utama Blok A',
    author: {
      name: 'Sekretariat KWT Sorgum',
      role: 'Pengurus Komunitas',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    }
  },
  {
    id: 'art_2',
    title: 'Workshop UMKM Desa',
    category: 'Inovasi' as any,
    timeAgo: '5 Hari Lalu',
    date: 'Rabu, 25 September 2026',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200',
    summary: 'Pelatihan pembuatan olahan produk turunan tepung sorgum bernilai tinggi bagi pemasaran UMKM lokal.',
    content: [
      'Workshop UMKM Desa diselenggarakan untuk membekali ibu-ibu tani dengan keterampilan mengolah tepung sorgum bebas gluten menjadi mie kering, biskuit, dan kue olahan sehat.',
      'Melalui diversifikasi produk ini, hasil panen warga memiliki nilai tambah ekonomi yang berkali lipat saat dipasarkan di pameran UMKM daerah.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    location: 'Balai Pertemuan Warga',
    author: {
      name: 'Ibu Kartini',
      role: 'Pengurus KWT',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  },
  {
    id: 'art_3',
    title: 'Pelatihan Ketahanan Pangan',
    category: 'Budidaya' as any,
    timeAgo: '1 Minggu Lalu',
    date: 'Kamis, 10 September 2026',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200',
    summary: 'Program peningkatan kapasitas petani perempuan dalam pemanfaatan lahan pekarangan dan diversifikasi pangan.',
    content: [
      'Pelatihan Ketahanan Pangan menghadirkan penyuluh pertanian lapangan untuk mengajarkan teknik budidaya sorgum tumpangsari dengan tanaman sayuran pekarangan.',
      'Diharapkan setiap rumah tangga petani dapat memenuhi kebutuhan nutrisi keluarga secara mandiri dari pekarangan rumah.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    location: 'Pusat Pembelajaran KWT',
    author: {
      name: 'Ibu Siti',
      role: 'Koordinator Lahan',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
    }
  },
  {
    id: 'art_4',
    title: 'Gotong Royong KWT',
    category: 'Pengetahuan' as any,
    timeAgo: '2 Minggu Lalu',
    date: 'Selasa, 05 September 2026',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
    summary: 'Aksi pembersihan rumput liar dan pemeliharaan saluran irigasi bersama anggota KWT Melati.',
    content: [
      'Kegiatan gotong royong kerja bakti rutin mingguan dilakukan untuk menjaga kelancaran saluran air irigasi ke petak-petak lahan komunal.',
      'Kebersamaan ini mempererat tali silaturahmi antar ibu tani sekaligus memastikan tanaman sorgum tumbuh optimal tanpa gangguan gulma.'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800'
    ],
    location: 'Lahan Komunal RT 04',
    author: {
      name: 'Ibu Rahma',
      role: 'Anggota KWT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Workshop Olahan Tepung Sorgum Minggu Depan',
    category: 'PENTING',
    badgeColor: '#572E4A',
    timeAgo: '2 jam yang lalu',
    postedBy: 'Admin',
    postedTime: '14:00 WIB',
    summary: 'Undangan bagi seluruh anggota untuk mempelajari teknik pengolahan butir sorgum menjadi tepung kualitas premium yang siap dipasarkan...',
    content: 'Sehubungan dengan hasil panen yang melimpah bulan lalu, KWT Sorgum bekerja sama dengan Dinas Pertanian akan menyelenggarakan workshop intensif pengolahan pangan.',
    bulletPoints: [
      'Teknik penggilingan butir sorgum rendah tanin.',
      'Standardisasi kehalusan tepung untuk ekspor.',
      'Pembuatan premix kue dan roti bebas gluten.',
      'Strategi pengemasan dan labeling produk UMKM.'
    ],
    eventDate: '15 Juli 2026',
    eventTime: '09:00 - Selesai',
    location: 'Aula Serbaguna Balai Desa',
    targetParticipants: 'Seluruh Anggota KWT & Umum',
    note: 'Peserta diharapkan membawa wadah sendiri untuk sampel tepung hasil praktek. Pendaftaran ditutup 2 hari sebelum acara.',
    isUrgent: true
  },
  {
    id: 'ann_2',
    title: 'Rekapitulasi Total Hasil Panen Periode Juli 2026',
    category: 'HASIL PANEN',
    badgeColor: '#A8B774',
    timeAgo: 'Kemarin',
    postedBy: 'Koordinator SCM',
    postedTime: '09:30 WIB',
    summary: 'Peningkatan sebesar 15% tercatat pada bulan ini dengan varietas Bioguma sebagai kontributor utama. Laporan lengkap tersaji untuk transparansi...',
    content: 'Total panen terkumpul mencapai 14.850 kg dari total 4 blok lahan utama. Mutu biji masuk kategori Super Premium sebesar 78%.',
    bulletPoints: [
      'Lahan Blok A: 4.200 kg (Varietas Bioguma 1)',
      'Lahan Blok B: 3.850 kg (Varietas Numbu)',
      'Lahan Blok C: 3.600 kg (Varietas Bioguma 2)',
      'Lahan Blok D: 3.200 kg (Varietas Super 1)'
    ],
    eventDate: '30 Juli 2026',
    eventTime: '10:00 WIB',
    location: 'Kantor Sekretariat KWT',
    targetParticipants: 'Pengurus & Koordinator Blok'
  },
  {
    id: 'ann_3',
    title: 'Pengambilan Benih Sorgum Varietas Unggul Baru',
    category: 'INFORMASI ANGGOTA',
    badgeColor: '#2C4219',
    timeAgo: '3 hari yang lalu',
    postedBy: 'Pengurus Tani',
    postedTime: '11:15 WIB',
    summary: 'Anggota terdaftar dapat mulai mengambil jatah benih subsidi di Balai Desa mulai Senin depan dengan membawa kartu identitas...',
    content: 'Bantuan benih bersubsidi varietas Bioguma Agritan sebanyak 250 kg telah tersedia di Balai Desa. Setiap anggota berhak menerima jatah 5 kg per petak lahan.',
    bulletPoints: [
      'Membawa KTP asli dan Kartu Anggota KWT.',
      'Pengambilan dibuka pkl 08:00 - 15:00 WIB.',
      'Pendampingan teknis penanaman diberikan oleh PPL Dinas.'
    ],
    eventDate: '03 Agustus 2026',
    eventTime: '08:00 - 15:00 WIB',
    location: 'Balai Desa RT 04',
    targetParticipants: 'Seluruh Anggota Terdaftar'
  },
  {
    id: 'ann_4',
    title: 'Panen Raya Besok!',
    category: 'MENDESAK',
    badgeColor: '#572E4A',
    timeAgo: '4 jam yang lalu',
    postedBy: 'Ketua Kelompok',
    postedTime: '07:00 WIB',
    summary: 'Seluruh anggota diharapkan berkumpul di Lahan Utama pukul 07:00 WIB. Mohon bawa peralatan panen masing-masing.',
    content: 'Apel persiapapan panen raya blok A akan dimulai pukul 06.45 WIB. Diharapkan membawa sabit khusus dan wadah karung pengumpul.',
    eventDate: '28 Oktober 2026',
    eventTime: '07:00 WIB',
    location: 'Lahan Utama Blok A',
    targetParticipants: 'Seluruh Anggota KWT',
    isUrgent: true
  }
];

export const INITIAL_EVENTS: AgendaEvent[] = [
  {
    id: 'ev_10',
    title: 'Workshop Pengolahan Tepung Sorgum',
    date: '2026-10-10',
    dayNumber: '10',
    monthAbbr: 'OKT',
    time: '09:00 - 12:00 WIB',
    location: 'Balai Desa Sukamaju',
    status: 'Terbuka Umum',
    statusType: 'success',
    category: 'WORKSHOP KREATIF',
    description: 'Pelatihan praktis pembuatan tepung sorgum halus dan pengolahan menjadi produk kue kering bernilai jual tinggi untuk anggota kelompok.',
    organizer: 'Instruktur: KWT Sari (Dian Permata)',
    targetParticipants: 'Anggota KWT & Pelaku UMKM Olahan Pangan Desa',
    quota: { registered: 28, max: 40 },
    contactPerson: { name: 'Ibu Dian Permata', phone: '0812-3456-7890' },
    requirements: [
      'Membawa wadah/baskom bersih sendiri',
      'Memakai masker dan apron/celemek kerja',
      'Membawa catatan atau smartphone untuk dokumentasi'
    ],
    benefits: [
      'Sampel Tepung Premix Bebas Gluten (500g)',
      'Modul Resep Komprehensif Resep Olahan Sorgum',
      'Sertifikat Pelatihan KWT Central'
    ],
    rundown: [
      { time: '09:00 - 09:30 WIB', activity: 'Registrasi peserta & Pembagian Modul' },
      { time: '09:30 - 10:30 WIB', activity: 'Praktek Penepungan & Eliminasi Tanin' },
      { time: '10:30 - 11:45 WIB', activity: 'Demo Pembuatan Cookies & Premix Gluten-Free' },
      { time: '11:45 - 12:00 WIB', activity: 'Tanya Jawab, Sesi Cicip & Penutupan' }
    ]
  },
  {
    id: 'ev_6',
    title: 'Workshop Olah Sorgum',
    date: '2026-10-06',
    dayNumber: '06',
    monthAbbr: 'OKT',
    time: '08:30 - 11:30 WIB',
    location: 'Dapur Komunitas KWT',
    status: 'Pendaftaran Dibuka',
    statusType: 'success',
    category: 'WORKSHOP',
    description: 'Bimbingan teknik perendaman dan penggilingan bulir sorgum bebas tanin untuk kebutuhan bahan baku usaha olahan desa.',
    organizer: 'Tim Pengolahan KWT',
    targetParticipants: 'Tim Pengolah Tepung & Anggota Kelompok Tani',
    quota: { registered: 18, max: 25 },
    contactPerson: { name: 'Ibu Siti Aminah', phone: '0857-1122-3344' },
    requirements: [
      'Membawa kain saring / ayakan beras 80 mesh',
      'Memakai sarung tangan plastik bersih'
    ],
    benefits: [
      'Bahan baku bulir sorgum 2kg untuk latihan',
      'Akses mesin penepung mesin disk mill desa'
    ],
    rundown: [
      { time: '08:30 - 09:00 WIB', activity: 'Pengenalan kadar air ideal bulir panen' },
      { time: '09:00 - 10:30 WIB', activity: 'Proses sosoh & penggilingan halus' },
      { time: '10:30 - 11:30 WIB', activity: 'Penyaringan & pengemasan vakum' }
    ]
  },
  {
    id: 'ev_14',
    title: 'Panen Bersama Lahan Blok A',
    date: '2026-10-14',
    dayNumber: '14',
    monthAbbr: 'OKT',
    time: '07:00 WIB - Selesai',
    location: 'Lahan Percobaan Utama',
    status: 'Wajib Hadir',
    statusType: 'warning',
    category: 'PANEN BERSAMA',
    description: 'Gotong royong pemetikan dan penimbangan sorgum varietas Bioguma 1 bersama seluruh anggota kelompok tani.',
    organizer: 'Koordinator Lahan Blok A',
    targetParticipants: 'Seluruh Anggota KWT & Pemilik Lahan Tani',
    quota: { registered: 42, max: 50 },
    contactPerson: { name: 'Pak Budi Santoso', phone: '0813-8899-0011' },
    requirements: [
      'Membawa sabit/pangkut panen sendiri',
      'Membawa Karung goni/plastik 50kg minimal 5 buah',
      'Memakai sepatu boots & topi caping'
    ],
    benefits: [
      'Konsumsi makan siang bersama warga tani',
      'Pembagian bagi hasil panen babak awal'
    ],
    rundown: [
      { time: '07:00 - 07:30 WIB', activity: 'Apel pagi & pembagian kavling petik' },
      { time: '07:30 - 10:30 WIB', activity: 'Proses pangkas malai & sortir awal' },
      { time: '10:30 - 11:30 WIB', activity: 'Penimbangan & perontokan bulir' },
      { time: '11:30 - Selesai', activity: 'Makan siang & pencatatan SCM Desa' }
    ]
  },
  {
    id: 'ev_22',
    title: 'Pelatihan Kemasan & Branding',
    date: '2026-10-22',
    dayNumber: '22',
    monthAbbr: 'OKT',
    time: '09:00 - 12:00 WIB',
    location: 'Balai Pertemuan',
    status: 'Pendaftaran Dibuka',
    statusType: 'success',
    category: 'PELATIHAN UMKM',
    description: 'Studi kasus branding produk olahan lokal, sertifikasi halal, dan pembuatan label pouch makanan kekinian.',
    organizer: 'Pendamping UMKM Desa',
    targetParticipants: 'Anggota KWT & Pengusaha Kuliner Desa',
    quota: { registered: 15, max: 30 },
    contactPerson: { name: 'Ibu Ratna Suwandi', phone: '0819-7766-5544' },
    requirements: [
      'Membawa contoh produk olahan yang ingin dikemas',
      'Membawa smartphone ber-kamera'
    ],
    benefits: [
      'Template stiker logo & kemasan gratis',
      'Panduan pendaftaran PIRT & sertifikasi Halal'
    ],
    rundown: [
      { time: '09:00 - 10:00 WIB', activity: 'Materi standar kemasan food-grade' },
      { time: '10:00 - 11:30 WIB', activity: 'Praktek desain label & foto produk' },
      { time: '11:30 - 12:00 WIB', activity: 'Klinik konsultasi legalitas usaha' }
    ]
  },
  {
    id: 'ev_nov4',
    title: 'Rapat Evaluasi Triwulan',
    date: '2026-11-04',
    dayNumber: '04',
    monthAbbr: 'NOV',
    time: '19:30 WIB',
    location: 'Kantor KWT Central',
    status: 'Wajib Hadir',
    statusType: 'neutral',
    category: 'RAPAT RUTIN',
    description: 'Evaluasi kinerja panen, pembacaan pembukuan kas bulanan, dan perencanaan alokasi pupuk organik musim tanam depan.',
    organizer: 'Pengurus Inti KWT',
    targetParticipants: 'Seluruh Anggota Pengurus & Anggota Aktif KWT',
    quota: { registered: 35, max: 40 },
    contactPerson: { name: 'Sekretariat KWT', phone: '0812-9988-7766' },
    requirements: ['Membawa kartu iuran bulanan'],
    benefits: ['Laporan keuangan transparan & pembagian dividen'],
    rundown: [
      { time: '19:30 - 20:00 WIB', activity: 'Pembacaan Laporan Keuangan' },
      { time: '20:00 - 21:00 WIB', activity: 'Diskusi Alokasi Pupuk & Rencana Tanam' },
      { time: '21:00 - Selesai', activity: 'Pengesahan Keputusan & Ramah Tamah' }
    ]
  }
];

export const INITIAL_THREADS: ForumThread[] = [
  {
    id: 'th_1',
    title: 'Tips Mengatur Suhu Penjemuran Tepung Sorgum Supaya Tidak Lembab',
    authorName: 'Ibu Rahayu',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFTK8aL0lbmzdKkeh1Xei7BhbTIxg5tD8AN4PBL6g0dDKmy5XJvcPAJMKSVXNkyf8x8At48Z7gVlJEuXzBpQuV1brlyrkZPQhMP9wiQ-hzucdobhks645C-cNA21OlgNo4aaz9DHsLBkJyp6NOLhBv4d6SbT4BVEd1pTRL3P7EAxyvfEqARTMazTg1Nw_Ok7b_9iHFBQIYRb3pSR995e1ueq7FcsgLqZ3L8QPz8pSJa4PcRpNttgzk',
    authorRole: 'Pencetus Topik',
    isTopicStarter: true,
    timeAgo: '2 jam lalu',
    category: 'Produksi & Pengolahan',
    categoryBadgeColor: '#2C4219',
    summary: 'Assalamu\'alaikum ibu-ibu sekalian, saya mau berbagi pengalaman menjemur hasil gilingan sorgum minggu lalu. Kuncinya ada pada alas yang kita gunakan agar udara berputar...',
    content: 'Halo ibu-ibu semua, selamat siang. Saya ingin berbagi pengalaman sedikit tentang proses pengeringan tepung sorgum yang sedang kita jalankan di kelompok tani minggu ini.\n\nKunci utama agar tepung tidak berjamur adalah konsistensi suhu. Usahakan suhu penjemuran stabil di angka 50-60 derajat Celcius. Jika terlalu panas, bagian luar akan mengeras namun dalam masih basah (case hardening). Jika kurang panas, kelembaban udara akan memicu tumbuhnya jamur.\n\nSaya sarankan menggunakan alas kain tipis di atas tampah untuk sirkulasi udara yang lebih merata. Mari kita diskusikan cara terbaik lainnya!',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoUSLBL3CKYo3UBs5q2T5Vzi0E5cXb6lharDyKrCl31S-5NzXWqOvJ9YP-HHCcUcEcw5ER6IiMN5hwf7Dlu-GM4jXmUck1NdwGUzAfX2N0nj9zsus9io_fXKN5hC9iQ-0R_YNomw-A_KKJIyHXu9reCC0hSdu7CKBVts5gDIOsZJZ2oxgkXnoVaL1ttD6N6PG_AuQyhBeiTgTE6n_F39NLJdwK1-M-NV2WYQ9BOX7W52xf0ioJNxEF'
    ],
    joinedMembers: ['Ibu Rahayu', 'Ibu Ani', 'Bpk. Slamet'],
    likes: 14,
    userLiked: true,
    repliesCount: 8,
    comments: [
      {
        id: 'c_1',
        authorName: 'Ibu Ani',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLDegp7OnAKHfldhbhLf_yUz0fec_FCyZYdsgJdr-NL05ceOUQPVfLdcaSxHOx-c1OcCYKdsdqmFSZtOJ-_J1mHsu77I7elJF3736zIk3vghu6auRwWXyuhwfLaHk2O3kTMhZc0Q0RaRhqLL7zJYJ57QDnWfphRIuT_4ZYp9UVGTUQZr8nu_J08acDo7u_1I93KS-tN_KQfY188ggXAZsXhgKU2zKgL_xFJFWT45O2781p4U4yueRX',
        timeAgo: '1j yang lalu',
        content: 'Inspiratif sekali tipsnya Ibu Rahayu. Untuk penjemuran di bawah sinar matahari langsung, kira-kira berapa jam waktu yang paling ideal ya Bu? Kadang cuaca tidak menentu di sore hari.',
        likes: 3,
        userLiked: false,
        replies: [
          {
            id: 'c_1_1',
            authorName: 'Ibu Rahayu',
            authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFTK8aL0lbmzdKkeh1Xei7BhbTIxg5tD8AN4PBL6g0dDKmy5XJvcPAJMKSVXNkyf8x8At48Z7gVlJEuXzBpQuV1brlyrkZPQhMP9wiQ-hzucdobhks645C-cNA21OlgNo4aaz9DHsLBkJyp6NOLhBv4d6SbT4BVEd1pTRL3P7EAxyvfEqARTMazTg1Nw_Ok7b_9iHFBQIYRb3pSR995e1ueq7FcsgLqZ3L8QPz8pSJa4PcRpNttgzk',
            authorRole: 'Penulis',
            isAuthor: true,
            timeAgo: '45m yang lalu',
            content: 'Pertanyaan bagus Ibu Ani. Waktu ideal biasanya antara jam 10 pagi sampai jam 2 siang saat matahari paling terik. Cukup 4 jam saja per sesi, lalu diangin-anginkan. Jika mendung, segera amankan ke dalam wadah kedap udara ya!',
            likes: 5,
            userLiked: true
          }
        ]
      },
      {
        id: 'c_2',
        authorName: 'Bpk. Slamet',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmV2syczoj6bnhULJMAo--BunkDLT-wO6ZJoDCP4YUDP_72KqM15DCGlRKI1vd3dWFKNKN2ArXx2CQTBjNkzJ2bJ0fQp2bC-jkmRbEWjgTboZ5D9dMwxd4umqik9rE_9t2kTlJu-vMksqooMQlw8I6ERCUqVms-pKJ0P-KZ8MbSli8QaAizny4NL9w6Bhl7tiFOo-pJQ2tFeE3T-q9YqbQnQ5xfOd5Z3TtjNXqR9FQAbJfhfheivA5',
        timeAgo: '30m yang lalu',
        content: 'Setuju sekali. Kualitas tepung kelompok kita memang sedang meningkat pesat sejak teknik ini diterapkan. Terima kasih Bu Rahayu sudah merangkumnya dengan jelas.',
        likes: 2,
        userLiked: false
      }
    ]
  },
  {
    id: 'th_2',
    title: 'Kendala Pertumbuhan Sorgum di Lahan Blok B & Solusinya',
    authorName: 'Ibu Siti Aminah',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvlHIFyVd4QF3NG_VHJMp1NQ8FuZ4SUtAQeXTKZs1qghHh6sw-q90PURIbrf8dr07OtnIbwq7IKpAZagdYNGnlhNVt4XR3Cg1e6gbFQ81fnDH8DTvoExm5C4xjYutcz95yAm4x1SECwsik6CGRcWD8RRsS3FYbjAecKJsPPD4L82OFqguEVzUcYaxKzh71-0DdxAN_Ifv9N6JIoEPHw_wPxHHHZTvPF4hiNQ1eSo54LkzK8FWTGWkf',
    authorRole: 'Koordinator Lahan',
    timeAgo: '5 jam lalu',
    category: 'Budidaya Lahan',
    categoryBadgeColor: '#572E4A',
    summary: 'Beberapa tanaman di Blok B menunjukkan gejala daun menguning. Hasil observasi awal menunjukkan adanya keterlambatan pemberian nutrisi...',
    content: 'Assalamu\'alaikum warahmatullah. Mohon arahan dari ibu-ibu yang lebih berpengalaman. Daun muda pada beberapa rumpun sorgum di Blok B terlihat agak kekuningan di bagian tepi. Kami menduga ada kekurangan nitrogen karena genangan air hujan pekan lalu. Apakah ada saran pupuk cair organik yang ramah dan cepat diserap?',
    joinedMembers: ['Ibu Siti Aminah', 'Ibu Kartini'],
    likes: 21,
    userLiked: false,
    repliesCount: 12,
    comments: [
      {
        id: 'c_2_1',
        authorName: 'Ibu Kartini',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrKGR-E18_9rN4ZvMn3Kq2Zh7zqu_IBCMTVJcDQiwKOrteZDr_s-MfqltXynca6kWz9IaxHqLNj_L5aLw2FoAC2SZdGHK0VrLoupDdB68JHRfBJCvG6Sq1THhfb_16wFwFX5Z5-TtX59BpWc3kFgU6xNklgMsVjAtmT9sjZ2b_DllBI1Cru0ruvPOFwU7E3ej0PV-v6uUTdTN_GkUWEsuo41QIwoKMsjHxdgFBJWvqVR32bDHvDQY9',
        timeAgo: '2j yang lalu',
        content: 'Bisa semprot POC ekstrak daun kelor dan urin kelinci yang sudah difermentasi Bu Siti. Coba takaran 100ml per tangki, semprot saat pagi hari.',
        likes: 6,
        userLiked: true
      }
    ]
  }
];

export const INITIAL_LAND_PLOTS: LandPlot[] = [
  {
    id: 'plot_A',
    blockName: 'Lahan Blok A (Lahan Utama)',
    cropVariety: 'Bioguma Agritan 1',
    areaSize: '1.8 Ha',
    plantingDate: '15 Juni 2026',
    expectedHarvestDate: '15 Oktober 2026',
    growthProgress: 92,
    status: 'Siap Panen',
    leaderName: 'Ibu Rahayu',
    estimatedYieldKg: 4200
  },
  {
    id: 'plot_B',
    blockName: 'Lahan Blok B (Sektor Barat)',
    cropVariety: 'Varietas Numbu',
    areaSize: '1.5 Ha',
    plantingDate: '01 Juli 2026',
    expectedHarvestDate: '01 November 2026',
    growthProgress: 68,
    status: 'Generatif',
    leaderName: 'Ibu Siti Aminah',
    estimatedYieldKg: 3850
  },
  {
    id: 'plot_C',
    blockName: 'Lahan Blok C (Sektor Timur)',
    cropVariety: 'Bioguma Agritan 2',
    areaSize: '1.2 Ha',
    plantingDate: '20 Juli 2026',
    expectedHarvestDate: '20 November 2026',
    growthProgress: 45,
    status: 'Vegetatif',
    leaderName: 'Ibu Ani',
    estimatedYieldKg: 3200
  },
  {
    id: 'plot_D',
    blockName: 'Lahan Blok D (Bukit Utara)',
    cropVariety: 'Varietas Super 1',
    areaSize: '1.0 Ha',
    plantingDate: '10 Mei 2026',
    expectedHarvestDate: '10 September 2026',
    growthProgress: 100,
    status: 'Pasca Panen',
    leaderName: 'Bpk. Slamet',
    estimatedYieldKg: 3600
  }
];

export const INITIAL_HARVEST_RECORDS: HarvestRecord[] = [
  {
    id: 'hr_1',
    date: '28 Juli 2026',
    blockName: 'Lahan Blok D',
    cropVariety: 'Varietas Super 1',
    weightKg: 3600,
    quality: 'Super Premium',
    recordedBy: 'Bpk. Slamet',
    notes: 'Kandungan gula lumayan tinggi 14 brix, cocok untuk tepung dan nira.'
  },
  {
    id: 'hr_2',
    date: '15 Juni 2026',
    blockName: 'Lahan Blok A',
    cropVariety: 'Bioguma 1',
    weightKg: 4100,
    quality: 'Grade A',
    recordedBy: 'Ibu Rahayu',
    notes: 'Butir malai sangat rapat, kadar air rendah.'
  }
];
