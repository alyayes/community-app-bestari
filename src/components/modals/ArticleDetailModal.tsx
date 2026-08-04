import React, { useState } from 'react';
import { InfoArticle } from '../../types';
import { X, Calendar, MapPin, User, Layers, Download, Share2 } from 'lucide-react';

interface ArticleDetailModalProps {
  article: InfoArticle | null;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!article) return null;

  const images = article.gallery && article.gallery.length > 0
    ? article.gallery
    : [article.image];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={onClose}>
      <div
        className="min-h-screen flex items-start justify-center p-4 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FAF6EE] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-[#E6E1D5] animate-in fade-in zoom-in-95">

          {/* Top bar with close */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2C4219] text-white">
              {article.category}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#E6E1D5] text-[#7A7062] hover:text-[#2C4219] hover:border-[#2C4219] flex items-center justify-center transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-8 space-y-6">
            {/* Title */}
            <h1 className="font-title font-extrabold text-2xl sm:text-3xl text-[#2C4219] leading-tight">
              {article.title}
            </h1>

            {/* Hero Banner with Floating Gallery Thumbnails */}
            <div className="relative mb-8">
              <div className="w-full h-60 sm:h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-sm relative border border-[#E6E1D5]">
                <img
                  src={images[activeImageIdx]}
                  alt={article.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Gallery Thumbnails Floating Card */}
              {images.length > 1 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-[#E6E1D5] shadow-lg flex items-center gap-2 sm:gap-3 z-10">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                        activeImageIdx === idx
                          ? 'border-[#2C4219] scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body Grid: Content + Sidebar */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${images.length > 1 ? 'pt-6' : ''}`}>
              {/* Left: Article Content */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-title font-extrabold text-lg text-[#2C4219]">Detail Informasi</h2>
                <div className="space-y-4 text-sm text-[#433A30] leading-relaxed">
                  {article.summary && (
                    <p className="font-medium text-[#2C4219] bg-white p-4 rounded-xl border border-[#E6E1D5] italic">
                      "{article.summary}"
                    </p>
                  )}
                  {article.content && article.content.length > 0 ? (
                    article.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))
                  ) : (
                    <p>{article.summary}</p>
                  )}
                </div>
              </div>

              {/* Right: Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-5">
                  <h3 className="font-title font-extrabold text-base text-[#2C4219]">Informasi Utama</h3>

                  <div className="space-y-4 text-xs text-[#433A30]">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#FAF6EE]">
                        <Calendar className="w-4 h-4 text-[#2C4219]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">TANGGAL</p>
                        <p className="font-bold text-[#2C4219] mt-0.5">{article.date || article.timeAgo || '—'}</p>
                      </div>
                    </div>

                    {article.location && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#FAF6EE]">
                          <MapPin className="w-4 h-4 text-[#2C4219]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">LOKASI</p>
                          <p className="font-bold text-[#2C4219] mt-0.5">{article.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#FAF6EE]">
                        <User className="w-4 h-4 text-[#2C4219]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">PENULIS</p>
                        <p className="font-bold text-[#2C4219] mt-0.5">{article.author?.name || 'Sekretariat KWT Sorgum'}</p>
                        {article.author?.role && (
                          <p className="text-[10px] text-[#433A30]/60 mt-0.5">{article.author.role}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#FAF6EE]">
                        <Layers className="w-4 h-4 text-[#2C4219]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#433A30]/70 uppercase tracking-wider">KATEGORI</p>
                        <p className="font-bold text-[#2C4219] mt-0.5">{article.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2 border-t border-[#E6E1D5]">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-[#A8B774]" />
                      Unduh Dokumen (PDF)
                    </button>
                    <button
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: article.title,
                              text: article.summary,
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
          </div>
        </div>
      </div>
    </div>
  );
};
