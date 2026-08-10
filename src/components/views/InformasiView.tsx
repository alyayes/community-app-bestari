import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { InfoArticle } from '../../types';
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  ChevronDown, 
  User, 
  Layers,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

interface InformasiViewProps {
  articles: InfoArticle[];
  selectedArticle: InfoArticle | null;
  onSelectArticle: (article: InfoArticle | null) => void;
  searchQuery?: string;
}

export const InformasiView: React.FC<InformasiViewProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  searchQuery = ''
}) => {
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Reset activeImageIdx when selected article changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedArticle]);

  // Auto transition banner slides every 5 seconds
  useEffect(() => {
    if (!selectedArticle || !selectedArticle.gallery || selectedArticle.gallery.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % selectedArticle.gallery!.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedArticle]);

  const categories = ['Semua', 'Panen', 'Inovasi', 'Budidaya', 'Pengetahuan'];

  const activeSearch = localSearch || searchQuery;
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
                          art.summary.toLowerCase().includes(activeSearch.toLowerCase());
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

  const handleDownloadPDF = async () => {
    if (!selectedArticle) return;
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Draw Header Line
      doc.setDrawColor(168, 183, 116); // #A8B774
      doc.setLineWidth(1);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Draw Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 66, 25); // #2C4219
      const titleLines = doc.splitTextToSize(selectedArticle.title, pageWidth - margin * 2);
      doc.text(titleLines, margin, yPos);
      yPos += (titleLines.length * 10);

      // Draw Meta (Kategori, Tanggal)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const metaText = `Kategori: ${selectedArticle.category || 'Umum'}   |   Tanggal: ${selectedArticle.date}`;
      doc.text(metaText, margin, yPos);
      yPos += 10;

      // Draw Line
      doc.setDrawColor(230, 225, 213); // #E6E1D5
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Draw Image if exists
      const imgUrl = selectedArticle.gallery?.[0] || selectedArticle.image;
      if (imgUrl) {
         try {
           const img = new Image();
           img.crossOrigin = 'Anonymous';
           img.src = imgUrl;
           await new Promise((resolve, reject) => {
             img.onload = resolve;
             img.onerror = reject;
           });
           
           const imgWidth = pageWidth - margin * 2;
           const imgHeight = (img.height * imgWidth) / img.width;
           
           // Ensure image is not too tall for the page
           let finalImgHeight = imgHeight;
           let finalImgWidth = imgWidth;
           if (imgHeight > 100) { 
              finalImgHeight = 100;
              finalImgWidth = (img.width * finalImgHeight) / img.height;
           }
           
           if (yPos + finalImgHeight > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
           }
           
           // Draw to canvas to bypass direct jsPDF CORS restrictions
           const canvas = document.createElement('canvas');
           canvas.width = img.width;
           canvas.height = img.height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
             const xPos = margin + (imgWidth - finalImgWidth) / 2; // Center horizontally
             doc.addImage(dataUrl, 'JPEG', xPos, yPos, finalImgWidth, finalImgHeight);
             yPos += finalImgHeight + 15;
           }
         } catch (e) {
           console.warn('Could not load image for PDF', e);
         }
      }

      // Draw Content
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const contentLines = doc.splitTextToSize(selectedArticle.content, pageWidth - margin * 2);
      
      contentLines.forEach((line: string) => {
        if (yPos > pageHeight - margin - 15) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += 7;
      });

      // Footer
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Diunduh dari Sistem Informasi Komunitas', pageWidth / 2, pageHeight - 15, { align: 'center' });

      doc.save(`${selectedArticle.title.substring(0, 25)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Maaf, terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.');
    }
  };

  // If an article is selected, render the Detail Informasi view matching the screenshot!
  if (selectedArticle) {
    return (
      <div ref={pdfRef} className="space-y-6 pb-16 w-full">
        {/* Back Button */}
        <button
          onClick={() => onSelectArticle(null)}
          className="flex items-center gap-2 text-xs font-bold text-[#433A30]/70 hover:text-[#2C4219] transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Informasi</span>
        </button>

        {/* Article Title */}
        <h1 className="font-title font-bold text-2xl sm:text-3xl lg:text-4xl text-[#2C4219] leading-tight pt-2">
          {selectedArticle.title}
        </h1>

        {/* Dynamic Carousel Banner */}
        <div className="relative mb-8 group">
          <div className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-sm relative border border-[#E6E1D5] flex items-start">
            {selectedArticle.gallery && selectedArticle.gallery.length > 0 ? (
               selectedArticle.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      idx === activeImageIdx ? 'opacity-100 z-0 print:opacity-100 print:z-10' : 'opacity-0 -z-10 print:hidden'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${selectedArticle.title} ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent print:hidden" />
                  </div>
               ))
            ) : (
                <div className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out opacity-100 z-0 print:opacity-100 print:z-10">
                  {selectedArticle.image ? (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#433A30]/30 bg-[#E6E1D5]/30">
                      <ImageIcon className="w-16 h-16 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent print:hidden" />
                </div>
            )}
            
            {/* Slider Navigation Arrows */}
            {selectedArticle.gallery && selectedArticle.gallery.length > 1 && (
              <div className="print:hidden">
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev - 1 + selectedArticle.gallery!.length) % selectedArticle.gallery!.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % selectedArticle.gallery!.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Foto Berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Indicators */}
          {selectedArticle.gallery && selectedArticle.gallery.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 print:hidden">
              {selectedArticle.gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`transition-all rounded-full ${
                    idx === activeImageIdx 
                      ? 'w-6 h-2 bg-[#A8B774]' 
                      : 'w-2 h-2 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Article Body + Sidebar Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Left Column: Detail Informasi */}
          <div className="lg:col-span-2 print:col-span-3 space-y-4">
            <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219] print:hidden">
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
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white/90 p-6 rounded-2xl border border-[#E6E1D5] shadow-2xs space-y-6">
              <h3 className="font-title font-bold text-base text-[#2C4219]">
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
                {selectedArticle.location && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">LOKASI</p>
                      <p className="font-bold text-[#2C4219] mt-0.5">{selectedArticle.location}</p>
                    </div>
                  </div>
                )}

                {/* Penulis */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">PENULIS</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">{selectedArticle.author?.name || 'Admin'}</p>
                  </div>
                </div>

                {/* Kategori */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">KATEGORI</p>
                    <p className="font-bold text-[#2C4219] mt-0.5">{selectedArticle.category}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-[#E6E1D5]">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Dokumen (PDF)
                </button>
                <button
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: selectedArticle.title,
                          text: selectedArticle.summary,
                          url: window.location.href,
                        });
                      } catch (err) {}
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Tautan informasi telah disalin ke clipboard!');
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF6EE] text-[#2C4219] font-title font-bold text-xs border border-[#E6E1D5] transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Bagikan Informasi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t border-[#E6E1D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#433A30]/70 font-semibold tracking-wider print:hidden">
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
      {/* Unified Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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

        {/* Search Bar */}
        <div className="relative w-full sm:w-80 md:w-[380px] shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#433A30]/50" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari artikel atau topik..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6E1D5] rounded-xl text-xs text-[#433A30] placeholder:text-[#433A30]/50 focus:outline-none focus:border-[#2C4219] transition-colors shadow-2xs"
          />
        </div>
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
                {art.image ? (
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#433A30]/30 group-hover:scale-105 transition-transform duration-500 bg-[#E6E1D5]/30">
                    <ImageIcon className="w-10 h-10 opacity-50" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-xs ${getCategoryBadgeClass(art.category)}`}>
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
