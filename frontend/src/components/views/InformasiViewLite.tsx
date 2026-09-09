import React, { useState, useEffect } from 'react';
import { InfoArticle } from '../../types';
import { ArrowLeft, Image as ImageIcon, ChevronLeft, Calendar, User, Layers, Download } from 'lucide-react';
import { cleanHtmlSummary, cleanArticleHtml, getArticleExcerpt } from '../../utils/agendaUtils';
import { resolveImageUrl } from '../../api/client';
import { downloadArticlePdf } from '../../utils/articlePdf';

interface InformasiViewLiteProps {
  articles: InfoArticle[];
  selectedArticle: InfoArticle | null;
  onSelectArticle: (article: InfoArticle | null) => void;
  searchQuery?: string;
}

export const InformasiViewLite: React.FC<InformasiViewLiteProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  searchQuery = ''
}) => {
  const q = (searchQuery || '').toLowerCase();
  const filteredArticles = articles.filter(a => 
    (a.title || '').toLowerCase().includes(q) || 
    (a.summary || '').toLowerCase().includes(q)
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!selectedArticle || isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      await downloadArticlePdf(selectedArticle);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Maaf, terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (selectedArticle?.gallery && selectedArticle.gallery.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIdx((prev) => (prev + 1) % selectedArticle.gallery!.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedArticle]);

  // Detail View (Tampilan Baca Artikel)
  if (selectedArticle) {
    return (
      <div className="w-full animate-in fade-in duration-300">
        <button 
          onClick={() => onSelectArticle(null)}
          className="flex items-center gap-1.5 text-[#2C4219] font-bold text-xs sm:text-sm mb-4 active:scale-95 transition-transform bg-white hover:bg-[#FAF6EE] px-3.5 py-2 rounded-xl border border-[#E6E1D5] w-fit shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Daftar
        </button>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2C4219] mb-3 leading-snug">
          {selectedArticle.title}
        </h1>

        {/* Metadata Badges (Tanggal, Penulis, Kategori) & PDF Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A7062] mb-5 pb-3 border-b border-[#E6E1D5]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#E6E1D5] font-semibold text-[#2C4219] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#2C4219]" />
              {selectedArticle.date || 'Rabu, 9 September 2026'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#E6E1D5] font-semibold text-[#433A30] shadow-2xs">
              <User className="w-3.5 h-3.5 text-[#A8B774]" />
              {selectedArticle.author?.name || 'Admin'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#E6E1D5] font-semibold text-[#572E4A] shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#572E4A]" />
              {selectedArticle.category}
            </span>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 bg-[#2C4219] hover:bg-[#1E2E11] disabled:opacity-50 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF'}</span>
          </button>
        </div>
        
        {selectedArticle.gallery && selectedArticle.gallery.length > 0 ? (
          <div className="relative mb-6 group overflow-hidden rounded-2xl shadow-xs bg-[#E6E1D5]/30">
            <div className="relative w-full h-48 sm:h-64 md:h-80">
              {selectedArticle.gallery.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={resolveImageUrl(imgUrl)}
                  alt={`${selectedArticle.title} ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === activeImageIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))}
            </div>
            {/* Indicators */}
            {selectedArticle.gallery.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {selectedArticle.gallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`transition-all rounded-full ${
                      idx === activeImageIdx 
                        ? 'w-5 h-1.5 bg-[#A8B774]' 
                        : 'w-1.5 h-1.5 bg-white/80 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedArticle.image && (
          <img 
            src={resolveImageUrl(selectedArticle.image)} 
            alt={selectedArticle.title}
            className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-2xl mb-6 shadow-xs"
          />
        )}

        <div className="text-sm sm:text-base text-[#433A30] leading-relaxed">
          {selectedArticle.content && (Array.isArray(selectedArticle.content) ? selectedArticle.content.length > 0 : Boolean(selectedArticle.content)) ? (
            <div 
              className="article-rich-content text-[#433A30] leading-relaxed text-sm sm:text-base text-justify"
              dangerouslySetInnerHTML={{ __html: cleanArticleHtml(selectedArticle.content) }}
            />
          ) : (
            <p className="article-rich-content text-sm sm:text-base leading-relaxed text-justify">{getArticleExcerpt(selectedArticle)}</p>
          )}
        </div>
      </div>
    );
  }

  // List View (Daftar Artikel)
  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12 animate-in fade-in duration-300 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(art => (
            <div 
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white rounded-2xl p-4 border border-[#E6E1D5] flex flex-col justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md hover:border-[#607829] group"
            >
              <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden shrink-0 bg-[#FAF6EE] flex items-center justify-center">
                {art.image ? (
                  <img src={resolveImageUrl(art.image)} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#2C4219]/30" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#2C4219] leading-snug line-clamp-2 mb-1.5 group-hover:text-[#607829] transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#433A30]/80 line-clamp-2 font-normal leading-relaxed">
                    {getArticleExcerpt(art)}
                  </p>
                </div>
                <div className="mt-3.5 pt-3 border-t border-[#E6E1D5]/60">
                  <div className="w-full bg-[#2C4219] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center group-hover:bg-[#1E2E11] transition-colors">
                    Baca Berita Lengkap
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-white rounded-2xl border border-[#E6E1D5] col-span-full">
            <p className="text-sm sm:text-base text-[#433A30]/60 font-medium">Belum ada berita atau tips untuk saat ini, Bu.</p>
          </div>
        )}
      </div>
    </div>
  );
};
