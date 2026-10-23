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

// Helper HTML ringkas agar isi artikel panjang tetap mudah dibaca/diedit.
const P = (t: string) => `<p>${t}</p>`;
const H = (t: string) => `<h3>${t}</h3>`;
const UL = (items: string[]) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const art = (...parts: string[]) => parts.join('');

export const ARTICLE_SAMPLES: ArticleSample[] = [
  {
    title: 'Kampung Sorgum Bojongmanggu, Penghasil Sorgum Ratusan Ton Di Kabupaten Bandung',
    category: 'Panen',
    content: art(
      P('Ketika pemerintah mulai gencar mendorong penanaman sorgum sebagai pengganti gandum pada pertengahan 2022, banyak orang mengira sorgum hanya cocok ditanam di wilayah kering seperti Nusa Tenggara Timur (NTT). Kenyataannya, di Kabupaten Bandung sudah lama ada sebuah kampung yang hidup dari sorgum dan mampu menghasilkan hingga ratusan ton.'),
      P('Kampung tersebut berada di Jalan Bojongkoneng No. 2, Desa Bojongmanggu, Kecamatan Pameungpeuk, Kabupaten Bandung, Jawa Barat. Masyarakat mengenalnya sebagai <strong>Kampung Sorgum</strong>.'),
      H('Berawal dari Tanaman di Pinggir Sungai'),
      P('Menurut Ketua Petani Sorgum Desa Bojongmanggu, Neneng Supriatiningsih, sorgum mulai dikenal di desanya sejak tahun 1999. Saat itu seorang tokoh masyarakat bernama H. Supardi, yang akrab disapa <strong>Abah Sorgum</strong>, menemukan tanaman sorgum di pinggir sungai lalu mulai membudidayakannya di Desa Bojongmanggu.'),
      P('"Akhirnya bertahan sampai sekarang, bahkan industrinya berjalan di sini sejak pertama kali ditemukan," tutur Neneng kepada Kompas.com pada 30 Agustus 2022.'),
      H('Mengapa Sorgum Dikembangkan?'),
      P('Sorgum adalah tanaman serbaguna yang dapat dimanfaatkan sebagai sumber pangan, pakan ternak, dan bahan baku industri. Sebagai bahan pangan dunia, sorgum menempati urutan kelima setelah gandum, jagung, padi, dan jelai. Beberapa alasan sorgum dikembangkan di Bojongmanggu:'),
      UL([
        '<strong>Mudah tumbuh</strong> – sorgum bisa tumbuh di banyak tempat, termasuk di lahan marginal yang kurang subur, bahkan lebih baik daripada gandum.',
        '<strong>Kaya karbohidrat</strong> – karakteristiknya mirip nasi sehingga dapat menjadi alternatif makanan pokok, dengan kandungan nutrisi yang berbeda.',
        '<strong>Baik untuk kesehatan</strong> – sorgum disebut baik dikonsumsi penderita diabetes dan membantu menjaga kesehatan pencernaan.',
        '<strong>Bernilai ekonomi</strong> – bijinya bisa diolah menjadi beras sorgum, tepung, hingga aneka camilan.',
      ]),
      H('Dari Lahan ke Produk Olahan'),
      P('Keberhasilan budidaya sorgum di Bojongmanggu menjadi fondasi berdirinya Kelompok Wanita Tani (KWT) Melati, yang kini mengolah hasil panen menjadi berbagai produk seperti beras sorgum, tepung sorgum, sistik, pop sorgum, dan sereal. Kampung Sorgum pun berkembang menjadi tujuan wisata edukasi bagi masyarakat yang ingin belajar budidaya dan pengolahan sorgum secara langsung.'),
      P('Kisah Kampung Sorgum menunjukkan bahwa ketahanan pangan dapat tumbuh dari inisiatif lokal yang dijalankan dengan tekun dan konsisten selama puluhan tahun.'),
      src('Kompas.com – "Bandung Punya Kampung Sorgum, Hasilkan Tanaman Pengganti Gandum hingga Ratusan Ton" (30 Agustus 2022)', 'https://bandung.kompas.com/read/2022/08/30/200503378/bandung-punya-kampung-sorgum-hasilkan-tanaman-pengganti-gandum-hingga'),
    ),
  },
  {
    title: 'Sejarah KWT Melati Dan Abah Sorgum Di Desa Bojongmanggu',
    category: 'Pengetahuan',
    content: art(
      P('Kelompok Wanita Tani (KWT) Melati tidak lahir begitu saja. Keberadaannya berakar dari perjalanan panjang budidaya sorgum di Desa Bojongmanggu, Kecamatan Pameungpeuk, Kabupaten Bandung, yang dirintis lebih dari dua dekade lalu.'),
      H('Perintis: H. Supardi (Abah Sorgum)'),
      P('Kampung Sorgum didirikan oleh <strong>H. Supardi</strong>, yang dikenal masyarakat sebagai <strong>Abah Sorgum</strong>, sejak tahun 1999. Berawal dari menemukan tanaman sorgum di pinggir sungai, beliau mulai membudidayakannya hingga Bojongmanggu dikenal sebagai salah satu sentra sorgum di Jawa Barat dengan hasil panen mencapai ratusan ton.'),
      H('Generasi Penerus dan Lahirnya KWT Melati'),
      P('Perjuangan Abah Sorgum diteruskan oleh generasi berikutnya, <strong>Hj. Neneng Supriatiningsih, S.Ag., M.Pd.</strong>, yang juga menjabat sebagai Ketua Petani Sorgum Desa Bojongmanggu. Untuk melibatkan kaum perempuan dalam pengolahan sorgum, dibentuklah Kelompok Wanita Tani Melati.'),
      UL([
        '<strong>Tahun berdiri:</strong> 2019 (beberapa sumber menyebut kelompok aktif sejak 2020)',
        '<strong>Penasihat dan Pembina:</strong> Hj. Neneng Supriatiningsih, S.Ag., M.Pd.',
        '<strong>Ketua:</strong> Widdya Minarni',
        '<strong>Fokus kegiatan:</strong> budidaya dan pengolahan sorgum menjadi produk konsumsi bernilai ekonomi tinggi dan sehat',
      ]),
      H('Produk Olahan KWT Melati'),
      P('Anggota KWT Melati mengolah sorgum menjadi berbagai produk, antara lain:'),
      UL(['Beras sorgum', 'Tepung sorgum', 'Sistik sorgum', 'Pop sorgum', 'Teng-teng sorgum', 'Sereal sorgum']),
      H('Tujuan dan Peran Kelompok'),
      P('KWT Melati berperan sebagai penggerak ekonomi perempuan desa. Melalui kelompok ini, ibu-ibu rumah tangga yang sebelumnya bergantung pada pendapatan kepala keluarga dapat memperoleh penghasilan tambahan dari kegiatan produksi dan penjualan olahan sorgum.'),
      P('Seiring waktu, KWT Melati aktif bermitra dengan perguruan tinggi, terutama Telkom University melalui Research Alliance Ko+Lab, untuk mendapatkan pendampingan di bidang kemasan, pemasaran digital, hingga teknologi kecerdasan buatan.'),
      src('Community Development Journal – "Redesain Kemasan dan Photo Produk Olahan Sorgum untuk Katalog Digital KWT Melati Bojongmanggu" (2024)', 'https://journal.universitaspahlawan.ac.id/index.php/cdj/article/download/30592/21863'),
      src('Kompas.com (30 Agustus 2022)', 'https://bandung.kompas.com/read/2022/08/30/200503378/bandung-punya-kampung-sorgum-hasilkan-tanaman-pengganti-gandum-hingga'),
    ),
  },
  {
    title: 'Redesain Kemasan Sistik Dan Pop Sorgum Untuk Katalog Digital',
    category: 'Inovasi',
    content: art(
      P('Desain kemasan memegang peran penting dalam memperkuat merek usaha mikro, kecil, dan menengah (UMKM), terlebih di tengah persaingan pasar yang semakin ketat. Kemasan yang kurang menarik masih menjadi masalah umum bagi sebagian besar UMKM di Indonesia, termasuk produsen olahan pangan lokal.'),
      H('Latar Belakang'),
      P('KWT Melati Desa Bojongmanggu telah berhasil membudidayakan dan mengolah sorgum menjadi produk konsumsi yang sehat dan bernilai ekonomi tinggi. Namun, beberapa produk olahan seperti <strong>sistik</strong> dan <strong>pop sorgum</strong> masih dikemas secara sederhana dan belum memiliki katalog digital untuk pemasaran.'),
      H('Program Pendampingan'),
      P('Tim dosen Telkom University yang tergabung dalam <strong>Research Alliance Ko+Lab</strong>, yaitu Heru Nugroho, Robbi Hendriyanto, Kristina Sisilia, Retno Setyorini, Arlin Ferlina Mochamad Trenggana, dan Lina Karlina, melaksanakan pengabdian masyarakat dengan tahapan berikut:'),
      UL([
        '<strong>Analisis kondisi mitra</strong> – mengidentifikasi produk yang paling membutuhkan perbaikan kemasan.',
        '<strong>Sosialisasi</strong> – penyampaian materi "Kemasan Produk & Redesain Kemasan Olahan Sorgum" serta pengenalan Ko+Lab Sorgumology, bertempat di Coworking Lab, Fakultas Ilmu Terapan Universitas Telkom.',
        '<strong>Penyerahan desain dan foto produk</strong> – desain kemasan yang sudah dicetak diserahterimakan kepada KWT Melati beserta foto produk untuk katalog digital.',
        '<strong>Evaluasi kegiatan</strong> – menilai manfaat program bagi mitra.',
      ]),
      H('Mengapa Kemasan Penting?'),
      UL([
        'Kemasan yang menarik meningkatkan kepercayaan dan minat beli konsumen.',
        'Informasi produk yang jelas membantu konsumen mengenal manfaat sorgum.',
        'Foto produk yang baik menjadi modal utama pemasaran daring dan katalog digital.',
        'Identitas merek yang konsisten memudahkan produk dikenali di pasar yang lebih luas.',
      ]),
      P('Melalui program ini, produk olahan sorgum KWT Melati memiliki tampilan yang lebih profesional dan siap bersaing di pasar modern maupun daring.'),
      src('Community Development Journal Vol. 2024 – Heru Nugroho dkk., Telkom University', 'https://journal.universitaspahlawan.ac.id/index.php/cdj/article/download/30592/21863'),
    ),
  },
  {
    title: 'Sorgum-AI Smart Toolkit: Simulasi Resep Olahan Sorgum Lewat Smartphone',
    category: 'Inovasi',
    content: art(
      P('Pengembangan sorgum di Indonesia kini menempati posisi strategis sebagai alternatif pangan pokok sekaligus bahan baku industri yang ramah lingkungan. Di tingkat lokal, KWT Melati Kampung Sorgum di Desa Bojongmanggu, Kabupaten Bandung, berperan sebagai agen perubahan yang fokus meningkatkan kesejahteraan wanita tani melalui budidaya hingga pengolahan sorgum.'),
      H('Tantangan yang Dihadapi'),
      P('Meski bahan baku melimpah, KWT Melati masih menghadapi tantangan saat beralih dari pertanian konvensional ke kewirausahaan berbasis teknologi:'),
      UL([
        'Diversifikasi produk olahan masih dilakukan secara manual.',
        'Pengembangan resep mengandalkan metode coba-coba (<em>trial and error</em>) yang memakan waktu lama.',
        'Akses terhadap teknologi simulasi untuk merancang varian produk baru masih terbatas.',
      ]),
      H('Solusi: Sorgum-AI Smart Toolkit'),
      P('Tim Pengabdian kepada Masyarakat (Abdimas) Telkom University yang diketuai oleh <strong>Dr. Heru Nugroho, S.Si., M.T.</strong> menghadirkan <strong>Sorgum-AI Smart Toolkit</strong>, sebuah ekosistem digital yang memanfaatkan <em>Generative AI</em> untuk:'),
      UL([
        '<strong>Simulasi resep olahan</strong> – membantu merancang resep baru berbahan sorgum.',
        '<strong>Desain kemasan otomatis</strong> – menghasilkan gagasan desain kemasan produk.',
        '<strong>Optimasi komposisi gizi</strong> – membantu menyusun komposisi bahan yang lebih bernutrisi.',
      ]),
      P('Toolkit ini dirancang ramah pengguna. Anggota KWT tidak memerlukan perangkat mahal karena cukup mengaksesnya melalui smartphone masing-masing.'),
      H('Pendampingan Learning by Doing'),
      P('Tim pengabdi menerapkan metode pelatihan <em>learning by doing</em> dan melibatkan mahasiswa sebagai fasilitator yang mendampingi ibu-ibu KWT secara intensif. Tujuannya agar mitra mampu mengoperasikan teknologi tersebut secara mandiri dan berkelanjutan tanpa bergantung pada tim ahli.'),
      H('Harapan ke Depan'),
      P('Dengan teknologi ini, KWT Melati diharapkan dapat menggali nilai tambah sorgum secara lebih presisi dan efisien, menciptakan produk pangan fungsional yang berdaya saing di pasar nasional, memperkuat strategi branding, serta mendorong kemandirian ekonomi kelompok dalam jangka panjang.'),
      src('Kompasiana – "Transformasi Digital KWT Melati: Tim Abdimas Telkom University Hadirkan Toolkit AI Untuk Inovasi Olahan Sorgum" (27 Juni 2026)', 'https://www.kompasiana.com/maulanafebrian5625/6a3f5ab4ed6415219b6c4c83/transformasi-digital-kwt-melati-tim-abdimas-telkom-university-hadirkan-toolkit-ai-untuk-inovasi-olahan-sorgum'),
    ),
  },
  {
    title: 'Buku Edukasi Dan Buku Resep Olahan Sorgum Untuk Ekowisata Bojongmanggu',
    category: 'Pengetahuan',
    content: art(
      P('Desa Bojongmanggu di Kabupaten Bandung kini menjadi sorotan berkat potensinya dalam pengembangan ekowisata berbasis sorgum. Dikenal dengan nama <strong>Kampung Sorgum</strong>, desa ini memanfaatkan sorgum untuk mendorong pariwisata sekaligus pemberdayaan ekonomi lokal.'),
      H('Sorgum sebagai Pangan Alternatif'),
      P('Sorgum adalah tanaman serealia serbaguna yang kaya protein dan mampu beradaptasi di berbagai kondisi lingkungan. Tanaman ini dipandang sebagai solusi strategis untuk diversifikasi pangan nasional. Di Bojongmanggu, sorgum tidak hanya dimanfaatkan sebagai bahan pangan, tetapi juga diolah menjadi tepung, camilan, dan sirup.'),
      H('Kolaborasi Penyusunan Buku'),
      P('Tim pengabdian masyarakat Universitas Telkom di bawah <strong>Research Alliance Kolabs</strong> berkolaborasi dengan KWT Melati menyusun dua buku:'),
      UL([
        '<strong>Buku Edukasi (Pembelajaran) Sorgum</strong> – memperkenalkan sorgum, manfaatnya, dan cara budidayanya.',
        '<strong>Buku Resep Olahan Sorgum</strong> – panduan praktis mengolah sorgum menjadi camilan, tepung, dan minuman bernilai tambah.',
      ]),
      P('Penyusunan dilakukan secara partisipatif, yaitu anggota KWT Melati dilibatkan di setiap tahap pengembangan. Dengan begitu, buku tidak hanya menjadi panduan, tetapi juga alat pemberdayaan.'),
      P('"Buku ini membantu kami memahami lebih jauh cara mengolah sorgum sekaligus mendukung pemasaran produk lokal," ujar salah satu anggota KWT Melati.'),
      H('Dampak bagi Masyarakat'),
      UL([
        'Pengetahuan warga berkembang dari sekadar budidaya tradisional menjadi pengolahan produk bernilai tambah.',
        'Produk olahan sorgum mulai dikenal di tingkat lokal maupun luar daerah dan menarik perhatian wisatawan.',
        'Pendapatan rumah tangga anggota KWT bertambah dari penjualan produk olahan.',
        'Branding "Kampung Sorgum" menjadikan desa destinasi wisata berbasis pangan lokal.',
      ]),
      H('Tantangan Berikutnya'),
      P('Akses pasar yang lebih luas masih menjadi tantangan utama. Karena itu, pengembangan pemasaran digital menjadi prioritas berikutnya agar produk sorgum Bojongmanggu dapat bersaing di tingkat nasional.'),
      src('Kompasiana – "Menggali Potensi Kampung Sorgum: Edukasi dan Resep untuk Pengembangan Ekowisata di Desa Bojongmanggu" (9 Januari 2025)', 'https://www.kompasiana.com/faizalfikri9444/677f7cf534777c561a662a12/menggali-potensi-kampung-sorgum-edukasi-dan-resep-untuk-pengembangan-ekowisata-di-desa-bojongmanggu'),
    ),
  },
  {
    title: 'Pelatihan Digital Marketing Meta Ads Untuk Promosi Ekowisata Kampung Sorgum',
    category: 'Inovasi',
    content: art(
      P('Desa Bojongmanggu menawarkan pengalaman wisata edukasi berbasis pertanian sorgum. Desa ini berada pada ketinggian 600–700 meter di atas permukaan laut dengan suhu rata-rata 21–30°C, dan dihuni sekitar 9.000 jiwa yang tersebar di 10 RW dan 40 RT.'),
      H('Permasalahan'),
      P('Produk sorgum Bojongmanggu sebenarnya sudah memiliki private label, tetapi visibilitasnya di pasar masih terbatas. Upaya membangun citra desa ekowisata yang sedang dirintis juga masih memerlukan penguatan.'),
      H('Pelaksanaan Kegiatan'),
      P('Tim pengabdian masyarakat Universitas Telkom melaksanakan pelatihan pemasaran digital berbasis <strong>Meta Ads</strong> pada <strong>Selasa, 8 Oktober 2024</strong> di Fakultas Ilmu Terapan Universitas Telkom. Pesertanya adalah petani sorgum dan pelaku UMKM dari komunitas Kampung Sorgum. Materi pelatihan meliputi:'),
      UL([
        'Pembuatan konten visual dan teks untuk promosi produk dan wisata.',
        'Pemilihan platform media sosial yang sesuai dengan target pasar.',
        'Penyusunan dan pengelolaan kampanye iklan digital melalui Meta Ads.',
        'Peningkatan kapasitas masyarakat dalam mengelola akun media sosial secara konsisten.',
      ]),
      H('Hasil yang Dicapai'),
      UL([
        'Keterampilan masyarakat dalam membuat konten dan mengelola media sosial meningkat.',
        'Akun Instagram <strong>@kampungsorgum.bojongmanggu</strong> mulai aktif mempromosikan produk sorgum dan ekowisata.',
        'Kesadaran pasar terhadap produk sorgum meningkat dan calon pengunjung desa wisata bertambah.',
      ]),
      H('Kunjungan Wisatawan Mancanegara'),
      P('Salah satu bukti nyata keberhasilan promosi adalah kunjungan <strong>Jerry von Oerthel</strong>, warga negara Belanda, yang mengetahui Kampung Sorgum melalui iklan Instagram (Meta Ads). Tertarik pada isu pangan berkelanjutan dan produk lokal, ia datang langsung dan berdiskusi dengan pelaku UMKM serta perwakilan KWT Bojongmanggu.'),
      P('Kegiatan ini membuktikan bahwa pemanfaatan teknologi digital mampu memperluas jangkauan produk desa hingga ke audiens internasional.'),
      src('Jurnal Abdi Teknoyasa Vol. 6 No. 1, Juli 2025 – Sri Widaningsih dkk., Universitas Telkom', 'https://journals2.ums.ac.id/abditeknoyasa/article/download/8109/4012'),
    ),
  },
  {
    title: 'Peluncuran Sorgumology Container Lab Di Telkom University',
    category: 'Inovasi',
    content: art(
      P('Kolaborasi antara perguruan tinggi dan komunitas petani terus memperkuat ekosistem pangan berbasis sorgum di Jawa Barat. Pada Juni 2025, Telkom University bersama KWT Melati Kampung Sorgum meluncurkan <strong>Sorgumology Container Lab</strong> dan <strong>Showcase</strong> di lingkungan kampus.'),
      H('Apa itu Sorgumology?'),
      P('Sorgumology adalah inisiatif yang menghubungkan riset kampus dengan produk olahan sorgum dari masyarakat. Container Lab berfungsi sebagai ruang pamer (<em>showcase</em>) sekaligus wadah pengembangan produk sorgum, sehingga civitas akademika dan masyarakat umum dapat mengenal lebih dekat produk dari Kampung Sorgum Bojongmanggu.'),
      H('Perjanjian Lisensi Website Kampung Sorgum'),
      P('Pada <strong>23 Juni 2025</strong>, Telkom University menandatangani rangkaian perjanjian lisensi Website Kampung Sorgum dengan tiga mitra:'),
      UL([
        'Komunitas Halal Bandung (KHB)',
        'KWT Melati Sorgum',
        'Sorgumology StartUp',
      ]),
      P('Perjanjian ini mengatur pemanfaatan kekayaan intelektual (nomor pencatatan 000809062) dan bertujuan memperluas akses digital terhadap ekosistem pangan berkelanjutan berbasis sorgum.'),
      H('Bagian dari Komitmen Pangan Berkelanjutan'),
      P('Kerja sama ini merupakan bagian dari komitmen Telkom University terhadap pengadaan pangan yang lokal, etis, dan berkelanjutan. Melalui kolaborasi semacam ini, kampus menghubungkan dunia akademik, komunitas lokal, dan UMKM untuk memajukan inovasi pangan sekaligus mendukung ekonomi daerah.'),
      H('Manfaat bagi KWT Melati'),
      UL([
        'Produk olahan sorgum mendapatkan etalase tetap di lingkungan kampus.',
        'Terbuka peluang riset bersama untuk pengembangan produk baru.',
        'Kehadiran digital melalui website resmi Kampung Sorgum makin kuat.',
        'Jejaring dengan komunitas halal dan startup memperluas akses pasar.',
      ]),
      src("SDG's Telkom University – \"Telkom University Prioritizes Sustainable Food Procurement and Local Partnerships\"", 'https://sdgs.telkomuniversity.ac.id/news/telkom-university-prioritizes-sustainable-food-procurement-and-local-partnerships'),
    ),
  },
  {
    title: 'Private Label Produk Sorgum Untuk Perluas Pasar KWT Melati',
    category: 'Panen',
    content: art(
      P('Desa Bojongmanggu di Kabupaten Bandung dikenal sebagai salah satu penghasil sorgum terbesar di Jawa Barat, dengan hasil panen mencapai ratusan ton setiap tahun. Sorgum dari desa ini kaya protein, karbohidrat, dan mineral seperti zat besi (Fe), sehingga dinilai berpotensi membantu mengatasi masalah stunting.'),
      H('Tantangan Pemasaran'),
      P('Di balik potensi besar tersebut, produk olahan sorgum KWT Melati menghadapi beberapa kendala:'),
      UL([
        'Identitas merek masih minim sehingga kurang menarik di pasar modern.',
        'Kemasan belum menarik dan strategi pemasaran belum efektif.',
        'Pasar yang dijangkau masih terbatas, sehingga nilai ekonomi sorgum lokal belum optimal.',
      ]),
      H('Strategi Private Label'),
      P('Universitas Telkom bekerja sama dengan masyarakat Desa Bojongmanggu menerapkan strategi <strong>private label</strong> untuk membangun identitas merek yang kuat. Tahapannya:'),
      UL([
        '<strong>Pengumpulan data dan analisis kebutuhan</strong> – wawancara dan diskusi dengan anggota KWT Melati dan tokoh masyarakat mengenai produk, kendala pemasaran, dan preferensi kemasan.',
        '<strong>Pengembangan desain</strong> – masyarakat terlibat langsung dalam pembuatan logo, pemilihan warna, dan elemen visual yang mencerminkan identitas lokal.',
        '<strong>Produksi dan penerapan label</strong> – label diproduksi massal dan dipasang pada produk olahan sorgum dengan pendampingan teknis.',
        '<strong>Pelatihan pemasaran</strong> – pengelolaan media sosial, fotografi produk, dan teknik penjualan daring.',
      ]),
      H('Hasil Program'),
      UL([
        'Penjualan meningkat hingga <strong>30%</strong> dalam tiga bulan pertama setelah implementasi.',
        '<strong>85%</strong> peserta merasa lebih percaya diri memasarkan produk secara daring.',
        'Produk sorgum memiliki identitas merek yang lebih kuat dan mampu bersaing di pasar lokal maupun nasional.',
        'Pendapatan anggota KWT Melati meningkat dan kesadaran tentang pentingnya branding tumbuh.',
      ]),
      H('Langkah Selanjutnya'),
      P('Beberapa hal yang masih perlu dikembangkan adalah peningkatan kapasitas produksi untuk memenuhi permintaan yang terus naik, diversifikasi produk (camilan, tepung, minuman), serta pengembangan Bojongmanggu sebagai destinasi ekowisata edukasi sorgum.'),
      src('Kompasiana – "Mengangkat Potensi Lokal Desa Bojongmanggu: Pemberdayaan Masyarakat Melalui Private Label Produk Sorgum"', 'https://www.kompasiana.com/faizalfikri9444/677f7a94c925c459c30d1662/mengangkat-potensi-lokal-desa-bojongmanggu-pemberdayaan-masyarakat-melalui-private-label-produk-sorgum'),
    ),
  },
  {
    title: 'Pemberdayaan Wanita Tani Lewat Budidaya Sorgum Berbasis Aset',
    category: 'Budidaya',
    content: art(
      P('Budidaya sorgum belum menjadi pilihan umum bagi kebanyakan petani di Indonesia. Namun, Kelompok Wanita Tani (KWT) Melati di Kampung Sorgum, Desa Bojongmanggu, Kecamatan Pameungpeuk, Kabupaten Bandung, berhasil menjadikannya sumber penghidupan baru bagi kaum perempuan.'),
      H('Pendekatan Asset Based Community Development (ABCD)'),
      P('Sebuah penelitian dari UIN Sunan Gunung Djati Bandung (2025) mengkaji pemberdayaan KWT Melati menggunakan pendekatan <strong>Asset Based Community Development (ABCD)</strong>. Berbeda dengan pendekatan yang berangkat dari masalah, ABCD memulai pengembangan dari <strong>kekuatan dan aset</strong> yang sudah dimiliki masyarakat.'),
      H('Aset yang Dimiliki Kampung Sorgum'),
      UL([
        '<strong>Aset alam</strong> – lahan yang cocok untuk sorgum, tanaman yang tahan di lahan kurang subur.',
        '<strong>Aset manusia</strong> – ibu-ibu anggota KWT yang memiliki semangat dan keterampilan mengolah pangan.',
        '<strong>Aset sosial</strong> – sejarah panjang budidaya sorgum sejak 1999 yang dirintis Abah Sorgum.',
        '<strong>Aset kelembagaan</strong> – kelompok tani yang terorganisasi dan jejaring dengan perguruan tinggi.',
      ]),
      H('Tujuan Pemberdayaan'),
      P('Pemberdayaan ini bertujuan meningkatkan ekonomi keluarga, khususnya ibu rumah tangga yang sebelumnya bergantung pada pendapatan kepala keluarga. Melalui budidaya dan pengolahan sorgum, anggota KWT memperoleh keterampilan baru sekaligus penghasilan tambahan.'),
      H('Tips Budidaya Sorgum untuk Anggota'),
      P('Berikut prinsip umum budidaya sorgum yang dapat diterapkan anggota KWT:'),
      UL([
        'Pilih benih varietas unggul yang sesuai dengan kebutuhan (biji untuk pangan atau batang untuk nira).',
        'Olah tanah hingga gembur dan buat bedengan agar drainase baik.',
        'Sorgum relatif tahan kekeringan, tetapi tetap perlu air cukup pada fase awal tumbuh dan pembungaan.',
        'Lakukan penyiangan gulma secara rutin dan pantau serangan hama, terutama burung menjelang panen.',
        'Panen dilakukan saat biji sudah keras dan bernas, lalu jemur hingga kering sebelum disimpan atau digiling.',
      ]),
      P('Kisah KWT Melati membuktikan bahwa potensi lokal yang dikelola bersama dapat menjadi kekuatan ekonomi bagi perempuan desa.'),
      src('Digilib UIN Sunan Gunung Djati Bandung – Hairud (2025), "Asset Based Community Development pada Kelompok Wanita Tani melalui Budidaya Sorgum"', 'https://digilib.uinsgd.ac.id/107459/'),
    ),
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
