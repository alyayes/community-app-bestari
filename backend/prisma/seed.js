const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function seed() {
  // ── USERS ────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('sorgum123', 12);

  const admin = await p.user.upsert({
    where: { email: 'admin@kwtsorgum.id' },
    update: {},
    create: {
      name: 'Alya Permata',
      email: 'admin@kwtsorgum.id',
      password: adminHash,
      role: 'ADMIN',
      phone: '0812-3456-7890',
      memberSince: 'Januari 2024',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });
  console.log('Admin:', admin.email);

  await p.user.upsert({
    where: { email: 'anggota@kwtsorgum.id' },
    update: {},
    create: {
      name: 'Ibu Hj. Kartini',
      email: 'anggota@kwtsorgum.id',
      password: userHash,
      role: 'USER',
      phone: '0812-7890-4321',
      memberSince: 'Maret 2024',
      firstName: 'Hj. Kartini',
      lastName: 'Suharto',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });
  console.log('User:', 'anggota@kwtsorgum.id');

  // ── ARTIKEL ──────────────────────────────────────
  await p.artikel.deleteMany({});
  await p.artikel.createMany({
    data: [
      {
        title: 'Panen Sorgum Bersama',
        category: 'Panen',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
        summary: 'Panen Sorgum Bersama adalah agenda rutin Kelompok Wanita Tani (KWT) yang bertujuan untuk merayakan hasil kerja keras anggota dalam kurun waktu satu musim tanam.',
        content: JSON.stringify([
          'Panen Sorgum Bersama adalah agenda rutin Kelompok Wanita Tani (KWT) yang bertujuan untuk merayakan hasil kerja keras anggota dalam kurun waktu satu musim tanam. Kegiatan ini bukan sekadar memetik hasil bumi, melainkan simbol ketahanan pangan mandiri bagi desa kita.',
          'Tahun ini, kita memfokuskan pada varietas sorgum unggulan yang memiliki nilai gizi tinggi dan daya tahan cuaca yang lebih baik.',
        ]),
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
        ]),
        authorName: 'Sekretariat KWT Sorgum',
        authorRole: 'Pengurus Komunitas',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        location: 'Lahan Utama Blok A',
        participantsCount: 42,
        status: 'Published',
        createdAt: new Date('2026-10-17T08:00:00'),
      },
      {
        title: 'Workshop UMKM Desa',
        category: 'Inovasi',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200',
        summary: 'Pelatihan pembuatan olahan produk turunan tepung sorgum bernilai tinggi bagi pemasaran UMKM lokal.',
        content: JSON.stringify([
          'Workshop UMKM Desa diselenggarakan untuk membekali ibu-ibu tani dengan keterampilan mengolah tepung sorgum bebas gluten menjadi mie kering, biskuit, dan kue olahan sehat.',
        ]),
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        ]),
        authorName: 'Ibu Kartini',
        authorRole: 'Pengurus KWT',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        location: 'Balai Pertemuan Warga',
        participantsCount: 28,
        status: 'Published',
        createdAt: new Date('2026-09-23T08:00:00'),
      },
      {
        title: 'Pelatihan Ketahanan Pangan',
        category: 'Budidaya',
        image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200',
        summary: 'Program peningkatan kapasitas petani perempuan dalam pemanfaatan lahan pekarangan dan diversifikasi pangan.',
        content: JSON.stringify([
          'Pelatihan Ketahanan Pangan menghadirkan penyuluh pertanian lapangan untuk mengajarkan teknik budidaya sorgum tumpangsari dengan tanaman sayuran pekarangan.',
        ]),
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        ]),
        authorName: 'Ibu Siti',
        authorRole: 'Koordinator Lahan',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        location: 'Pusat Pembelajaran KWT',
        participantsCount: 35,
        status: 'Published',
        createdAt: new Date('2026-09-10T08:00:00'),
      },
      {
        title: 'Gotong Royong KWT',
        category: 'Pengetahuan',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
        summary: 'Aksi pembersihan rumput liar dan pemeliharaan saluran irigasi bersama anggota KWT Melati.',
        content: JSON.stringify([
          'Kegiatan gotong royong kerja bakti rutin mingguan dilakukan untuk menjaga kelancaran saluran air irigasi ke petak-petak lahan komunal.',
        ]),
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200',
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
        ]),
        authorName: 'Ibu Rahma',
        authorRole: 'Anggota KWT',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        location: 'Lahan Komunal RT 04',
        participantsCount: 50,
        status: 'Published',
        createdAt: new Date('2026-09-05T08:00:00'),
      },
    ],
  });
  console.log('Artikel: 4');

  // ── PENGUMUMAN ───────────────────────────────────
  await p.pengumuman.deleteMany({});
  await p.pengumuman.createMany({
    data: [
      {
        title: 'Workshop Olahan Tepung Sorgum Minggu Depan',
        category: 'PENTING',
        badgeColor: '#572E4A',
        postedBy: 'Admin',
        postedTime: '14:00 WIB',
        summary: 'Undangan bagi seluruh anggota untuk mempelajari teknik pengolahan butir sorgum menjadi tepung kualitas premium yang siap dipasarkan...',
        content: 'Sehubungan dengan hasil panen yang melimpah bulan lalu, KWT Sorgum bekerja sama dengan Dinas Pertanian akan menyelenggarakan workshop intensif pengolahan pangan.',
        bulletPoints: JSON.stringify([
          'Teknik penggilingan butir sorgum rendah tanin.',
          'Standardisasi kehalusan tepung untuk ekspor.',
          'Pembuatan premix kue dan roti bebas gluten.',
          'Strategi pengemasan dan labeling produk UMKM.',
        ]),
        eventDate: '15 Juli 2026',
        eventTime: '09:00 - Selesai',
        location: 'Aula Serbaguna Balai Desa',
        targetParticipants: 'Seluruh Anggota KWT & Umum',
        note: 'Peserta diharapkan membawa wadah sendiri untuk sampel tepung hasil praktek.',
        isUrgent: true,
        createdAt: new Date('2026-07-28T08:00:00'),
      },
      {
        title: 'Rekapitulasi Total Hasil Panen Periode Juli 2026',
        category: 'HASIL PANEN',
        badgeColor: '#A8B774',
        postedBy: 'Koordinator SCM',
        postedTime: '09:30 WIB',
        summary: 'Peningkatan sebesar 15% tercatat pada bulan ini dengan varietas Bioguma sebagai kontributor utama.',
        content: 'Total panen terkumpul mencapai 14.850 kg dari total 4 blok lahan utama. Mutu biji masuk kategori Super Premium sebesar 78%.',
        bulletPoints: JSON.stringify([
          'Lahan Blok A: 4.200 kg (Varietas Bioguma 1)',
          'Lahan Blok B: 3.850 kg (Varietas Numbu)',
          'Lahan Blok C: 3.600 kg (Varietas Bioguma 2)',
          'Lahan Blok D: 3.200 kg (Varietas Super 1)',
        ]),
        eventDate: '30 Juli 2026',
        eventTime: '10:00 WIB',
        location: 'Kantor Sekretariat KWT',
        targetParticipants: 'Pengurus & Koordinator Blok',
        isUrgent: false,
        createdAt: new Date('2026-07-27T08:00:00'),
      },
      {
        title: 'Pengambilan Benih Sorgum Varietas Unggul Baru',
        category: 'INFORMASI ANGGOTA',
        badgeColor: '#2C4219',
        postedBy: 'Pengurus Tani',
        postedTime: '11:15 WIB',
        summary: 'Anggota terdaftar dapat mulai mengambil jatah benih subsidi di Balai Desa mulai Senin depan dengan membawa kartu identitas...',
        content: 'Bantuan benih bersubsidi varietas Bioguma Agritan sebanyak 250 kg telah tersedia di Balai Desa. Setiap anggota berhak menerima jatah 5 kg per petak lahan.',
        bulletPoints: JSON.stringify([
          'Membawa KTP asli dan Kartu Anggota KWT.',
          'Pengambilan dibuka pkl 08:00 - 15:00 WIB.',
          'Pendampingan teknis penanaman diberikan oleh PPL Dinas.',
        ]),
        eventDate: '03 Agustus 2026',
        eventTime: '08:00 - 15:00 WIB',
        location: 'Balai Desa RT 04',
        targetParticipants: 'Seluruh Anggota Terdaftar',
        isUrgent: false,
        createdAt: new Date('2026-07-26T08:00:00'),
      },
      {
        title: 'Panen Raya Besok!',
        category: 'MENDESAK',
        badgeColor: '#572E4A',
        postedBy: 'Ketua Kelompok',
        postedTime: '07:00 WIB',
        summary: 'Seluruh anggota diharapkan berkumpul di Lahan Utama pukul 07:00 WIB. Mohon bawa peralatan panen masing-masing.',
        content: 'Apel persiapan panen raya blok A akan dimulai pukul 06.45 WIB. Diharapkan membawa sabit khusus dan wadah karung pengumpul.',
        eventDate: '28 Oktober 2026',
        eventTime: '07:00 WIB',
        location: 'Lahan Utama Blok A',
        targetParticipants: 'Seluruh Anggota KWT',
        isUrgent: true,
        createdAt: new Date('2026-10-27T08:00:00'),
      },
    ],
  });
  console.log('Pengumuman: 4');

  // ── AGENDA ───────────────────────────────────────
  await p.agenda.deleteMany({});
  await p.agenda.createMany({
    data: [
      {
        title: 'Workshop Pengolahan Tepung Sorgum',
        date: '2026-10-10',
        dayNumber: '10',
        monthAbbr: 'OKT',
        time: '09:00 - 12:00 WIB',
        location: 'Balai Desa Sukamaju',
        status: 'Belum dimulai',
        statusType: 'success',
        category: 'WORKSHOP KREATIF',
        description: 'Pelatihan praktis pembuatan tepung sorgum halus dan pengolahan menjadi produk kue kering bernilai jual tinggi untuk anggota kelompok.',
        organizer: 'Instruktur: KWT Sari (Dian Permata)',
        rundown: JSON.stringify([
          { time: '09:00 - 09:30 WIB', activity: 'Registrasi peserta & Pembagian Modul' },
          { time: '09:30 - 10:30 WIB', activity: 'Praktek Penepungan & Eliminasi Tanin' },
          { time: '10:30 - 11:45 WIB', activity: 'Demo Pembuatan Cookies & Premix Gluten-Free' },
          { time: '11:45 - 12:00 WIB', activity: 'Tanya Jawab, Sesi Cicip & Penutupan' },
        ]),
        requirements: JSON.stringify(['Membawa wadah/baskom bersih sendiri', 'Memakai masker dan apron/celemek kerja']),
        benefits: JSON.stringify(['Sampel Tepung Premix Bebas Gluten (500g)', 'Modul Resep Komprehensif Resep Olahan Sorgum']),
        targetParticipants: 'Anggota KWT & Pelaku UMKM Olahan Pangan Desa',
        quotaRegistered: 28,
        quotaMax: 40,
        contactName: 'Ibu Dian Permata',
        contactPhone: '0812-3456-7890',
        createdAt: new Date('2026-09-01T08:00:00'),
      },
      {
        title: 'Workshop Olah Sorgum',
        date: '2026-10-06',
        dayNumber: '06',
        monthAbbr: 'OKT',
        time: '08:30 - 11:30 WIB',
        location: 'Dapur Komunitas KWT',
        status: 'Belum dimulai',
        statusType: 'success',
        category: 'WORKSHOP',
        description: 'Bimbingan teknik perendaman dan penggilingan bulir sorgum bebas tanin untuk kebutuhan bahan baku usaha olahan desa.',
        organizer: 'Tim Pengolahan KWT',
        requirements: JSON.stringify(['Membawa kain saring / ayakan beras 80 mesh', 'Memakai sarung tangan plastik bersih']),
        benefits: JSON.stringify(['Bahan baku bulir sorgum 2kg untuk latihan', 'Akses mesin penepung mesin disk mill desa']),
        targetParticipants: 'Tim Pengolah Tepung & Anggota Kelompok Tani',
        quotaRegistered: 18,
        quotaMax: 25,
        contactName: 'Ibu Siti Aminah',
        contactPhone: '0857-1122-3344',
        createdAt: new Date('2026-08-20T08:00:00'),
      },
      {
        title: 'Panen Bersama Lahan Blok A',
        date: '2026-10-14',
        dayNumber: '14',
        monthAbbr: 'OKT',
        time: '07:00 WIB - Selesai',
        location: 'Lahan Percobaan Utama',
        status: 'Belum dimulai',
        statusType: 'warning',
        category: 'PANEN BERSAMA',
        description: 'Gotong royong pemetikan dan penimbangan sorgum varietas Bioguma 1 bersama seluruh anggota kelompok tani.',
        organizer: 'Koordinator Lahan Blok A',
        requirements: JSON.stringify(['Membawa sabit/pangkut panen sendiri', 'Membawa Karung goni/plastik 50kg minimal 5 buah', 'Memakai sepatu boots & topi caping']),
        benefits: JSON.stringify(['Konsumsi makan siang bersama warga tani', 'Pembagian bagi hasil panen babak awal']),
        targetParticipants: 'Seluruh Anggota KWT & Pemilik Lahan Tani',
        quotaRegistered: 42,
        quotaMax: 50,
        contactName: 'Pak Budi Santoso',
        contactPhone: '0813-8899-0011',
        createdAt: new Date('2026-08-15T08:00:00'),
      },
      {
        title: 'Pelatihan Kemasan & Branding',
        date: '2026-10-22',
        dayNumber: '22',
        monthAbbr: 'OKT',
        time: '09:00 - 12:00 WIB',
        location: 'Balai Pertemuan',
        status: 'Belum dimulai',
        statusType: 'success',
        category: 'PELATIHAN UMKM',
        description: 'Studi kasus branding produk olahan lokal, sertifikasi halal, dan pembuatan label pouch makanan kekinian.',
        organizer: 'Pendamping UMKM Desa',
        requirements: JSON.stringify(['Membawa contoh produk olahan yang ingin dikemas', 'Membawa smartphone ber-kamera']),
        benefits: JSON.stringify(['Template stiker logo & kemasan gratis', 'Panduan pendaftaran PIRT & sertifikasi Halal']),
        targetParticipants: 'Anggota KWT & Pengusaha Kuliner Desa',
        quotaRegistered: 15,
        quotaMax: 30,
        contactName: 'Ibu Ratna Suwandi',
        contactPhone: '0819-7766-5544',
        createdAt: new Date('2026-08-10T08:00:00'),
      },
      {
        title: 'Rapat Evaluasi Triwulan',
        date: '2026-11-04',
        dayNumber: '04',
        monthAbbr: 'NOV',
        time: '19:30 WIB',
        location: 'Kantor KWT Central',
        status: 'Selesai',
        statusType: 'neutral',
        category: 'RAPAT RUTIN',
        description: 'Evaluasi kinerja panen, pembacaan pembukuan kas bulanan, dan perencanaan alokasi pupuk organik musim tanam depan.',
        organizer: 'Pengurus Inti KWT',
        requirements: JSON.stringify(['Membawa kartu iuran bulanan']),
        benefits: JSON.stringify(['Laporan keuangan transparan & pembagian dividen']),
        targetParticipants: 'Seluruh Anggota Pengurus & Anggota Aktif KWT',
        quotaRegistered: 35,
        quotaMax: 40,
        contactName: 'Sekretariat KWT',
        contactPhone: '0812-9988-7766',
        createdAt: new Date('2026-08-05T08:00:00'),
      },
    ],
  });
  console.log('Agenda: 5');

  // ── THREAD / FORUM ───────────────────────────────
  await p.thread.deleteMany({});
  await p.threadComment.deleteMany({});

  const t1 = await p.thread.create({
    data: {
      title: 'Tips Mengatur Suhu Penjemuran Tepung Sorgum Supaya Tidak Lembab',
      authorName: 'Ibu Rahayu',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFTK8aL0lbmzdKkeh1Xei7BhbTIxg5tD8AN4PBL6g0dDKmy5XJvcPAJMKSVXNkyf8x8At48Z7gVlJEuXzBpQuV1brlyrkZPQhMP9wiQ-hzucdobhks645C-cNA21OlgNo4aaz9DHsLBkJyp6NOLhBv4d6SbT4BVEd1pTRL3P7EAxyvfEqARTMazTg1Nw_Ok7b_9iHFBQIYRb3pSR995e1ueq7FcsgLqZ3L8QPz8pSJa4PcRpNttgzk',
      authorRole: 'Pencetus Topik',
      isTopicStarter: true,
      category: 'Produksi & Pengolahan',
      categoryBadgeColor: '#2C4219',
      summary: 'Assalamualaikum ibu-ibu sekalian, saya mau berbagi pengalaman menjemur hasil gilingan sorgum minggu lalu.',
      content: 'Halo ibu-ibu semua, selamat siang. Saya ingin berbagi pengalaman sedikit tentang proses pengeringan tepung sorgum yang sedang kita jalankan di kelompok tani minggu ini. Kunci utama agar tepung tidak berjamur adalah konsistensi suhu. Usahakan suhu penjemuran stabil di angka 50-60 derajat Celcius.',
      images: JSON.stringify(['https://lh3.googleusercontent.com/aida-public/AB6AXuBoUSLBL3CKYo3UBs5q2T5Vzi0E5cXb6lharDyKrCl31S-5NzXWqOvJ9YP-HHCcUcEcw5ER6IiMN5hwf7Dlu-GM4jXmUck1NdwGUzAfX2N0nj9zsus9io_fXKN5hC9iQ-0R_YNomw-A_KKJIyHXu9reCC0hSdu7CKBVts5gDIOsZJZ2oxgkXnoVaL1ttD6N6PG_AuQyhBeiTgTE6n_F39NLJdwK1-M-NV2WYQ9BOX7W52xf0ioJNxEF']),
      joinedMembers: JSON.stringify(['Ibu Rahayu', 'Ibu Ani', 'Bpk. Slamet']),
      likes: 14,
      userLiked: true,
      createdAt: new Date('2026-10-28T10:00:00'),
    },
  });

  await p.threadComment.createMany({
    data: [
      {
        threadId: t1.id,
        parentId: null,
        authorName: 'Ibu Ani',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLDegp7OnAKHfldhbhLf_yUz0fec_FCyZYdsgJdr-NL05ceOUQPVfLdcaSxHOx-c1OcCYKdsdqmFSZtOJ-_J1mHsu77I7elJF3736zIk3vghu6auRwWXyuhwfLaHk2O3kTMhZc0Q0RaRhqLL7zJYJ57QDnWfphRIuT_4ZYp9UVGTUQZr8nu_J08acDo7u_1I93KS-tN_KQfY188ggXAZsXhgKU2zKgL_xFJFWT45O2781p4U4yueRX',
        authorRole: 'Anggota',
        content: 'Inspiratif sekali tipsnya Ibu Rahayu. Untuk penjemuran di bawah sinar matahari langsung, kira-kira berapa jam waktu yang paling ideal ya Bu?',
        likes: 3,
        userLiked: false,
        createdAt: new Date('2026-10-28T11:00:00'),
      },
      {
        threadId: t1.id,
        parentId: null,
        authorName: 'Bpk. Slamet',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmV2syczoj6bnhULJMAo--BunkDLT-wO6ZJoDCP4YUDP_72KqM15DCGlRKI1vd3dWFKNKN2ArXx2CQTBjNkzJ2bJ0fQp2bC-jkmRbEWjgTboZ5D9dMwxd4umqik9rE_9t2kTlJu-vMksqooMQlw8I6ERCUqVms-pKJ0P-KZ8MbSli8QaAizny4NL9w6Bhl7tiFOo-pJQ2tFeE3T-q9YqbQnQ5xfOd5Z3TtjNXqR9FQAbJfhfheivA5',
        authorRole: 'Anggota',
        content: 'Setuju sekali. Kualitas tepung kelompok kita memang sedang meningkat pesat sejak teknik ini diterapkan. Terima kasih Bu Rahayu sudah merangkumnya dengan jelas.',
        likes: 2,
        userLiked: false,
        createdAt: new Date('2026-10-28T12:00:00'),
      },
    ],
  });

  const t2 = await p.thread.create({
    data: {
      title: 'Kendala Pertumbuhan Sorgum di Lahan Blok B & Solusinya',
      authorName: 'Ibu Siti Aminah',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvlHIFyVd4QF3NG_VHJMp1NQ8FuZ4SUtAQeXTKZs1qghHh6sw-q90PURIbrf8dr07OtnIbwq7IKpAZagdYNGnlhNVt4XR3Cg1e6gbFQ81fnDH8DTvoExm5C4xjYutcz95yAm4x1SECwsik6CGRcWD8RRsS3FYbjAecKJsPPD4L82OFqguEVzUcYaxKzh71-0DdxAN_Ifv9N6JIoEPHw_wPxHHHZTvPF4hiNQ1eSo54LkzK8FWTGWkf',
      authorRole: 'Koordinator Lahan',
      isTopicStarter: true,
      category: 'Budidaya Lahan',
      categoryBadgeColor: '#572E4A',
      summary: 'Beberapa tanaman di Blok B menunjukkan gejala daun menguning. Hasil observasi awal menunjukkan adanya keterlambatan pemberian nutrisi...',
      content: 'Assalamualaikum warahmatullah. Mohon arahan dari ibu-ibu yang lebih berpengalaman. Daun muda pada beberapa rumpun sorgum di Blok B terlihat agak kekuningan di bagian tepi. Kami menduga ada kekurangan nitrogen karena genangan air hujan pekan lalu.',
      joinedMembers: JSON.stringify(['Ibu Siti Aminah', 'Ibu Kartini']),
      likes: 21,
      userLiked: false,
      createdAt: new Date('2026-10-28T07:00:00'),
    },
  });

  await p.threadComment.create({
    data: {
      threadId: t2.id,
      parentId: null,
      authorName: 'Ibu Kartini',
      authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrKGR-E18_9rN4ZvMn3Kq2Zh7zqu_IBCMTVJcDQiwKOrteZDr_s-MfqltXynca6kWz9IaxHqLNj_L5aLw2FoAC2SZdGHK0VrLoupDdB68JHRfBJCvG6Sq1THhfb_16wFwFX5Z5-TtX59BpWc3kFgU6xNklgMsVjAtmT9sjZ2b_DllBI1Cru0ruvPOFwU7E3ej0PV-v6uUTdTN_GkUWEsuo41QIwoKMsjHxdgFBJWvqVR32bDHvDQY9',
      authorRole: 'Ketua Kelompok',
      content: 'Bisa semprot POC ekstrak daun kelor dan urin kelinci yang sudah difermentasi Bu Siti. Coba takaran 100ml per tangki, semprot saat pagi hari.',
      likes: 6,
      userLiked: true,
      createdAt: new Date('2026-10-28T09:00:00'),
    },
  });

  console.log('Thread: 2 + komentar');

  // ── LAHAN ────────────────────────────────────────
  await p.lahan.deleteMany({});
  await p.lahan.createMany({
    data: [
      { blockName: 'Lahan Blok A (Lahan Utama)', cropVariety: 'Bioguma Agritan 1', areaSize: '1.8 Ha', plantingDate: '15 Juni 2026', expectedHarvestDate: '15 Oktober 2026', growthProgress: 92, status: 'Siap Panen', leaderName: 'Ibu Rahayu', estimatedYieldKg: 4200 },
      { blockName: 'Lahan Blok B (Sektor Barat)', cropVariety: 'Varietas Numbu', areaSize: '1.5 Ha', plantingDate: '01 Juli 2026', expectedHarvestDate: '01 November 2026', growthProgress: 68, status: 'Generatif', leaderName: 'Ibu Siti Aminah', estimatedYieldKg: 3850 },
      { blockName: 'Lahan Blok C (Sektor Timur)', cropVariety: 'Bioguma Agritan 2', areaSize: '1.2 Ha', plantingDate: '20 Juli 2026', expectedHarvestDate: '20 November 2026', growthProgress: 45, status: 'Vegetatif', leaderName: 'Ibu Ani', estimatedYieldKg: 3200 },
      { blockName: 'Lahan Blok D (Bukit Utara)', cropVariety: 'Varietas Super 1', areaSize: '1.0 Ha', plantingDate: '10 Mei 2026', expectedHarvestDate: '10 September 2026', growthProgress: 100, status: 'Pasca Panen', leaderName: 'Bpk. Slamet', estimatedYieldKg: 3600 },
    ],
  });
  console.log('Lahan: 4');

  // ── PANEN ────────────────────────────────────────
  await p.panen.deleteMany({});
  await p.panen.createMany({
    data: [
      { date: '28 Juli 2026', blockName: 'Lahan Blok D', cropVariety: 'Varietas Super 1', weightKg: 3600, quality: 'Super Premium', recordedBy: 'Bpk. Slamet', notes: 'Kandungan gula lumayan tinggi 14 brix, cocok untuk tepung dan nira.' },
      { date: '15 Juni 2026', blockName: 'Lahan Blok A', cropVariety: 'Bioguma 1', weightKg: 4100, quality: 'Grade A', recordedBy: 'Ibu Rahayu', notes: 'Butir malai sangat rapat, kadar air rendah.' },
    ],
  });
  console.log('Panen: 2');

  // ── BANNER ────────────────────────────────────────
  await p.banner.deleteMany({});
  await p.banner.createMany({
    data: [
      {
        title: 'Ladang Sorgum Subur Komunitas',
        tag: 'Komunitas Kelompok Wanita Tani Sorgum',
        desc: 'Pantau jadwal panen raya, rekapitulasi stok tepung, dan kabar terbaru dari pengurus desa dalam satu platform terpadu.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920',
        linkUrl: '/beranda',
        order: 1,
        isActive: true,
      },
      {
        title: 'Hasil Budidaya Bioguma Agritan High Yield',
        tag: 'Panen Raya KWT Melati Sorgum',
        desc: 'Pengolahan pasca-panen mandiri menjadi produk olahan bernilai tinggi bagi perekonomian warga desa.',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1920',
        linkUrl: '/dashboard',
        order: 2,
        isActive: true,
      },
      {
        title: 'Kemandirian Pangan Lokal Berkelanjutan',
        tag: 'Semangat Gotong Royong Desa',
        desc: 'Saling bahu membahu mendukung pengolahan tepung sorgum sehat bebas gluten untuk pasar nasional.',
        image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=1920',
        linkUrl: '/agenda',
        order: 3,
        isActive: true,
      },
    ],
  });
  console.log('Banner: 3');

  // ── HARGA PASAR ──────────────────────────────────
  await p.hargaPasar.deleteMany({});
  await p.hargaPasar.createMany({
    data: [
      { item: 'Tepung Sorgum Premium', price: 'Rp 25.000/kg', trend: 'up', percentage: '+5.2%', order: 1 },
      { item: 'Biji Sorgum Kupas', price: 'Rp 15.000/kg', trend: 'stable', percentage: '0.0%', order: 2 },
      { item: 'Biji Sorgum Pakan', price: 'Rp 6.000/kg', trend: 'down', percentage: '-1.5%', order: 3 },
      { item: 'Sorgum Gula (Sirup)', price: 'Rp 35.000/L', trend: 'up', percentage: '+2.1%', order: 4 },
    ],
  });
  console.log('Harga Pasar: 4');

  console.log('\n✅ SEED SELESAI');
  console.log('Login admin : admin@kwtsorgum.id / admin123');
  console.log('Login user  : anggota@kwtsorgum.id / sorgum123');
}

seed()
  .catch(e => { console.error('ERROR:', e); process.exit(1); })
  .finally(() => p.$disconnect());
