import React, { useState } from 'react';
import { InfoArticle } from '../../types';
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  ChevronDown, 
  User, 
  Layers 
} from 'lucide-react';

interface InformasiViewProps {
  articles: InfoArticle[];
  selectedArticle: InfoArticle | null;
  onSelectArticle: (article: InfoArticle | null) => void;
}

export const InformasiView: React.FC<InformasiViewProps> = ({
  articles,
  selectedArticle,
  onSelectArticle
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const categories = ['Semua', 'Panen', 'Inovasi', 'Budidaya', 'Pengetahuan'];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'Semua') return matchesSearch;
    return matchesSearch && art.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getCategoryBadgeClass = (category: string) => {
    const cat = category?.toUpperCase();
    if (cat === 'PANEN') return 'bg-[#2C4219] text-white';
    if (cat === 'INOVASI') return 'bg-[#A8B774] text-white';
    if (cat === 'BUDIDAYA') return 'bg-[#FAF6EE] text-[#2C4219] border border-[#2C4219]/20';
    return 'bg-[#FAF6EE] text-[#433A30] border border-[#E6E1D5]';
  };

  // If an article is selected, render the Detail Informasi view matching the screenshot!
  if (selectedArticle) {
    return (
      <div className="space-y-6 pb-16 w-full">
        {/* Article Title */}
        <h1 className="font-title font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2C4219] leading-tight pt-2">
          {selectedArticle.title}
        </h1>

        {/* Hero Banner with Floating Thumbnails Overlay Card */}
        <div className="relative mb-8">
          <div className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-sm relative border border-[#E6E1D5]">
            <img
              src={selectedArticle.gallery && selectedArticle.gallery.length > 0 ? selectedArticle.gallery[activeImageIdx] : selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Gallery Thumbnails Floating Card Overlay */}
          {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-[#E6E1D5] shadow-lg flex items-center gap-2 sm:gap-3 z-10">
              {selectedArticle.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                    activeImageIdx === idx ? 'border-[#2C4219] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Gallery thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Article Body + Sidebar Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left Column: Detail Informasi */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-title font-extrabold text-lg sm:text-xl text-[#2C4219]">
              Detail Informasi
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#433A30] leading-relaxed font-normal">
              {selectedArticle.content && selectedArticle.content.length > 0 ? (
                selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))
              ) : (
                <p>{selectedArticle.summary}</p>
              )}
            </div>
          </div>

          {/* Right Column: Informasi Utama Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 p-6 rounded-2xl border border-[#E6E1D5] shadow-2xs space-y-6">
              <h3 className="font-title font-extrabold text-base text-[#2C4219]">
                Informasi Utama
              </h3>

              <div className="space-y-4 text-xs text-[#433A30]">
                {/* Tanggal */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">TANGGAL</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">{selectedArticle.date || 'Sabtu, 19 Oktober 2026'}</p>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">LOKASI</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">Lahan Utama Blok A</p>
                  </div>
                </div>

                {/* Penulis */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">PENULIS</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">{selectedArticle.author?.name || 'Sekretariat KWT Sorgum'}</p>
                  </div>
                </div>

                {/* Kategori */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">KATEGORI</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">Laporan Pasca Panen</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-[#E6E1D5]">
                <button
                  onClick={() => alert('Unduh Dokumen (PDF)...')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-xs"
                >
                  Unduh Dokumen (PDF)
                </button>
                <button
                  onClick={() => alert('Bagikan Informasi...')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#2C4219] font-title font-bold text-xs border border-[#E6E1D5] transition-all"
                >
                  Bagikan Informasi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-[#E6E1D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#433A30]/70 font-semibold tracking-wider">
          <p>KWT SORGUM © 2026. NURTURING COMMUNITY & GROWTH</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-[#2C4219] transition-colors">Kebijakan Privasi</button>
            <button className="hover:text-[#2C4219] transition-colors">Ketentuan Layanan</button>
            <button className="hover:text-[#2C4219] transition-colors">Kontak Kami</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-title font-extrabold text-2xl sm:text-3xl text-[#2C4219]">
            Pusat Informasi & Artikel
          </h1>

        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#433A30]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari artikel atau topik..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1D5] rounded-xl text-xs text-[#433A30] placeholder:text-[#433A30]/50 focus:outline-none focus:border-[#2C4219] transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-white text-[#433A30] hover:bg-[#FAF6EE] border border-[#E6E1D5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="bg-white rounded-2xl border border-[#E6E1D5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#2C4219]/30 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Image Header */}
              <div className="relative h-48 w-full overflow-hidden bg-[#FAF6EE]">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase shadow-xs ${getCategoryBadgeClass(art.category)}`}>
                  {art.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-[#433A30]/60 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{art.date || '12 Oktober 2026'}</span>
                </div>

                <h3 className="font-title font-bold text-base text-[#2C4219] group-hover:text-[#A8B774] transition-colors line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-[#433A30]/80 line-clamp-3 leading-relaxed font-normal">
                  {art.summary}
                </p>
              </div>
            </div>

            {/* Read More Footer */}
            <div className="px-5 pb-5 pt-2 border-t border-[#E6E1D5]/50 flex items-center justify-between text-xs font-bold text-[#2C4219]">
              <span className="group-hover:underline">Baca Selengkapnya</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-[#E6E1D5] text-center space-y-3">
          <p className="font-title font-bold text-base text-[#2C4219]">Tidak ada artikel ditemukan</p>
          <p className="text-xs text-[#433A30]/70">Coba gunakan kata kunci pencarian atau kategori yang berbeda.</p>
        </div>
      )}
    </div>
  );
};
