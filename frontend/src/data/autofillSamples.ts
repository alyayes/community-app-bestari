// Data contoh untuk tombol "Isi Otomatis" di form admin.
// Informasi: fakta dari sumber publik (link sumber dicantumkan di isi artikel).
// Agenda & Diskusi: contoh buatan (bebas), tanggal agenda dihitung relatif dari hari ini.

export type ArtCategory = 'Budidaya' | 'Inovasi' | 'Pengetahuan' | 'Panen';

export interface ArticleSample { title: string; category: ArtCategory; content: string }
export interface AgendaSample {
  title: string; category: string; daysFromNow: number; start: string; end: string;
  location: string; organizer: string; description: string; target: string;
  contactName: string; contactPhone: string; requirements: string; benefits: string; quota: number;
}
// category = value <option> di CreateTopicModal
export interface ThreadSample { title: string; category: string; content: string }

const src = (label: string, url: string) =>
  `<p><em>Sumber: <a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></em></p>`;

export const ARTICLE_SAMPLES: ArticleSample[] = [
  {
    title: 'Kampung Sorgum Bojongmanggu, Penghasil Sorgum Ratusan Ton Di Kabupaten Bandung',
    category: 'Panen',
    content:
      '<p>Di Jalan Bojongkoneng No. 2, Desa Bojongmanggu, Kecamatan Pameungpeuk, Kabupaten Bandung, terdapat Kampung Sorgum yang sudah menghasilkan sorgum hingga ratusan ton.</p>' +
      '<p>Sorgum dibudidayakan sebagai tanaman pangan alternatif pengganti gandum, sejalan dengan dorongan pemerintah sejak Juni 2022 untuk memperluas penanaman sorgum.</p>' +
      src('Kompas.com, 30 Agustus 2022', 'https://bandung.kompas.com/read/2022/08/30/200503378/bandung-punya-kampung-sorgum-hasilkan-tanaman-pengganti-gandum-hingga'),
  },
  {
    title: 'Sejarah KWT Melati Dan Abah Sorgum Di Desa Bojongmanggu',
    category: 'Pengetahuan',
    content:
      '<p>Kampung Sorgum dirintis oleh H. Supardi (Abah Sorgum) sejak tahun 1999. Generasi penerusnya, Hj. Neneng Supriatiningsih, S.Ag., M.Pd., menjadi Penasihat dan Pembina Kelompok Wanita Tani (KWT) Melati.</p>' +
      '<p>KWT Melati didirikan pada tahun 2019 dengan ketua Widdya Minarni, dan fokus pada budidaya serta pengolahan sorgum menjadi produk konsumsi yang bernilai ekonomi tinggi dan sehat.</p>' +
      src('Community Development Journal, Universitas Pahlawan', 'https://journal.universitaspahlawan.ac.id/index.php/cdj/article/download/30592/21863'),
  },
  {
    title: 'Redesain Kemasan Sistik Dan Pop Sorgum Untuk Katalog Digital',
    category: 'Inovasi',
    content:
      '<p>Dosen yang tergabung dalam Research Alliance Ko+Lab Telkom University membina KWT Melati dalam redesain kemasan dan foto produk olahan sorgum, khususnya sistik dan pop sorgum, untuk katalog digital.</p>' +
      '<p>Sosialisasi dilaksanakan di Coworking Lab, Fakultas Ilmu Terapan Universitas Telkom. Desain kemasan yang sudah dicetak kemudian diserahterimakan kepada KWT Melati.</p>' +
      src('Community Development Journal, Universitas Pahlawan', 'https://journal.universitaspahlawan.ac.id/index.php/cdj/article/download/30592/21863'),
  },
  {
    title: 'Sorgum-AI Smart Toolkit: Simulasi Resep Olahan Sorgum Lewat Smartphone',
    category: 'Inovasi',
    content:
      '<p>Tim Abdimas Telkom University yang diketuai Dr. Heru Nugroho, S.Si., M.T. menghadirkan Sorgum-AI Smart Toolkit untuk KWT Melati Kampung Sorgum.</p>' +
      '<p>Toolkit ini memanfaatkan Generative AI untuk simulasi resep olahan, desain kemasan otomatis, dan optimasi komposisi gizi. Anggota KWT cukup mengaksesnya lewat smartphone, didampingi mahasiswa sebagai fasilitator.</p>' +
      src('Kompasiana', 'https://www.kompasiana.com/maulanafebrian5625/6a3f5ab4ed6415219b6c4c83/transformasi-digital-kwt-melati-tim-abdimas-telkom-university-hadirkan-toolkit-ai-untuk-inovasi-olahan-sorgum'),
  },
  {
    title: 'Buku Edukasi Dan Buku Resep Olahan Sorgum Untuk Ekowisata Bojongmanggu',
    category: 'Pengetahuan',
    content:
      '<p>Tim pengabdian masyarakat Universitas Telkom di bawah Research Alliance Kolabs berkolaborasi dengan KWT Melati menyusun buku edukasi dan buku resep produk olahan sorgum.</p>' +
      '<p>Buku ini memperkenalkan manfaat sorgum dan cara praktis mengolahnya menjadi camilan, tepung, dan minuman untuk mendukung ekowisata Kampung Sorgum.</p>' +
      src('Kompasiana, 9 Januari 2025', 'https://www.kompasiana.com/faizalfikri9444/677f7cf534777c561a662a12/menggali-potensi-kampung-sorgum-edukasi-dan-resep-untuk-pengembangan-ekowisata-di-desa-bojongmanggu'),
  },
  {
    title: 'Pelatihan Digital Marketing Meta Ads Untuk Promosi Ekowisata Kampung Sorgum',
    category: 'Inovasi',
    content:
      '<p>Pada Selasa, 8 Oktober 2024, petani sorgum dan pelaku UMKM Kampung Sorgum mengikuti pelatihan digital marketing berbasis Meta Ads di Fakultas Ilmu Terapan Universitas Telkom.</p>' +
      '<p>Hasilnya, promosi lewat Instagram @kampungsorgum.bojongmanggu menjangkau audiens internasional, termasuk kunjungan Jerry von Oerthel dari Belanda yang menemukan Kampung Sorgum lewat iklan Instagram.</p>' +
      src('Jurnal Abdi Teknoyasa Vol. 6 No. 1, Juli 2025', 'https://journals2.ums.ac.id/abditeknoyasa/article/download/8109/4012'),
  },
  {
    title: 'Peluncuran Sorgumology Container Lab Di Telkom University',
    category: 'Inovasi',
    content:
      '<p>Telkom University dan KWT Melati Kampung Sorgum meluncurkan Sorgumology Container Lab dan showcase di lingkungan kampus pada Juni 2025.</p>' +
      '<p>Pada 23 Juni 2025 juga ditandatangani perjanjian lisensi Website Kampung Sorgum bersama Komunitas Halal Bandung, KWT Melati Sorgum, dan Sorgumology StartUp.</p>' +
      src("SDG's Telkom University", 'https://sdgs.telkomuniversity.ac.id/news/telkom-university-prioritizes-sustainable-food-procurement-and-local-partnerships'),
  },
  {
    title: 'Private Label Produk Sorgum Untuk Perluas Pasar KWT Melati',
    category: 'Panen',
    content:
      '<p>Desa Bojongmanggu dikenal sebagai salah satu penghasil sorgum terbesar di Jawa Barat. Namun produk olahan KWT Melati sering belum memiliki kemasan menarik dan pemasaran yang efektif.</p>' +
      '<p>Program private label dan pelatihan pemasaran digital membuat 85% peserta merasa lebih percaya diri memasarkan produk secara daring.</p>' +
      src('Kompasiana', 'https://www.kompasiana.com/faizalfikri9444/677f7a94c925c459c30d1662/mengangkat-potensi-lokal-desa-bojongmanggu-pemberdayaan-masyarakat-melalui-private-label-produk-sorgum'),
  },
  {
    title: 'Pemberdayaan Wanita Tani Lewat Budidaya Sorgum Berbasis Aset',
    category: 'Budidaya',
    content:
      '<p>Penelitian di Kampung Sorgum Desa Bojongmanggu mengkaji pemberdayaan KWT Melati melalui pendekatan Asset Based Community Development (ABCD).</p>' +
      '<p>Pengembangan dimulai dari kekuatan dan aset yang dimiliki masyarakat, bukan dari kekurangan, untuk meningkatkan ekonomi khususnya ibu rumah tangga melalui budidaya sorgum.</p>' +
      src('Digilib UIN Sunan Gunung Djati Bandung (2025)', 'https://digilib.uinsgd.ac.id/107459/'),
  },
];

export const AGENDA_SAMPLES: AgendaSample[] = [
  {
    title: 'Pelatihan Pembuatan Sistik Sorgum Untuk Anggota Baru', category: 'Pengolahan Sorgum', daysFromNow: 7,
    start: '09:00', end: '12:00', location: 'Rumah Produksi KWT Melati, Desa Bojongmanggu', organizer: 'Pengurus KWT Melati',
    description: 'Praktik langsung membuat sistik sorgum dari tepung sorgum, mulai dari takaran adonan, penggorengan, hingga pengemasan.',
    target: 'Anggota baru KWT Melati', contactName: 'Sekretariat KWT', contactPhone: '0812-0000-0001',
    requirements: 'Membawa celemek, Membawa wadah plastik', benefits: 'Resep sistik sorgum, Sertifikat pelatihan', quota: 25,
  },
  {
    title: 'Gotong Royong Persiapan Lahan Tanam Sorgum', category: 'Budidaya Sorgum', daysFromNow: 10,
    start: '07:00', end: '10:00', location: 'Lahan Bersama Kampung Sorgum', organizer: 'Koordinator Lahan KWT',
    description: 'Pembersihan gulma, pengolahan tanah, dan pembuatan bedengan untuk persiapan musim tanam berikutnya.',
    target: 'Seluruh anggota KWT', contactName: 'Koordinator Lahan', contactPhone: '0812-0000-0002',
    requirements: 'Membawa cangkul, Memakai sepatu bot', benefits: 'Konsumsi pagi', quota: 40,
  },
  {
    title: 'Kelas Foto Produk Olahan Sorgum Dengan Smartphone', category: 'Pemasaran', daysFromNow: 14,
    start: '13:00', end: '15:30', location: 'Balai Desa Bojongmanggu', organizer: 'Divisi Pemasaran KWT',
    description: 'Teknik dasar memotret produk olahan sorgum memakai smartphone dan cahaya alami untuk katalog dan media sosial.',
    target: 'Anggota pengelola penjualan', contactName: 'Divisi Pemasaran', contactPhone: '0812-0000-0003',
    requirements: 'Membawa smartphone, Membawa 1 produk olahan', benefits: 'Panduan foto produk, Sertifikat', quota: 20,
  },
  {
    title: 'Penjemuran Dan Sortasi Biji Sorgum Pascapanen', category: 'Panen & Pascapanen', daysFromNow: 18,
    start: '08:00', end: '11:00', location: 'Area Penjemuran Kampung Sorgum', organizer: 'Pengurus KWT Melati',
    description: 'Kegiatan bersama menjemur, menyortir, dan menimbang biji sorgum hasil panen sebelum disimpan atau digiling.',
    target: 'Anggota yang terlibat panen', contactName: 'Sekretariat KWT', contactPhone: '0812-0000-0001',
    requirements: 'Memakai topi, Membawa karung bersih', benefits: 'Data timbangan hasil panen', quota: 30,
  },
  {
    title: 'Kunjungan Lapangan Pemantauan Hama Tanaman Sorgum', category: 'Kegiatan Lapangan', daysFromNow: 21,
    start: '07:30', end: '09:30', location: 'Lahan Bersama Kampung Sorgum', organizer: 'Penyuluh Pertanian Pendamping',
    description: 'Pengecekan kondisi tanaman, identifikasi hama burung dan ulat, serta diskusi cara pengendalian ramah lingkungan.',
    target: 'Anggota pengelola lahan', contactName: 'Koordinator Lahan', contactPhone: '0812-0000-0002',
    requirements: 'Memakai sepatu bot, Membawa buku catatan', benefits: 'Catatan rekomendasi penyuluh', quota: 20,
  },
  {
    title: 'Pelatihan Pencatatan Keuangan Sederhana UMKM Sorgum', category: 'Pelatihan', daysFromNow: 25,
    start: '09:00', end: '12:00', location: 'Balai Desa Bojongmanggu', organizer: 'Bendahara KWT Melati',
    description: 'Cara mencatat modal, biaya produksi, dan penjualan produk olahan sorgum agar harga jual dan keuntungan jelas.',
    target: 'Pengurus dan anggota produksi', contactName: 'Bendahara KWT', contactPhone: '0812-0000-0004',
    requirements: 'Membawa alat tulis, Membawa kalkulator', benefits: 'Templat buku kas, Sertifikat', quota: 25,
  },
];

export const THREAD_SAMPLES: ThreadSample[] = [
  { title: 'Berapa Lama Biji Sorgum Dijemur Sebelum Digiling?', category: 'Produksi & Pengolahan',
    content: 'Ibu-ibu, biasanya biji sorgum dijemur berapa hari sampai siap digiling jadi tepung? Kalau cuaca mendung apa ada cara lain supaya tidak berjamur?' },
  { title: 'Cara Mengusir Burung Di Lahan Sorgum Menjelang Panen', category: 'Budidaya & Lahan',
    content: 'Menjelang panen banyak burung yang makan biji sorgum. Ada yang punya pengalaman pakai jaring, orang-orangan sawah, atau cara lain yang efektif?' },
  { title: 'Ide Kemasan Pop Sorgum Supaya Lebih Menarik', category: 'Pemasaran & UMKM',
    content: 'Yuk berbagi ide kemasan pop sorgum yang murah tapi menarik untuk dijual di bazar dan online. Pakai standing pouch atau toples kecil lebih laku?' },
  { title: 'Resep Bolu Tepung Sorgum Yang Tidak Bantat', category: 'Produksi & Pengolahan',
    content: 'Saya sudah coba bikin bolu dari tepung sorgum tapi hasilnya agak bantat. Ada tips takaran telur dan pengembang yang pas?' },
  { title: 'Jadwal Piket Penjemuran Hasil Panen Bulan Ini', category: 'Obrolan Umum',
    content: 'Diskusi untuk menyusun jadwal piket penjemuran biji sorgum bulan ini. Silakan tulis hari yang ibu-ibu bisa ikut.' },
  { title: 'Pengalaman Menanam Sorgum Di Musim Kemarau', category: 'Budidaya & Lahan',
    content: 'Sorgum katanya tahan kering. Bagaimana pengalaman ibu-ibu menanam saat kemarau, perlu disiram berapa kali seminggu?' },
];

/** Ambil 1 contoh acak yang judulnya belum dipakai. null = semua contoh sudah ada. */
export function pickUnused<T extends { title: string }>(samples: T[], existingTitles: string[]): T | null {
  const used = new Set(existingTitles.map(t => (t || '').trim().toLowerCase()));
  const free = samples.filter(s => !used.has(s.title.trim().toLowerCase()));
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

/** yyyy-mm-dd untuk hari ini + n hari (waktu lokal). */
export function dateFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
